import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { usePersistentState } from '../utils/storage';

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
