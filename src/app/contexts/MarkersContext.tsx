import type { ReactNode } from 'react';
import { useState } from 'react';
import { useMemo } from 'react';
import { createContext, useContext, useEffect } from 'react';
import { getMarkerRoutes } from '../components/MarkerRoutes/api';
import type { MarkerRouteItem } from '../components/MarkerRoutes/MarkerRoutes';
import { latestLeafletMap } from '../components/WorldMap/useWorldMap';
import { fetchJSON } from '../utils/api';
import { writeError } from '../utils/logs';
import { notify } from '../utils/notifications';
import { usePersistentState } from '../utils/storage';
import { useFilters } from './FiltersContext';
import { useUser } from './UserContext';

export type MarkerBasic = {
  type: string;
  position: [number, number, number];
  name?: string;
  level?: number;
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
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  allMarkerRoutes: MarkerRouteItem[];
  refreshMarkerRoutes: () => void;
};
const MarkersContext = createContext<MarkersContextProps>({
  markers: [],
  markerRoutes: [],
  clearMarkerRoutes: () => undefined,
  toggleMarkerRoute: () => undefined,
  visibleMarkers: [],
  refresh: () => undefined,
  mode: null,
  setMode: () => undefined,
  allMarkerRoutes: [],
  refreshMarkerRoutes: () => undefined,
});

type MarkersProviderProps = {
  children: ReactNode;
  readonly?: boolean;
};

type Mode = 'route' | 'marker' | null;

export function MarkersProvider({
  children,
  readonly,
}: MarkersProviderProps): JSX.Element {
  const [markers, setMarkers] = usePersistentState<MarkerBasic[]>(
    'markers',
    []
  );
  const [allMarkerRoutes, setAllMarkerRoutes] = usePersistentState<
    MarkerRouteItem[]
  >('all-marker-routes', []);

  const [markerRoutes, setMarkerRoutes] = usePersistentState<MarkerRouteItem[]>(
    'markers-routes',
    []
  );
  const [mode, setMode] = useState<Mode>(null);

  const [filters, setFilters] = useFilters();
  const user = useUser();

  const refresh = () => {
    if (!readonly) {
      notify(
        fetchJSON<MarkerBasic[]>('/api/markers').then((newMarkers) => {
          if (JSON.stringify(newMarkers) !== JSON.stringify(markers)) {
            setMarkers(newMarkers);
          }
        })
      );
    }
  };

  const refreshMarkerRoutes = async () => {
    try {
      const newMarkerRoutes = await notify(getMarkerRoutes());
      setAllMarkerRoutes(newMarkerRoutes);
    } catch (error) {
      writeError(error);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const selectedMarkerRoutes: MarkerRouteItem[] = [];
    markerRoutes.forEach((markerRoute) => {
      const newMarkerRoute = allMarkerRoutes.find(
        (targetMarkerRoute) => targetMarkerRoute._id === markerRoute._id
      );
      if (newMarkerRoute) {
        selectedMarkerRoutes.push(newMarkerRoute);
      }
    });
    setMarkerRoutes(selectedMarkerRoutes);
  }, [allMarkerRoutes]);

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

  const toggleMarkerRoute = (markerRoute: MarkerRouteItem) => {
    const markerRoutesClone = [...markerRoutes];
    const index = markerRoutesClone.findIndex(
      (targetMarkerRoute) => targetMarkerRoute._id === markerRoute._id
    );
    if (index > -1) {
      markerRoutesClone.splice(index, 1);
    } else {
      const types = Object.keys(markerRoute.markersByType);
      setFilters((filters) => [
        ...filters,
        ...types.filter((type) => !filters.includes(type)),
      ]);
      markerRoutesClone.push(markerRoute);
      if (latestLeafletMap) {
        latestLeafletMap.fitBounds(markerRoute.positions);
      }
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
        mode,
        setMode,
        allMarkerRoutes,
        refreshMarkerRoutes,
      }}
    >
      {children}
    </MarkersContext.Provider>
  );
}

export function useMarkers(): MarkersContextProps {
  return useContext(MarkersContext);
}
