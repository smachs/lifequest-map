import { Router } from 'express';
import { activePlayers, getSocketServer } from './socket';
import osUtils from 'node-os-utils';

const liveRouter = Router();
const cpu = osUtils.cpu;
const mem = osUtils.mem;

liveRouter.get('/', async (_request, response) => {
  const io = getSocketServer();
  const numberOfPlayers = Object.keys(activePlayers).length;
  response.json({
    players: numberOfPlayers,
    connections: io.sockets.sockets.size,
    cpu: {
      count: cpu.count(),
      usage: await cpu.usage(),
      average: cpu.loadavg(),
    },
    memory: await mem.free(),
    activePlayers,
  });
});

liveRouter.get('/:token', (request, response) => {
  const { token } = request.params;
  const player = activePlayers[token];
  if (!player) {
    response.status(404).json({});
    return;
  }
  response.json(player);
});

export default liveRouter;
