import { Anchor, Box, Checkbox, Kbd, Slider, Text } from '@mantine/core';
import {
  SETUP_MINIMAP,
  SHOW_HIDE_MINIMAP,
  useHotkeyBinding,
} from '../../utils/hotkeys';
import { useMinimapSettingsStore } from './store';

function MinimapSetup() {
  const store = useMinimapSettingsStore();
  const showHideMinimapBinding = useHotkeyBinding(SHOW_HIDE_MINIMAP);
  const setupMinimapBinding = useHotkeyBinding(SETUP_MINIMAP);

  return (
    <Box p="xs" maw={300} mx="auto">
      <Text weight={500} size="sm">
        Minimap Zoom
        <Slider
          value={store.minimapZoom}
          min={0.5}
          max={8}
          step={0.5}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={store.setMinimapZoom}
        />
      </Text>
      <Text weight={500} size="sm">
        Minimap Border
        <Slider
          value={store.minimapBorderRadius}
          min={0}
          max={50}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={store.setMinimapBorderRadius}
        />
      </Text>
      <Text weight={500} size="sm">
        Minimap Opacity
        <Slider
          value={store.minimapOpacity}
          min={20}
          max={100}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={store.setMinimapOpacity}
        />
      </Text>
      <Checkbox
        label="Rotate minimap"
        checked={store.rotateMinimap}
        onMouseDown={(event) => event.stopPropagation()}
        onChange={(event) => store.setRotateMinimap(event.target.checked)}
      />
      <Text mt="xs">
        Show/Hide{' '}
        <Anchor
          href="overwolf://settings/games-overlay?hotkey=show_hide_minimap&gameId=21816"
          mx="xs"
        >
          <Kbd>{showHideMinimapBinding}</Kbd>
        </Anchor>
        Setup
        <Anchor
          href="overwolf://settings/games-overlay?hotkey=setup_minimap&gameId=21816"
          ml="xs"
        >
          <Kbd>{setupMinimapBinding}</Kbd>
        </Anchor>
      </Text>
    </Box>
  );
}

export default MinimapSetup;
