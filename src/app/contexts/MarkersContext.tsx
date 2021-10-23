import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';
import type { MarkerRouteItem } from '../components/MarkerRoutes/MarkerRoutes';
import { fetchJSON } from '../utils/api';
import { usePersistentState } from '../utils/storage';
import { useFilters } from './FiltersContext';
import { useUser } from './UserContext';

export type MarkerBasic = {
  type: string;
  position?: [number, number, number];
  positions?: [number, number][];
  name?: string;
  level?: number;
  levelRange?: [number, number];
  comments?: number;
  _id: string;
};

type MarkersContextProps = {
  markers: MarkerBasic[];
  markerRoutes: MarkerRouteItem[];
  clearMarkerRoutes: () => void;
  toggleMarkerRoute: (markerRoute: MarkerRouteItem) => void;
  visibleMarkers: MarkerBasic[];

  refresh: () => void;
};
const MarkersContext = createContext<MarkersContextProps>({
  markers: [],
  markerRoutes: [],
  clearMarkerRoutes: () => undefined,
  toggleMarkerRoute: () => undefined,
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
  const [markers, setMarkers] = usePersistentState<MarkerBasic[]>(
    'markers',
    []
  );
  const [markerRoutes, setMarkerRoutes] = usePersistentState<MarkerRouteItem[]>(
    'markers-routes',
    []
  );
  const [filters] = useFilters();
  const user = useUser();

  const refresh = useCallback(() => {
    if (!readonly) {
      fetchJSON<MarkerBasic[]>('/api/markers').then((newMarkers) => {
        setMarkers(newMarkers);
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

  const toggleMarkerRoute = (targetMarkerRoute: MarkerRouteItem) => {
    const markerRoutesClone = [...markerRoutes];
    const index = markerRoutesClone.findIndex(
      (markerRoute) => markerRoute.name === targetMarkerRoute.name
    );
    if (index > -1) {
      markerRoutesClone.splice(index, 1);
    } else {
      markerRoutesClone.push(targetMarkerRoute);
    }
    setMarkerRoutes(markerRoutesClone);
  };

  function clearMarkerRoutes() {
    setMarkerRoutes([]);
  }

  return (
    <MarkersContext.Provider
      value={{
        markers,
        visibleMarkers,
        refresh,
        markerRoutes,
        clearMarkerRoutes,
        toggleMarkerRoute,
      }}
    >
      {children}
    </MarkersContext.Provider>
  );
}

export function useMarkers(): MarkersContextProps {
  return useContext(MarkersContext);
}
