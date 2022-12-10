import { useSettings } from 'ui/contexts/SettingsContext';
import {
  SETUP_MINIMAP,
  SHOW_HIDE_DIRECTION,
  SHOW_HIDE_APP,
  SHOW_HIDE_MINIMAP,
  useHotkeyBinding,
  ZOOM_IN_MINIMAP,
  ZOOM_OUT_MINIMAP,
  ZOOM_IN_MAP,
  ZOOM_OUT_MAP,
  MARKER_ACTION,
} from '../../utils/hotkeys';
import Debug from '../Debug/Debug';
import { useUserStore } from 'ui/utils/userStore';
import SupporterInput from 'ui/components/SupporterInput/SupporterInput';
import {
  Anchor,
  Box,
  Button,
  Checkbox,
  ColorInput,
  Group,
  Input,
  Kbd,
  ScrollArea,
  Stack,
  Title,
} from '@mantine/core';
import { IconLogout } from '@tabler/icons';

type SettingsProps = {
  showMinimap: boolean;
  onShowMinimap: (show: boolean) => void;
};

function Settings({ showMinimap, onShowMinimap }: SettingsProps): JSX.Element {
  const {
    showRegionBorders,
    setShowRegionBorders,
    peerToPeer,
    setPeerToPeer,
    playerIconColor,
    setPlayerIconColor,
  } = useSettings();
  const showHideAppBinding = useHotkeyBinding(SHOW_HIDE_APP);
  const setupMinimapBinding = useHotkeyBinding(SETUP_MINIMAP);
  const showHideMinimapBinding = useHotkeyBinding(SHOW_HIDE_MINIMAP);
  const zoomInMinimapBinding = useHotkeyBinding(ZOOM_IN_MINIMAP);
  const zoomOutMinimapBinding = useHotkeyBinding(ZOOM_OUT_MINIMAP);
  const showHideDirectionBinding = useHotkeyBinding(SHOW_HIDE_DIRECTION);
  const zoomInMapBinding = useHotkeyBinding(ZOOM_IN_MAP);
  const zoomOutMapBinding = useHotkeyBinding(ZOOM_OUT_MAP);
  const markerActionBinding = useHotkeyBinding(MARKER_ACTION);

  const logoutAccount = useUserStore((state) => state.logoutAccount);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: 'var(--color-shade-one)',
        display: 'grid',
      }}
    >
      <Title order={3}>Settings</Title>
      <ScrollArea offsetScrollbars>
        <Stack>
          <Title order={4}>Account</Title>
          <SupporterInput />
          <Button color="red" onClick={logoutAccount} leftIcon={<IconLogout />}>
            Sign out
          </Button>
          <Title order={4}>Minimap</Title>
          <Checkbox
            label="Show blank Minimap"
            description="Because of the ToS, it's not allowed to display nodes on the Overwolf minimap. But you can setup something similar with Skeleton (see FAQ/Discord)."
            checked={showMinimap}
            onChange={(event) => onShowMinimap(event.target.checked)}
          />
          <Checkbox
            label="Region borders"
            checked={showRegionBorders}
            description="You'll see thin lines on the map which indicates the regions."
            onChange={(event) => setShowRegionBorders(event.target.checked)}
          />
          <ColorInput
            label="Player icon color"
            value={playerIconColor}
            onChange={setPlayerIconColor}
          />
          <Title order={4}>Website Hotkeys</Title>
          <Group grow>
            <Input.Label>Zoom in Map</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=zoom_in_map&gameId=21816">
              <Kbd>{zoomInMapBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Zoom out Map</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=zoom_out_map&gameId=21816">
              <Kbd>{zoomOutMapBinding}</Kbd>
            </Anchor>
          </Group>

          <Group grow>
            <Input.Label>Interact with near marker</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=marker_action&gameId=21816">
              <Kbd>{markerActionBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Show/Hide Direction</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=show_hide_direction&gameId=21816">
              <Kbd>{showHideDirectionBinding}</Kbd>
            </Anchor>
          </Group>
          <Title order={4}>App Hotkeys</Title>
          <Group grow>
            <Input.Label>Show/Hide App</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=show_hide_app&gameId=21816">
              <Kbd>{showHideAppBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Setup Minimap</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=setup_minimap&gameId=21816">
              <Kbd>{setupMinimapBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Show/Hide Minimap</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=show_hide_minimap&gameId=21816">
              <Kbd>{showHideMinimapBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Zoom in Minimap</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=zoom_in_minimap&gameId=21816">
              <Kbd>{zoomInMinimapBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Zoom out Minimap</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=zoom_out_minimap&gameId=21816">
              <Kbd>{zoomOutMinimapBinding}</Kbd>
            </Anchor>
          </Group>
          <Title order={4}>Connection</Title>
          <Checkbox
            label="Peer to peer"
            checked={peerToPeer}
            description="If your browser or network doesn't support WebRTC, you can deactivate this to fallback to slower socket connections."
            onChange={(event) => setPeerToPeer(event.target.checked)}
          />
          <Debug />
        </Stack>
      </ScrollArea>
    </Box>
  );
}

export default Settings;
