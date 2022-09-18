import { useEffect, useState } from 'react';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAccount } from 'ui/contexts/UserContext';
import { usePosition } from 'ui/contexts/PositionContext';
import { usePersistentState } from 'ui/utils/storage';
import { toast } from 'react-toastify';
import type { Group } from 'ui/utils/useReadLivePosition';
import useShareHotkeys from './useShareHotkeys';
import Peer from 'peerjs';
import { useSettings } from 'ui/contexts/SettingsContext';

const peerConnections: { [key: string]: any } = {};

const sendToPeers = (data: unknown) => {
  Object.values(peerConnections).forEach((peerConnection) => {
    if (peerConnection.open) {
      peerConnection.send(data);
    }
  });
};

function useShareLivePosition(token: string, serverUrl: string) {
  const { peerToPeer } = useSettings();
  const [isSharing, setIsSharing] = usePersistentState(
    'share-live-position',
    false
  );
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
  const { account } = useAccount();
  const steamId = account!.steamId;

  useShareHotkeys(socket);

  useEffect(() => {
    if (!isSharing) {
      return;
    }
    if (!token || !serverUrl) {
      setIsSharing(false);
      return;
    }

    const peer = peerToPeer ? new Peer({ debug: 2 }) : null;

    const openPromise = new Promise((resolve) => {
      peer?.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        resolve(id);
      });
    });

    const newSocket = io(serverUrl, {
      query: {
        token,
        steamId: account!.steamId,
        steamName: account!.name,
        isOverwolfApp: true,
      },
      upgrade: false,
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
              console.log(`Connect to ${peerId}`);
              peerConnections[connection] = peer.connect(peerId);

              peerConnections[connection].on('error', (error: Error) => {
                console.error('Peer error', error);
              });

              peerConnections[connection].on('open', () => {
                console.log('Peer opened');
                peerConnections[connection].send({ group });
              });

              peerConnections[connection].on('close', () => {
                console.log('Peer closed');
                delete peerConnections[connection];
              });
            }
          });
        }
      });
    };

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Sharing live status 👌');
      updateStatus();
    });

    newSocket.on('connected', (isOverwolfApp, steamName) => {
      const message = isOverwolfApp
        ? `${steamName} connected 🎮`
        : 'Website connected 👽';
      toast.info(message);
      updateStatus();
    });

    newSocket.on('disconnected', (isOverwolfApp, steamName, clientId) => {
      const message = isOverwolfApp
        ? `${steamName} disconnected 👋`
        : 'Website disconnected 👋';
      toast.info(message);
      updateStatus();
      peerConnections[clientId]?.close();
      delete peerConnections[clientId];
    });

    return () => {
      newSocket.close();

      Object.entries(peerConnections).forEach(([clientId, peerConnection]) => {
        peerConnection.close();
        delete peerConnections[clientId];
      });

      peer?.destroy();

      setSocket(null);
      setStatus(null);
      toast.info('Stop sharing live status 🛑');
    };
  }, [isSharing, account?.steamId, peerToPeer]);

  useEffect(() => {
    if (socket) {
      sendToPeers({ steamId, position });
      socket.emit('position', position);
    }
  }, [socket, position]);

  useEffect(() => {
    if (socket) {
      sendToPeers({ steamId, location });
      socket.emit('location', location);
    }
  }, [socket, location]);

  useEffect(() => {
    if (socket) {
      sendToPeers({ steamId, worldName });
      socket.emit('worldName', worldName);
    }
  }, [socket, worldName]);

  useEffect(() => {
    if (socket) {
      sendToPeers({ steamId, map });
      socket.emit('map', map);
    }
  }, [socket, map]);

  useEffect(() => {
    if (socket) {
      sendToPeers({ steamId, region });
      socket.emit('region', region);
    }
  }, [socket, region]);

  useEffect(() => {
    if (socket) {
      sendToPeers({ steamId, username });
      socket.emit('username', username);
    }
  }, [socket, username]);

  return { status, isConnected, isSharing, setIsSharing, peerConnections };
}

export default useShareLivePosition;
