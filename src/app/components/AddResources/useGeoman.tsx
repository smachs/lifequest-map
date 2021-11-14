import 'leaflet';
import leaflet from 'leaflet';
import type { Map } from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useEffect, useState } from 'react';
import { LeafIcon } from '../WorldMap/useLayerGroups';
import type { FilterItem } from '../MapFilter/mapFilters';
import { useRef } from 'react';
import type { Details } from './AddResources';
import { getTooltipContent } from '../WorldMap/tooltips';

type UseGeomanProps = {
  details: Details | null;
  leafletMap: Map;
  iconUrl?: string;
  filter: FilterItem | null;
  x: number;
  y: number;
  onMove: (x: number, y: number) => void;
};

const unknownMarkerIcon = new LeafIcon({ iconUrl: '/unknown.webp' });
function useGeoman({
  details,
  leafletMap,
  iconUrl,
  filter,
  x,
  y,
  onMove,
}: UseGeomanProps): void {
  const [dragging, setDragging] = useState(false);

  const markerRef = useRef(
    leaflet.marker([y, x], {
      icon: unknownMarkerIcon,
    })
  );

  useEffect(() => {
    if (iconUrl) {
      markerRef.current.setZIndexOffset(10000);
      markerRef.current.setIcon(new LeafIcon({ iconUrl }));
    }
    if (details && filter) {
      markerRef.current.bindTooltip(getTooltipContent(details, filter), {
        direction: 'top',
        permanent: true,
      });
    } else {
      markerRef.current.bindTooltip('Choose marker', {
        direction: 'top',
        permanent: true,
      });
    }
    return () => {
      markerRef.current.unbindTooltip();
    };
  }, [details, filter, iconUrl]);

  useEffect(() => {
    markerRef.current.addTo(leafletMap);

    leafletMap.pm.enableGlobalDragMode();

    markerRef.current.on('pm:dragstart', () => {
      setDragging(true);
    });

    markerRef.current.on('pm:dragend', () => {
      setDragging(false);
    });

    markerRef.current.on('pm:drag', (event) => {
      // @ts-ignore
      onMove(+event.latlng.lng.toFixed(2), +event.latlng.lat.toFixed(2));
    });

    return () => {
      markerRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (dragging) {
      return;
    }
    const latLng = markerRef.current.getLatLng();
    if (latLng.lat !== y || latLng.lng !== x) {
      markerRef.current.setLatLng([y, x]);
      leafletMap.setView([y, x]);
    }
  }, [markerRef, x, y, dragging]);
}

export default useGeoman;
