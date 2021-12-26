import { useEffect, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { usePersistentState } from '../../utils/storage';
import type { Player } from '../../utils/useReadLivePosition';
import { latestLeafletMap } from './useWorldMap';

function useAdaptiveZoom(player: Player | null) {
  const [zoomIn, setZoomIn] = usePersistentState('adaptive-zoom-in', 6);
  const [zoomOut, setZoomOut] = usePersistentState('adaptive-zoom-out', 4);
  const isFirstRender = useRef(true);
  const { adaptiveZoom } = useSettings();

  useEffect(() => {
    if (!player) {
      return;
    }

    const handleZoom = () => {
      const zoom = latestLeafletMap!.getZoom();
      if (player.location) {
        setZoomIn(zoom);
      } else {
        setZoomOut(zoom);
      }
    };
    latestLeafletMap!.on('zoom', handleZoom);

    return () => {
      latestLeafletMap!.off('zoom', handleZoom);
    };
  }, [player?.location]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!latestLeafletMap || !adaptiveZoom || !player?.position) {
      return;
    }
    if (player.location) {
      latestLeafletMap.setZoomAround(player.position.location, zoomIn);
    } else {
      latestLeafletMap.setZoomAround(player.position.location, zoomOut);
    }
  }, [player?.location]);
}

export default useAdaptiveZoom;
