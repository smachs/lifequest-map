import { useEffect, useState } from 'react';
import { init } from 'realtime';
import type { Group, Player } from 'realtime/types';
import type { Socket } from 'socket.io-client';
import shallow from 'zustand/shallow';
import useGroupPositions from '../components/WorldMap/useGroupPositions';
import { usePlayerStore } from './playerStore';
import { isEmbed } from './routes';
import { useSettingsStore } from './settingsStore';
import { useUserStore } from './userStore';

export type Position = { location: [number, number]; rotation: number };
let latestPlayer: Player | null = null;
let latestGroup: Group | null = null;

function useReadLivePosition() {
  const { setPlayer } = usePlayerStore();
  const [group, setGroup] = useState<Group>({});
  const account = useUserStore((state) => state.account);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { liveShareServerUrl, liveShareToken } = useSettingsStore(
    (state) => ({
      liveShareServerUrl: state.liveShareServerUrl,
      liveShareToken: state.liveShareToken,
    }),
    shallow
  );
  useGroupPositions(group);

  const token = account?.liveShareToken || liveShareToken;
  const serverUrl = account?.liveShareServerUrl || liveShareServerUrl;

  useEffect(() => {
    if (!token || !serverUrl || isEmbed) {
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
      if (group[playerSessionId] && latestPlayer) {
        Object.assign(latestPlayer, group[playerSessionId]);
      } else {
        latestPlayer = group[playerSessionId];
      }
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

    const { destroy, socket } = init({
      serverUrl,
      token,
      onGroup: updateStatus,
      onPlayer: updateData,
      onHotkey: handleHotkey,
      onConnect: () => console.log('Sharing live status 👌'),
    });
    setSocket(socket);
    return () => {
      destroy();
      setGroup({});
      setSocket(null);
    };
  }, [token, serverUrl, account?.steamId]);

  return socket;
}

export default useReadLivePosition;
