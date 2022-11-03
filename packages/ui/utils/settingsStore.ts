import create from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { getJSONItem } from './storage';

type Store = {
  liveShareServerUrl: string;
  setLiveShareServerUrl: (liveShareServerUrl: string) => void;
  liveShareToken: string;
  setLiveShareToken: (liveShareToken: string) => void;
  following: boolean;
  toggleFollowing: () => void;
  showOtherPlayers: boolean;
  toggleShowOtherPlayers: () => void;
};

export const useSettingsStore = create(
  subscribeWithSelector(
    persist<Store>(
      (set) => ({
        liveShareServerUrl: getJSONItem('live-share-server-url', ''), // Deprecated
        setLiveShareServerUrl: (liveShareServerUrl) =>
          set({ liveShareServerUrl }),
        liveShareToken: getJSONItem('live-share-token', ''), // Deprecated
        setLiveShareToken: (liveShareToken) => set({ liveShareToken }),
        following: true,
        toggleFollowing: () =>
          set((state) => ({ following: !state.following })),
        showOtherPlayers: false,
        toggleShowOtherPlayers: () =>
          set((state) => ({ showOtherPlayers: !state.showOtherPlayers })),
      }),
      {
        name: 'settings-store',
      }
    )
  )
);
