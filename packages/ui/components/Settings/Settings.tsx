import {
  Checkbox,
  ColorInput,
  NumberInput,
  ScrollArea,
  Slider,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useEffect } from 'react';
import { useSettingsStore } from '../../utils/settingsStore';

export default function Settings() {
  const settingsStore = useSettingsStore();

  useEffect(() => {
    // @ts-ignore
    if (window['__cmp']) {
      // @ts-ignore
      window['__cmp']('addConsentLink');
    }
  }, []);

  return (
    <>
      <Title order={4}>Map</Title>
      <ScrollArea.Autosize mah="80vh" offsetScrollbars>
        <Stack>
          <Text weight={500} size="sm">
            Node size
          </Text>
          <Slider
            value={settingsStore.markerSize}
            onChange={settingsStore.setMarkerSize}
            min={10}
            max={80}
          />
          <Checkbox
            label="Node background"
            description="The nodes have a background for better distinction to the background."
            checked={settingsStore.markerShowBackground}
            onChange={(event) =>
              settingsStore.setMarkerShowBackground(event.target.checked)
            }
          />
          <Checkbox
            label="Region borders"
            checked={settingsStore.showRegionBorders}
            description="You'll see thin lines on the map which indicates the regions."
            onChange={(event) =>
              settingsStore.setShowRegionBorders(event.target.checked)
            }
          />
          <Checkbox
            label="Trace lines"
            checked={settingsStore.showTraceLines}
            description="Small dots will display the path you were walking. You will know where you have been to."
            onChange={(event) =>
              settingsStore.setShowTraceLines(event.target.checked)
            }
          />
          <NumberInput
            label="Trace line length"
            description="Maximum number of dots visible on the map"
            value={settingsStore.maxTraceLines}
            onChange={settingsStore.setMaxTraceLines}
            min={0}
          />
          <NumberInput
            label="Trace line rate"
            description="Creates a dot every X milliseconds"
            value={settingsStore.traceLineRate}
            onChange={settingsStore.setTraceLineRate}
            min={0}
          />
          <ColorInput
            label="Trace line color"
            value={settingsStore.traceLineColor}
            onChange={settingsStore.setTraceLineColor}
          />
          <ColorInput
            label="Player icon color"
            value={settingsStore.playerIconColor}
            onChange={settingsStore.setPlayerIconColor}
          />
          <Checkbox
            label="Show Player Names"
            checked={settingsStore.showPlayerNames}
            description="Display the names of other players in your group next to their player icons."
            onChange={(event) =>
              settingsStore.setShowPlayerNames(event.target.checked)
            }
          />
          <Checkbox
            label="Always show direction"
            checked={settingsStore.alwaysShowDirection}
            description="In addition to the app hotkey, you can always display the direction line."
            onChange={(event) =>
              settingsStore.setAlwaysShowDirection(event.target.checked)
            }
          />
          <Checkbox
            label="Adaptive Zoom"
            checked={settingsStore.adaptiveZoom}
            description="The zoom level will change if you enter/leave a settlement."
            onChange={(event) =>
              settingsStore.setAdaptiveZoom(event.target.checked)
            }
          />
          <Checkbox
            label="Auto fade UI"
            checked={settingsStore.autoFade}
            description="Fades out the control elements of this window if it's inactive."
            onChange={() => settingsStore.toggleAutoFade()}
          />
          <Title order={4}>Hotkeys</Title>
          <Text fs="italic">Hotkeys are configured in the Overwolf app</Text>
          <Title order={4}>GDPR</Title>
          <span id="ncmp-consent-link" />
        </Stack>
      </ScrollArea.Autosize>
    </>
  );
}
