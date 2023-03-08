import { Checkbox, Slider, Text } from '@mantine/core';
import { useMinimapSettingsStore } from './store';

function MinimapSetup() {
  const store = useMinimapSettingsStore();

  return (
    <>
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
    </>
  );
}

export default MinimapSetup;
