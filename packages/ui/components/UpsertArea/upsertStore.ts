import create from 'zustand';
import type { MarkerFull } from '../MarkerDetails/useMarker';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';

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
