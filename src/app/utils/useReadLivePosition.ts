import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSetUser } from '../contexts/UserContext';
import { usePosition } from '../contexts/PositionContext';
import { getJSONItem, usePersistentState } from './storage';
import { toast } from 'react-toastify';
import useGroupPositions from '../components/WorldMap/useGroupPositions';

type Position = { location: [number, number]; rotation: number };
type Player = {
  username: string | null;
  position: Position | null;
};
export type Group = {
  [playerToken: string]: Player;
};

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
  const [group, setGroup] = useState<Group>({});

  useGroupPositions(group);

  useEffect(() => {
    const playerToken = getJSONItem('player-token', null);
    const groupToken = getJSONItem('group-token', null);
    if (!playerToken || !groupToken || !isReading) {
      return;
    }
    const socket = io(
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

    socket.emit('status', (group: Group) => {
      const player = group[playerToken];
      if (player) {
        if (player.username) {
          setUsername(player.username);
        }
        if (player.position) {
          setPosition(player.position);
        }
      }
      setGroup(group);
    });

    socket.on('connect', () => {
      if (socket.connected) {
        toast.success('Sharing live status 👌');
      }
    });

    socket.on('update', (group: Group) => {
      const player = group[playerToken];
      if (player) {
        if (player.username) {
          setUsername(player.username);
        }
        if (player.position) {
          setPosition(player.position);
        }
      }
      setGroup(group);
    });

    return () => {
      socket.close();
      toast.info('Stop sharing live status 🛑');
    };
  }, [isReading]);

  return [isReading, setIsReading];
}

export default useReadLivePosition;
