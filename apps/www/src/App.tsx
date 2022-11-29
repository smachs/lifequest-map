import { ToastContainer } from 'react-toastify';
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
import { Box } from '@mantine/core';
import UserAction from 'ui/components/Actions/UserAction';
import NavActions from 'ui/components/Actions/NavActions';
import MapActions from 'ui/components/Actions/MapActions';
import MapAction from 'ui/components/Actions/MapAction';

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
    <Box>
      <Box
        sx={{
          position: 'fixed',
          left: 7,
          top: 7,
          zIndex: 1,
        }}
      >
        <NavActions
          onMarkerEdit={setTargetMarker}
          onMarkerCreate={() => setTargetMarker(true)}
          onMarkerRouteUpsert={setTargetMarkerRoute}
        />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          right: 7,
          top: 7,
          zIndex: 2,
        }}
      >
        <UserAction />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          top: 'calc(50% - 45px)',
          right: 12,
          zIndex: 1,
        }}
      >
        <MapActions />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 7,
          left: 7,
          zIndex: 1,
        }}
      >
        <MapAction />
      </Box>
      <Box sx={{ width: '100vw', height: '100vh' }}>
        <WorldMap isEditing={Boolean(targetMarker || targetMarkerRoute)} />
      </Box>
      <Head map={map} />
      <ToastContainer theme="dark" pauseOnFocusLoss={false} />
      <UpsertArea
        marker={targetMarker}
        markerRoute={targetMarkerRoute}
        onMarkerClose={() => setTargetMarker(undefined)}
        onRouteClose={() => setTargetMarkerRoute(undefined)}
      />
      <NitroPay />
    </Box>
  );
}

export default App;
