import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AETERNUM_MAP,
  findLocation,
  findMapDetails,
  findRegion,
  mapIsAeternumMap,
} from 'static';
import { useNewWorldGameInfo } from '../components/store';
import { getGameInfo } from '../utils/games';

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
  const newWorldGameInfo = useNewWorldGameInfo();

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
    if (!newWorldGameInfo?.isRunning) {
      return;
    }
    overwolf.games.events.setRequiredFeatures(['game_info'], (event) =>
      console.log(event)
    );

    let handler = setTimeout(updatePosition, 50);
    let active = true;

    let lastLocation: [number, number] | null = position?.location || null;
    let lastRotation: number | null = position?.rotation || null;
    let hasError = false;
    let lastUsername = username;
    let lastWorldName = worldName;
    let lastMap = map;

    async function updatePosition() {
      try {
        const gameInfo = await getGameInfo();
        if (gameInfo?.game_info) {
          const {
            player_name: username,
            location: locationList,
            world_name: worldName,
            map,
          } = gameInfo.game_info;
          if (locationList) {
            const location: [number, number] = [
              +locationList.match(/position.y,(\d+.\d{3})/)[1],
              +locationList.match(/position.x,(\d+.\d{3})/)[1],
            ];
            let rotation: number;
            if (locationList.includes('player.compass,NONE')) {
              rotation = calcRotation(location, lastLocation);
            } else {
              rotation = +locationList.match(/rotation.z,(\d+)/)[1];
            }
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
        }
      } catch (error) {
        if (!hasError) {
          console.error(error);
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
  }, [newWorldGameInfo?.isRunning]);

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
