import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { fetchJSON } from '../utils/api';
import { usePersistentState } from '../utils/storage';
import { useFilters } from './FiltersContext';
import { useUser } from './UserContext';

export type Marker = {
  type: string;
  position?: [number, number, number];
  positions?: [number, number][];
  name?: string;
  level?: number;
  levelRange?: [number, number];
  description?: string;
  screenshotFilename?: string;
  createdAt: string;
  username?: string;
  _id: string;
};

type MarkersContextProps = {
  markers: Marker[];
  visibleMarkers: Marker[];
  refresh: () => void;
};
const MarkersContext = createContext<MarkersContextProps>({
  markers: [],
  visibleMarkers: [],
  refresh: () => undefined,
});

type MarkersProviderProps = {
  children: ReactNode;
  readonly?: boolean;
};

export function MarkersProvider({
  children,
  readonly,
}: MarkersProviderProps): JSX.Element {
  const [markers, setMarkers] = usePersistentState<Marker[]>('markers', []);
  const [filters] = useFilters();
  const user = useUser();

  const refresh = useCallback(() => {
    if (!readonly) {
      fetchJSON<Marker[]>('/api/markers').then((newMarkers) => {
        if (newMarkers.length !== markers.length) {
          setMarkers(newMarkers);
        }
      });
    }
  }, [readonly, markers]);

  useEffect(() => {
    refresh();
  }, []);

  const hiddenMarkerIds = user?.hiddenMarkerIds || [];
  const visibleMarkers = useMemo(
    () =>
      filters.includes('hidden')
        ? markers.filter((marker) =>
            filters.some((filter) => filter === marker.type)
          )
        : markers.filter(
            (marker) =>
              filters.some((filter) => filter === marker.type) &&
              !hiddenMarkerIds.includes(marker._id)
          ),
    [filters, markers, hiddenMarkerIds]
  );

  return (
    <MarkersContext.Provider value={{ markers, visibleMarkers, refresh }}>
      {children}
    </MarkersContext.Provider>
  );
}

export function useMarkers(): MarkersContextProps {
  return useContext(MarkersContext);
}
