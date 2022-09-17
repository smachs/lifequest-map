import { Router } from 'express';
import type { Player } from './socket.js';
import { activeGroups, getSocketServer } from './socket.js';
import osUtils from 'node-os-utils';

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
