import create from 'zustand';
import type { Player } from './useReadLivePosition';

type Store = {
  player: Player | null;
  setPlayer: (player: Player) => void;
};

export const usePlayerStore = create<Store>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
}));
