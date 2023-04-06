import { StrictMode, useEffect, useState } from 'react';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import styles from './Minimap.module.css';
import { PositionProvider } from './contexts/PositionContext';
import './globals.css';
import { waitForOverwolf } from './utils/overwolf';
import { WINDOWS, dragMoveWindow } from './utils/windows';

import { MantineProvider, Paper } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import { initPlausible } from 'ui/utils/stats';
import { classNames } from 'ui/utils/styles';
import useEventListener from 'ui/utils/useEventListener';
import ResizeBorder from './components/ResizeBorder/ResizeBorder';
import MinimapSetup from './components/Settings/MinimapSetup';
import { useMinimapSettingsStore } from './components/Settings/store';
import {
  SETUP_MINIMAP,
  ZOOM_IN_MINIMAP,
  ZOOM_OUT_MINIMAP,
} from './utils/hotkeys';

const queryClient = new QueryClient();
const root = createRoot(document.querySelector('#root')!);

function Minimap(): JSX.Element {
  const [showSetup, setShowSetup] = useState(false);

  const state = useMinimapSettingsStore();

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

  useEffect(() => {
    if (!isHovering) {
      return;
    }
    const handleKeyDown = (event: overwolf.games.inputTracking.KeyEvent) => {
      // ESC
      if (event.key === '27') {
        setIsHovering(false);
      }
    };
    overwolf.games.inputTracking.onKeyDown.addListener(handleKeyDown);
    return () => {
      overwolf.games.inputTracking.onKeyDown.removeListener(handleKeyDown);
    };
  }, [isHovering]);

  useEffect(() => {
    if (showSetup) {
      overwolf.windows.removeWindowStyle(
        WINDOWS.MINIMAP,
        overwolf.windows.enums.WindowStyle.InputPassThrough,
        () => undefined
      );
      overwolf.windows.bringToFront(WINDOWS.MINIMAP, true, () => undefined);
    } else {
      overwolf.windows.setWindowStyle(
        WINDOWS.MINIMAP,
        overwolf.windows.enums.WindowStyle.InputPassThrough,
        () => undefined
      );
      overwolf.windows.sendToBack(WINDOWS.MINIMAP, () => undefined);
    }

    async function handleHotkeyPressed(
      event: overwolf.settings.hotkeys.OnPressedEvent
    ) {
      if (event.name === SETUP_MINIMAP) {
        setShowSetup(!showSetup);
      } else if (event.name === ZOOM_IN_MINIMAP) {
        state.setMinimapZoom(Math.min(state.minimapZoom + 0.5, 8));
      } else if (event.name === ZOOM_OUT_MINIMAP) {
        state.setMinimapZoom(Math.max(state.minimapZoom - 0.5, 0));
      }
    }
    overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);
    return () => {
      overwolf.settings.hotkeys.onPressed.removeListener(handleHotkeyPressed);
    };
  }, [showSetup, state.minimapZoom]);

  return (
    <>
      <div
        onMouseMove={() => setIsHovering(true)}
        className={classNames(
          styles.container,
          !showSetup && isHovering && styles.hideOnHover
        )}
        style={{
          opacity: state.minimapOpacity / 100,
          borderRadius: `${state.minimapBorderRadius}%`,
        }}
      >
        <WorldMap
          isMinimap
          hideControls
          initialZoom={state.minimapZoom}
          className={styles.minimap}
          rotate={state.rotateMinimap}
        />
      </div>
      {showSetup && (
        <div className={styles.setup} onMouseDown={dragMoveWindow}>
          <Paper className={styles.toolbar} onMouseDown={dragMoveWindow}>
            <MinimapSetup />
            <ResizeBorder square />
          </Paper>
        </div>
      )}
    </>
  );
}

const router = createMemoryRouter([
  {
    path: '/',
    element: (
      <QueryClientProvider client={queryClient}>
        <MarkersProvider>
          <PositionProvider>
            <Minimap />
          </PositionProvider>
        </MarkersProvider>
      </QueryClientProvider>
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

waitForOverwolf().then(() => {
  root.render(
    <StrictMode>
      <MantineProvider
        theme={{
          colorScheme: 'dark',
        }}
      >
        <RouterProvider router={router} />
      </MantineProvider>
    </StrictMode>
  );
});

initPlausible();
