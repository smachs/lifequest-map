import 'leaflet';
import leaflet from 'leaflet';
import type { Map } from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useEffect, useMemo, useState } from 'react';
import { LeafIcon } from '../WorldMap/useLayerGroups';
import type { FilterItem } from 'static';
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

  const marker = useMemo(
    () =>
      leaflet.marker([y, x], {
        icon: unknownMarkerIcon,
        pmIgnore: false,
      }),
    []
  );

  useEffect(() => {
    if (iconUrl) {
      marker.setZIndexOffset(10000);
      marker.setIcon(new LeafIcon({ iconUrl }));
    }
    if (details && filter) {
      marker.bindTooltip(getTooltipContent(details, filter), {
        direction: 'top',
        permanent: true,
      });
    } else {
      marker.bindTooltip('Choose marker', {
        direction: 'top',
        permanent: true,
      });
    }
    return () => {
      marker.unbindTooltip();
    };
  }, [details, filter, iconUrl]);

  useEffect(() => {
    marker.addTo(leafletMap);
    // @ts-ignore
    leafletMap.pm.setGlobalOptions({ snappable: false });
    // @ts-ignore
    marker.pm.enableLayerDrag();
    marker.on('pm:dragstart', () => {
      setDragging(true);
    });

    marker.on('pm:dragend', () => {
      const latLng = marker.getLatLng();
      onMove(+latLng.lng.toFixed(2), +latLng.lat.toFixed(2));
      setDragging(false);
    });

    marker.on('pm:drag', (event) => {
      onMove(+event.latlng.lng.toFixed(2), +event.latlng.lat.toFixed(2));
    });

    return () => {
      marker.off();
      marker.remove();
    };
  }, []);

  useEffect(() => {
    if (dragging) {
      return;
    }
    const latLng = marker.getLatLng();
    if (latLng.lat !== y || latLng.lng !== x) {
      marker.setLatLng([y, x]);
    }
    leafletMap.setView([y, x]);
  }, [x, y, dragging]);
}

export default useGeoman;
