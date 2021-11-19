import { useEffect, useState } from 'react';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAccount, useUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { usePersistentState } from './storage';

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

  const { account } = useAccount();
  const user = useUser();
  const { position } = usePosition();

  useEffect(() => {
    if (!account || !isSharing) {
      return;
    }
    const newSocket = io(
      typeof VITE_SOCKET_ENDPOINT === 'string' ? VITE_SOCKET_ENDPOINT : '',
      {
        auth: {
          token: account.steamId,
        },
        upgrade: false,
        transports: ['websocket'],
      }
    );
    setSocket(newSocket);

    return () => {
      newSocket.close();
      setSocket(null);
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

  return [isSharing, setIsSharing];
}

export default useShareLivePosition;
