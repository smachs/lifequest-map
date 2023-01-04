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
  const [positions, setPositions] = useState<[number, number][]>(
    markerRoute?.positions || []
  );
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});
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

    // @ts-ignore
    latestLeafletMap!.pm.setGlobalOptions({ snappable: true });
    let existingPolyline: leaflet.Polyline | null = null;

    const toggleControls = (editMode: boolean) => {
      latestLeafletMap!.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawMarker: false,
        drawRectangle: false,
        drawPolygon: false,
        drawText: false,
        rotateMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: false,
        drawPolyline: true,
        editMode: false,
      });
      if (editMode) {
        // @ts-ignore
        if (!latestLeafletMap!.pm.Toolbar.buttons['EditRoute']) {
          latestLeafletMap!.pm.Toolbar.createCustomControl({
            name: 'EditRoute',
            block: 'custom',
            title: 'Edit Route',
            className: 'leaflet-pm-icon-edit',
            toggle: false,
          });
        }
      }
    };
    toggleControls(false);

    latestLeafletMap!.on('pm:create', (event) => {
      existingPolyline = event.layer as leaflet.Polyline;
      refreshMarkers(event.layer);

      toggleControls(true);

      event.layer.on('pm:edit', (event) => {
        refreshMarkers(event.layer as leaflet.Polyline);
      });
    });

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    latestLeafletMap!.on('pm:drawstart', ({ workingLayer }) => {
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

    latestLeafletMap!.on('pm:buttonclick', ({ btnName }) => {
      if (btnName === 'EditRoute' && existingPolyline) {
        existingPolyline.pm.toggleEdit();
      }
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
      toggleControls(true);
      setTimeout(() => {
        if (existingPolyline) {
          refreshMarkers(existingPolyline);
        }
      }, 100);
      existingPolyline.pm.enable();
    } else {
      latestLeafletMap!.pm.enableDraw('Line');
    }

    return () => {
      latestLeafletMap!.pm.removeControls();
      latestLeafletMap!.pm.disableGlobalEditMode();
      latestLeafletMap!.off('pm:create');
      latestLeafletMap!.off('pm:drawstart');

      if (existingPolyline) {
        existingPolyline.off();
        existingPolyline.remove();
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const partialMarkerRoute = {
        name,
        description,
        isPublic,
        positions,
        map,
        markersByType,
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
