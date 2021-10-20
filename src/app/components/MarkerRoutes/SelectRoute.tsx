import { useEffect, useState } from 'react';
import useLayerGroups from '../WorldMap/useLayerGroups';
import useWorldMap from '../WorldMap/useWorldMap';
import styles from './SelectRoute.module.css';
import 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import type { Polyline } from 'leaflet';
import type leaflet from 'leaflet';
import MarkerTypes from './MarkerTypes';
import { fetchJSON } from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';

type SelectRouteProps = {
  onAdd: () => void;
};
type MarkerBase = { _id: string; type: string };
function SelectRoute({ onAdd }: SelectRouteProps): JSX.Element {
  const { closeLatestModal } = useModal();
  const [positions, setPositions] = useState<[number, number][]>([]);
  const { leafletMap, elementRef } = useWorldMap({ selectMode: true });
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});
  const [name, setName] = useState('');

  useLayerGroups({
    leafletMap,
  });

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    leafletMap.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawMarker: false,
      // drawPolyline: false,
      drawPolygon: false,
      drawCircleMarker: false,
      drawRectangle: false,
      cutPolygon: false,
      dragMode: false,
      rotateMode: false,
      editMode: false,
    });

    let selectedMarkers: MarkerBase[] = [];
    leafletMap.on('pm:create', (event) => {
      console.log(event, selectedMarkers);

      if (event.shape === 'Line') {
        const latLngs = (
          event.layer as Polyline
        ).getLatLngs() as leaflet.LatLng[];
        const positions = latLngs.map((latLng) => [latLng.lat, latLng.lng]) as [
          number,
          number
        ][];
        setPositions(positions);
      }
    });

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    leafletMap.on('pm:drawstart', ({ workingLayer }) => {
      let snappedMarker: MarkerBase | undefined = undefined;
      console.log('pm:drawstart');

      workingLayer.on('pm:vertexadded', () => {
        if (snappedMarker) {
          selectedMarkers.push(snappedMarker);
          const type = snappedMarker.type;
          setMarkersByType((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
          }));
        }
      });
      workingLayer.on('pm:vertexremoved', (event) => {
        if (snappedMarker) {
          const index = selectedMarkers.findIndex(
            (marker) => marker._id === snappedMarker?._id
          );
          selectedMarkers = selectedMarkers.splice(index, 1);
          const type = snappedMarker.type;
          setMarkersByType((prev) => ({
            ...prev,
            [type]: (prev[type] || 1) - 1,
          }));
        }
        console.log(event);
      });
      workingLayer.on('pm:snap', (event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const imageOptions = event.layerInteractedWith?.options?.image;
        if (!imageOptions) {
          return;
        }
        snappedMarker = {
          _id: imageOptions.markerId,
          type: imageOptions.type,
        };
      });
      workingLayer.on('pm:unsnap', () => {
        snappedMarker = undefined;
      });
    });

    leafletMap.pm.enableDraw('Line');

    return () => {
      leafletMap.off('pm:create');
      leafletMap.off('pm:drawstart');
      leafletMap.off('pm:vertexadded');
      leafletMap.off('pm:vertexremoved');
      leafletMap.off('pm:snap');
      leafletMap.off('pm:unsnap');
    };
  }, [leafletMap]);

  function handleSave() {
    fetchJSON('/api/marker-routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        positions,
        markersByType,
      }),
    })
      .then(onAdd)
      .then(closeLatestModal);
  }

  return (
    <div className={styles.container}>
      <aside>
        <MarkerTypes markersByType={markersByType} />
        <label>
          Name
          <input
            onChange={(event) => setName(event.target.value)}
            value={name || ''}
            placeholder="Enter name"
            required
            autoFocus
          />
        </label>
      </aside>
      <div className={styles.map} ref={elementRef} />
      <button className={styles.save} onClick={handleSave}>
        Save Position
      </button>
    </div>
  );
}

export default SelectRoute;
