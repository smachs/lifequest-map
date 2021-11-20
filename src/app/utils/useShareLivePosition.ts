import { useEffect, useState } from 'react';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { getJSONItem, usePersistentState } from './storage';
import { toast } from 'react-toastify';

const { VITE_SOCKET_ENDPOINT } = import.meta.env;

function useShareLivePosition(): [
  boolean,
  (value: boolean | ((value: boolean) => boolean)) => void
] {
  const [isSharing, setIsSharing] = usePersistentState(
    'share-live-position',
    false
  );
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  const user = useUser();
  const { position } = usePosition();

  useEffect(() => {
    const playerToken = getJSONItem('player-token', null);
    const groupToken = getJSONItem('group-token', null);
    if (!playerToken || !groupToken || !isSharing) {
      return;
    }
    const newSocket = io(
      typeof VITE_SOCKET_ENDPOINT === 'string' ? VITE_SOCKET_ENDPOINT : '',
      {
        query: {
          playerToken,
          groupToken,
        },
        upgrade: false,
        transports: ['websocket'],
      }
    );
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (newSocket.connected) {
        toast.success('Sharing live status 👌');
      }
    });

    return () => {
      newSocket.close();
      setSocket(null);
      toast.info('Stop sharing live status 🛑');
    };
  }, [isSharing]);

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

  return [isSharing, setIsSharing];
}

export default useShareLivePosition;
