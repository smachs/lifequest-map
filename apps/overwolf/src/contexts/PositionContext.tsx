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
};

const PositionContext = createContext<PositionContextProps>({
  position: null,
  location: null,
  region: null,
  worldName: null,
  map: null,
  username: null,
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

    let lastLocation: [number, number] | null = position?.location || null;
    let lastRotation: number | null = position?.rotation || null;
    let hasError = false;
    let lastUsername = username;
    let lastWorldName = worldName;
    let lastMap = map;
    let falsePositiveCount = 0;
    async function updatePosition() {
      try {
        const gameInfo = await getGameInfo();
        const {
          player_name: username,
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
        } else {
          // OCR fallback
          const location = await getLocation();
          const rotation =
            (Math.atan2(
              location[0] - (lastLocation?.[0] || location[0]),
              location[1] - (lastLocation?.[1] || location[1])
            ) *
              180) /
            Math.PI;

          if (
            lastLocation?.[0] !== location[0] ||
            lastLocation?.[1] !== location[1] ||
            lastRotation !== rotation
          ) {
            const distance = lastLocation
              ? Math.sqrt(
                  Math.pow(location[0] - lastLocation[0], 2) +
                    Math.pow(location[1] - lastLocation[1], 2)
                )
              : 0;
            if (distance > 50 && falsePositiveCount < 5) {
              // Might be false positive
              falsePositiveCount++;
            } else {
              falsePositiveCount = 0;
              lastLocation = location;

              setPosition({
                location,
                rotation,
              });
            }
          }
        }
        if (username && username !== lastUsername) {
          lastUsername = username;
          setUsername(username);
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
  }, [newWorldIsRunning]);

  return (
    <PositionContext.Provider
      value={{
        position,
        location,
        region,
        map,
        worldName,
        username,
      }}
    >
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition(): PositionContextProps {
  return useContext(PositionContext);
}
