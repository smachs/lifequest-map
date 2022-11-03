import { useCallback, useEffect, useRef, useState } from 'react';
import leaflet from 'leaflet';
import {
  findMapDetails,
  mapFilters,
  mapFiltersCategories,
  mapIsAeternumMap,
} from 'static';
import { getTooltipContent } from './tooltips';
import { useMarkers } from '../../contexts/MarkersContext';
import CanvasMarker from './CanvasMarker';
import { useSettings } from '../../contexts/SettingsContext';
import { writeError } from '../../utils/logs';
import { useRouteParams } from 'ui/utils/routes';
import useEventListener from '../../utils/useEventListener';
import { calcDistance } from '../../utils/positions';
import { useRefreshUser, useUser } from '../../contexts/UserContext';
import { getAction } from './actions';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../utils/playerStore';

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
}: {
  leafletMap: leaflet.Map | null;
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
  const { map, nodeId } = useRouteParams();
  const playerLocation = usePlayerStore(
    (state) => state.player?.position?.location
  );
  const user = useUser();
  const refreshUser = useRefreshUser();
  const navigate = useNavigate();

  const [highlightedMapMarker, setHighlightedMapMarker] =
    useState<CanvasMarker | null>(null);

  const onMarkerAction = useCallback(async () => {
    if (!playerLocation) {
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
    }
  }, [playerLocation, user]);

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
      const radius = markerSize / 2;
      allMarkers.forEach(({ layer }) => {
        if (
          layer.options.radius === radius &&
          layer.options.image.showBackground === markerShowBackground
        ) {
          return;
        }

        layer.setRadius(radius);
        layer.options.image.showBackground = markerShowBackground;
        layer.redraw();
      });
    }, 200);

    return () => {
      clearTimeout(handle);
    };
  }, [markerSize, markerShowBackground]);

  useEffect(() => {
    if (!highlightedMapMarker || !nodeId) {
      return;
    }
    const size = markerSize * 1.5;
    highlightedMapMarker.setRadius(size / 2);
    highlightedMapMarker.options.image.highlight = true;
    highlightedMapMarker.redraw();
    highlightedMapMarker.bringToFront();

    return () => {
      highlightedMapMarker.setRadius(markerSize / 2);
      highlightedMapMarker.options.image.highlight = false;
      highlightedMapMarker.redraw();
    };
  }, [highlightedMapMarker, nodeId]);

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
        const isHighlighted = marker._id === nodeId;
        const radius = markerSize / 2;
        const mapMarker = new CanvasMarker(latLng, {
          renderer: canvasRenderer,
          radius: isHighlighted ? radius * 1.5 : radius,
          image: {
            markerId: marker._id,
            type: marker.type,
            markerSize: marker.size,
            src: mapFilter.iconUrl,
            showBackground: markerShowBackground,
            borderColor: filterCategory.borderColor,
            highlight: isHighlighted,
            comments: marker.comments,
            issues: marker.issues,
          },
          customRespawnTimer: marker.customRespawnTimer,
          pmIgnore: false,
        }).bindTooltip(getTooltipContent(marker, mapFilter), {
          direction: 'top',
        });
        if (isHighlighted) {
          setHighlightedMapMarker(mapMarker);
        }
        mapMarker.on('click', (event) => {
          // @ts-ignore
          event.originalEvent.propagatedFromMarker = true;

          if (
            !leafletMap.pm ||
            (!leafletMap.pm.globalEditModeEnabled() &&
              !leafletMap.pm.globalDrawModeEnabled())
          ) {
            let url = '/';
            if (marker.map) {
              const mapDetails = findMapDetails(marker.map);
              if (mapDetails) {
                url += `${mapDetails.title}/`;
              }
            }
            url += `nodes/${marker._id}${location.search}`;
            navigate(url);
            setHighlightedMapMarker(mapMarker);
          }
        });
        mapMarker.on('contextmenu', () => {
          if (
            !leafletMap.pm ||
            (!leafletMap.pm.globalEditModeEnabled() &&
              !leafletMap.pm.globalDrawModeEnabled())
          ) {
            const action = getAction(mapMarker.options.image.type);
            if (action) {
              action(mapMarker, user, refreshUser);
            }
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
  }, [leafletMap, visibleMarkers, user]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    const layerGroup = new leaflet.LayerGroup();
    const mapDetails = findMapDetails(map);

    for (let i = 0; i < markerRoutes.length; i++) {
      const markerRoute = markerRoutes[i];
      if (
        markerRoute.map
          ? mapDetails !== findMapDetails(markerRoute.map)
          : !mapIsAeternumMap(map)
      ) {
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
