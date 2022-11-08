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
import { writeError, writeLog } from 'ui/utils/logs';
import { useIsNewWorldRunning } from '../components/store';
import { getGameInfo, getNewWorldRunning } from '../utils/games';
import {
  getLocation,
  getScreenshotFromNewWorld,
  toLocation,
} from '../utils/ocr';

export type Position = { location: [number, number]; rotation: number };
type PositionContextProps = {
  position: Position | null;
  location: string | null;
  region: string | null;
  worldName: string | null;
  map: string | null;
  username: string | null;
  isOCR: boolean;
};

const PositionContext = createContext<PositionContextProps>({
  position: null,
  location: null,
  region: null,
  worldName: null,
  map: null,
  username: null,
  isOCR: false,
});

type PositionProviderProps = {
  children: ReactNode;
};

const calcRotation = (
  location: [number, number],
  lastLocation: [number, number] | null
) => {
  return (
    (Math.atan2(
      location[0] - (lastLocation?.[0] || location[0]),
      location[1] - (lastLocation?.[1] || location[1])
    ) *
      180) /
    Math.PI
  );
};

export function PositionProvider({
  children,
}: PositionProviderProps): JSX.Element {
  const [position, setPosition] = useState<Position | null>(null);
  const [worldName, setWorldName] = useState<string>('Unknown');
  const [map, setMap] = useState<string>(AETERNUM_MAP.name);
  const [username, setUsername] = useState<string | null>(null);
  const newWorldIsRunning = useIsNewWorldRunning();
  const [isOCR, setIsOCR] = useState(false);

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
    overwolf.games.events.setRequiredFeatures(['game_info'], (event) =>
      writeLog(event)
    );

    let handler = setTimeout(updatePosition, 50);
    let active = true;

    let lastLocation: [number, number] | null = position?.location || null;
    let hasError = false;
    let lastUsername = username;
    let lastWorldName = worldName;
    let lastMap = map;
    let falsePositiveCount = 0;
    let lastIsOCR = isOCR;

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
          let rotation: number;
          if (locationList.includes('player.compass,NONE')) {
            rotation = calcRotation(location, lastLocation);
          } else {
            rotation = +locationList.match(/rotation.z,(\d+)/)[1];
          }
          if (
            lastLocation?.[0] !== location[0] ||
            lastLocation?.[1] !== location[1]
          ) {
            lastLocation = location;
            setPosition({
              location,
              rotation,
            });
          }
          if (lastIsOCR) {
            lastIsOCR = false;
            setIsOCR(false);
          }
        } else {
          // OCR is too fast, delay it
          await new Promise((resolve) => setTimeout(resolve, 80));

          const newWorld = await getNewWorldRunning();
          if (newWorld?.isInFocus) {
            // OCR fallback
            const url = await getScreenshotFromNewWorld();
            const locationString = await getLocation(url);
            try {
              const location = toLocation(locationString);
              if (location) {
                const rotation = calcRotation(location, lastLocation);

                if (
                  lastLocation?.[0] !== location[0] ||
                  lastLocation?.[1] !== location[1]
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
                if (!lastIsOCR) {
                  lastIsOCR = true;
                  setIsOCR(true);
                }
              }
            } catch (error) {
              //
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
        hasError = false;
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
        isOCR,
      }}
    >
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition(): PositionContextProps {
  return useContext(PositionContext);
}
