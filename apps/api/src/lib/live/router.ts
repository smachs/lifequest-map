import { Router } from 'express';
import osUtils from 'node-os-utils';
import type { Player } from './socket.js';
import { activeGroups, getSocketServer, markersRespawnAt } from './socket.js';

const liveRouter = Router();
const cpu = osUtils.cpu;
const mem = osUtils.mem;

liveRouter.get('/ping', async (_request, response) => {
  response.send('OK');
});

liveRouter.get('/stats', async (_request, response) => {
  const io = getSocketServer();
  const numberOfPlayers = Object.keys(activeGroups).length;
  response.json({
    players: numberOfPlayers,
    connections: io.sockets.sockets.size,
    cpu: {
      count: cpu.count(),
      usage: await cpu.usage(),
      average: cpu.loadavg(),
    },
    memory: await mem.free(),
  });
});

type PublicPlayer = Pick<Player, 'position' | 'location' | 'region'>;
liveRouter.get('/', async (request, response) => {
  const { region, location } = request.query;

  let players = Object.values(activeGroups).reduce<PublicPlayer[]>(
    (prev, group) => {
      const players = Object.values(group)
        .filter((player) => player.position)
        .map((player) => ({
          position: player.position,
          location: player.location,
          region: player.region,
          worldName: player.worldName,
          map: player.map,
        }));
      prev.push(...players);
      return prev;
    },
    []
  );
  if (typeof location === 'string') {
    players = players.filter((player) =>
      player.location?.match(new RegExp(location, 'ig'))
    );
  }
  if (typeof region === 'string') {
    players = players.filter((player) =>
      player.region?.match(new RegExp(region, 'ig'))
    );
  }

  response.json(players);
});

liveRouter.get('/respawns', (_request, response) => {
  const now = Date.now();
  const markersRespawnTimers = markersRespawnAt.map((data) => ({
    markerId: data.markerId,
    respawnTimer: data.respawnAt - now,
    worldName: data.worldName,
    markerType: data.markerType,
  }));
  response.json(markersRespawnTimers);
});

liveRouter.get('/respawns/:worldName', (request, response) => {
  const now = Date.now();
  const markersRespawnTimers = markersRespawnAt
    .filter((data) => data.worldName === request.params.worldName)
    .map((data) => ({
      markerId: data.markerId,
      respawnTimer: data.respawnAt - now,
      markerType: data.markerType,
    }));
  response.json(markersRespawnTimers);
});

liveRouter.get('/:token', (request, response) => {
  const { token } = request.params;
  const group = activeGroups[token];
  if (!group) {
    response.status(404).json({});
    return;
  }
  response.json(group);
});

export default liveRouter;
