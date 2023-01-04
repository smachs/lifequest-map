import { MantineProvider } from '@mantine/core';
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { initPlausible } from 'ui/utils/stats';
import { usePersistentState } from 'ui/utils/storage';
import { classNames } from 'ui/utils/styles';
import useEventListener from 'ui/utils/useEventListener';
import './globals.css';
import styles from './Minimap.module.css';

const queryClient = new QueryClient();
broadcastQueryClient({
  queryClient,
  broadcastChannel: 'aeternum-map',
});
const root = createRoot(document.querySelector('#root')!);

function Minimap(): JSX.Element {
  const [minimapOpacity] = usePersistentState('minimapOpacity', 80);
  const [minimapBorderRadius] = usePersistentState('minimapBorderRadius', 50);
  const [minimapZoom] = usePersistentState('minimapZoom', 5);
  const [rotateMinimap] = usePersistentState('rotateMinimap', false);
  const [isHovering, setIsHovering] = useState(false);

  useEventListener(
    'hotkey-zoom_in_minimap',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.min(zoom + 1, 6));
      }
    },
    []
  );
  useEventListener(
    'hotkey-zoom_out_minimap',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.max(zoom - 1, 0));
      }
    },
    []
  );

  return (
    <div
      onMouseMove={() => setIsHovering(true)}
      className={classNames(styles.container, isHovering && styles.hideOnHover)}
      style={{
        opacity: minimapOpacity / 100,
        borderRadius: `${minimapBorderRadius}%`,
      }}
    >
      <WorldMap
        isMinimap
        hideControls
        initialZoom={minimapZoom}
        className={styles.minimap}
        rotate={rotateMinimap}
      />
    </div>
  );
}

const router = createMemoryRouter([
  {
    path: '/',
    element: (
      <MantineProvider
        theme={{
          colorScheme: 'dark',
        }}
      >
        <QueryClientProvider client={queryClient}>
          <MarkersProvider>
            <Minimap />
          </MarkersProvider>
        </QueryClientProvider>
      </MantineProvider>
    ),
    children: [
      {
        id: 'map',
        path: ':map',
        element: null,
      },
    ],
  },
]);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

initPlausible();
