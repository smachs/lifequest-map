import type { ReactNode } from 'react';
import { createContext, useEffect, useContext } from 'react';
import { usePersistentState } from '../utils/storage';
import { getGameInfo, useIsNewWorldRunning } from '../utils/games';
import { useSetUser } from './UserContext';
import { writeError } from '../utils/logs';

export type Position = { location: [number, number]; rotation: number };
type PositionContextProps = {
  position: Position;
  setPosition: (value: Position | ((value: Position) => Position)) => void;
  following: boolean;
  toggleFollowing: () => void;
};

export const defaultPosition: Position = {
  location: [325, 9750],
  rotation: 90,
};
const PositionContext = createContext<PositionContextProps>({
  position: defaultPosition,
  setPosition: () => undefined,
  following: true,
  toggleFollowing: () => undefined,
});

type PositionProviderProps = {
  children: ReactNode;
};

export function PositionProvider({
  children,
}: PositionProviderProps): JSX.Element {
  const [position, setPosition] = usePersistentState<Position>(
    'position',
    defaultPosition,
    false
  );
  const [following, setFollowing] = usePersistentState<boolean>(
    'following',
    true
  );
  const newWorldIsRunning = useIsNewWorldRunning();
  const setUsername = useSetUser();

  useEffect(() => {
    if (!newWorldIsRunning) {
      return;
    }

    overwolf.games.events.setRequiredFeatures(['game_info'], () => undefined);

    let handler = setTimeout(updatePosition, 50);
    let active = true;

    let lastLocation = position.location;
    let lastRotation = position.rotation;
    let hasError = false;
    let lastPlayerName = '';
    async function updatePosition() {
      try {
        const gameInfo = await getGameInfo();
        const { player_name, location: locationList } =
          gameInfo?.game_info || {};
        if (locationList) {
          const location: [number, number] = [
            +locationList.match(/position.y,(\d+.\d+)/)[1],
            +locationList.match(/position.x,(\d+.\d+)/)[1],
          ];
          const rotation = +locationList.match(/rotation.z,(\d+)/)[1];
          if (
            lastLocation[0] !== location[0] ||
            lastLocation[1] !== location[1] ||
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
        }
        if (player_name && player_name !== lastPlayerName) {
          lastPlayerName = player_name;
          setUsername(player_name);
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

  function toggleFollowing() {
    setFollowing(!following);
  }
  return (
    <PositionContext.Provider
      value={{ position, setPosition, following, toggleFollowing }}
    >
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition(): PositionContextProps {
  return useContext(PositionContext);
}
