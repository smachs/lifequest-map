import type { ReactNode } from 'react';
import { useState } from 'react';
import { useMemo } from 'react';
import { createContext, useContext, useEffect } from 'react';
import type { MarkerRouteItem } from '../components/MarkerRoutes/MarkerRoutes';
import { latestLeafletMap } from '../components/WorldMap/useWorldMap';
import { findMapDetails, mapIsAeternumMap } from 'static';
import { fetchJSON } from '../utils/api';
import { notify } from '../utils/notifications';
import { isOverwolfApp } from '../utils/overwolf';
import { usePersistentState } from '../utils/storage';
import { useFilters } from './FiltersContext';
import type { MarkerSize } from 'static';
import { useMarkerSearchStore } from '../components/MarkerSearch/markerSearchStore';
import { isEmbed, useRouteParams } from '../utils/routes';
import { useUserStore } from '../utils/userStore';
import useMarkerRoute from '../components/MarkerRoutes/useMarkerRoute';

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
  setMarkerRoutes: (routes: MarkerRouteItem[]) => void;
  toggleMarkerRoute: (markerRoute: MarkerRouteItem, force?: boolean) => void;
  visibleMarkers: MarkerBasic[];
  refresh: () => void;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
};
const MarkersContext = createContext<MarkersContextProps>({
  markers: [],
  setMarkers: () => undefined,
  setTemporaryHiddenMarkerIDs: () => undefined,
  markerRoutes: [],
  setMarkerRoutes: () => undefined,
  toggleMarkerRoute: () => undefined,
  visibleMarkers: [],
  refresh: () => undefined,
  mode: null,
  setMode: () => undefined,
});

type MarkersProviderProps = {
  children: ReactNode;
  readonly?: boolean;
};

type Mode = 'route' | 'marker' | null;

// Remove old storage (deprecated)
localStorage.removeItem('markers');
localStorage.removeItem('all-marker-routes');
localStorage.removeItem('cached-marker-routes');

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
  const [allMarkerRoutes, setMarkerRoutes] = usePersistentState<
    MarkerRouteItem[]
  >('markers-routes', []);
  const markerRoutes = isEmbed ? [] : allMarkerRoutes;

  const [mode, setMode] = useState<Mode>(null);
  const [temporaryHiddenMarkerIDs, setTemporaryHiddenMarkerIDs] = useState<
    string[]
  >([]);

  const { filters } = useFilters();
  const { map, nodeId, routeId } = useRouteParams();
  const { data: markerRoute } = useMarkerRoute(routeId);

  const hiddenMarkerIds = useUserStore(
    (state) => state.user?.hiddenMarkerIds || []
  );
  const searchValues = useMarkerSearchStore((state) => state.searchValues);
  const markerFilters = useMarkerSearchStore((state) => state.markerFilters);

  const refresh = () => {
    if (!readonly) {
      if (isOverwolfApp) {
        return;
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

  useEffect(() => {
    refresh();
  }, []);

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

      if (marker._id === nodeId) {
        return true;
      }
      if (
        markerRoute?.positions.some(
          (position) =>
            position[0] === marker.position[1] &&
            position[1] === marker.position[0]
        )
      ) {
        return true;
      }
      if (
        markerRoutes.some((markerRoute) =>
          markerRoute.positions.some(
            (position) =>
              position[0] === marker.position[1] &&
              position[1] === marker.position[0]
          )
        )
      ) {
        return true;
      }
      if (isEmbed) {
        return true;
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
    nodeId,
    markerRoutes,
    markerRoute,
  ]);

  const toggleMarkerRoute = (markerRoute: MarkerRouteItem, force?: boolean) => {
    const markerRoutesClone = [...markerRoutes];
    const index = markerRoutesClone.findIndex(
      (targetMarkerRoute) => targetMarkerRoute._id === markerRoute._id
    );
    if (index > -1 && force !== true) {
      markerRoutesClone.splice(index, 1);
    } else if (force !== false) {
      markerRoutesClone.push(markerRoute);
      if (latestLeafletMap) {
        latestLeafletMap.fitBounds(markerRoute.positions);
      }
    }

    setMarkerRoutes(markerRoutesClone);
  };

  return (
    <MarkersContext.Provider
      value={{
        markers,
        setMarkers,
        setTemporaryHiddenMarkerIDs,
        visibleMarkers,
        refresh,
        markerRoutes,
        setMarkerRoutes,
        toggleMarkerRoute,
        mode,
        setMode,
      }}
    >
      {children}
    </MarkersContext.Provider>
  );
}

export function useMarkers(): MarkersContextProps {
  return useContext(MarkersContext);
}
