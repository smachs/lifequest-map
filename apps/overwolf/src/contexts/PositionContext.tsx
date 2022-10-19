import type { ReactNode } from 'react';
import { useState } from 'react';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { createContext, useContext } from 'react';
import {
  findRegion,
  findLocation,
  mapIsAeternumMap,
  findMapDetails,
  AETERNUM_MAP,
} from 'static';
import { writeError } from 'ui/utils/logs';
import { getGameInfo, useIsNewWorldRunning } from 'ui/utils/games';
import { getLocation } from '../utils/ocr';

export type Position = { location: [number, number]; rotation: number };
type PositionContextProps = {
  position: Position | null;
  location: string | null;
  region: string | null;
  worldName: string | null;
  map: string | null;
  username: string | null;
  fallbackToOCR: boolean;
};

const PositionContext = createContext<PositionContextProps>({
  position: null,
  location: null,
  region: null,
  worldName: null,
  map: null,
  username: null,
  fallbackToOCR: false,
});

type PositionProviderProps = {
  children: ReactNode;
};

export function PositionProvider({
  children,
}: PositionProviderProps): JSX.Element {
  const [position, setPosition] = useState<Position | null>(null);
  const [worldName, setWorldName] = useState<string>('Unknown');
  const [map, setMap] = useState<string>(AETERNUM_MAP.name);
  const [username, setUsername] = useState<string | null>(null);
  const newWorldIsRunning = useIsNewWorldRunning();
  const [fallbackToOCR, setFallbackToOCR] = useState(false);

  const location = useMemo(
    () =>
      (map &&
        mapIsAeternumMap(map) &&
        position &&
        findLocation(position.location)) ||
      null,
    [position, map]
  );
  const region = useMemo(() => {
    if (map && !mapIsAeternumMap(map)) {
      const world = findMapDetails(map);
      return world?.title || 'Unknown';
    }
    return position && findRegion(position.location);
  }, [position, map]);

  useEffect(() => {
    if (!newWorldIsRunning) {
      return;
    }

    overwolf.games.events.setRequiredFeatures(['game_info'], () => undefined);

    let handler = setTimeout(updatePosition, 50);
    let active = true;

    let lastLocation: [number, number] | null = null;
    let lastRotation: number | null = null;
    let hasError = false;
    let lastPlayerName = '';
    let lastWorldName = '';
    let lastMap = '';
    async function updatePosition() {
      try {
        const gameInfo = await getGameInfo();
        const {
          player_name: playerName,
          location: locationList,
          world_name: worldName,
          map,
        } = gameInfo?.game_info || {};
        if (locationList) {
          const location: [number, number] = [
            +locationList.match(/position.y,(\d+.\d+)/)[1],
            +locationList.match(/position.x,(\d+.\d+)/)[1],
          ];
          const rotation = +locationList.match(/rotation.z,(\d+)/)[1];
          if (
            lastLocation?.[0] !== location[0] ||
            lastLocation?.[1] !== location[1] ||
            lastRotation !== rotation
          ) {
            lastLocation = location;
            lastRotation = rotation;
            setPosition({
              location,
              rotation,
            });
            hasError = false;
          }
          if (fallbackToOCR) {
            setFallbackToOCR(false);
          }
        } else {
          const location = await getLocation();
          const rotation = 90; // Need to find out the correct calculation
          // const rotation =
          //   (Math.atan2(
          //     location[1] - (lastLocation?.[1] || location[1]),
          //     location[0] - (lastLocation?.[0] || location[0])
          //   ) *
          //     180) /
          //   -Math.PI;

          if (
            lastLocation?.[0] !== location[0] ||
            lastLocation?.[1] !== location[1] ||
            lastRotation !== rotation
          ) {
            lastLocation = location;
            setPosition({
              location,
              rotation,
            });
            if (!fallbackToOCR) {
              setFallbackToOCR(true);
            }
          }
        }
        if (playerName && playerName !== lastPlayerName) {
          lastPlayerName = playerName;
          setUsername(playerName);
        }
        if (worldName && worldName !== lastWorldName) {
          lastWorldName = worldName;
          setWorldName(worldName);
        }
        if (map && map !== lastMap) {
          lastMap = map;
          setMap(lastMap);
        }
      } catch (error) {
        if (!hasError) {
          writeError(error);
          hasError = true;
        }
      } finally {
        if (active) {
          handler = setTimeout(updatePosition, 50);
        }
      }
    }

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [newWorldIsRunning, fallbackToOCR]);

  return (
    <PositionContext.Provider
      value={{
        position,
        location,
        region,
        map,
        worldName,
        username,
        fallbackToOCR,
      }}
    >
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition(): PositionContextProps {
  return useContext(PositionContext);
}
