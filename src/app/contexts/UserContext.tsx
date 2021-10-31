import type { ReactNode } from 'react';
import { createContext, useEffect, useContext } from 'react';
import { fetchJSON } from '../utils/api';
import { writeError } from '../utils/logs';
import { notify } from '../utils/notifications';
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
  account: AccountDTO | null;
  logoutAccount: () => void;
  refreshAccount: (verifyingSessionId?: string) => void;
};
const UserContext = createContext<UserContextValue>({
  user: null,
  setUsername: () => undefined,
  refresh: () => undefined,
  account: null,
  logoutAccount: () => undefined,
  refreshAccount: () => undefined,
});

type UserProviderProps = {
  children: ReactNode;
};

export type AccountDTO = {
  steamId: string;
  name: string;
  sessionId: string;
  isModerator?: boolean;
  favoriteRouteIds?: string[];
  createdAt: Date;
};

export function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [user, setUser] = usePersistentState<User | null>('user', null);
  const [username, setUsername] = usePersistentState<string | null>(
    'username',
    null
  );
  const [account, setAccount] = usePersistentState<AccountDTO | null>(
    'account',
    null
  );

  const refresh = async (): Promise<void> => {
    try {
      if (!username) {
        return;
      }
      const result = await notify(
        fetchJSON('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
          }),
        })
      );
      setUser(result as User);
    } catch (error) {
      writeError(error);
    }
  };

  const refreshAccount = async (verifyingSessionId?: string): Promise<void> => {
    try {
      const init: RequestInit = {};
      if (verifyingSessionId) {
        init.headers = {
          'x-session-id': verifyingSessionId,
        };
      }
      const account = await fetchJSON<AccountDTO>(`/api/auth/account`, init);
      setAccount(account);
    } catch (error) {
      if (verifyingSessionId) {
        // Keep waiting
        return;
      }
      writeError(error);
    }
  };

  const logoutAccount = async () => {
    try {
      await fetchJSON<string>('/api/auth/logout');
    } catch (error) {
      // DO nothing
    } finally {
      setAccount(null);
    }
  };

  useEffect(() => {
    function handleSessionExpired() {
      setAccount(null);
      console.log('Expired');
    }
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (username) {
      refresh();
    }
  }, [username]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUsername,
        refresh,
        account,
        refreshAccount,
        logoutAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useAccount(): {
  account: AccountDTO | null;
  refreshAccount: (verifyingSessionId?: string) => void;
  logoutAccount: () => void;
} {
  const { account, refreshAccount, logoutAccount } = useContext(UserContext);
  return { account, refreshAccount, logoutAccount };
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
