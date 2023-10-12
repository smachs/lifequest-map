import { Box } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
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
import ReloadPrompt from './ReloadPrompt';

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
        <FadingBox left={7} top={7} fadeFrom="top" dynamic>
          <NavActions />
        </FadingBox>
        <FadingBox right={7} top={7} zIndex={2} fadeFrom="top">
          <UserAction />
        </FadingBox>
        <FadingBox top="calc(50% - 45px)" right={12} fadeFrom="right">
          <MapActions />
        </FadingBox>
        <FadingBox bottom={7} left={7} fadeFrom="bottom" dynamic>
          <MapAction />
        </FadingBox>
        <Box sx={{ width: '100vw', height: '100vh' }}>
          <ErrorBoundary>
            <WorldMap />
          </ErrorBoundary>
        </Box>
        <Head />
        <Notifications position="top-right" autoClose={4000} />
        <UpsertArea />
        <ErrorBoundary>
          <NitroPay />
        </ErrorBoundary>
        <ReloadPrompt />
      </Box>
    </ErrorBoundary>
  );
}

export default App;
