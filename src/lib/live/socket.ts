import type http from 'http';
import { Server } from 'socket.io';

const activePlayers: {
  [token: string]: {
    username: string;
    position: { location: [number, number]; rotation: number };
  };
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
    console.log(`${auth.token} connected`);

    activePlayers[auth.token] = {
      username: 'Unknown',
      position: {
        location: [0, 0],
        rotation: 0,
      },
    };

    client.on('position', (position) => {
      console.log('position', position);
      io.to(auth.token).emit('position', position);
      activePlayers[auth.token].position = position;
    });

    client.on('username', (username) => {
      console.log('username', username);
      io.to(auth.token).emit('username', username);
      activePlayers[auth.token].username = username;
    });

    client.on('disconnect', () => {
      console.log(`${auth.token} disconnected`);
    });

    io.of('/').adapter.on('delete-room', (room) => {
      console.log(`delete-room ${room}`);
      delete activePlayers[room];
    });
  });
}
