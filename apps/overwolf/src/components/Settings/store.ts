import { withStorageDOMEvents } from 'ui/utils/storage';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type Store = {
  showSetup: boolean;
  setShowSetup: (showSetup: boolean) => void;
  rotateMinimap: boolean;
  setRotateMinimap: (rotateMinimap: boolean) => void;
  minimapOpacity: number;
  setMinimapOpacity: (minimapOpacity: number) => void;
  minimapBorderRadius: number;
  setMinimapBorderRadius: (minimapBorderRadius: number) => void;
  minimapZoom: number;
  setMinimapZoom: (minimapZoom: number) => void;
};

export const useMinimapSettingsStore = create(
  subscribeWithSelector(
    persist<Store>(
      (set) => ({
        showSetup: true,
        setShowSetup: (showSetup) => set({ showSetup }),
        rotateMinimap: false,
        setRotateMinimap: (rotateMinimap) => set({ rotateMinimap }),
        minimapOpacity: 80,
        setMinimapOpacity: (minimapOpacity) => set({ minimapOpacity }),
        minimapBorderRadius: 50,
        setMinimapBorderRadius: (minimapBorderRadius) =>
          set({ minimapBorderRadius }),
        minimapZoom: 5,
        setMinimapZoom: (minimapZoom) => set({ minimapZoom }),
      }),
      {
        name: 'minimap-settings-store',
      }
    )
  )
);

withStorageDOMEvents(useMinimapSettingsStore);
