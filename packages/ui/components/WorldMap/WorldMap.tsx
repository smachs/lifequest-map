import { Box } from '@mantine/core';
import type { CSSProperties } from 'react';
import { Suspense, lazy } from 'react';
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
    <Box
      sx={{
        height: '100%',
        width: '100%',
        background: '#859594 !important',
        transition: 'transform 1s linear',
        zIndex: 0,
      }}
      className={className}
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
    </Box>
  );
}

export default WorldMap;
