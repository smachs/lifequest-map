import { useEffect, useState } from 'react';
import styles from './SelectRoute.module.css';
import 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import leaflet from 'leaflet';
import MarkerTypes from './MarkerTypes';
import { notify } from '../../utils/notifications';
import { patchMarkerRoute, postMarkerRoute } from './api';
import CanvasMarker from '../WorldMap/CanvasMarker';
import { useMarkers } from '../../contexts/MarkersContext';
import type { MarkerRouteItem } from './MarkerRoutes';

type SelectRouteProps = {
  leafletMap: leaflet.Map;
  markerRoute?: MarkerRouteItem;
  onClose: () => void;
};
function SelectRoute({
  leafletMap,
  markerRoute,
  onClose,
}: SelectRouteProps): JSX.Element {
  const [positions, setPositions] = useState<[number, number][]>(
    markerRoute?.positions || []
  );
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});
  const [name, setName] = useState(markerRoute?.name || '');
  const [isPublic, setIsPublic] = useState(markerRoute?.isPublic || false);
  const { toggleMarkerRoute, refreshMarkerRoutes } = useMarkers();

  useEffect(() => {
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
        drawPolyline: true,
        editMode: editMode,
      });
    };
    toggleControls(false);

    const refreshMarkers = (workingLayer: leaflet.Polyline | leaflet.Layer) => {
      // @ts-ignore
      const markers = Object.values(leafletMap._layers).filter(
        (marker) => marker instanceof CanvasMarker
      ) as CanvasMarker[];
      markers.forEach((marker) => {
        marker.options.image.alwaysVisible = false;
      });

      // @ts-ignore
      const latLngs = workingLayer.getLatLngs() as leaflet.LatLng[];
      const snappedMarkers = markers.filter((marker) =>
        latLngs.some((latLng: leaflet.LatLng) =>
          latLng.equals(marker.getLatLng())
        )
      ) as CanvasMarker[];

      snappedMarkers.forEach((marker) => {
        marker.options.image.alwaysVisible = true;
      });

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

    let existingPolyline: leaflet.Polyline | null = null;
    leafletMap.on('pm:create', (event) => {
      existingPolyline = event.layer as leaflet.Polyline;
      refreshMarkers(event.layer);

      leafletMap.pm.enableGlobalEditMode();
      toggleControls(true);

      event.layer.on('pm:edit', (event) => {
        refreshMarkers(event.layer as leaflet.Polyline);
      });
    });

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    leafletMap.on('pm:drawstart', ({ workingLayer }) => {
      if (!existingPolyline) {
        existingPolyline = workingLayer as leaflet.Polyline;
      } else {
        existingPolyline
          .getLatLngs()
          .flat(999)
          .forEach((latlng) => {
            // @ts-ignore
            leafletMap.pm.Draw.Line._createVertex({ latlng });
          });
        existingPolyline.remove();
        // @ts-ignore
        existingPolyline = leafletMap.pm.Draw.Line._layer;
      }

      existingPolyline!.on('pm:vertexadded', () => {
        refreshMarkers(existingPolyline!);
      });
    });

    if (markerRoute) {
      leafletMap.pm.enableGlobalEditMode();
      existingPolyline = leaflet.polyline(markerRoute.positions, {
        pmIgnore: false,
      });
      existingPolyline.pm.toggleEdit();
      existingPolyline.addTo(leafletMap);
      refreshMarkers(existingPolyline);
      existingPolyline.on('pm:edit', (event) => {
        refreshMarkers(event.layer);
      });
      toggleControls(true);
      setTimeout(() => {
        if (existingPolyline) {
          refreshMarkers(existingPolyline);
        }
      }, 100);
    } else {
      leafletMap.pm.enableDraw('Line');
    }

    return () => {
      leafletMap.pm.removeControls();
      leafletMap.pm.disableGlobalEditMode();
      leafletMap.off('pm:create');
      leafletMap.off('pm:drawstart');

      if (existingPolyline) {
        existingPolyline.remove();
      }

      // @ts-ignore
      const markers = Object.values(leafletMap._layers).filter(
        (marker) => marker instanceof CanvasMarker
      ) as CanvasMarker[];
      markers.forEach((marker) => {
        marker.options.image.alwaysVisible = false;
      });
    };
  }, []);

  async function handleSave() {
    const partialMarkerRoute = {
      name,
      isPublic,
      positions,
      markersByType,
    };
    const action = markerRoute
      ? patchMarkerRoute(markerRoute._id, partialMarkerRoute)
      : postMarkerRoute(partialMarkerRoute);
    const updatedMarkerRoute = await notify(action, {
      success: markerRoute ? 'Route updated 👌' : 'Route added 👌',
    });

    toggleMarkerRoute(updatedMarkerRoute);
    await refreshMarkerRoutes();
    onClose();
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        Name
        <input
          onChange={(event) => setName(event.target.value)}
          value={name || ''}
          placeholder="Give this route an explanatory name"
          required
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
      <button
        className={styles.button}
        onClick={handleSave}
        disabled={!name || positions.length === 0}
      >
        Save Route {!name && '(Name missing)'}
      </button>
      <button className={styles.button} onClick={onClose}>
        Cancel
      </button>
      <small>Right click in edit mode to remove a vertex</small>
    </div>
  );
}

export default SelectRoute;
