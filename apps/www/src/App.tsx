import { Box } from '@mantine/core';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapAction from 'ui/components/Actions/MapAction';
import MapActions from 'ui/components/Actions/MapActions';
import NavActions from 'ui/components/Actions/NavActions';
import UserAction from 'ui/components/Actions/UserAction';
import ErrorBoundary from 'ui/components/ErrorBoundary/ErrorBoundary';
import FadingBox from 'ui/components/FadingBox/FadingBox';
import NitroPay from 'ui/components/NitroPay/NitroPay';
import UpsertArea from 'ui/components/UpsertArea/UpsertArea';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import useEventListener from 'ui/utils/useEventListener';
import Head from './Head';

function App(): JSX.Element {
  useEventListener(
    'hotkey-zoom_in_map',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.min(zoom + 1, 8));
      }
    },
    []
  );

  useEventListener(
    'hotkey-zoom_out_map',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.max(zoom - 1, -2));
      }
    },
    []
  );

  return (
    <ErrorBoundary>
      <Box>
        <FadingBox left={7} top={7} fadeFrom="top">
          <NavActions />
        </FadingBox>
        <FadingBox right={7} top={7} zIndex={2} fadeFrom="top">
          <UserAction />
        </FadingBox>
        <FadingBox top="calc(50% - 45px)" right={12} fadeFrom="right">
          <MapActions />
        </FadingBox>
        <FadingBox bottom={7} left={7} fadeFrom="bottom">
          <MapAction />
        </FadingBox>
        <Box sx={{ width: '100vw', height: '100vh' }}>
          <ErrorBoundary>
            <WorldMap />
          </ErrorBoundary>
        </Box>
        <Head />
        <ToastContainer theme="dark" pauseOnFocusLoss={false} />
        <UpsertArea />
        <NitroPay />
      </Box>
    </ErrorBoundary>
  );
}

export default App;
