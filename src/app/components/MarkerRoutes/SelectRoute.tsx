import { useEffect, useState } from 'react';
import useLayerGroups from '../WorldMap/useLayerGroups';
import useWorldMap from '../WorldMap/useWorldMap';
import styles from './SelectRoute.module.css';
import 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import type { Polyline } from 'leaflet';
import type leaflet from 'leaflet';
import { mapFilters } from '../MapFilter/mapFilters';

type SelectRouteType = {
  onSelectRoute: (positions: [number, number][]) => void;
};
type MarkerBase = { _id: string; type: string };
function SelectRoute({ onSelectRoute }: SelectRouteType): JSX.Element {
  const [positions, setPositions] = useState<[number, number][]>([]);
  const { leafletMap, elementRef } = useWorldMap({ selectMode: true });
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});

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
        const positions = latLngs.map((latLng) => [
          +latLng.lng.toFixed(2),
          +latLng.lat.toFixed(2),
        ]) as [number, number][];
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
    onSelectRoute(positions);
  }

  return (
    <div className={styles.container}>
      <aside>
        {Object.keys(markersByType).length === 0 && 'No markers selected'}
        {Object.keys(markersByType).map((markerType) => (
          <span key={markerType} className={styles.marker}>
            <img
              src={
                mapFilters.find((mapFilter) => mapFilter.type === markerType)
                  ?.iconUrl
              }
              alt={markerType}
            />
            : {markersByType[markerType]}
          </span>
        ))}
      </aside>
      <div className={styles.map} ref={elementRef} />
      <button className={styles.save} onClick={handleSave}>
        Save Position
      </button>
    </div>
  );
}

export default SelectRoute;
