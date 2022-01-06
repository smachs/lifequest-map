import type http from 'http';
import { Server } from 'socket.io';

export type Player = {
  steamId?: string;
  steamName?: string;
  username: string | null;
  position: { location: [number, number]; rotation: number } | null;
  location?: string;
  region?: string;
  worldName?: string;
  map?: string;
};

export const activeGroups: {
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
    if (typeof query.token !== 'string') {
      client.disconnect();
      return;
    }
    const token = query.token;
    const isOverwolfApp = query.isOverwolfApp === 'true';
    const steamId =
      typeof query.steamId === 'string' && query.steamId !== 'undefined'
        ? query.steamId
        : undefined;
    const steamName =
      typeof query.steamName === 'string' && query.steamName !== 'undefined'
        ? query.steamName
        : undefined;
    client.join(token);

    if (!activeGroups[token]) {
      activeGroups[token] = {};
    }

    if (isOverwolfApp && !activeGroups[token][client.id]) {
      activeGroups[token][client.id] = {
        steamId,
        steamName,
        username: null,
        position: null,
      };
      client.to(token).emit('status', activeGroups[token]);
    }
    client.to(token).emit('connected', isOverwolfApp, steamName, client.id);

    client.on('status', async (callback) => {
      const roomSockets = await io!.in(token).allSockets();
      const connections = [...roomSockets.values()].filter(
        (id) => !activeGroups[token][id]
      );
      callback(activeGroups[token], connections);
    });

    client.on('position', (position) => {
      if (!isOverwolfApp || !activeGroups[token][client.id]) {
        return;
      }
      activeGroups[token][client.id].position = position;
      client.to(token).emit('data', {
        steamId: activeGroups[token][client.id].steamId,
        position,
      });
    });

    client.on('location', (location) => {
      if (!isOverwolfApp || !activeGroups[token][client.id]) {
        return;
      }
      activeGroups[token][client.id].location = location;
      client.to(token).emit('data', {
        steamId: activeGroups[token][client.id].steamId,
        location,
      });
    });

    client.on('region', (region) => {
      if (!isOverwolfApp || !activeGroups[token][client.id]) {
        return;
      }
      activeGroups[token][client.id].region = region;
      client.to(token).emit('data', {
        steamId: activeGroups[token][client.id].steamId,
        region,
      });
    });

    client.on('worldName', (worldName) => {
      if (!isOverwolfApp || !activeGroups[token][client.id]) {
        return;
      }
      activeGroups[token][client.id].worldName = worldName;
      client.to(token).emit('data', {
        steamId: activeGroups[token][client.id].steamId,
        worldName,
      });
    });

    client.on('map', (map) => {
      if (!isOverwolfApp || !activeGroups[token][client.id]) {
        return;
      }
      activeGroups[token][client.id].map = map;
      client
        .to(token)
        .emit('data', { steamId: activeGroups[token][client.id].steamId, map });
    });

    client.on('username', (username) => {
      if (!isOverwolfApp || !activeGroups[token][client.id]) {
        return;
      }
      activeGroups[token][client.id].username = username;
      client.to(token).emit('data', {
        steamId: activeGroups[token][client.id].steamId,
        username,
      });
    });

    client.on('hotkey', (hotkey) => {
      client.to(token).emit('hotkey', steamId, hotkey);
    });

    client.on('disconnect', () => {
      if (!isOverwolfApp) {
        client
          .to(token)
          .emit('disconnected', isOverwolfApp, steamName, client.id);
        return;
      }
      if (activeGroups[token]?.[client.id]) {
        delete activeGroups[token][client.id];
      }
      client.to(token).emit('status', activeGroups[token]);
    });
  });

  io.of('/').adapter.on('delete-room', (room) => {
    delete activeGroups[room];
  });
}

export function getSocketServer(): Server {
  if (!io) {
    throw new Error('Socket not initialized');
  }
  return io;
}
