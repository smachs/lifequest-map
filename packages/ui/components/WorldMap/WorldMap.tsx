import styles from './WorldMap.module.css';
import useWorldMap from './useWorldMap';
import useLayerGroups from './useLayerGroups';
import usePlayerPosition from './usePlayerPosition';
import { classNames } from '../../utils/styles';
import type { CSSProperties } from 'react';
import useReadLivePosition from '../../utils/useReadLivePosition';

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
  useReadLivePosition();

  useLayerGroups({
    leafletMap,
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
