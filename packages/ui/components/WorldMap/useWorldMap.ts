import leaflet from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AETERNUM_MAP, findMapDetails, mapIsAeternumMap } from 'static';
import { isEmbed, useView } from 'ui/utils/routes';
import { useRealmStore } from '../../utils/realmStore';
import createCanvasLayer from './CanvasLayer';
import { initOtherPlayers } from './otherPlayers';
import { coordinates as playerCoordinates } from './usePlayerPosition';
import useRegionBorders from './useRegionBorders';

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
  const { view, setView } = useView();
  const navigate = useNavigate();
  const isPTR = useRealmStore((state) => state.isPTR);

  useEffect(() => {
    if (leafletMap && initialZoom) {
      leafletMap.setZoom(initialZoom);
    }
  }, [leafletMap, initialZoom]);

  useRegionBorders(leafletMap, mapIsAeternumMap(view.map));

  useEffect(() => {
    if (leafletMap) {
      leafletMap.off('click');
      leafletMap.on('click', (event) => {
        if (
          // @ts-ignore
          !event.originalEvent.propagatedFromMarker &&
          (view.nodeId || view.routeId) &&
          !isEmbed
        ) {
          const mapDetail = findMapDetails(view.map);
          if (mapDetail === AETERNUM_MAP || !mapDetail) {
            navigate(`/${location.search}`);
          } else {
            navigate(`/${view.map}${location.search}`);
          }
        }
      });
    }
  }, [leafletMap, view.map, view.routeId, view.nodeId]);

  useEffect(() => {
    const mapElement = elementRef.current;

    const mapDetail = findMapDetails(view.map);
    if (!mapElement || !mapDetail) {
      return;
    }
    const updateView = (leafletMap: leaflet.Map) => {
      const latLngBounds = leaflet.latLngBounds(mapDetail.maxBounds);
      try {
        const match = location.search.match(
          /bounds=(-?\d+\.?\d+),(-?\d+\.?\d+),(-?\d+\.?\d+),(-?\d+\.?\d+)/
        );
        if (match?.length === 5) {
          const initialBounds: [[number, number], [number, number]] = [
            [+match[2], +match[1]],
            [+match[4], +match[3]],
          ];
          // leafletMap.fitBounds(initialBounds)
          leafletMap.fitBounds(
            [
              [-90, -180],
              [90, 180],
            ],
            {
              animate: false,
              noMoveStart: true,
            }
          );
          return;
        }
      } catch (error) {
        //
      }
      if (view.x) {
        leafletMap.setView([view.y, view.x], initialZoom || view.zoom, {
          animate: false,
          noMoveStart: true,
        });
      } else {
        leafletMap.fitBounds(latLngBounds, {
          animate: false,
          noMoveStart: true,
        });
      }
    };

    if (latestLeafletMap) {
      const CanvasLayer = createCanvasLayer(mapDetail, isPTR);
      const worldTiles = new CanvasLayer();
      worldTiles.addTo(latestLeafletMap);
      updateView(latestLeafletMap);

      return () => {
        worldTiles.remove();
      };
    }

    latestLeafletMap = leaflet.map(mapElement, {
      preferCanvas: true,
      worldCopyJump: false,
      attributionControl: false,
      zoomControl: false,
      zoom: initialZoom || 4,
    });

    latestLeafletMap.on('contextmenu', () => {
      // Disable default context menu
    });

    setLeafletMap(latestLeafletMap);
    updateView(latestLeafletMap);

    if (!hideControls) {
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
      playerCoordinates.addTo(latestLeafletMap);

      coordinates.addTo(latestLeafletMap);
    }
    const CanvasLayer = createCanvasLayer(mapDetail, isPTR);
    const worldTiles = new CanvasLayer();

    worldTiles.addTo(latestLeafletMap);
    initOtherPlayers(latestLeafletMap);
    return () => {
      worldTiles.remove();
    };
  }, [elementRef, view.map, isPTR]);

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
  }, [leafletMap, setView]);

  return { elementRef, leafletMap };
}

export default useWorldMap;
