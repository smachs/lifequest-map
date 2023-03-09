import { create } from 'zustand';
import { NEW_WORLD_CLASS_ID } from '../utils/games';
import { waitForOverwolf } from '../utils/overwolf';

type Store = {
  newWorldGameInfo: overwolf.games.RunningGameInfo | null;
  setNewWorldGameInfo: (
    newWorldGameInfo: overwolf.games.RunningGameInfo | null
  ) => void;
};

export const useStore = create<Store>((set) => {
  waitForOverwolf().then(() => {
    overwolf.games.onGameInfoUpdated.addListener((event) => {
      if (event.gameInfo?.classId === NEW_WORLD_CLASS_ID) {
        set({ newWorldGameInfo: event.gameInfo });
      } else {
        set({ newWorldGameInfo: null });
      }
    });

    overwolf.games.getRunningGameInfo((result) => {
      if (result?.classId === NEW_WORLD_CLASS_ID) {
        set({ newWorldGameInfo: result });
      } else {
        set({ newWorldGameInfo: null });
      }
    });
  });
  return {
    newWorldGameInfo: null,
    setNewWorldGameInfo: (newWorldGameInfo) => set({ newWorldGameInfo }),
  };
});

export const useNewWorldGameInfo = () => useStore().newWorldGameInfo;
