import { useEffect, useState } from 'react';
import { useAccount } from '../contexts/UserContext';
import { getJSONItem } from './storage';
import { toast } from 'react-toastify';
import useGroupPositions from '../components/WorldMap/useGroupPositions';
import { usePlayer } from '../contexts/PlayerContext';
import { init } from 'realtime';

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

let latestPlayer: Player | null = null;
let latestGroup: Group | null = null;

function useReadLivePosition() {
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

      latestPlayer = group[playerSessionId];
      setPlayer(latestPlayer);
      delete group[playerSessionId];
      latestGroup = group;
      setGroup(group);
    };

    const updateData = (data: Partial<Player>) => {
      const { steamId, ...partialPlayer } = data;
      if (!steamId) {
        return;
      }
      if (latestPlayer && latestPlayer.steamId === steamId) {
        Object.assign(latestPlayer, partialPlayer);
        setPlayer({ ...latestPlayer });
      } else if (latestGroup) {
        const player = Object.values(latestGroup).find(
          (player) => player.steamId === steamId
        );
        if (player) {
          Object.assign(player, partialPlayer);
          setGroup({ ...latestGroup });
        }
      }
    };

    const handleHotkey = (steamId: string, hotkey: string) => {
      if (steamId !== account?.steamId) {
        return;
      }
      const event = new CustomEvent(`hotkey-${hotkey}`);
      window.dispatchEvent(event);
    };

    const { destroy } = init({
      serverUrl,
      token,
      onGroup: updateStatus,
      onPlayer: updateData,
      onHotkey: handleHotkey,
      onConnect: () => toast.success('Sharing live status 👌'),
    });

    return () => {
      destroy();
      setGroup({});
      toast.info('Stop sharing live status 🛑');
    };
  }, [
    account?.liveShareToken,
    account?.liveShareServerUrl,
    isSyncing,
    account?.steamId,
  ]);
}

export default useReadLivePosition;
