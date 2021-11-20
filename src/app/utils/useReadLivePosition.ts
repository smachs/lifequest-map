import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSetUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { getJSONItem, usePersistentState } from './storage';
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

  const { setPosition } = usePosition();
  const setUsername = useSetUser();

  useEffect(() => {
    const token = getJSONItem('share-token', null);
    if (!token || !isReading) {
      return;
    }
    const socket = io(
      typeof VITE_SOCKET_ENDPOINT === 'string' ? VITE_SOCKET_ENDPOINT : '',
      {
        auth: {
          token: token,
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
  }, [isReading]);

  return [isReading, setIsReading];
}

export default useReadLivePosition;
