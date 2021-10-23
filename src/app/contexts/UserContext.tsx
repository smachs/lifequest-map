import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useContext } from 'react';
import { fetchJSON } from '../utils/api';
import { writeError } from '../utils/logs';
import { usePersistentState } from '../utils/storage';

export type User = {
  _id: string;
  username: string;
  hiddenMarkerIds: string[];
  createdAt: Date;
  isModerator?: boolean;
};
type UserContextValue = {
  user: User | null;
  setUsername: (name: string) => void;
  refresh: () => void;
};
const UserContext = createContext<UserContextValue>({
  user: null,
  setUsername: () => undefined,
  refresh: () => undefined,
});

type UserProviderProps = {
  children: ReactNode;
};

export function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [user, setUser] = usePersistentState<User | null>('user', null);
  const [username, setUsername] = usePersistentState<string | null>(
    'username',
    null
  );

  const refresh = async (): Promise<void> => {
    try {
      if (!username) {
        return;
      }
      const result = await fetchJSON('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
        }),
      });
      setUser(result as User);
    } catch (error) {
      writeError(error);
    }
  };

  useEffect(() => {
    if (username) {
      refresh();
    }
  }, [username]);

  return (
    <UserContext.Provider value={{ user, setUsername, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): User | null {
  return useContext(UserContext).user;
}

export function useSetUser(): (name: string) => void {
  return useContext(UserContext).setUsername;
}

export function useRefreshUser(): () => void {
  return useContext(UserContext).refresh;
}
