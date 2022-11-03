import create from 'zustand';
import type { Preset } from '../components/PresetSelect/presets';
import { fetchJSON } from './api';
import { writeError, writeWarn } from './logs';
import { notify } from './notifications';
import { persist } from 'zustand/middleware';
import { usePlayerStore } from './playerStore';
import { patchUser } from '../components/MarkerDetails/api';
import { getJSONItem } from './storage';

export type User = {
  _id: string;
  username: string;
  hiddenMarkerIds: string[];
  createdAt: Date;
  worldName?: string;
  isModerator?: boolean;
};

export type AccountDTO = {
  steamId: string;
  name: string;
  sessionId: string;
  isModerator?: boolean;
  favoriteRouteIds?: string[];
  liveShareToken?: string;
  liveShareServerUrl?: string;
  presets?: Preset[];
  createdAt: Date;
  hideAds?: boolean;
};

type Store = {
  user: User | null;
  refreshUser: (username?: string) => Promise<void>;
  account: AccountDTO | null;
  logoutAccount: () => void;
  setAccount: (account: AccountDTO) => void;
  refreshAccount: () => Promise<void>;
};

export const useUserStore = create(
  persist<Store>(
    (set, get) => {
      window.addEventListener('session-expired', () => {
        set({ account: null });
        writeWarn('Session expired');
      });

      usePlayerStore.subscribe(
        (state) => state.player?.username,
        (username) => {
          if (username) {
            get().refreshUser(username);
          }
        }
      );

      usePlayerStore.subscribe(
        (state) => state.player?.worldName,
        (worldName) => {
          const user = get().user;
          if (worldName && user && worldName !== user.worldName) {
            patchUser(user.username, { worldName }).then(() => {
              get().refreshUser();
            });
          }
        }
      );

      return {
        user: getJSONItem<User | null>('user', null), // Deprecated
        refreshUser: async (username) => {
          try {
            const targetUsername = username ?? get().user?.username;
            if (!targetUsername) {
              return;
            }
            const updatedUser = await notify(
              fetchJSON<User>('/api/users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  username: targetUsername,
                }),
              })
            );
            set({ user: updatedUser });
          } catch (error) {
            writeError(error);
          }
        },
        account: getJSONItem<AccountDTO | null>('account', null), // Deprecated,
        logoutAccount: async () => {
          try {
            await fetchJSON<string>('/api/auth/logout');
          } catch (error) {
            // DO nothing
          } finally {
            set({ account: null });
          }
        },
        setAccount: (account) => set({ account }),
        refreshAccount: async () => {
          try {
            const account = await notify(
              fetchJSON<AccountDTO>(`/api/auth/account`)
            );
            set({ account });
          } catch (error) {
            writeError(error);
          }
        },
      };
    },
    {
      name: 'user-store',
      onRehydrateStorage: () => {
        return (state) => {
          if (state?.account) {
            state.refreshAccount();
          }
        };
      },
    }
  )
);
