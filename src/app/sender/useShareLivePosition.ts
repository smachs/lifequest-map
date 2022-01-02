import { useEffect, useState } from 'react';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAccount } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { usePersistentState } from '../utils/storage';
import { toast } from 'react-toastify';
import type { Group } from '../utils/useReadLivePosition';
import useShareHotkeys from './useShareHotkeys';
import Peer from 'peerjs';
import { useSettings } from '../contexts/SettingsContext';

const peerConnections: { [key: string]: Peer.DataConnection } = {};

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

    const peer = peerToPeer ? new Peer() : null;

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
        Object.values(peerConnections).forEach((peerConnection) =>
          peerConnection.send({ group })
        );
      });
    };

    newSocket.on('connect', () => {
      if (newSocket.connected) {
        setIsConnected(true);
        toast.success('Sharing live status 👌');
        updateStatus();
      }
    });

    newSocket.on('connected', (isOverwolfApp, steamName, clientId) => {
      const message = isOverwolfApp
        ? `${steamName} connected 🎮`
        : 'Website connected 👽';
      toast.info(message);
      updateStatus();

      if (peer) {
        peerConnections[clientId] = peer.connect(
          clientId.replace(/[^a-zA-Z ]/g, '')
        );
      }
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
      peer?.destroy();
      setIsConnected(false);
      setSocket(null);
      setStatus(null);
      toast.info('Stop sharing live status 🛑');
    };
  }, [isSharing, account?.steamId, peerToPeer]);

  useEffect(() => {
    if (socket) {
      Object.values(peerConnections).forEach((peerConnection) =>
        peerConnection.send({ steamId, position })
      );
      socket.emit('position', position);
    }
  }, [socket, position]);

  useEffect(() => {
    if (socket) {
      Object.values(peerConnections).forEach((peerConnection) =>
        peerConnection.send({ steamId, location })
      );
      socket.emit('location', location);
    }
  }, [socket, location]);

  useEffect(() => {
    if (socket) {
      Object.values(peerConnections).forEach((peerConnection) =>
        peerConnection.send({ steamId, worldName })
      );
      socket.emit('worldName', worldName);
    }
  }, [socket, worldName]);

  useEffect(() => {
    if (socket) {
      Object.values(peerConnections).forEach((peerConnection) =>
        peerConnection.send({ steamId, map })
      );
      socket.emit('map', map);
    }
  }, [socket, map]);

  useEffect(() => {
    if (socket) {
      Object.values(peerConnections).forEach((peerConnection) =>
        peerConnection.send({ steamId, region })
      );
      socket.emit('region', region);
    }
  }, [socket, region]);

  useEffect(() => {
    if (socket) {
      Object.values(peerConnections).forEach((peerConnection) =>
        peerConnection.send({ steamId, username })
      );
      socket.emit('username', username);
    }
  }, [socket, username]);

  return { status, isConnected, isSharing, setIsSharing, peerConnections };
}

export default useShareLivePosition;
