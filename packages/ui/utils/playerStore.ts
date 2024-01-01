import type { Player } from 'aeternum-map-realtime/types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type Store = {
  player: Player | null;
  setPlayer: (player: Player) => void;
};

export const usePlayerStore = create(
  subscribeWithSelector<Store>((set) => ({
    player: null,
    setPlayer: (player) => set({ player }),
  }))
);
