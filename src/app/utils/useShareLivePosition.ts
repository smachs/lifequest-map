import { useEffect, useState } from 'react';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAccount, useUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { getJSONItem, usePersistentState } from './storage';
import { toast } from 'react-toastify';

const { VITE_SOCKET_ENDPOINT } = import.meta.env;

function useShareLivePosition() {
  const [isSharing, setIsSharing] = usePersistentState(
    'share-live-position',
    false
  );
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);

  const user = useUser();
  const { position } = usePosition();
  const { account } = useAccount();

  useEffect(() => {
    const token = getJSONItem('live-share-token', null);
    if (!token || !isSharing) {
      return;
    }
    const newSocket = io(
      typeof VITE_SOCKET_ENDPOINT === 'string' ? VITE_SOCKET_ENDPOINT : '',
      {
        query: {
          token,
          steamId: account!.steamId,
          steamName: account!.name,
          isOverwolfApp: true,
        },
        upgrade: false,
        transports: ['websocket'],
      }
    );
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (newSocket.connected) {
        setIsConnected(true);
        toast.success('Sharing live status 👌');
      }
    });

    newSocket.emit('status', (players, connections) => {
      console.log(players, connections);
    });

    newSocket.on('connected', (isOverwolfApp, steamName) => {
      const message = isOverwolfApp
        ? `${steamName} connected 🎮`
        : 'Website connected 👽';
      toast.info(message);
    });

    newSocket.on('disconnected', (isOverwolfApp, steamName) => {
      const message = isOverwolfApp
        ? `${steamName} disconnected 👋`
        : 'Website disconnected 👋';
      toast.info(message);
    });

    return () => {
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
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
      socket.emit('username', user?.username);
    }
  }, [socket, user?.username]);

  return { isConnected, isSharing, setIsSharing };
}

export default useShareLivePosition;
