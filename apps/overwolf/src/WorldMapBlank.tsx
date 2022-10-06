import styles from 'ui/components/WorldMap/WorldMap.module.css';
import useWorldMap from 'ui/components/WorldMap/useWorldMap';
import usePlayerPosition from 'ui/components/WorldMap/usePlayerPosition';
import { classNames } from 'ui/utils/styles';
import type { CSSProperties } from 'react';

type WorldMapProps = {
  isMinimap?: boolean;
  hideControls?: boolean;
  initialZoom?: number;
  className?: string;
  style?: CSSProperties;
  rotate?: boolean;
  isEditing?: boolean;
};

function WorldMap({
  isMinimap,
  className,
  hideControls,
  initialZoom,
  style,
  rotate,
  isEditing,
}: WorldMapProps): JSX.Element {
  const { leafletMap, elementRef } = useWorldMap({
    hideControls,
    initialZoom,
  });
  usePlayerPosition({ isMinimap, leafletMap, rotate, isEditing });

  return (
    <div
      className={classNames(styles.map, className)}
      ref={elementRef}
      style={style}
    />
  );
}

export default WorldMap;
