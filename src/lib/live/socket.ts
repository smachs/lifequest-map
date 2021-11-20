import type http from 'http';
import { Server } from 'socket.io';

type Player = {
  username: string | null;
  position: { location: [number, number]; rotation: number } | null;
};

export const activePlayers: {
  [token: string]: Player;
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
    const { auth } = client.handshake;
    if (!auth.token) {
      client.disconnect();
      return;
    }

    client.join(auth.token);

    if (!activePlayers[auth.token]) {
      activePlayers[auth.token] = {
        position: null,
        username: null,
      };
    }

    client.on('status', (callback) => {
      callback(activePlayers[auth.token]);
    });

    client.on('position', (position) => {
      io!.to(auth.token).emit('position', position);
      activePlayers[auth.token].position = position;
    });

    client.on('username', (username) => {
      io!.to(auth.token).emit('username', username);
      activePlayers[auth.token].username = username;
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
