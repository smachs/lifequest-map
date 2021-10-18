import styles from './ResizeBorder.module.css';
import { dragResize, getCurrentWindow } from '../../utils/windows';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';

function onDragResize(edge: overwolf.windows.enums.WindowDragEdge) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    dragResize(edge);
  };
}

function useIsMaximizedWindow(): boolean {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    async function handleWindowStateChanged(
      state: overwolf.windows.WindowStateChangedEvent
    ) {
      const currentWindow = await getCurrentWindow();
      if (currentWindow.id !== state.window_id) {
        return;
      }
      if (state.window_previous_state_ex !== state.window_state_ex) {
        setIsMaximized(state.window_state_ex === 'maximized');
      }
    }

    getCurrentWindow().then(
      (currentWindow) => currentWindow.stateEx === 'maximized'
    );

    overwolf.windows.onStateChanged.addListener(handleWindowStateChanged);
    return () => {
      overwolf.windows.onStateChanged.removeListener(handleWindowStateChanged);
    };
  }, []);

  return isMaximized;
}

function ResizeBorder(): JSX.Element {
  const isMaximizedWindow = useIsMaximizedWindow();
  if (isMaximizedWindow) {
    return <></>;
  }
  return (
    <>
      <div
        className={styles.topBorder}
        onMouseDown={onDragResize(overwolf.windows.enums.WindowDragEdge.Top)}
      />
      <div
        className={styles.rightBorder}
        onMouseDown={onDragResize(overwolf.windows.enums.WindowDragEdge.Right)}
      />
      <div
        className={styles.bottomBorder}
        onMouseDown={onDragResize(overwolf.windows.enums.WindowDragEdge.Bottom)}
      />
      <div
        className={styles.leftBorder}
        onMouseDown={onDragResize(overwolf.windows.enums.WindowDragEdge.Left)}
      />
      <div
        className={styles.topLeftBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.TopLeft
        )}
      />
      <div
        className={styles.topRightBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.TopRight
        )}
      />
      <div
        className={styles.bottomLeftBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.BottomLeft
        )}
      />
      <div
        className={styles.bottomRightBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.BottomRight
        )}
      />
    </>
  );
}

export default ResizeBorder;
