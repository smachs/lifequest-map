import { useEffect, useState } from 'react';
import useLayerGroups from '../WorldMap/useLayerGroups';
import useWorldMap from '../WorldMap/useWorldMap';
import styles from './SelectRoute.module.css';
import 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import leaflet from 'leaflet';
import MarkerTypes from './MarkerTypes';
import { useModal } from '../../contexts/ModalContext';
import { useAccount } from '../../contexts/UserContext';
import type { MarkerRouteItem } from './MarkerRoutes';
import { notify } from '../../utils/notifications';
import { postMarkerRoute } from './api';
import CanvasMarker from '../WorldMap/CanvasMarker';

type SelectRouteProps = {
  onAdd: (markerRoute: MarkerRouteItem) => void;
};
function SelectRoute({ onAdd }: SelectRouteProps): JSX.Element {
  const { closeLatestModal } = useModal();
  const [positions, setPositions] = useState<[number, number][]>([]);
  const { leafletMap, elementRef } = useWorldMap({ selectMode: true });
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});
  const [name, setName] = useState('');
  const { account } = useAccount();
  const [isPublic, setIsPublic] = useState(false);

  useLayerGroups({
    leafletMap,
    pmIgnore: false,
  });

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    const toggleControls = (editMode: boolean) => {
      leafletMap.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawMarker: false,
        drawRectangle: false,
        drawPolygon: false,
        rotateMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: false,
        drawPolyline: !editMode,
        editMode: editMode,
      });
    };
    toggleControls(false);

    const refreshMarkers = (workingLayer: leaflet.Layer) => {
      // @ts-ignore
      const markers = Object.values(leafletMap._layers).filter(
        (marker) => marker instanceof CanvasMarker
      ) as CanvasMarker[];
      markers.forEach((marker) => (marker.options.image.alwaysVisible = false));

      // @ts-ignore
      const latLngs = workingLayer.getLatLngs() as leaflet.LatLng[];
      const snappedMarkers = markers.filter((marker) =>
        latLngs.some((latLng: leaflet.LatLng) =>
          latLng.equals(marker.getLatLng())
        )
      ) as CanvasMarker[];

      snappedMarkers.forEach(
        (marker) => (marker.options.image.alwaysVisible = true)
      );

      const markersByType = snappedMarkers.reduce<{
        [type: string]: number;
      }>(
        (prev, acc) => ({
          ...prev,
          [acc.options.image.type]: (prev[acc.options.image.type] || 0) + 1,
        }),
        {}
      );

      setMarkersByType(markersByType);

      const positions = latLngs.map((latLng) => [latLng.lat, latLng.lng]) as [
        number,
        number
      ][];
      setPositions(positions);
    };

    leafletMap.on('pm:create', (event) => {
      refreshMarkers(event.layer);

      leafletMap.pm.enableGlobalEditMode();
      toggleControls(true);

      event.layer.on('pm:edit', (event) => {
        refreshMarkers(event.layer);
      });
    });

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    leafletMap.on('pm:drawstart', ({ workingLayer }) => {
      if (!(workingLayer instanceof leaflet.Polyline)) {
        return;
      }

      workingLayer.on('pm:vertexadded', (event) => {
        refreshMarkers(event.workingLayer);
      });
    });

    leafletMap.pm.enableDraw('Line');

    return () => {
      leafletMap.off('pm:create');
      leafletMap.off('pm:drawstart');
    };
  }, [leafletMap]);

  function handleSave() {
    if (!account) {
      return;
    }
    notify(
      postMarkerRoute({
        name,
        isPublic,
        positions,
        markersByType,
      })
        .then(onAdd)
        .then(closeLatestModal)
    );
  }

  return (
    <div className={styles.container}>
      <aside>
        <small>Only selected markers are visible on this map</small>
        <label className={styles.label}>
          Name
          <input
            onChange={(event) => setName(event.target.value)}
            value={name || ''}
            placeholder="Give this route an explanatory name"
            required
            autoFocus
          />
        </label>
        <label className={styles.label}>
          Make it available for everyone
          <input
            type="checkbox"
            onChange={(event) => setIsPublic(event.target.checked)}
            checked={isPublic}
          />
        </label>
        <MarkerTypes markersByType={markersByType} />
      </aside>
      <div className={styles.map} ref={elementRef} />
      <button
        className={styles.save}
        onClick={handleSave}
        disabled={
          !name || !Object.keys(markersByType).length || positions.length === 0
        }
      >
        Save Position
      </button>
    </div>
  );
}

export default SelectRoute;
