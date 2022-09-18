import { ToastContainer } from 'react-toastify';
import styles from './App.module.css';
import AppHeader from 'ui/components/AppHeader/AppHeader';
import MapFilter from 'ui/components/MapFilter/MapFilter';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import type { MarkerBasic } from 'ui/contexts/MarkersContext';
import UpsertArea from 'ui/components/UpsertArea/UpsertArea';
import type { MarkerRouteItem } from 'ui/components/MarkerRoutes/MarkerRoutes';
import useEventListener from 'ui/utils/useEventListener';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import { useFilters } from 'ui/contexts/FiltersContext';
import NitroPay from 'ui/components/NitroPay/NitroPay';

function App(): JSX.Element {
  const [targetMarker, setTargetMarker] = useState<
    MarkerBasic | true | undefined
  >(undefined);
  const [targetMarkerRoute, setTargetMarkerRoute] = useState<
    MarkerRouteItem | true | undefined
  >(undefined);
  const { map } = useFilters();

  useEffect(() => {
    setTargetMarker(undefined);
    setTargetMarkerRoute(undefined);
  }, [map]);

  useEventListener(
    'hotkey-zoom_in_map',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.min(zoom + 1, 6));
      }
    },
    []
  );

  useEventListener(
    'hotkey-zoom_out_map',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.max(zoom - 1, 0));
      }
    },
    []
  );

  return (
    <div className={styles.container}>
      <AppHeader />
      <MapFilter
        onMarkerCreate={() => setTargetMarker(true)}
        onMarkerRouteUpsert={setTargetMarkerRoute}
      />
      <WorldMap
        onMarkerEdit={setTargetMarker}
        isEditing={Boolean(targetMarker || targetMarkerRoute)}
      />
      <ToastContainer theme="dark" pauseOnFocusLoss={false} />
      <UpsertArea
        marker={targetMarker}
        markerRoute={targetMarkerRoute}
        onMarkerClose={() => setTargetMarker(undefined)}
        onRouteClose={() => setTargetMarkerRoute(undefined)}
      />
      <NitroPay />
    </div>
  );
}

export default App;
