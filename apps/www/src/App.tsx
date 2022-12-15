import { ToastContainer } from 'react-toastify';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import 'react-toastify/dist/ReactToastify.css';
import UpsertArea from 'ui/components/UpsertArea/UpsertArea';
import useEventListener from 'ui/utils/useEventListener';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import NitroPay from 'ui/components/NitroPay/NitroPay';
import Head from './Head';
import { Box } from '@mantine/core';
import UserAction from 'ui/components/Actions/UserAction';
import NavActions from 'ui/components/Actions/NavActions';
import MapActions from 'ui/components/Actions/MapActions';
import MapAction from 'ui/components/Actions/MapAction';
import FadingBox from 'ui/components/FadingBox/FadingBox';
import ErrorBoundary from 'ui/components/ErrorBoundary/ErrorBoundary';

function App(): JSX.Element {
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
