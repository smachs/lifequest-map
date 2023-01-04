import { getJSONItem, withStorageDOMEvents } from 'ui/utils/storage';
import create from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type Store = {
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
        rotateMinimap: getJSONItem('rotateMinimap', false), // Deprecated
        setRotateMinimap: (rotateMinimap) => set({ rotateMinimap }),
        minimapOpacity: getJSONItem('minimapOpacity', 80), // Deprecated
        setMinimapOpacity: (minimapOpacity) => set({ minimapOpacity }),
        minimapBorderRadius: getJSONItem('minimapBorderRadius', 50), // Deprecated
        setMinimapBorderRadius: (minimapBorderRadius) =>
          set({ minimapBorderRadius }),
        minimapZoom: getJSONItem('minimapZoom', 5), // Deprecated
        setMinimapZoom: (minimapZoom) => set({ minimapZoom }),
      }),
      {
        name: 'minimap-settings-store',
      }
    )
  )
);

withStorageDOMEvents(useMinimapSettingsStore);
