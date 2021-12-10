import leaflet from 'leaflet';
import { useEffect, useMemo } from 'react';
import type { Position } from '../../contexts/PositionContext';
import { useSettings } from '../../contexts/SettingsContext';
import { latestLeafletMap } from './useWorldMap';

function useDirectionLine(position: Position) {
  const { alwaysShowDirection } = useSettings();

  const directionLine = useMemo(
    () =>
      leaflet.polyline([], {
        color: '#0EA2FE',
        dashArray: '5',
      }),
    []
  );

  useEffect(() => {
    if (alwaysShowDirection) {
      directionLine.addTo(latestLeafletMap!);
    }

    return () => {
      directionLine.remove();
    };
  }, [alwaysShowDirection]);

  useEffect(() => {
    const latLng: [number, number] = [
      position.location[0] +
        Math.sin((position.rotation * Math.PI) / 180) * 500,
      position.location[1] +
        Math.cos((position.rotation * Math.PI) / 180) * 500,
    ];
    const latLngs = [position.location, latLng];
    directionLine.setLatLngs(latLngs);
  }, [position]);
}

export default useDirectionLine;
