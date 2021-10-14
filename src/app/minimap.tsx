import type { MouseEvent } from 'react';
import { StrictMode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './globals.css';
import { waitForOverwolf } from './utils/overwolf';
import { UserProvider } from './contexts/UserContext';
import { MarkersProvider, useMarkers } from './contexts/MarkersContext';
import { PositionProvider } from './contexts/PositionContext';
import WorldMap from './components/WorldMap/WorldMap';
import styles from './Minimap.module.css';
import { RouterProvider } from './components/Router/Router';
import { dragMoveWindow, dragResize, WINDOWS } from './utils/windows';
import { SETUP_MINIMAP } from './utils/hotkeys';
import { usePersistentState } from './utils/storage';

function onDragResize(edge: overwolf.windows.enums.WindowDragEdge) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    dragResize(edge, (result) => {
      if (result.height && result.width) {
        const minSize = Math.max(result.width, result.height, 200);
        overwolf.windows.changeSize(WINDOWS.MINIMAP, minSize, minSize);
      }
    });
  };
}

function Minimap(): JSX.Element {
  const { markers } = useMarkers();
  const [showSetup, setShowSetup] = useState(false);
  const [minimapOpacity, setMinimapOpacity] = usePersistentState(
    'minimapOpacity',
    80
  );
  const [minimapBorderRadius, setMinimapBorderRadius] = usePersistentState(
    'minimapBorderRadius',
    50
  );

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
      }
    }
    overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);
    return () => {
      overwolf.settings.hotkeys.onPressed.removeListener(handleHotkeyPressed);
    };
  }, [showSetup]);

  return (
    <>
      <div
        className={styles.container}
        style={{
          pointerEvents: showSetup ? 'initial' : 'none',
          opacity: minimapOpacity / 100,
          borderRadius: `${minimapBorderRadius}%`,
        }}
      >
        <WorldMap
          markers={markers}
          hideControls
          alwaysFollowing
          initialZoom={2}
          className={styles.noMouseEvents}
        />
      </div>
      {showSetup && (
        <div className={styles.toolbar}>
          <label>
            Border
            <input
              type="range"
              value={minimapBorderRadius}
              min={0}
              max={50}
              onChange={(event) => setMinimapBorderRadius(+event.target.value)}
            />
          </label>
          <label>
            Opacity
            <input
              type="range"
              value={minimapOpacity}
              min={0}
              max={100}
              onChange={(event) => setMinimapOpacity(+event.target.value)}
            />
          </label>
          <svg
            className={styles.move}
            onMouseDown={dragMoveWindow}
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
            fill="currentColor"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z" />
          </svg>
          <svg
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
            fill="currentColor"
            className={styles.bottomRightBorder}
            onMouseDown={onDragResize(
              overwolf.windows.enums.WindowDragEdge.BottomRight
            )}
          >
            <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" />
          </svg>
        </div>
      )}
    </>
  );
}

waitForOverwolf().then(() => {
  ReactDOM.render(
    <StrictMode>
      <RouterProvider readonly>
        <UserProvider>
          <MarkersProvider>
            <PositionProvider>
              <Minimap />
            </PositionProvider>
          </MarkersProvider>
        </UserProvider>
      </RouterProvider>
    </StrictMode>,
    document.querySelector('#root')
  );
});
