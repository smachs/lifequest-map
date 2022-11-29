import {
  Checkbox,
  ColorInput,
  Dialog,
  NumberInput,
  Slider,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

type SettingsDialogProps = {
  opened: boolean;
  onClose: () => void;
};
const SettingsDialog = ({ opened, onClose }: SettingsDialogProps) => {
  const {
    markerSize,
    setMarkerSize,
    markerShowBackground,
    setMarkerShowBackground,
    showRegionBorders,
    setShowRegionBorders,
    maxTraceLines,
    setMaxTraceLines,
    showTraceLines,
    setShowTraceLines,
    showPlayerNames,
    setShowPlayerNames,
    alwaysShowDirection,
    setAlwaysShowDirection,
    adaptiveZoom,
    setAdaptiveZoom,
    traceLineColor,
    setTraceLineColor,
    playerIconColor,
    setPlayerIconColor,
  } = useSettings();

  useEffect(() => {
    // @ts-ignore
    if (window['__cmp']) {
      // @ts-ignore
      window['__cmp']('addConsentLink');
    }
  }, []);

  return (
    <Dialog
      opened={opened}
      withCloseButton
      onClose={onClose}
      position={{ bottom: 7, right: 7 }}
    >
      <Stack>
        <Title order={4}>Map</Title>
        <Text weight={500} size="sm">
          Node size
        </Text>
        <Slider value={markerSize} onChange={setMarkerSize} min={10} max={80} />
        <Checkbox
          label="Node background"
          description="The nodes have a background for better distinction to the background."
          checked={markerShowBackground}
          onChange={(event) => setMarkerShowBackground(event.target.checked)}
        />
        <Checkbox
          label="Region borders"
          checked={showRegionBorders}
          description="You'll see thin lines on the map which indicates the regions."
          onChange={(event) => setShowRegionBorders(event.target.checked)}
        />
        <Checkbox
          label="Trace lines"
          checked={showTraceLines}
          description="Small dots will display the path you were walking. You will know where you have been to."
          onChange={(event) => setShowTraceLines(event.target.checked)}
        />
        <NumberInput
          label="Trace line length"
          value={maxTraceLines}
          onChange={setMaxTraceLines}
          min={0}
        />
        <ColorInput
          label="Trace line color"
          value={traceLineColor}
          onChange={setTraceLineColor}
        />
        <ColorInput
          label="Player icon color"
          value={playerIconColor}
          onChange={setPlayerIconColor}
        />
        <Checkbox
          label="Show Player Names"
          checked={showPlayerNames}
          description="Display the names of other players in your group next to their player icons."
          onChange={(event) => setShowPlayerNames(event.target.checked)}
        />
        <Checkbox
          label="Always show direction"
          checked={alwaysShowDirection}
          description="In addition to the app hotkey, you can always display the direction line."
          onChange={(event) => setAlwaysShowDirection(event.target.checked)}
        />
        <Checkbox
          label="Adaptive Zoom"
          checked={adaptiveZoom}
          description="The zoom level will change if you enter/leave a settlement."
          onChange={(event) => setAdaptiveZoom(event.target.checked)}
        />
        <Title order={4}>Hotkeys</Title>
        <Text fs="italic">Hotkeys are configured in the Overwolf app</Text>
        <Title order={4}>GDPR</Title>
        <span id="ncmp-consent-link" />
      </Stack>
    </Dialog>
  );
};

export default SettingsDialog;
