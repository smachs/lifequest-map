import { StrictMode, useEffect, useState } from 'react';
import './globals.css';
import { isOverwolfApp, waitForOverwolf } from 'ui/utils/overwolf';
import { UserProvider } from 'ui/contexts/UserContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { PositionProvider } from 'ui/contexts/PositionContext';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import styles from './Minimap.module.css';
import { dragMoveWindow, WINDOWS } from 'ui/utils/windows';
import {
  SETUP_MINIMAP,
  ZOOM_IN_MINIMAP,
  ZOOM_OUT_MINIMAP,
} from 'ui/utils/hotkeys';
import { usePersistentState } from 'ui/utils/storage';
import { FiltersProvider } from 'ui/contexts/FiltersContext';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { classNames } from 'ui/utils/styles';
import ResizeBorder from 'ui/components/ResizeBorder/ResizeBorder';
import useEventListener from 'ui/utils/useEventListener';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import { initPlausible } from 'ui/utils/stats';
import { PlayerProvider } from 'ui/contexts/PlayerContext';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.querySelector('#root')!);

function Minimap(): JSX.Element {
  const [showSetup, setShowSetup] = useState(false);
  const [minimapOpacity, setMinimapOpacity] = usePersistentState(
    'minimapOpacity',
    80
  );
  const [minimapBorderRadius, setMinimapBorderRadius] = usePersistentState(
    'minimapBorderRadius',
    50
  );
  const [minimapZoom, setMinimapZoom] = usePersistentState('minimapZoom', 5);
  const [rotateMinimap, setRotateMinimap] = usePersistentState(
    'rotateMinimap',
    false
  );
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
        setMinimapZoom((minimapZoom) => Math.min(minimapZoom + 0.5, 6));
      } else if (event.name === ZOOM_OUT_MINIMAP) {
        setMinimapZoom((minimapZoom) => Math.max(minimapZoom - 0.5, 0));
      }
    }
    overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);
    return () => {
      overwolf.settings.hotkeys.onPressed.removeListener(handleHotkeyPressed);
    };
  }, [showSetup, minimapZoom]);

  return (
    <>
      <div
        onMouseMove={() => setIsHovering(true)}
        className={classNames(
          styles.container,
          !showSetup && isHovering && styles.hideOnHover
        )}
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
      {showSetup && (
        <div className={styles.setup} onMouseDown={dragMoveWindow}>
          <div className={styles.toolbar} onMouseDown={dragMoveWindow}>
            <label>
              Zoom
              <input
                type="range"
                value={minimapZoom}
                min={0}
                max={6}
                step={0.5}
                onMouseDown={(event) => event.stopPropagation()}
                onChange={(event) => setMinimapZoom(+event.target.value)}
              />
            </label>
            <label>
              Border
              <input
                type="range"
                value={minimapBorderRadius}
                min={0}
                max={50}
                onMouseDown={(event) => event.stopPropagation()}
                onChange={(event) =>
                  setMinimapBorderRadius(+event.target.value)
                }
              />
            </label>
            <label>
              Opacity
              <input
                type="range"
                value={minimapOpacity}
                min={20}
                max={100}
                onMouseDown={(event) => event.stopPropagation()}
                onChange={(event) => setMinimapOpacity(+event.target.value)}
              />
            </label>
            <label>
              Rotate minimap
              <input
                type="checkbox"
                checked={rotateMinimap}
                onMouseDown={(event) => event.stopPropagation()}
                onChange={(event) => setRotateMinimap(event.target.checked)}
              />
            </label>
            <ResizeBorder square />
          </div>
        </div>
      )}
    </>
  );
}

waitForOverwolf().then(() => {
  root.render(
    <StrictMode>
      <SettingsProvider>
        <UserProvider>
          <FiltersProvider>
            <MarkersProvider readonly>
              {isOverwolfApp ? (
                <PositionProvider>
                  <Minimap />
                </PositionProvider>
              ) : (
                <PlayerProvider>
                  <Minimap />
                </PlayerProvider>
              )}
            </MarkersProvider>
          </FiltersProvider>
        </UserProvider>
      </SettingsProvider>
    </StrictMode>
  );
});

initPlausible();
