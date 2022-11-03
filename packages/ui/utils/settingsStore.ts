import create from 'zustand';
import { persist } from 'zustand/middleware';
import { getJSONItem } from './storage';

type Store = {
  liveShareServerUrl: string;
  setLiveShareServerUrl: (liveShareServerUrl: string) => void;
  liveShareToken: string;
  setLiveShareToken: (liveShareToken: string) => void;
  following: boolean;
  toggleFollowing: () => void;
};

export const useSettingsStore = create(
  persist<Store>(
    (set) => ({
      liveShareServerUrl: getJSONItem('live-share-server-url', ''),
      setLiveShareServerUrl: (liveShareServerUrl) =>
        set({ liveShareServerUrl }),
      liveShareToken: getJSONItem('live-share-token', ''),
      setLiveShareToken: (liveShareToken) => set({ liveShareToken }),
      following: true,
      toggleFollowing: () => set((state) => ({ following: !state.following })),
    }),
    {
      name: 'settings-store',
    }
  )
);
