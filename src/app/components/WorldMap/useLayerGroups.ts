import { useEffect, useRef } from 'react';
import leaflet from 'leaflet';
import { mapFilters } from '../MapFilter/mapFilters';
import 'leaflet.markercluster';
import type { Marker } from '../../contexts/MarkersContext';
import { getTooltipContent } from './tooltips';
import { classNames } from '../../utils/styles';
import { useMarkers } from '../../contexts/MarkersContext';
import { useFilters } from '../../contexts/FiltersContext';
import 'leaflet-canvas-markers';

export const LeafIcon: new ({ iconUrl }: { iconUrl: string }) => leaflet.Icon =
  leaflet.Icon.extend({
    options: {
      iconSize: [32, 32],
      tooltipAnchor: [0, -20],
    },
  });

const icons: {
  [key: string]: leaflet.Icon<leaflet.IconOptions>;
} = {};
function useLayerGroups({
  leafletMap,
  onMarkerClick,
}: {
  leafletMap: leaflet.Map | null;
  onMarkerClick?: (marker: Marker) => void;
}): void {
  const { visibleMarkers } = useMarkers();
  const [filters] = useFilters();

  const layerGroupByFilterRef = useRef<{
    [filterType: string]: leaflet.LayerGroup;
  }>({});

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    Object.entries(layerGroupByFilterRef.current).forEach(
      ([filterType, layerGroup]) => {
        leafletMap.removeLayer(layerGroup);
        delete layerGroupByFilterRef.current[filterType];
      }
    );

    const layerGroups = layerGroupByFilterRef.current;

    for (let i = 0; i < visibleMarkers.length; i++) {
      const marker = visibleMarkers[i];
      const mapFilter = mapFilters.find(
        (mapFilter) => mapFilter.type === marker.type
      );
      if (!mapFilter) {
        return;
      }

      if (!icons[mapFilter.iconUrl]) {
        icons[mapFilter.iconUrl] = new LeafIcon({ iconUrl: mapFilter.iconUrl });
        icons[
          mapFilter.iconUrl
        ].options.className = `leaflet-marker-${mapFilter.category}`;
      }
      const icon = icons[mapFilter.iconUrl];

      if (!layerGroups[marker.type]) {
        layerGroups[marker.type] = leaflet.markerClusterGroup({
          iconCreateFunction: () => icon,
          disableClusteringAtZoom: 0,
          maxClusterRadius: 30,
          removeOutsideVisibleBounds: true,
          chunkedLoading: true,
        });

        layerGroups[marker.type]
          .on('clustermouseover', (event) => {
            event.propagatedFrom
              .bindTooltip(
                `${event.propagatedFrom.getChildCount()} ${mapFilter.title}`,
                {
                  direction: 'top',
                  sticky: true,
                }
              )
              .openTooltip();
          })
          .on('clustermouseout', (event) => {
            event.propagatedFrom.unbindTooltip();
          });
        layerGroups[marker.type].addTo(leafletMap);
      }
      const layerGroup = layerGroups[marker.type];

      if (marker.position) {
        const mapMarker = leaflet
          .canvasMarker([marker.position[1], marker.position[0]], {
            radius: 16,
            img: {
              url: mapFilter.iconUrl,
              size: [32, 32],
              rotate: 0,
            },
            pmIgnore: true,
          })
          .bindTooltip(getTooltipContent(marker, mapFilter), {
            direction: 'top',
          });
        if (onMarkerClick) {
          mapMarker.on('click', () => {
            onMarkerClick(marker);
          });
        }
        layerGroup.addLayer(mapMarker);
      } else if (marker.positions) {
        const polygon = leaflet.polygon(
          marker.positions.map((position) => [position[1], position[0]])
        );

        layerGroup.addLayer(polygon);
        const text = leaflet.divIcon({
          className: classNames(
            'leaflet-polygon-text',
            `leaflet-polygon-text-${leafletMap.getZoom()}`
          ),
          html: `${marker.name}<br/>(${marker.levelRange?.join('-')})`,
        });
        const textMarker = leaflet.marker(polygon.getCenter(), {
          icon: text,
        });

        leafletMap.on('zoomend', () => {
          const element = textMarker.getElement();
          if (element) {
            element.className = classNames(
              'leaflet-polygon-text',
              `leaflet-polygon-text-${leafletMap.getZoom()}`
            );
          }
        });
        layerGroup.addLayer(textMarker);
        if (onMarkerClick) {
          polygon.on('click', () => {
            onMarkerClick(marker);
          });
        }
      }
    }
  }, [leafletMap, filters, visibleMarkers]);
}

export default useLayerGroups;
