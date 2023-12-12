import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AETERNUM_MAP,
  findLocation,
  findMapDetails,
  findRegion,
  mapIsAeternumMap,
} from 'static';
import { useSettingsStore } from 'ui/utils/settingsStore';
import { promisifyOverwolf } from 'ui/utils/wrapper';
import { useNewWorldGameInfo } from '../components/store';
import type { DiscordRPCPlugin } from '../utils/discord-rpc';
import { loadDiscordRPCPlugin } from '../utils/discord-rpc';
import { getGameInfo } from '../utils/games';
import type { MOVEMENT } from '../utils/inputTracking';
import { listenToMovement } from '../utils/inputTracking';

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
  const settingsStore = useSettingsStore();

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
    let lastGuessedLocation: [number, number] | null = null;
    let lastZ: number | null = null;
    let lastRotation: number | null = position?.rotation || null;
    let hasError = false;
    let lastUsername = username;
    let lastWorldName = worldName;
    let lastMap = map;
    let lastUpdate = Date.now();

    let lastMovement: MOVEMENT = 'none';
    let lastIsJumping = false;
    const stopListenToKeysDown = listenToMovement((movement, isJumping) => {
      lastMovement = movement;
      lastIsJumping = isJumping;
    });

    async function updatePosition() {
      try {
        const gameInfo = await getGameInfo();
        const timeDiff = Date.now() - lastUpdate;
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
            const z = +locationList.match(/position.z,(\d+.\d+)/)[1];
            let rotation: number;
            if (locationList.includes('player.compass,NONE')) {
              rotation = calcRotation(location, lastLocation);
            } else {
              rotation = +locationList.match(/rotation.z,(\d+)/)[1];
            }
            const isMoving = lastZ !== z;
            if (
              lastLocation?.[0] !== location[0] ||
              lastLocation?.[1] !== location[1] ||
              lastRotation !== rotation ||
              isMoving
            ) {
              const guessedLocation: [number, number] = [...location];
              if (!lastGuessedLocation) {
                lastGuessedLocation = [...guessedLocation];
              }
              let guessed = false;
              if (lastLocation) {
                if (!settingsStore.extrapolatePlayerPosition) {
                  guessed = true;
                } else if (
                  location[0] - lastLocation[0] > 25 ||
                  location[1] - lastLocation[1] > 25
                ) {
                  guessed = true;
                } else if (location[0] > lastLocation[0]) {
                  guessed = true;
                  guessedLocation[0] = lastLocation[0];
                  guessedLocation[1] = lastGuessedLocation[1];
                } else if (location[0] < lastLocation[0]) {
                  guessed = true;
                  guessedLocation[0] = location[0];
                  guessedLocation[1] = lastGuessedLocation[1];
                } else if (location[1] > lastLocation[1]) {
                  guessed = true;
                  guessedLocation[1] = location[1] - 25;
                  guessedLocation[0] = lastGuessedLocation[0];
                } else if (location[1] < lastLocation[1]) {
                  guessed = true;
                  guessedLocation[1] = location[1];
                  guessedLocation[0] = lastGuessedLocation[0];
                } else if (isMoving) {
                  guessed = true;
                  guessedLocation[0] = lastGuessedLocation[0];
                  guessedLocation[1] = lastGuessedLocation[1];

                  let velocity = lastMovement.startsWith('backward')
                    ? 0.00625
                    : 0.0125;
                  let movementRotation = rotation;
                  if (lastMovement === 'left') {
                    movementRotation = rotation + 90;
                  } else if (lastMovement === 'right') {
                    movementRotation = rotation - 90;
                  } else if (lastMovement === 'backward') {
                    movementRotation = rotation + 180;
                  } else if (lastMovement === 'backward_left') {
                    movementRotation = rotation + 135;
                  } else if (lastMovement === 'backward_right') {
                    movementRotation = rotation + 225;
                  } else if (lastMovement === 'forward_left') {
                    movementRotation = rotation + 45;
                  } else if (lastMovement === 'forward_right') {
                    movementRotation = rotation + 315;
                  } else if (lastMovement === 'forward') {
                    movementRotation = rotation;
                  } else if (lastIsJumping) {
                    velocity = 0;
                  }

                  const distance = velocity * timeDiff;

                  const yDiff =
                    Math.sin((movementRotation * Math.PI) / 180) * distance;
                  const xDiff =
                    Math.cos((movementRotation * Math.PI) / 180) * distance;
                  if (yDiff > 0) {
                    if (guessedLocation[0] + yDiff < location[0] + 25) {
                      guessedLocation[0] = guessedLocation[0] + yDiff;
                    } else {
                      guessedLocation[0] = location[0] + 25;
                    }
                  } else {
                    if (guessedLocation[0] + yDiff > location[0] - 25) {
                      guessedLocation[0] = guessedLocation[0] + yDiff;
                    } else {
                      guessedLocation[0] = location[0] - 25;
                    }
                  }
                  if (xDiff > 0) {
                    if (guessedLocation[1] + xDiff < location[1] + 25) {
                      guessedLocation[1] = guessedLocation[1] + xDiff;
                    } else {
                      guessedLocation[1] = location[1] + 25;
                    }
                  } else {
                    if (guessedLocation[1] + xDiff > location[1] - 25) {
                      guessedLocation[1] = guessedLocation[1] + xDiff;
                    } else {
                      guessedLocation[1] = location[1] - 25;
                    }
                  }
                }
              }
              lastLocation = location;
              lastGuessedLocation = guessedLocation;
              lastRotation = rotation;
              lastZ = z;
              if (guessed) {
                setPosition({
                  location: guessedLocation,
                  rotation,
                });
              } else {
                setPosition((position) => ({
                  location: position?.location || location,
                  rotation,
                }));
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
        }
      } catch (error) {
        if (!hasError) {
          console.error(error);
          hasError = true;
        }
      } finally {
        if (active) {
          lastUpdate = Date.now();
          handler = setTimeout(updatePosition, 50);
        }
      }
    }

    return () => {
      active = false;
      clearTimeout(handler);
      stopListenToKeysDown();
    };
  }, [newWorldGameInfo?.isRunning, settingsStore.extrapolatePlayerPosition]);

  const discordRPCPlugin = useRef<DiscordRPCPlugin | null>(null);
  useEffect(() => {
    if (discordRPCPlugin.current) return;

    loadDiscordRPCPlugin('930068687380168765').then((result) => {
      discordRPCPlugin.current = result;
      discordRPCPlugin.current.onLogLine.addListener((message) => {
        console.log(`DISCORD RPC - ${message.level} - ${message.message}`);

        if (message.message == 'Failed to connect for some reason.') {
          console.log(
            'Shutting down Discord RPC because of too many connections errors'
          );
          discordRPCPlugin.current = null;
          promisifyOverwolf(result.dispose)();
        }

        if (
          message.message ==
          'We have been told to terminate by discord: (4000) Invalid Client ID'
        ) {
          console.log(
            'Shutting down Discord RPC because of too many connections errors'
          );
          discordRPCPlugin.current = null;
          promisifyOverwolf(result.dispose)();
        }
      });
    });
  }, []);

  useEffect(() => {
    if (discordRPCPlugin.current && username && region) {
      discordRPCPlugin.current.updatePresence(
        username,
        region,
        'new-world',
        'New World',
        'thgl',
        'Aeternum Map・The Hidden Gaming Lair',
        true,
        0,
        'Get The App',
        'https://www.th.gl/apps/Aeternum%20Map?ref=discordrpc',
        '',
        '',
        () => null
      );
    }
  }, [username, worldName, region]);

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
