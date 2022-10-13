import { ToastContainer } from 'react-toastify';
import styles from './App.module.css';
import AppHeader from 'ui/components/AppHeader/AppHeader';
import MapFilter from 'ui/components/MapFilter/MapFilter';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import UpsertArea from 'ui/components/UpsertArea/UpsertArea';
import type { MarkerRouteItem } from 'ui/components/MarkerRoutes/MarkerRoutes';
import useEventListener from 'ui/utils/useEventListener';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import NitroPay from 'ui/components/NitroPay/NitroPay';
import { useMap } from 'ui/utils/routes';
import Head from './Head';
import type { MarkerFull } from 'ui/components/MarkerDetails/useMarker';

function App(): JSX.Element {
  const [targetMarker, setTargetMarker] = useState<
    MarkerFull | true | undefined
  >(undefined);
  const [targetMarkerRoute, setTargetMarkerRoute] = useState<
    MarkerRouteItem | true | undefined
  >(undefined);
  const map = useMap();

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
      <Head map={map} />
      <AppHeader />
      <MapFilter
        onMarkerEdit={setTargetMarker}
        onMarkerCreate={() => setTargetMarker(true)}
        onMarkerRouteUpsert={setTargetMarkerRoute}
      />
      <WorldMap isEditing={Boolean(targetMarker || targetMarkerRoute)} />
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
