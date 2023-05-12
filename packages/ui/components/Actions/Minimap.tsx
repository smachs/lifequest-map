import {
  Anchor,
  Checkbox,
  Divider,
  Slider,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { trackOutboundLinkClick } from '../../utils/stats';
import { usePersistentState } from '../../utils/storage';

export default function Minimap() {
  const [minimapOpacity, setMinimapOpacity] = usePersistentState(
    'minimapOpacity',
    80
  );
  const [minimapBorderRadius, setMinimapBorderRadius] = usePersistentState(
    'minimapBorderRadius',
    50
  );
  const [minimapZoom, setMinimapZoom] = usePersistentState('minimapZoom', 5);
  const [rotateMinimap, setRotateMinimap] = usePersistentState(
    'rotateMinimap',
    false
  );

  return (
    <>
      <Text size="sm" weight={500}>
        Minimap
      </Text>
      <Stack>
        <Text>
          You can use{' '}
          <Anchor
            href="https://github.com/lmachens/skeleton"
            target="_blank"
            onClick={() =>
              trackOutboundLinkClick('https://github.com/lmachens/skeleton')
            }
            inline
          >
            Skeleton
          </Anchor>{' '}
          to display a minimap as overlay 🤘 if location sharing is active. Keep
          in mind, that this is definitly in the grey area of AGS ToS. Use at
          own risk 💀!
        </Text>
        <Divider />
        <TextInput
          value="https://aeternum-map.gg/minimap.html"
          label="URL"
          readOnly
        />
        <Text weight={500} size="sm">
          Zoom
          <Slider
            value={minimapZoom}
            min={0.5}
            max={8}
            step={0.5}
            onChange={(value) => setMinimapZoom(value)}
          />
        </Text>
        <Text weight={500} size="sm">
          Border
          <Slider
            value={minimapBorderRadius}
            min={0}
            max={50}
            onChange={(value) => setMinimapBorderRadius(value)}
          />
        </Text>
        <Text weight={500} size="sm">
          Opacity
          <Slider
            value={minimapOpacity}
            min={20}
            max={100}
            onChange={(value) => setMinimapOpacity(value)}
          />
        </Text>
        <Checkbox
          label="Rotate minimap"
          checked={rotateMinimap}
          description="Rotate the minimap instead of the player cursor"
          onChange={(event) => setRotateMinimap(event.target.checked)}
        />
      </Stack>
    </>
  );
}
