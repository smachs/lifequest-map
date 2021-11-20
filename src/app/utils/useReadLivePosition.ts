import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAccount, useSetUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { usePersistentState } from './storage';
import { toast } from 'react-toastify';

const { VITE_SOCKET_ENDPOINT } = import.meta.env;

function useReadLivePosition(): [
  boolean,
  (value: boolean | ((value: boolean) => boolean)) => void
] {
  const [isReading, setIsReading] = usePersistentState(
    'read-live-position',
    false
  );

  const { account } = useAccount();
  const { setPosition } = usePosition();
  const setUsername = useSetUser();

  useEffect(() => {
    if (!account || !isReading) {
      return;
    }
    const socket = io(
      typeof VITE_SOCKET_ENDPOINT === 'string' ? VITE_SOCKET_ENDPOINT : '',
      {
        auth: {
          token: account.steamId,
        },
        upgrade: false,
        transports: ['websocket'],
      }
    );

    socket.emit(
      'status',
      ({
        username,
        position,
      }: {
        username?: string;
        position?: { location: [number, number]; rotation: number };
      }) => {
        if (username) {
          setUsername(username);
        }
        if (position) {
          setPosition(position);
        }
      }
    );

    socket.on('connect', () => {
      if (socket.connected) {
        toast.success('Sharing live status 👌');
      }
    });

    socket.on('position', setPosition);
    socket.on('username', setUsername);

    return () => {
      socket.close();
      toast.info('Stop sharing live status 🛑');
    };
  }, [isReading, account]);

  return [isReading, setIsReading];
}

export default useReadLivePosition;
