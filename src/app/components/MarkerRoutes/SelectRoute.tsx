import { useEffect, useState } from 'react';
import useLayerGroups from '../WorldMap/useLayerGroups';
import useWorldMap from '../WorldMap/useWorldMap';
import styles from './SelectRoute.module.css';
import 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import type { Polyline } from 'leaflet';
import type leaflet from 'leaflet';

type SelectRouteType = {
  onSelectRoute: (positions: [number, number][]) => void;
};
function SelectRoute({ onSelectRoute }: SelectRouteType): JSX.Element {
  const [positions, setPositions] = useState<[number, number][]>([]);
  const { leafletMap, elementRef } = useWorldMap({ selectMode: true });

  useLayerGroups({
    leafletMap,
  });

  useEffect(() => {
    if (!leafletMap || !leafletMap.getPane('markerPane')) {
      return;
    }

    leafletMap.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawMarker: false,
      drawPolyline: false,
      drawCircleMarker: false,
      drawRectangle: false,
      cutPolygon: false,
      dragMode: false,
      rotateMode: false,
      editMode: false,
    });
    leafletMap.pm.enableDraw('Line');

    leafletMap.on('pm:create', (event) => {
      if (event.shape === 'Line') {
        const latLngs = (
          event.layer as Polyline
        ).getLatLngs() as leaflet.LatLng[][];
        const positions = latLngs[0].map((latLng) => [
          +latLng.lng.toFixed(2),
          +latLng.lat.toFixed(2),
        ]) as [number, number][];
        setPositions(positions);
      }
    });
  }, [leafletMap]);

  function handleSave() {
    onSelectRoute(positions);
  }

  return (
    <div className={styles.container}>
      <div className={styles.map} ref={elementRef} />
      <button className={styles.save} onClick={handleSave}>
        Save Position
      </button>
    </div>
  );
}

export default SelectRoute;
