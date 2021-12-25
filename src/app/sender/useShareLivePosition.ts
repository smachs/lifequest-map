import { useEffect, useState } from 'react';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAccount, useUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { usePersistentState } from '../utils/storage';
import { toast } from 'react-toastify';
import type { Group } from '../utils/useReadLivePosition';
import useShareHotkeys from './useShareHotkeys';

function useShareLivePosition(token: string, serverUrl: string) {
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

  const user = useUser();
  const { position, location, region, worldName, map } = usePosition();
  const { account } = useAccount();

  useShareHotkeys(socket);

  useEffect(() => {
    if (!isSharing) {
      return;
    }
    if (!token || !serverUrl) {
      setIsSharing(false);
      return;
    }
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

    newSocket.on('connect', () => {
      if (newSocket.connected) {
        setIsConnected(true);
        toast.success('Sharing live status 👌');
      }
    });

    const updateStatus = () => {
      newSocket.emit('status', (group: Group, connections: string[]) => {
        setStatus({ group, connections });
      });
    };
    updateStatus();

    newSocket.on('connected', (isOverwolfApp, steamName) => {
      const message = isOverwolfApp
        ? `${steamName} connected 🎮`
        : 'Website connected 👽';
      toast.info(message);
      updateStatus();
      newSocket.emit('position', position);
      newSocket.emit('location', location);
      newSocket.emit('region', region);
      newSocket.emit('worldName', worldName);
      newSocket.emit('map', map);
      newSocket.emit('username', user?.username);
    });

    newSocket.on('disconnected', (isOverwolfApp, steamName) => {
      const message = isOverwolfApp
        ? `${steamName} disconnected 👋`
        : 'Website disconnected 👋';
      toast.info(message);
      updateStatus();
    });

    return () => {
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
      setStatus(null);
      toast.info('Stop sharing live status 🛑');
    };
  }, [isSharing, account]);

  useEffect(() => {
    if (socket) {
      socket.emit('position', position);
    }
  }, [socket, position]);

  useEffect(() => {
    if (socket) {
      socket.emit('location', location);
    }
  }, [socket, location]);

  useEffect(() => {
    if (socket) {
      socket.emit('worldName', worldName);
    }
  }, [socket, worldName]);

  useEffect(() => {
    if (socket) {
      socket.emit('map', map);
    }
  }, [socket, map]);

  useEffect(() => {
    if (socket) {
      socket.emit('region', region);
    }
  }, [socket, region]);

  useEffect(() => {
    if (socket) {
      socket.emit('username', user?.username);
    }
  }, [socket, user?.username]);

  return { status, isConnected, isSharing, setIsSharing };
}

export default useShareLivePosition;
