import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {
  Button,
  Checkbox,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import leaflet from 'leaflet';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { findRegions } from 'static';
import { useMap } from 'ui/utils/routes';
import { useMarkers } from '../../contexts/MarkersContext';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import { patchMarkerRoute, postMarkerRoute } from './api';
import type { MarkerRouteItem } from './MarkerRoutes';
import MarkerTypes from './MarkerTypes';

type SelectRouteProps = {
  markerRoute?: MarkerRouteItem;
  onClose: () => void;
};
function SelectRoute({ markerRoute, onClose }: SelectRouteProps): JSX.Element {
  const [positions, setPositions] = useState<MarkerRouteItem['positions']>(
    markerRoute?.positions || []
  );
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});
  const [texts, setTexts] = useState<MarkerRouteItem['texts']>(
    markerRoute?.texts || []
  );

  const [name, setName] = useState(markerRoute?.name || '');
  const [description, setDescription] = useState(
    markerRoute?.description || ''
  );
  const [regions, setRegions] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(markerRoute?.isPublic || false);
  const { markers, toggleMarkerRoute } = useMarkers();
  const map = useMap();
  const queryClient = useQueryClient();

  const refreshMarkers = useCallback(
    (workingLayer: leaflet.Polyline | leaflet.Layer) => {
      // @ts-ignore
      const latLngs = workingLayer.getLatLngs() as leaflet.LatLng[];
      const snappedMarkers = markers.filter((marker) =>
        latLngs.some((latLng: leaflet.LatLng) =>
          latLng.equals([marker.position[1], marker.position[0]])
        )
      );

      const markersByType = snappedMarkers.reduce<{
        [type: string]: number;
      }>(
        (prev, acc) => ({
          ...prev,
          [acc.type]: (prev[acc.type] || 0) + 1,
        }),
        {}
      );

      setMarkersByType(markersByType);

      const positions = latLngs.map((latLng) => [latLng.lat, latLng.lng]) as [
        number,
        number
      ][];
      setPositions(positions);
      setRegions(findRegions(positions, map));
    },
    [markers, map]
  );

  useEffect(() => {
    if (!latestLeafletMap!.pm) {
      // @ts-ignore
      leaflet.PM.reInitLayer(latestLeafletMap);
    }

    const refreshTexts = () => {
      const allLayers = latestLeafletMap!.pm.getGeomanLayers();
      const texts = allLayers
        .filter(
          // @ts-ignore
          (layer) => layer.pm._shape === 'Text'
        )
        .map((layer) => {
          const textLayer = layer as leaflet.Marker;
          const latLng = textLayer.getLatLng();
          return {
            position: [latLng.lat, latLng.lng],
            text: textLayer.options.text || '',
          };
        });
      setTexts(texts);
      // workaround for https://github.com/geoman-io/leaflet-geoman/issues/1300
      latestLeafletMap!.dragging.enable();
    };

    // @ts-ignore
    latestLeafletMap!.pm.setGlobalOptions({ snappable: true });
    latestLeafletMap!.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawCircleMarker: false,
      drawMarker: false,
      drawRectangle: false,
      drawPolygon: false,
      drawText: true,
      rotateMode: false,
      cutPolygon: false,
      drawPolyline: true,
      removalMode: true,
      editMode: true,
      dragMode: true,
    });

    let existingPolyline: leaflet.Polyline | null = null;
    latestLeafletMap!.on('pm:create', (event) => {
      if (event.shape === 'Text') {
        event.layer.on('pm:textblur', refreshTexts);
        event.layer.on('pm:dragend', refreshTexts);
        event.layer.on('pm:remove', refreshTexts);
      }
      if (event.shape === 'Line') {
        existingPolyline = event.layer as leaflet.Polyline;
        refreshMarkers(event.layer);

        event.layer.on('pm:edit', (event) => {
          refreshMarkers(event.layer as leaflet.Polyline);
        });
      }
    });

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    latestLeafletMap!.on('pm:drawstart', ({ shape, workingLayer }) => {
      if (shape !== 'Line') {
        return;
      }
      if (!existingPolyline) {
        existingPolyline = workingLayer as leaflet.Polyline;
      } else {
        existingPolyline
          .getLatLngs()
          .flat(999)
          .forEach((latlng) => {
            // @ts-ignore
            latestLeafletMap.pm.Draw.Line._createVertex({ latlng });
          });
        existingPolyline.remove();
        // @ts-ignore
        existingPolyline = latestLeafletMap.pm.Draw.Line._layer;
      }

      existingPolyline!.on('pm:vertexadded', () => {
        refreshMarkers(existingPolyline!);
      });
    });

    if (markerRoute) {
      existingPolyline = leaflet.polyline(markerRoute.positions, {
        pmIgnore: false,
      });
      existingPolyline.addTo(latestLeafletMap!);
      refreshMarkers(existingPolyline);
      existingPolyline.on('pm:edit', (event) => {
        refreshMarkers(event.layer);
      });
      setTimeout(() => {
        if (existingPolyline) {
          refreshMarkers(existingPolyline);
        }
      }, 100);
      existingPolyline.pm.enable();

      markerRoute.texts?.forEach(({ text, position }) => {
        leaflet
          .marker(position as [number, number], {
            textMarker: true,
            text,
            pmIgnore: false,
          })
          .addTo(latestLeafletMap!);
      });
    } else {
      latestLeafletMap!.pm.enableDraw('Line');
    }

    return () => {
      latestLeafletMap!.pm.removeControls();
      latestLeafletMap!.pm.disableGlobalEditMode();
      latestLeafletMap!.pm.disableDraw();
      latestLeafletMap!.off('pm:create');
      latestLeafletMap!.off('pm:drawstart');
      if (existingPolyline) {
        existingPolyline.off();
        existingPolyline.remove();
      }
      latestLeafletMap!.pm.getGeomanLayers().forEach((layer) => {
        layer.off();
        layer.remove();
      });
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const partialMarkerRoute: Partial<MarkerRouteItem> = {
        name,
        description,
        isPublic,
        positions,
        map,
        markersByType,
        texts,
      };

      const action = markerRoute
        ? patchMarkerRoute(markerRoute._id, partialMarkerRoute)
        : postMarkerRoute(partialMarkerRoute);
      const updatedMarkerRoute = await notify(action, {
        success: markerRoute ? 'Route updated 👌' : 'Route added 👌',
      });

      toggleMarkerRoute(updatedMarkerRoute, true);
      queryClient.invalidateQueries(['routes']);
      onClose();
    } catch (error) {
      writeError(error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="xs">
        <TextInput
          label="Name"
          onChange={(event) => setName(event.target.value)}
          value={name || ''}
          placeholder="Give this route an explanatory name"
          required
        />
        <Textarea
          label="Description"
          onChange={(event) => setDescription(event.target.value)}
          value={description || ''}
          placeholder="Add some information like 'how long does the route take', 'how often it is contested' or 'which level is required'"
          minRows={4}
        />
        <Checkbox
          label="Make it available for everyone"
          onChange={(event) => setIsPublic(event.target.checked)}
          checked={isPublic}
        />
        <MarkerTypes markersByType={markersByType} />
        <Text color="cyan">{regions.join(', ')}</Text>
        <Button type="submit" disabled={!name || positions.length === 0}>
          Save Route {!name && '(Name missing)'}
        </Button>
        <small>Right click in edit mode to remove a vertex</small>
      </Stack>
    </form>
  );
}

export default SelectRoute;
