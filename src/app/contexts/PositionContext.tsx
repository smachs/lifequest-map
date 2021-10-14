import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useContext } from 'react';
import { usePersistentState } from '../utils/storage';
import { getGameInfo, useIsNewWorldRunning } from '../utils/games';

type PositionContextProps = {
  position: [number, number] | null;
  following: boolean;
  toggleFollowing: () => void;
};
const PositionContext = createContext<PositionContextProps>({
  position: null,
  following: true,
  toggleFollowing: () => undefined,
});

type PositionProviderProps = {
  children: ReactNode;
};

export function PositionProvider({
  children,
}: PositionProviderProps): JSX.Element {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [following, setFollowing] = usePersistentState<boolean>(
    'following',
    true
  );
  const newWorldIsRunning = useIsNewWorldRunning();

  useEffect(() => {
    if (!newWorldIsRunning) {
      return;
    }
    let handler = setTimeout(updatePosition, 1);
    let active = true;
    let lastPosition = [0, 0];
    async function updatePosition() {
      try {
        const gameInfo = await getGameInfo();
        const locationJSON = gameInfo?.game_info?.location;
        if (locationJSON) {
          const location = JSON.parse(locationJSON);
          const position: [number, number] = [location.y, location.x];
          if (
            position &&
            lastPosition[0] !== position[0] &&
            lastPosition[1] !== position[1]
          ) {
            lastPosition = position;
            setPosition(position);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          handler = setTimeout(updatePosition, 1);
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
    <PositionContext.Provider value={{ position, following, toggleFollowing }}>
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition(): PositionContextProps {
  return useContext(PositionContext);
}
