import { Button, Stack, Text } from '@mantine/core';
import type { FileWithPath } from '@mantine/dropzone';
import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { FilterItem, MarkerSize } from 'static';
import { mapFilters, mapIsAeternumMap } from 'static';
import { useMap } from 'ui/utils/routes';
import { useMarkers } from '../../contexts/MarkersContext';
import { getScreenshotUrl } from '../../utils/api';
import { notify } from '../../utils/notifications';
import { usePlayerStore } from '../../utils/playerStore';
import { useSettingsStore } from '../../utils/settingsStore';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import DetailsInput from './DetailsInput';
import ImageDropzone from './ImageDropzone';
import SelectPosition from './SelectPosition';
import SelectType from './SelectType';
import type { MarkerDTO } from './api';
import { patchMarker, postMarker, uploadScreenshot } from './api';

export type Details = {
  description?: string;
  name?: string;
  level?: number;
  chestType?: string;
  tier?: number;
  size?: MarkerSize;
  customRespawnTimer?: number;
  hp?: number;
  screenshotFilename?: string;
  requiredGlyphId?: number;
  isTemporary?: boolean;
};

type AddResourcesProps = {
  marker?: MarkerDTO;
  onClose: () => void;
};
function AddResources({ marker, onClose }: AddResourcesProps): JSX.Element {
  const { setTemporaryHiddenMarkerIDs } = useMarkers();
  const map = useMap();

  const [filter, setFilter] = useState<FilterItem | null>(
    () =>
      (marker && mapFilters.find((filter) => filter.type === marker.type)) ||
      null
  );
  const [fileScreenshot, setFileScreenshot] = useState<FileWithPath | null>(
    null
  );

  const [details, setDetails] = useState<Details>({});
  const { player } = usePlayerStore();
  const following = useSettingsStore((state) => state.following);
  const queryClient = useQueryClient();

  const [location, setLocation] = useState<[number, number, number]>(() => {
    if (marker) {
      return marker.position;
    }
    if (following && player?.position?.location) {
      const location = player.position.location;
      return [+location[1].toFixed(2), +location[0].toFixed(2), 0];
    }
    const center = latestLeafletMap!.getCenter();
    return [+center.lng.toFixed(2), +center.lat.toFixed(2), 0];
  });

  useEffect(() => {
    if (!marker) {
      return;
    }
    setTemporaryHiddenMarkerIDs((markerIDs) => [marker._id!, ...markerIDs]);

    return () => {
      setTemporaryHiddenMarkerIDs((markerIDs) =>
        markerIDs.filter((markerID) => markerID !== marker._id!)
      );
    };
  }, [marker]);

  useEffect(() => {
    if (!filter) {
      return;
    }
    const details: Details = {};
    if (filter.category === 'chests') {
      if (filter.type.includes('Supplies')) {
        details.chestType = marker?.chestType || 'Supply';
      }
      details.tier = marker?.tier || 1;
    }
    if (filter.sizes) {
      details.size = marker?.size || '?';
    }
    details.description = marker?.description;
    if (filter.hasLevel) {
      details.level = marker?.level || 1;
    }
    if (filter.hasName) {
      details.name = marker?.name || '';
    }
    if (filter.hasCustomRespawnTimer) {
      details.customRespawnTimer = marker?.customRespawnTimer || 0;
    }
    if (filter.hasHP) {
      details.hp = marker?.hp || 0;
    }
    if (filter.glyph) {
      details.requiredGlyphId = marker?.requiredGlyphId;
    }
    details.isTemporary = marker?.isTemporary;
    details.screenshotFilename = marker?.screenshotFilename;
    setDetails(details);
  }, [filter]);

  const isValid =
    filter &&
    (filter.hasName ? details.name && details.name.length > 0 : true) &&
    (filter.hasLevel ? details.level && details.level > 0 : true) &&
    (filter.category === 'chests'
      ? details.tier && (details.chestType || !filter.type.includes('Supplies'))
      : true) &&
    (filter.sizes ? Boolean(details.size) : true) &&
    (filter.glyph && filter.glyph.isRequired
      ? details.requiredGlyphId && details.requiredGlyphId > 0
      : true);

  const base64Image = useMemo(
    () => fileScreenshot && URL.createObjectURL(fileScreenshot),
    [fileScreenshot]
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    try {
      const newMarker: MarkerDTO = {
        type: filter.type,
        position: location || undefined,
        ...details,
      };
      if (!mapIsAeternumMap(map)) {
        newMarker.map = map;
      }

      if (fileScreenshot) {
        const { screenshotId } = await notify(uploadScreenshot(fileScreenshot));
        newMarker.screenshotId = screenshotId;
      }

      if (marker) {
        await notify(patchMarker(marker._id!, newMarker), {
          success: 'Node edited 👌',
        });
      } else {
        await notify(postMarker(newMarker), {
          success: 'Node added 👌',
        });
      }
      queryClient.invalidateQueries(['markers']);
      onClose();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <SelectPosition
          details={details}
          filter={filter}
          onSelectLocation={setLocation}
          location={location}
        />
        <SelectType onSelect={setFilter} filter={filter} />
        <DetailsInput filter={filter} onChange={setDetails} details={details} />
        <ImageDropzone
          src={
            base64Image ||
            (details.screenshotFilename &&
              getScreenshotUrl(details.screenshotFilename))
          }
          onDrop={(files) => setFileScreenshot(files[0])}
          onClear={() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setDetails(({ screenshotFilename, ...rest }) => rest);
            setFileScreenshot(null);
          }}
        />
        <Button type="submit" disabled={!isValid}>
          Save node
        </Button>
        <Text color="dimmed" size="xs">
          Move node by dragging it
        </Text>
      </Stack>
    </form>
  );
}

export default AddResources;
