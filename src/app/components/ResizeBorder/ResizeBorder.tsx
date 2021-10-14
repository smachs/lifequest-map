import styles from './ResizeBorder.module.css';
import { dragResize } from '../../utils/windows';
import type { MouseEvent } from 'react';

function onDragResize(edge: overwolf.windows.enums.WindowDragEdge) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    dragResize(edge);
  };
}

function ResizeBorder(): JSX.Element {
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
