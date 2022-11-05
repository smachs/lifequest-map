import type { ReactNode } from 'react';
import { useState } from 'react';
import { useMemo } from 'react';
import { createContext, useContext, useEffect } from 'react';
import { getMarkerRoutes } from '../components/MarkerRoutes/api';
import type { MarkerRouteItem } from '../components/MarkerRoutes/MarkerRoutes';
import { latestLeafletMap } from '../components/WorldMap/useWorldMap';
import { findMapDetails, mapFilters, mapIsAeternumMap } from 'static';
import { fetchJSON } from '../utils/api';
import { writeError } from '../utils/logs';
import { notify } from '../utils/notifications';
import { isOverwolfApp } from '../utils/overwolf';
import { usePersistentState } from '../utils/storage';
import { useFilters } from './FiltersContext';
import type { MarkerSize } from 'static';
import { useMarkerSearchStore } from '../components/MarkerSearch/markerSearchStore';
import { useMap } from '../utils/routes';
import { useUserStore } from '../utils/userStore';

export type MarkerBasic = {
  type: string;
  map?: string;
  position: [number, number, number];
  name?: string;
  chestType?: string;
  tier?: number;
  level?: number;
  comments?: number;
  size?: MarkerSize;
  issues?: number;
  customRespawnTimer?: number;
  _id: string;
  screenshotFilename?: string;
};

type MarkersContextProps = {
  markers: MarkerBasic[];
  setMarkers: (
    value: MarkerBasic[] | ((value: MarkerBasic[]) => MarkerBasic[])
  ) => void;
  setTemporaryHiddenMarkerIDs: (
    value: string[] | ((value: string[]) => string[])
  ) => void;
  markerRoutes: MarkerRouteItem[];
  clearMarkerRoutes: () => void;
  toggleMarkerRoute: (markerRoute: MarkerRouteItem, force?: boolean) => void;
  visibleMarkers: MarkerBasic[];
  refresh: () => void;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  visibleMarkerRoutes: MarkerRouteItem[];
  refreshMarkerRoutes: () => void;
};
const MarkersContext = createContext<MarkersContextProps>({
  markers: [],
  setMarkers: () => undefined,
  setTemporaryHiddenMarkerIDs: () => undefined,
  markerRoutes: [],
  clearMarkerRoutes: () => undefined,
  toggleMarkerRoute: () => undefined,
  visibleMarkers: [],
  refresh: () => undefined,
  mode: null,
  setMode: () => undefined,
  visibleMarkerRoutes: [],
  refreshMarkerRoutes: () => undefined,
});

type MarkersProviderProps = {
  children: ReactNode;
  readonly?: boolean;
};

type Mode = 'route' | 'marker' | null;

// Remove old storage (deprecated)
localStorage.removeItem('markers');
localStorage.removeItem('all-marker-routes');

export function MarkersProvider({
  children,
  readonly,
}: MarkersProviderProps): JSX.Element {
  const [markers, setMarkers] = usePersistentState<MarkerBasic[]>(
    'cached-markers',
    [],
    true,
    true
  );
  const [allMarkerRoutes, setAllMarkerRoutes] = usePersistentState<
    MarkerRouteItem[]
  >('cached-marker-routes', [], true, true);
  const [markerRoutes, setMarkerRoutes] = usePersistentState<MarkerRouteItem[]>(
    'markers-routes',
    []
  );
  const [mode, setMode] = useState<Mode>(null);
  const [temporaryHiddenMarkerIDs, setTemporaryHiddenMarkerIDs] = useState<
    string[]
  >([]);

  const { filters, setFilters } = useFilters();
  const map = useMap();

  const hiddenMarkerIds = useUserStore(
    (state) => state.user?.hiddenMarkerIds || []
  );
  const searchValues = useMarkerSearchStore((state) => state.searchValues);
  const markerFilters = useMarkerSearchStore((state) => state.markerFilters);

  const refresh = () => {
    if (!readonly) {
      if (isOverwolfApp) {
        setMarkers([]);
        setAllMarkerRoutes([]);
        setMarkerRoutes([]);
      } else {
        notify(
          Promise.all([
            fetchJSON<MarkerBasic[]>('/api/markers'),
            fetchJSON<MarkerBasic[]>('/api/auth/markers'),
          ]).then(([newMarkers, privateMarkers]) => {
            const allMarkers = newMarkers.concat(privateMarkers);
            if (JSON.stringify(allMarkers) !== JSON.stringify(markers)) {
              setMarkers(allMarkers);
            }
          })
        );
      }
    }
  };

  const refreshMarkerRoutes = async () => {
    try {
      if (!isOverwolfApp) {
        const newMarkerRoutes = await notify(getMarkerRoutes());
        setAllMarkerRoutes(newMarkerRoutes);
      }
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

  const visibleMarkers = useMemo(() => {
    const nameSearchValues = searchValues.filter((value) =>
      value.startsWith('name: ')
    );

    const isAeternumMap = mapIsAeternumMap(map);
    const mapDetails = findMapDetails(map);
    return markers.filter((marker) => {
      if (marker.map) {
        if (mapDetails !== findMapDetails(marker.map)) {
          return false;
        }
      } else if (!isAeternumMap) {
        return false;
      }

      if (
        markerFilters.length > 0 &&
        !markerFilters.some((limit) => limit.markerIds.includes(marker._id))
      ) {
        return false;
      }
      if (marker.tier) {
        if (
          !filters.some((filter) => filter === `${marker.type}-${marker.tier}`)
        ) {
          return false;
        }
      } else if (marker.size) {
        if (
          !filters.some((filter) => filter === `${marker.type}-${marker.size}`)
        ) {
          return false;
        }
      } else if (!filters.some((filter) => filter === marker.type)) {
        return false;
      }
      if (temporaryHiddenMarkerIDs.includes(marker._id)) {
        return false;
      }
      if (searchValues.includes('has: comment') && !marker.comments) {
        return false;
      }
      if (searchValues.includes('has: issue') && !marker.issues) {
        return false;
      }
      if (
        (!searchValues.includes('is: hidden') &&
          hiddenMarkerIds.includes(marker._id)) ||
        (searchValues.includes('is: hidden') &&
          !hiddenMarkerIds.includes(marker._id))
      ) {
        return false;
      }
      if (
        nameSearchValues.length > 0 &&
        !nameSearchValues.some((value) => value.slice(6) === marker.name)
      ) {
        return false;
      }
      return true;
    });
  }, [
    filters,
    markers,
    hiddenMarkerIds,
    temporaryHiddenMarkerIDs,
    map,
    markerFilters,
    searchValues,
  ]);

  const toggleMarkerRoute = (markerRoute: MarkerRouteItem, force?: boolean) => {
    const markerRoutesClone = [...markerRoutes];
    const index = markerRoutesClone.findIndex(
      (targetMarkerRoute) => targetMarkerRoute._id === markerRoute._id
    );
    if (index > -1 && force !== true) {
      markerRoutesClone.splice(index, 1);
    } else if (force !== false) {
      const types = Object.keys(markerRoute.markersByType);

      const requiredFilters: string[] = [];
      types.forEach((markerType) => {
        const mapFilter = mapFilters.find(
          (mapFilter) => mapFilter.type === markerType
        );
        if (mapFilter) {
          if (mapFilter.category === 'chests') {
            const tierTypes = Array(mapFilter.maxTier || 5)
              .fill(null)
              .map((_, index) => `${mapFilter.type}-${index + 1}`);
            requiredFilters.push(...tierTypes);
          } else if (mapFilter.sizes) {
            requiredFilters.push(
              ...mapFilter.sizes.map((size) => `${mapFilter.type}-${size}`)
            );
          } else {
            requiredFilters.push(mapFilter.type);
          }
        }
      });

      setFilters((filters) => [...filters, ...requiredFilters]);
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

  const visibleMarkerRoutes = useMemo(
    () =>
      allMarkerRoutes.filter((markerRoute) => {
        if (markerRoute.map) {
          if (mapIsAeternumMap(map)) {
            return false;
          }
          if (findMapDetails(map) !== findMapDetails(markerRoute.map)) {
            return false;
          }
        } else if (!mapIsAeternumMap(map)) {
          return false;
        }
        return true;
      }),
    [allMarkerRoutes, map]
  );

  return (
    <MarkersContext.Provider
      value={{
        markers,
        setMarkers,
        setTemporaryHiddenMarkerIDs,
        visibleMarkers,
        refresh,
        markerRoutes,
        clearMarkerRoutes,
        toggleMarkerRoute,
        mode,
        setMode,
        visibleMarkerRoutes,
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
