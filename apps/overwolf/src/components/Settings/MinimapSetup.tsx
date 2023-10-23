import { Anchor, Box, Checkbox, Group, Kbd, Slider, Text } from '@mantine/core';
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
    <Box p="xs" maw={350} w="100%" mx="auto">
      <Text weight={500} size="xs">
        Zoom
        <Slider
          value={store.minimapZoom}
          min={0.5}
          max={8}
          step={0.5}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={store.setMinimapZoom}
        />
      </Text>
      <Text weight={500} size="xs">
        Border
        <Slider
          value={store.minimapBorderRadius}
          min={0}
          max={50}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={store.setMinimapBorderRadius}
        />
      </Text>
      <Text weight={500} size="xs">
        Opacity
        <Slider
          value={store.minimapOpacity}
          min={20}
          max={100}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={store.setMinimapOpacity}
        />
      </Text>
      <Checkbox
        label="Rotate"
        checked={store.rotateMinimap}
        onMouseDown={(event) => event.stopPropagation()}
        onChange={(event) => store.setRotateMinimap(event.target.checked)}
      />
      <Group position="apart" mt="xs">
        <Text size="xs" truncate>
          Show Minimap
        </Text>
        <Anchor href="overwolf://settings/games-overlay?hotkey=show_hide_minimap&gameId=21816">
          <Kbd>{showHideMinimapBinding}</Kbd>
        </Anchor>
      </Group>
      <Group position="apart" mt="xs">
        <Text size="xs" truncate>
          Show Settings
        </Text>
        <Anchor href="overwolf://settings/games-overlay?hotkey=setup_minimap&gameId=21816">
          <Kbd>{setupMinimapBinding}</Kbd>
        </Anchor>
      </Group>
    </Box>
  );
}

export default MinimapSetup;
