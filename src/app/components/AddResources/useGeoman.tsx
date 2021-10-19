import 'leaflet';
import leaflet from 'leaflet';
import type { Map, Polyline } from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useEffect, useState } from 'react';
import { LeafIcon } from '../WorldMap/useLayerGroups';
import type { FilterItem } from '../MapFilter/mapFilters';
import { useRef } from 'react';
import type { Details } from './AddResources';
import { getTooltipContent } from '../WorldMap/tooltips';

type UseGeomanProps = {
  details: Details;
  leafletMap: Map | null;
  iconUrl: string;
  filter: FilterItem;
  x: number;
  y: number;
  onMove: (x: number, y: number) => void;
  onDraw: (latLngs: [number, number][]) => void;
};
function useGeoman({
  details,
  leafletMap,
  iconUrl,
  filter,
  x,
  y,
  onMove,
  onDraw,
}: UseGeomanProps): void {
  const [dragging, setDragging] = useState(false);

  const markerRef = useRef(
    leaflet
      .marker([y, x], {
        icon: new LeafIcon({ iconUrl }),
      })
      .bindTooltip(getTooltipContent(details, filter), {
        direction: 'top',
        permanent: true,
      })
  );

  useEffect(() => {
    if (!leafletMap || !leafletMap.getPane('markerPane')) {
      return;
    }
    if (!filter.isArea) {
      markerRef.current.addTo(leafletMap);

      leafletMap.pm.enableGlobalDragMode();
    } else {
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
      leafletMap.pm.enableDraw('Polygon');

      leafletMap.on('pm:create', (event) => {
        if (event.shape === 'Polygon') {
          const latLngs = (
            event.layer as Polyline
          ).getLatLngs() as leaflet.LatLng[][];
          const positions = latLngs[0].map((latLng) => [
            +latLng.lng.toFixed(2),
            +latLng.lat.toFixed(2),
          ]) as [number, number][];
          onDraw(positions);
        }
      });
    }
    markerRef.current.on('pm:dragstart', () => {
      setDragging(true);
    });

    markerRef.current.on('pm:dragend', () => {
      setDragging(false);
    });

    markerRef.current.on('pm:drag', (event) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onMove(+event.latlng.lng.toFixed(2), +event.latlng.lat.toFixed(2));
    });
  }, [leafletMap, markerRef]);

  useEffect(() => {
    if (dragging || !leafletMap) {
      return;
    }
    const latLng = markerRef.current.getLatLng();
    if (latLng.lat !== y || latLng.lng !== x) {
      markerRef.current.setLatLng([y, x]);
      leafletMap.setView([y, x]);
    }
  }, [markerRef, x, y, dragging, leafletMap]);
}

export default useGeoman;
