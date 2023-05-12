import type { Map } from 'leaflet';
import { Suspense, lazy, useEffect, useState } from 'react';
import type { Group, Player } from 'realtime/types';
import type { Socket } from 'socket.io-client';
import { shallow } from 'zustand/shallow';
import { usePlayerStore } from '../../utils/playerStore';
import { isEmbed } from '../../utils/routes';
import { useSettingsStore } from '../../utils/settingsStore';
import { useUserStore } from '../../utils/userStore';
import useGroupPositions from './useGroupPositions';
import useLayerGroups from './useLayerGroups';
import usePlayerPosition from './usePlayerPosition';
const LivePosition = lazy(() => import('./LivePosition'));

export type Position = { location: [number, number]; rotation: number };
let latestPlayer: Player | null = null;
let latestGroup: Group | null = null;

function MapData({
  leafletMap,
  isMinimap,
  rotate,
}: {
  leafletMap: Map | null;
  isMinimap?: boolean;
  rotate?: boolean;
}) {
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

  useEffect(() => {
    if (!token || !serverUrl || isEmbed) {
      return;
    }
    return () => {
      setGroup({});
      setSocket(null);
    };
  }, [token, serverUrl, account?.steamId]);

  useLayerGroups({
    leafletMap,
    socket,
  });
  usePlayerPosition({ isMinimap, leafletMap, rotate });

  return (
    <>
      {token && serverUrl && account?.steamId && (
        <Suspense>
          <LivePosition
            serverUrl={serverUrl}
            token={token}
            onSocket={setSocket}
            onGroup={updateStatus}
            onPlayer={updateData}
            onHotkey={handleHotkey}
          />
        </Suspense>
      )}
    </>
  );
}

export default MapData;
