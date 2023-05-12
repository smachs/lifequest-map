import type { CSSProperties } from 'react';
import { Suspense, lazy } from 'react';
import { classNames } from '../../utils/styles';
import styles from './WorldMap.module.css';
import useWorldMap from './useWorldMap';
const MapData = lazy(() => import('./MapData'));

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

  return (
    <div
      className={classNames(styles.map, className)}
      ref={elementRef}
      style={style}
    >
      <Suspense>
        <MapData
          leafletMap={leafletMap}
          isMinimap={isMinimap}
          rotate={rotate}
        />
      </Suspense>
    </div>
  );
}

export default WorldMap;
