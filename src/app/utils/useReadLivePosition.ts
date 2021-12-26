import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAccount } from '../contexts/UserContext';
import { getJSONItem } from './storage';
import { toast } from 'react-toastify';
import useGroupPositions from '../components/WorldMap/useGroupPositions';
import { usePlayer } from '../contexts/PlayerContext';

export type Position = { location: [number, number]; rotation: number };
export type Player = {
  steamId: string;
  steamName: string;
  username: string | null;
  position: Position | null;
  location: string | null;
  region: string | null;
  worldName: string | null;
  map: string | null;
};
export type Group = {
  [playerToken: string]: Player;
};

function useReadLivePosition(): [boolean, (value: boolean) => void] {
  const { setPlayer, isSyncing, setIsSyncing } = usePlayer();
  const [group, setGroup] = useState<Group>({});
  const { account } = useAccount();

  useGroupPositions(group);

  useEffect(() => {
    if (!isSyncing) {
      return;
    }
    const token =
      account?.liveShareToken ||
      getJSONItem<string | null>('live-share-token', null);
    const serverUrl =
      account?.liveShareServerUrl ||
      getJSONItem<string | null>('live-share-server-url', null);

    if (!token || !serverUrl) {
      setIsSyncing(false);
      return;
    }

    const socket = io(serverUrl, {
      query: {
        token,
      },
      upgrade: false,
      transports: ['websocket'],
    });

    const updateStatus = (group: Group) => {
      const sessionIds = Object.keys(group);
      const playerSessionId =
        sessionIds.find((sessionId) => {
          if (account) {
            const player = group[sessionId];
            return player.steamId === account.steamId;
          }
          return true;
        }) || sessionIds[0];

      const player = group[playerSessionId];
      setPlayer(player);
      delete group[playerSessionId];
      setGroup(group);
    };

    socket.emit('status', updateStatus);
    socket.on('update', updateStatus);

    const handleHotkey = (steamId: string, hotkey: string) => {
      if (steamId !== account?.steamId) {
        return;
      }
      const event = new CustomEvent(`hotkey-${hotkey}`);
      window.dispatchEvent(event);
    };
    socket.on('hotkey', handleHotkey);

    socket.on('connect', () => {
      if (socket.connected) {
        toast.success('Sharing live status 👌');
      }
    });

    return () => {
      socket.off('connect');
      socket.off('update');
      socket.off('hotkey');

      socket.close();
      setGroup({});
      toast.info('Stop sharing live status 🛑');
    };
  }, [
    account?.liveShareToken,
    account?.liveShareServerUrl,
    isSyncing,
    account?.steamId,
  ]);

  return [isSyncing, setIsSyncing];
}

export default useReadLivePosition;
