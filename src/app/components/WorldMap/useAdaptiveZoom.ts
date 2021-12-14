import { useEffect, useRef, useState } from 'react';
import type { Position } from '../../contexts/PositionContext';
import { useSettings } from '../../contexts/SettingsContext';
import { usePersistentState } from '../../utils/storage';
import { findLocation } from './areas';
import { latestLeafletMap } from './useWorldMap';

function useAdaptiveZoom(position: Position) {
  const [location, setLocation] = useState(() => findLocation(position));
  const [zoomIn, setZoomIn] = usePersistentState('adaptive-zoom-in', 6);
  const [zoomOut, setZoomOut] = usePersistentState('adaptive-zoom-out', 4);
  const isFirstRender = useRef(true);
  const { adaptiveZoom } = useSettings();

  useEffect(() => {
    const insideLocation = findLocation(position);
    setLocation(insideLocation);
  }, [location, position]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!latestLeafletMap || !adaptiveZoom) {
      return;
    }
    const zoom = latestLeafletMap.getZoom();
    if (location) {
      setZoomOut(zoom);
      latestLeafletMap.setZoomAround(position.location, zoomIn);
    } else {
      setZoomIn(zoom);
      latestLeafletMap.setZoomAround(position.location, zoomOut);
    }
  }, [location]);
}

export default useAdaptiveZoom;
