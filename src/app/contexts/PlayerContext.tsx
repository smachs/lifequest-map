import type { ReactNode } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { createContext, useContext } from 'react';
import { usePersistentState } from '../utils/storage';
import type { Player } from '../utils/useReadLivePosition';
import { useSetUser } from './UserContext';

type PlayerContextProps = {
  player: Player | null;
  setPlayer: (value: Player) => void;
  following: boolean;
  toggleFollowing: () => void;
  isSyncing: boolean;
  setIsSyncing: (isSyncing: boolean) => void;
};

const PlayerContext = createContext<PlayerContextProps>({
  player: null,
  setPlayer: () => undefined,
  following: true,
  toggleFollowing: () => undefined,
  isSyncing: false,
  setIsSyncing: () => undefined,
});

type PlayerProviderProps = {
  children: ReactNode;
};

export function PlayerProvider({ children }: PlayerProviderProps): JSX.Element {
  const [player, setPlayer] = useState<Player | null>(null);
  const [following, setFollowing] = usePersistentState<boolean>(
    'following',
    true
  );
  const setUsername = useSetUser();
  const [isSyncing, setIsSyncing] = usePersistentState(
    'read-live-position',
    false
  );

  useEffect(() => {
    if (player?.username) {
      setUsername(player.username);
    }
  }, [player?.username]);

  function toggleFollowing() {
    setFollowing(!following);
  }

  return (
    <PlayerContext.Provider
      value={{
        following,
        toggleFollowing,
        player,
        setPlayer,
        isSyncing,
        setIsSyncing,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextProps {
  return useContext(PlayerContext);
}
