import type http from 'http';
import { Server } from 'socket.io';

type Player = {
  username: string | null;
  position: { location: [number, number]; rotation: number } | null;
};

export const activePlayers: {
  [groupToken: string]: {
    [playerToken: string]: Player;
  };
} = {};

let io: Server | null = null;
export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (client) => {
    const { query } = client.handshake;
    if (!query.playerToken || !query.groupToken) {
      client.disconnect();
      return;
    }
    const playerToken =
      typeof query.playerToken === 'string'
        ? query.playerToken
        : query.playerToken[0];
    const groupToken =
      typeof query.groupToken === 'string'
        ? query.groupToken
        : query.groupToken[0];

    client.join(groupToken);

    if (!activePlayers[groupToken]) {
      activePlayers[groupToken] = {};
    }
    if (!activePlayers[groupToken][playerToken]) {
      activePlayers[groupToken][playerToken] = {
        username: null,
        position: null,
      };
    }

    client.on('status', (callback) => {
      callback(activePlayers[groupToken]);
    });

    client.on('position', (position) => {
      if (!activePlayers[groupToken][playerToken]) {
        return;
      }
      activePlayers[groupToken][playerToken].position = position;
      io!.to(groupToken).emit('update', activePlayers[groupToken]);
    });

    client.on('username', (username) => {
      if (!activePlayers[groupToken][playerToken]) {
        return;
      }
      activePlayers[groupToken][playerToken].username = username;
      io!.to(groupToken).emit('update', activePlayers[groupToken]);
    });

    client.on('disconnect', () => {
      if (activePlayers[groupToken]?.[playerToken]) {
        delete activePlayers[groupToken][playerToken];
      }
    });
  });

  io.of('/').adapter.on('delete-room', (room) => {
    delete activePlayers[room];
  });
}

export function getSocketServer(): Server {
  if (!io) {
    throw new Error('Socket not initialized');
  }
  return io;
}
