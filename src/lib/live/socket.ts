import type http from 'http';
import { Server } from 'socket.io';

type Player = {
  username?: string;
  position?: { location: [number, number]; rotation: number };
};

const activePlayers: {
  [token: string]: Player;
} = {};

export function initSocket(server: http.Server) {
  const io = new Server(server, {
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
      activePlayers[auth.token] = {};
    }

    client.on('status', (callback) => {
      callback(activePlayers[auth.token]);
    });

    client.on('position', (position) => {
      io.to(auth.token).emit('position', position);
      activePlayers[auth.token].position = position;
    });

    client.on('username', (username) => {
      io.to(auth.token).emit('username', username);
      activePlayers[auth.token].username = username;
    });
  });

  io.of('/').adapter.on('delete-room', (room) => {
    delete activePlayers[room];
  });
}
