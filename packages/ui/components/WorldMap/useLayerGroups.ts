import { useCallback, useEffect, useRef } from 'react';
import leaflet from 'leaflet';
import { mapFilters, mapFiltersCategories, DEFAULT_MAP_NAME } from 'static';
import type { MarkerBasic } from '../../contexts/MarkersContext';
import { getTooltipContent } from './tooltips';
import { useMarkers } from '../../contexts/MarkersContext';
import CanvasMarker from './CanvasMarker';
import { useSettings } from '../../contexts/SettingsContext';
import { writeError } from '../../utils/logs';
import { useFilters } from '../../contexts/FiltersContext';
import useEventListener from '../../utils/useEventListener';
import { calcDistance } from '../../utils/positions';
import { usePlayer } from '../../contexts/PlayerContext';
import { useRefreshUser, useUser } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import { getAction } from './actions';

export const LeafIcon: new ({ iconUrl }: { iconUrl: string }) => leaflet.Icon =
  leaflet.Icon.extend({
    options: {
      iconSize: [32, 32],
      tooltipAnchor: [0, -20],
    },
  });

const canvasRenderer = leaflet.canvas();
const markersLayerGroup = leaflet.layerGroup();

function useLayerGroups({
  leafletMap,
  onMarkerClick,
}: {
  leafletMap: leaflet.Map | null;
  onMarkerClick: (marker: MarkerBasic) => void;
}): void {
  const { visibleMarkers, markerRoutes } = useMarkers();
  const { markerSize, markerShowBackground } = useSettings();
  const isFirstRender = useRef(true);
  const allLayersRef = useRef<{
    [id: string]: {
      layer: CanvasMarker;
      hasComments: boolean;
      hasIssues: boolean;
    };
  }>({});
  const { map } = useFilters();
  const { player } = usePlayer();
  const user = useUser();
  const refreshUser = useRefreshUser();

  const onMarkerAction = useCallback(async () => {
    const playerLocation = player?.position?.location;
    if (!playerLocation || !user) {
      return;
    }
    const markers = markersLayerGroup.getLayers() as CanvasMarker[];
    const marker = markers.find((marker) => {
      const action = getAction(marker.options.image.type);
      if (!action) {
        return false;
      }
      const latLng = marker.getLatLng();
      const distance = calcDistance([latLng.lat, latLng.lng], playerLocation);
      return distance < 5;
    });
    if (marker) {
      const action = getAction(marker.options.image.type);
      action(marker, user, refreshUser);
    } else {
      toast.warn('Can not find near interactable marker');
    }
  }, [player?.position, user]);

  useEventListener('hotkey-marker_action', onMarkerAction, [onMarkerAction]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    markersLayerGroup.addTo(leafletMap);
    // @ts-ignore
    leafletMap.markersLayerGroup = markersLayerGroup;
  }, [leafletMap]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handle = setTimeout(() => {
      const allLayers = allLayersRef.current;
      const allMarkers = Object.values(allLayers);
      if (allMarkers.length === 0 || !leafletMap) {
        return;
      }
      allMarkers.forEach(({ layer }) => {
        if (
          layer.options.image.size[0] === markerSize &&
          layer.options.image.size[1] === markerSize &&
          layer.options.image.showBackground === markerShowBackground
        ) {
          return;
        }

        layer.options.image.size = [markerSize, markerSize];
        layer.options.image.showBackground = markerShowBackground;
        const isVisible = markersLayerGroup.hasLayer(layer);
        markersLayerGroup.removeLayer(layer);
        if (isVisible) {
          markersLayerGroup.addLayer(layer);
        }
      });
    }, 200);

    return () => {
      clearTimeout(handle);
    };
  }, [markerSize, markerShowBackground]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    const allLayers = allLayersRef.current;
    const removableMarkers = Object.keys(allLayers);
    const mapBounds = leafletMap.getBounds();

    for (let i = 0; i < visibleMarkers.length; i++) {
      try {
        const marker = visibleMarkers[i];
        const latLng: [number, number] = [
          marker.position[1],
          marker.position[0],
        ];

        const shouldBeVisible = mapBounds.contains(latLng);
        if (allLayers[marker._id]) {
          const index = removableMarkers.indexOf(marker._id);
          if (index > -1) {
            removableMarkers.splice(index, 1);
          }
          const isVisible = markersLayerGroup.hasLayer(
            allLayers[marker._id].layer
          );
          if (
            allLayers[marker._id].hasComments !== Boolean(marker.comments) ||
            allLayers[marker._id].hasIssues !== Boolean(marker.issues)
          ) {
            markersLayerGroup.removeLayer(allLayers[marker._id].layer);
            delete allLayers[marker._id];
          } else {
            if (shouldBeVisible && !isVisible) {
              markersLayerGroup.addLayer(allLayers[marker._id].layer);
            }
            continue;
          }
        }

        const mapFilter = mapFilters.find(
          (mapFilter) => mapFilter.type === marker.type
        );
        if (!mapFilter) {
          continue;
        }

        const filterCategory = mapFiltersCategories.find(
          (filterCategory) => filterCategory.value === mapFilter.category
        );
        if (!filterCategory) {
          continue;
        }
        const mapMarker = new CanvasMarker(latLng, {
          renderer: canvasRenderer,
          radius: 16,
          image: {
            markerId: marker._id,
            type: marker.type,
            markerSize: marker.size,
            src: mapFilter.iconUrl,
            showBackground: markerShowBackground,
            borderColor: filterCategory.borderColor,
            size: [markerSize, markerSize],
            comments: marker.comments,
            issues: marker.issues,
          },
          pmIgnore: false,
        }).bindTooltip(getTooltipContent(marker, mapFilter), {
          direction: 'top',
        });
        mapMarker.on('click', () => {
          if (
            !leafletMap.pm ||
            (!leafletMap.pm.globalEditModeEnabled() &&
              !leafletMap.pm.globalDrawModeEnabled())
          ) {
            onMarkerClick(marker);
          }
        });
        mapMarker.on('contextmenu', () => {
          if (
            !leafletMap.pm ||
            (!leafletMap.pm.globalEditModeEnabled() &&
              !leafletMap.pm.globalDrawModeEnabled())
          ) {
            const action = getAction(mapMarker.options.image.type);
            action(mapMarker, user, refreshUser);
          }
        });
        allLayers[marker._id] = {
          layer: mapMarker,
          hasComments: Boolean(marker.comments),
          hasIssues: Boolean(marker.issues),
        };
        if (shouldBeVisible) {
          markersLayerGroup.addLayer(allLayers[marker._id].layer);
        }
      } catch (error) {
        writeError(error);
      }
    }

    removableMarkers.forEach((markerId) => {
      const layerCache = allLayers[markerId];
      if (layerCache) {
        markersLayerGroup.removeLayer(layerCache.layer);
        allLayers[markerId].layer.popup?.remove();
        allLayers[markerId].layer.off();
        allLayers[markerId].layer.remove();
        delete allLayers[markerId];
      }
    });

    let currentMapBounds = leafletMap.getBounds();
    function showHideLayers() {
      const allMarkers = Object.values(allLayers);
      const mapBounds = leafletMap!.getBounds();
      currentMapBounds = mapBounds;
      allMarkers.forEach((marker) => {
        if (currentMapBounds !== mapBounds) {
          return;
        }
        const layer = marker.layer;
        const shouldBeVisible = mapBounds.contains(layer.getLatLng());

        const isVisible = markersLayerGroup.hasLayer(layer);

        if (isVisible && !shouldBeVisible) {
          markersLayerGroup.removeLayer(layer);
        } else if (!isVisible && shouldBeVisible) {
          markersLayerGroup.addLayer(layer);
        }
      });
    }

    let isThrottled = false;
    let trailingTimeoutId: NodeJS.Timeout;
    function placeMarkersInBounds() {
      clearTimeout(trailingTimeoutId);
      if (isThrottled) {
        trailingTimeoutId = setTimeout(showHideLayers, 500);
        return;
      }
      isThrottled = true;

      setTimeout(() => {
        showHideLayers();
        isThrottled = false;
      }, 500);
    }

    leafletMap.on('moveend', placeMarkersInBounds);
    return () => {
      leafletMap.off('moveend', placeMarkersInBounds);
      clearTimeout(trailingTimeoutId);
    };
  }, [leafletMap, visibleMarkers]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    const layerGroup = new leaflet.LayerGroup();

    for (let i = 0; i < markerRoutes.length; i++) {
      const markerRoute = markerRoutes[i];
      if (map !== (markerRoute.map || DEFAULT_MAP_NAME)) {
        continue;
      }
      const startHereCircle = leaflet.circle(markerRoute.positions[0], {
        pmIgnore: true,
      });
      const line = leaflet.polyline(markerRoute.positions, { pmIgnore: true });
      startHereCircle.addTo(layerGroup);
      line.addTo(layerGroup);
    }
    layerGroup.addTo(leafletMap);

    return () => {
      layerGroup.off();
      layerGroup.remove();
    };
  }, [leafletMap, markerRoutes, map]);

  useEffect(() => {
    return () => {
      Object.values(allLayersRef.current).forEach(({ layer }) => {
        layer.off();
        layer.remove();
      });
      allLayersRef.current = {};
    };
  }, []);
}

export default useLayerGroups;
