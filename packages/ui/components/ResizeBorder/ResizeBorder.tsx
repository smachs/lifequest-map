import styles from './ResizeBorder.module.css';
import { dragResize, getCurrentWindow } from '../../utils/windows';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';

function onDragResize(
  edge: overwolf.windows.enums.WindowDragEdge,
  square?: boolean
) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    dragResize(edge, square);
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

    getCurrentWindow().then((currentWindow) => {
      setIsMaximized(currentWindow.stateEx === 'maximized');
    });

    overwolf.windows.onStateChanged.addListener(handleWindowStateChanged);
    return () => {
      overwolf.windows.onStateChanged.removeListener(handleWindowStateChanged);
    };
  }, []);

  return isMaximized;
}

type ResizeBorderTypes = {
  square?: boolean;
};

function ResizeBorder({ square }: ResizeBorderTypes): JSX.Element {
  const isMaximizedWindow = useIsMaximizedWindow();
  if (isMaximizedWindow) {
    return <></>;
  }
  return (
    <>
      <div
        className={styles.topBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.Top,
          square
        )}
      />
      <div
        className={styles.rightBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.Right,
          square
        )}
      />
      <div
        className={styles.bottomBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.Bottom,
          square
        )}
      />
      <div
        className={styles.leftBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.Left,
          square
        )}
      />
      <div
        className={styles.topLeftBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.TopLeft,
          square
        )}
      />
      <div
        className={styles.topRightBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.TopRight,
          square
        )}
      />
      <div
        className={styles.bottomLeftBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.BottomLeft,
          square
        )}
      />
      <div
        className={styles.bottomRightBorder}
        onMouseDown={onDragResize(
          overwolf.windows.enums.WindowDragEdge.BottomRight,
          square
        )}
      />
    </>
  );
}

export default ResizeBorder;
