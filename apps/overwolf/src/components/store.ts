import { waitForOverwolf } from 'ui/utils/overwolf';
import create from 'zustand';
import { NEW_WORLD_CLASS_ID } from '../utils/games';

type Store = {
  isNewWorldRunning: boolean;
  setIsNewWorldRunning: (isNewWorldRunning: boolean) => void;
};

export const useStore = create<Store>((set) => {
  waitForOverwolf().then(() => {
    overwolf.games.onGameInfoUpdated.addListener((event) => {
      if (event.gameChanged) {
        const isNewWorldRunning =
          event.gameInfo?.classId === NEW_WORLD_CLASS_ID;
        set({ isNewWorldRunning });
      }
    });

    overwolf.games.getRunningGameInfo((result) => {
      const isNewWorldRunning = result?.classId === NEW_WORLD_CLASS_ID;
      set({ isNewWorldRunning });
    });
  });
  return {
    isNewWorldRunning: false,
    setIsNewWorldRunning: (isNewWorldRunning) => set({ isNewWorldRunning }),
  };
});

export const useIsNewWorldRunning = () => useStore().isNewWorldRunning;
