import type http from 'http';
import { Server } from 'socket.io';

export type Player = {
  steamId?: string;
  steamName?: string;
  username?: string;
  position?: { location: [number, number]; rotation: number };
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

export const markersRespawnAt: {
  [worldName: string]: {
    [groupToken: string]: {
      [markerId: string]: {
        timeoutId: NodeJS.Timeout;
        respawnAt: number;
      };
    };
  };
} = {};

const peerConnections: {
  [steamId: string]: string[];
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
    let peerConnectedSteamId: string | null = null;

    client.join(token);

    if (!activeGroups[token]) {
      activeGroups[token] = {};
    }

    if (isOverwolfApp && !activeGroups[token][client.id]) {
      activeGroups[token][client.id] = {
        steamId,
        steamName,
      };
      client.to(token).emit('status', activeGroups[token]);
    }
    client.to(token).emit('connected', isOverwolfApp, steamName, client.id);

    client.on('status', async (callback) => {
      const roomSockets = await io!.in(token).fetchSockets();
      const connections = roomSockets
        .map((roomSocket) => roomSocket.id)
        .filter((id) => !activeGroups[token][id]);
      callback(activeGroups[token], connections);
    });

    client.on('position', (position) => {
      if (!isOverwolfApp || !activeGroups[token][client.id] || !steamId) {
        return;
      }
      activeGroups[token][client.id].position = position;
      client
        .to(token)
        .except(peerConnections[steamId] || [])
        .emit('data', {
          steamId,
          position,
        });
    });

    client.on('location', (location) => {
      if (!isOverwolfApp || !activeGroups[token][client.id] || !steamId) {
        return;
      }
      activeGroups[token][client.id].location = location;
      client
        .to(token)
        .except(peerConnections[steamId] || [])
        .emit('data', {
          steamId,
          location,
        });
    });

    client.on('region', (region) => {
      if (!isOverwolfApp || !activeGroups[token][client.id] || !steamId) {
        return;
      }
      activeGroups[token][client.id].region = region;
      client
        .to(token)
        .except(peerConnections[steamId] || [])
        .emit('data', {
          steamId,
          region,
        });
    });

    client.on('worldName', (worldName) => {
      if (!isOverwolfApp || !activeGroups[token][client.id] || !steamId) {
        return;
      }
      activeGroups[token][client.id].worldName = worldName;
      client
        .to(token)
        .except(peerConnections[steamId] || [])
        .emit('data', {
          steamId,
          worldName,
        });
    });

    client.on('map', (map) => {
      if (!isOverwolfApp || !activeGroups[token][client.id] || !steamId) {
        return;
      }
      activeGroups[token][client.id].map = map;
      client
        .to(token)
        .except(peerConnections[steamId] || [])
        .emit('data', { steamId, map });
    });

    client.on('username', (username) => {
      if (!isOverwolfApp || !activeGroups[token][client.id] || !steamId) {
        return;
      }
      activeGroups[token][client.id].username = username;
      client
        .to(token)
        .except(peerConnections[steamId] || [])
        .emit('data', {
          steamId,
          username,
        });
    });

    client.on('hotkey', (hotkey) => {
      client.to(token).emit('hotkey', steamId, hotkey);
    });

    client.on(
      'markerRespawnAt',
      (markerId: string, respawnTimer: number, worldName: string) => {
        if (!markersRespawnAt[worldName]) {
          markersRespawnAt[worldName] = {};
        }
        if (!markersRespawnAt[worldName][token]) {
          markersRespawnAt[worldName][token] = {};
        }

        const previousRespawnAt = markersRespawnAt[worldName][token][markerId];
        if (previousRespawnAt) {
          clearTimeout(previousRespawnAt.timeoutId);
        }
        const now = Date.now();
        markersRespawnAt[worldName][token][markerId] = {
          respawnAt: now + respawnTimer,
          timeoutId: setTimeout(() => {
            delete markersRespawnAt[worldName][token][markerId];
          }, respawnTimer),
        };
        client.to(token).emit('markerRespawnAt', markerId, respawnTimer);
      }
    );

    client.on('markersRespawnTimers', (worldName: string, callback) => {
      if (!markersRespawnAt[worldName]?.[token]) {
        callback({});
        return;
      }
      const now = Date.now();
      const markersRespawnTimers = Object.entries(
        markersRespawnAt[worldName][token]
      ).map(([markerId, data]) => ({
        markerId,
        respawnTimer: data.respawnAt - now,
      }));
      callback(markersRespawnTimers);
    });

    client.on('disconnect', () => {
      if (!isOverwolfApp) {
        client
          .to(token)
          .emit('disconnected', isOverwolfApp, steamName, client.id);
        if (peerConnectedSteamId && peerConnections[peerConnectedSteamId]) {
          const index = peerConnections[peerConnectedSteamId].indexOf(
            client.id
          );
          if (index !== -1) {
            peerConnections[peerConnectedSteamId].splice(index, 1);
          }
        }
        return;
      }
      if (activeGroups[token]?.[client.id]) {
        delete activeGroups[token][client.id];
      }
      if (steamId && peerConnections[steamId]) {
        delete peerConnections[steamId];
      }
      client.to(token).emit('status', activeGroups[token]);
    });

    client.on('peer:on', (steamId: string) => {
      if (!peerConnections[steamId]) {
        peerConnections[steamId] = [];
      }
      if (!peerConnections[steamId].includes(client.id)) {
        peerConnections[steamId].push(client.id);
      }
      peerConnectedSteamId = steamId;
    });

    client.on('peer:off', (steamId: string) => {
      if (!peerConnections[steamId]) {
        return;
      }
      const index = peerConnections[steamId].indexOf(client.id);
      if (index !== -1) {
        peerConnections[steamId].splice(index, 1);
      }
      peerConnectedSteamId = null;
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
