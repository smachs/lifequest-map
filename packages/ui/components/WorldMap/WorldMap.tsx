import type { CSSProperties } from 'react';
import { classNames } from '../../utils/styles';
import useReadLivePosition from '../../utils/useReadLivePosition';
import useLayerGroups from './useLayerGroups';
import usePlayerPosition from './usePlayerPosition';
import useWorldMap from './useWorldMap';
import styles from './WorldMap.module.css';

type WorldMapProps = {
  isMinimap?: boolean;
  hideControls?: boolean;
  initialZoom?: number;
  className?: string;
  style?: CSSProperties;
  rotate?: boolean;
};

function WorldMap({
  isMinimap,
  className,
  hideControls,
  initialZoom,
  style,
  rotate,
}: WorldMapProps): JSX.Element {
  const { leafletMap, elementRef } = useWorldMap({
    hideControls,
    initialZoom,
  });
  useReadLivePosition();

  useLayerGroups({
    leafletMap,
  });
  usePlayerPosition({ isMinimap, leafletMap, rotate });

  return (
    <div
      className={classNames(styles.map, className)}
      ref={elementRef}
      style={style}
    />
  );
}

export default WorldMap;
