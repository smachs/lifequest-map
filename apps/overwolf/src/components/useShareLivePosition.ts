import type { Group } from 'aeternum-map-realtime/types';
import type { DataConnection } from 'peerjs';
import Peer from 'peerjs';
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { useSettingsStore } from 'ui/utils/settingsStore';
import { useUserStore } from 'ui/utils/userStore';
import { usePosition } from '../contexts/PositionContext';
import useShareHotkeys from './useShareHotkeys';

const peerConnections: { [key: string]: DataConnection } = {};

const sendToPeers = (data: unknown) => {
  Object.values(peerConnections).forEach((peerConnection) => {
    if (peerConnection.open) {
      peerConnection.send(data);
    }
  });
};

function useShareLivePosition() {
  const peerToPeer = useSettingsStore((state) => state.peerToPeer);
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<{
    group: Group;
    connections: string[];
  } | null>(null);

  const { position, location, region, worldName, map, username } =
    usePosition();
  const account = useUserStore((state) => state.account);

  const steamId = account?.steamId;

  useShareHotkeys(socket);

  useEffect(() => {
    if (!account || !account.liveShareToken || !account.liveShareServerUrl) {
      return;
    }

    const peer = peerToPeer ? new Peer({ debug: 2 }) : null;
    const openPromise = new Promise((resolve) => {
      if (!peer) {
        resolve(true);
        return;
      }
      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        resolve(id);
      });
      peer.on('error', (error) => {
        console.error('Peer error', error);
      });
      peer.on('disconnected', () => {
        console.log('Peer disconnected -> reconnecting');
        peer.reconnect();
      });
    });

    const newSocket = io(account.liveShareServerUrl, {
      query: {
        token: account.liveShareToken,
        steamId: account.steamId,
        steamName: account.name,
        isOverwolfApp: true,
      },
      transports: ['websocket'],
    });
    setSocket(newSocket);

    const updateStatus = () => {
      newSocket.emit('status', (group: Group, connections: string[]) => {
        setStatus({ group, connections });
        sendToPeers({ group });

        if (peer) {
          connections.forEach(async (connection) => {
            await openPromise;
            if (!peerConnections[connection]) {
              const peerId = connection.replace(/[^a-zA-Z ]/g, '');
              console.log(`Connecting to peer ${peerId}`);
              const dataConnection = peer.connect(peerId);
              if (!dataConnection) {
                return;
              }
              peerConnections[connection] = dataConnection;

              peerConnections[connection].on('error', (error: Error) => {
                console.error(`Peer ${peerId} error`, error);
              });

              peerConnections[connection].on('open', () => {
                console.log(`Peer ${peerId} opened`);
                const sessionIds = Object.keys(group);
                const playerSessionId =
                  sessionIds.find((sessionId) => {
                    if (account) {
                      const player = group[sessionId];
                      return player.steamId === account.steamId;
                    }
                    return true;
                  }) || sessionIds[0];

                peerConnections[connection].send({
                  group,
                  ...group[playerSessionId],
                });
              });

              peerConnections[connection].on('close', () => {
                console.log(`Peer ${peerId} closed`);
                delete peerConnections[connection];
              });
            }
          });
        }
      });
    };

    newSocket.on('connect', () => {
      setIsConnected(true);
      updateStatus();
    });

    newSocket.on('connected', (isOverwolfApp, steamName) => {
      const message = isOverwolfApp
        ? `${steamName} connected 🎮`
        : 'Website connected 👽';
      console.info(message);
      updateStatus();
    });

    newSocket.on('disconnected', (isOverwolfApp, steamName, clientId) => {
      const message = isOverwolfApp
        ? `${steamName} disconnected 👋`
        : 'Website disconnected 👋';
      console.info(message);
      updateStatus();
      peerConnections[clientId]?.close();
      delete peerConnections[clientId];
    });

    newSocket.io.on('reconnect_attempt', () => {
      setIsConnected(false);
    });

    newSocket.io.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      newSocket.io.connect();
    });

    newSocket.io.on('reconnect', () => {
      console.info('Reconnected');
      setIsConnected(true);
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.io.removeAllListeners();
      newSocket.close();

      setIsConnected(false);

      peer?.destroy();
      Object.entries(peerConnections).forEach(([clientId, peerConnection]) => {
        peerConnection?.close();
        delete peerConnections[clientId];
      });
      setSocket(null);
      setStatus(null);
    };
  }, [
    peerToPeer,
    account?.steamId,
    account?.liveShareServerUrl,
    account?.liveShareToken,
    account?.name,
  ]);

  useEffect(() => {
    if (socket && isConnected && position) {
      sendToPeers({ steamId, position });
      socket.emit('position', position);
    }
  }, [socket, isConnected, position]);

  useEffect(() => {
    if (socket && isConnected && location) {
      sendToPeers({ steamId, location });
      socket.emit('location', location);
    }
  }, [socket, isConnected, location]);

  useEffect(() => {
    if (socket && isConnected && worldName) {
      sendToPeers({ steamId, worldName });
      socket.emit('worldName', worldName);
    }
  }, [socket, isConnected, worldName]);

  useEffect(() => {
    if (socket && isConnected && map) {
      sendToPeers({ steamId, map });
      socket.emit('map', map);
    }
  }, [socket, isConnected, map]);

  useEffect(() => {
    if (socket && isConnected && region) {
      sendToPeers({ steamId, region });
      socket.emit('region', region);
    }
  }, [socket, isConnected, region]);

  useEffect(() => {
    if (socket && isConnected && username) {
      sendToPeers({ steamId, username });
      socket.emit('username', username);
    }
  }, [socket, isConnected, username]);

  return { status, isConnected, peerConnections };
}

export default useShareLivePosition;
