import { useQuery } from '@tanstack/react-query';
import leaflet from 'leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import {
  findMapDetails,
  mapFilters,
  mapFiltersCategories,
  mapIsAeternumMap,
} from 'static';
import { isEmbed, useRouteParams } from 'ui/utils/routes';
import shallow from 'zustand/shallow';
import { useMarkers } from '../../contexts/MarkersContext';
import { writeError } from '../../utils/logs';
import { usePlayerStore } from '../../utils/playerStore';
import { calcDistance } from '../../utils/positions';
import { useSettingsStore } from '../../utils/settingsStore';
import useEventListener from '../../utils/useEventListener';
import { getAction, sharedRespawnTimers, startTimer } from './actions';
import CanvasMarker from './CanvasMarker';
import { fetchRespawnTimers } from './respawnTimers';
import { getTooltipContent } from './tooltips';

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
  socket,
}: {
  leafletMap: leaflet.Map | null;
  socket: Socket | null;
}): void {
  const { visibleMarkers, markerRoutes } = useMarkers();
  const {
    markerSize,
    markerShowBackground,
    showOtherRespawnTimers,
    otherPlayersWorldName,
  } = useSettingsStore(
    (state) => ({
      markerSize: state.markerSize,
      markerShowBackground: state.markerShowBackground,
      showOtherRespawnTimers: state.showOtherRespawnTimers,
      otherPlayersWorldName: state.otherPlayersWorldName,
    }),
    shallow
  );
  const isFirstRender = useRef(true);
  const allLayersRef = useRef<{
    [id: string]: {
      layer: CanvasMarker;
      hasComments: boolean;
      hasIssues: boolean;
    };
  }>({});
  const { map, nodeId } = useRouteParams();
  const {
    location: playerLocation,
    worldName,
    steamId,
  } = usePlayerStore(
    (state) => ({
      location: state.player?.position?.location,
      worldName: state.player?.worldName,
      steamId: state.player?.steamId,
    }),
    shallow
  );
  const navigate = useNavigate();
  const markersRespawnAt = useRef<{
    [markerId: string]: number;
  }>({});

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
      const respawnTimer = action(marker);
      if (typeof respawnTimer === 'number') {
        startTimer(marker, respawnTimer, socket);
      }
    }
  }, [playerLocation]);

  useEventListener('hotkey-marker_action', onMarkerAction, [onMarkerAction]);
  useEventListener('hotkey-marker_action_secondary', onMarkerAction, [
    onMarkerAction,
  ]);

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    markersLayerGroup.addTo(leafletMap);
    // @ts-ignore
    leafletMap.markersLayerGroup = markersLayerGroup;
  }, [leafletMap]);

  useEffect(() => {
    if (socket && worldName) {
      socket.emit(
        'markersRespawnTimers',
        worldName,
        (
          markersRespawnTimers: {
            markerId: string;
            respawnTimer: number;
            steamId: string;
            markerType: string;
          }[]
        ) => {
          const allLayers = allLayersRef.current;
          markersRespawnAt.current = {};
          const now = Date.now();
          for (const markerRespawnTimer of markersRespawnTimers) {
            const isMine = markerRespawnTimer.steamId === steamId;
            if (
              !isMine &&
              !sharedRespawnTimers.includes(markerRespawnTimer.markerType)
            ) {
              continue;
            }
            markersRespawnAt.current[markerRespawnTimer.markerId] =
              markerRespawnTimer.respawnTimer + now;

            const marker = allLayers[markerRespawnTimer.markerId]?.layer;
            if (marker) {
              startTimer(marker, markerRespawnTimer.respawnTimer);
            }
          }
        }
      );
    }
  }, [socket, worldName, showOtherRespawnTimers && otherPlayersWorldName]);

  const { data: respawnTimers } = useQuery(
    ['respawnTimers', otherPlayersWorldName],
    () => fetchRespawnTimers(otherPlayersWorldName!),
    {
      enabled: Boolean(showOtherRespawnTimers && otherPlayersWorldName),
      refetchInterval: 30000,
    }
  );

  useEffect(() => {
    if (!showOtherRespawnTimers || !otherPlayersWorldName || !respawnTimers) {
      return;
    }
    const now = Date.now();
    for (const markerRespawnTimer of respawnTimers) {
      const allLayers = allLayersRef.current;
      const marker = allLayers[markerRespawnTimer.markerId]?.layer;
      if (marker && sharedRespawnTimers.includes(marker.options.image.type)) {
        markersRespawnAt.current[markerRespawnTimer.markerId] =
          markerRespawnTimer.respawnTimer + now;
        startTimer(marker, markerRespawnTimer.respawnTimer);
      }
    }

    return () => {
      for (const markerRespawnTimer of respawnTimers) {
        const allLayers = allLayersRef.current;
        const marker = allLayers[markerRespawnTimer.markerId]?.layer;
        if (marker && sharedRespawnTimers.includes(marker.options.image.type)) {
          delete markersRespawnAt.current[markerRespawnTimer.markerId];
          if (marker.actionHandle) {
            clearTimeout(marker.actionHandle);
          }
          if (marker.popup) {
            marker.popup.remove();
          }
        }
      }
    };
  }, [showOtherRespawnTimers, otherPlayersWorldName, respawnTimers]);

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
            url += `nodes/${marker._id}`;
            if (isEmbed) {
              window.open(`https://aeternum-map.gg${url}`);
            } else {
              url += location.search;
              navigate(url);
              setHighlightedMapMarker(mapMarker);
            }
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
              const respawnTimer = action(mapMarker);
              if (typeof respawnTimer === 'number') {
                startTimer(mapMarker, respawnTimer, socket);
              }
            }
          }
        });
        if (markersRespawnAt.current[marker._id]) {
          startTimer(
            mapMarker,
            markersRespawnAt.current[marker._id] - Date.now()
          );
        }
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

    const handleMarkerRespawnAt = (
      markerId: string,
      respawnTimer: number,
      markerSteamId: string,
      markerType: string
    ) => {
      markersRespawnAt.current[markerId] = respawnTimer + Date.now();

      const isMine = markerSteamId === steamId;
      if (!isMine && !sharedRespawnTimers.includes(markerType)) {
        return;
      }

      const marker = allLayers[markerId]?.layer;
      if (marker) {
        startTimer(marker, respawnTimer);
      }
    };
    socket?.on('markerRespawnAt', handleMarkerRespawnAt);
    return () => {
      leafletMap.off('moveend', placeMarkersInBounds);
      clearTimeout(trailingTimeoutId);
      socket?.off('markerRespawnAt', handleMarkerRespawnAt);
    };
  }, [leafletMap, visibleMarkers, socket]);

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
