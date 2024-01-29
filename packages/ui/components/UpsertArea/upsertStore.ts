import { create } from 'zustand';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
import type { MarkerFull } from 'static';

type Store = {
  marker: MarkerFull | true | undefined;
  setMarker: (marker: MarkerFull | true | undefined) => void;
  markerRoute: MarkerRouteItem | true | undefined;
  setMarkerRoute: (markerRoute: MarkerRouteItem | true | undefined) => void;
};
export const useUpsertStore = create<Store>((set) => ({
  marker: undefined,
  setMarker: (marker) => set({ marker }),
  markerRoute: undefined,
  setMarkerRoute: (markerRoute) => set({ markerRoute }),
}));
