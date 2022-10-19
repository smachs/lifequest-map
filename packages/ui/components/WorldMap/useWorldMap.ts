import { useEffect, useRef, useState } from 'react';
import type { TileLayer } from 'leaflet';
import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'tilelayer-canvas';
import { coordinates as playerCoordinates } from './usePlayerPosition';
import { useSettings } from '../../contexts/SettingsContext';
import useRegionBorders from './useRegionBorders';
import { mapIsAeternumMap, findMapDetails, AETERNUM_MAP } from 'static';
import { useView } from 'ui/utils/routes';
import { useNavigate } from 'react-router-dom';

const { VITE_API_ENDPOINT = '' } = import.meta.env;

function toThreeDigits(number: number): string {
  if (number < 10) {
    return `00${number}`;
  }
  if (number < 100) {
    return `0${number}`;
  }
  return `${number}`;
}

const worldCRS = leaflet.extend({}, leaflet.CRS.Simple, {
  transformation: new leaflet.Transformation(1 / 16, 0, -1 / 16, 0),
});

const WorldTiles = (map: string): new () => TileLayer =>
  // @ts-ignore
  leaflet.TileLayer.Canvas.extend({
    // options: {
    //   errorTileUrl: `${VITE_API_ENDPOINT}/assets/map/empty.webp`,
    // },
    getTileUrl(coords: { x: number; y: number; z: number }) {
      const zoom = 8 - coords.z - 1;
      const multiplicators = [1, 2, 4, 8, 16, 32, 64];
      const x = coords.x * multiplicators[zoom - 1];
      const y = (-coords.y - 1) * multiplicators[zoom - 1];
      if (x < 0 || y < 0 || y >= 64 || x >= 64) {
        return `${VITE_API_ENDPOINT}/assets/map/empty.webp`;
      }
      return `${VITE_API_ENDPOINT}/assets/${map}/map_l${zoom}_y${toThreeDigits(
        y
      )}_x${toThreeDigits(x)}.webp`;
    },
    getTileSize() {
      return { x: 1024, y: 1024 };
    },
  });

type UseWorldMapProps = {
  hideControls?: boolean;
  initialZoom?: number;
};
export let latestLeafletMap: leaflet.Map | null = null;
function useWorldMap({ hideControls, initialZoom }: UseWorldMapProps): {
  elementRef: React.MutableRefObject<HTMLDivElement | null>;
  leafletMap: leaflet.Map | null;
} {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [leafletMap, setLeafletMap] = useState<leaflet.Map | null>(null);
  const { showRegionBorders } = useSettings();
  const { view, setView } = useView();
  const navigate = useNavigate();

  useEffect(() => {
    if (leafletMap && initialZoom) {
      leafletMap.setZoom(initialZoom);
    }
  }, [leafletMap, initialZoom]);

  useRegionBorders(showRegionBorders, leafletMap, mapIsAeternumMap(view.map));

  useEffect(() => {
    if (leafletMap) {
      leafletMap.off('click');
      leafletMap.on('click', (event) => {
        // @ts-ignore
        if (!event.originalEvent.propagatedFromMarker && view.nodeId) {
          const mapDetail = findMapDetails(view.map);
          if (mapDetail === AETERNUM_MAP || !mapDetail) {
            navigate(`/${location.search}`);
          } else {
            navigate(`/${view.map}${location.search}`);
          }
        }
      });
    }
  }, [leafletMap, view.map, view.nodeId]);

  useEffect(() => {
    const mapElement = elementRef.current;

    const mapDetail = findMapDetails(view.map);
    if (!mapElement || !mapDetail) {
      return;
    }
    const latLngBounds = leaflet.latLngBounds(mapDetail.maxBounds);

    const updateView = (leafletMap: leaflet.Map) => {
      if (view.x) {
        leafletMap.setView([view.y, view.x], initialZoom || view.zoom, {
          animate: false,
          noMoveStart: true,
        });
      } else {
        leafletMap.fitBounds(latLngBounds, { animate: false });
      }
    };

    if (latestLeafletMap) {
      const leafletMap = latestLeafletMap;
      const worldTiles = new (WorldTiles(mapDetail.folder))();
      worldTiles.addTo(leafletMap);
      leafletMap.setMaxZoom(mapDetail.maxZoom);
      leafletMap.setMinZoom(mapDetail.minZoom);
      leafletMap.setMaxBounds(latLngBounds);
      updateView(leafletMap);

      return () => {
        worldTiles.remove();
      };
    }

    const leafletMap = leaflet.map(mapElement, {
      preferCanvas: true,
      crs: worldCRS,
      maxZoom: mapDetail.maxZoom,
      minZoom: mapDetail.minZoom,
      attributionControl: false,
      zoomControl: false,
      zoom: initialZoom || 4,
      maxBounds: latLngBounds,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
    });

    leafletMap.on('contextmenu', () => {
      // Disable default context menu
    });

    setLeafletMap(leafletMap);

    latestLeafletMap = leafletMap;
    updateView(leafletMap);

    if (!hideControls) {
      leaflet.control.zoom({ position: 'bottomleft' }).addTo(leafletMap);

      const divElement = leaflet.DomUtil.create('div', 'leaflet-position');
      const handleMouseMove = (event: leaflet.LeafletMouseEvent) => {
        divElement.innerHTML = `<span>[${event.latlng.lng.toFixed(
          2
        )}, ${event.latlng.lat.toFixed(2)}]</span>`;
      };
      const handleMouseOut = () => {
        divElement.innerHTML = ``;
      };

      const CoordinatesControl = leaflet.Control.extend({
        onAdd(map: leaflet.Map) {
          map.on('mousemove', handleMouseMove);
          map.on('mouseout', handleMouseOut);
          return divElement;
        },
        onRemove(map: leaflet.Map) {
          map.off('mousemove', handleMouseMove);
          map.off('mouseout', handleMouseOut);
        },
      });

      const coordinates = new CoordinatesControl({ position: 'bottomright' });
      playerCoordinates.addTo(leafletMap);

      coordinates.addTo(leafletMap);
    }
    const worldTiles = new (WorldTiles(mapDetail.folder))();
    worldTiles.addTo(leafletMap);

    return () => {
      worldTiles.remove();
    };
  }, [elementRef, view.map]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    let timeoutId: NodeJS.Timeout;
    const handleMoveEnd = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const center = leafletMap.getCenter();
        setView({
          x: center.lng,
          y: center.lat,
          zoom: leafletMap.getZoom(),
        });
      }, 1000);
    };
    leafletMap.on('moveend', handleMoveEnd);

    return () => {
      clearTimeout(timeoutId);
      leafletMap.off('moveend', handleMoveEnd);
    };
  }, [leafletMap]);

  return { elementRef, leafletMap };
}

export default useWorldMap;
