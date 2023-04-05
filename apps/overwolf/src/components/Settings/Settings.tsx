import {
  Anchor,
  Button,
  Checkbox,
  ColorInput,
  Group,
  Input,
  Kbd,
  Paper,
  ScrollArea,
  Stack,
  Title,
} from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import SupporterInput from 'ui/components/SupporterInput/SupporterInput';
import { useSettingsStore } from 'ui/utils/settingsStore';
import { useUserStore } from 'ui/utils/userStore';
import {
  SETUP_MINIMAP,
  SHOW_HIDE_APP,
  SHOW_HIDE_DIRECTION,
  SHOW_HIDE_INFLUENCE_OVERLAY,
  SHOW_HIDE_MINIMAP,
  ZOOM_IN_MAP,
  ZOOM_IN_MINIMAP,
  ZOOM_OUT_MAP,
  ZOOM_OUT_MINIMAP,
  useHotkeyBinding,
} from '../../utils/hotkeys';
import { togglePreferedWindow } from '../../utils/windows';
import Debug from '../Debug/Debug';
import useMinimap from '../useMinimap';
import MinimapSetup from './MinimapSetup';

function Settings(): JSX.Element {
  const settingsStore = useSettingsStore();
  const showHideAppBinding = useHotkeyBinding(SHOW_HIDE_APP);
  const setupMinimapBinding = useHotkeyBinding(SETUP_MINIMAP);
  const showHideMinimapBinding = useHotkeyBinding(SHOW_HIDE_MINIMAP);
  const zoomInMinimapBinding = useHotkeyBinding(ZOOM_IN_MINIMAP);
  const zoomOutMinimapBinding = useHotkeyBinding(ZOOM_OUT_MINIMAP);
  const showHideDirectionBinding = useHotkeyBinding(SHOW_HIDE_DIRECTION);
  const zoomInMapBinding = useHotkeyBinding(ZOOM_IN_MAP);
  const zoomOutMapBinding = useHotkeyBinding(ZOOM_OUT_MAP);
  const showHideInfluenceOverlayBinding = useHotkeyBinding(
    SHOW_HIDE_INFLUENCE_OVERLAY
  );
  const [showMinimap, setShowMinimap] = useMinimap();

  const logoutAccount = useUserStore((state) => state.logoutAccount);

  return (
    <Paper p="sm">
      <ScrollArea offsetScrollbars>
        <Stack>
          <Title order={2} size="sm" align="center">
            Settings
          </Title>
          <SupporterInput />
          <Checkbox
            label="Activate Overlay"
            description="This window is only visible as overlay in-game. Deactivate it, if you like to move this window to second screen or to ALT+TAB it."
            checked={settingsStore.overlayMode ?? true}
            onChange={() => {
              togglePreferedWindow();
            }}
          />
          <Title order={3} size="sm" align="center">
            Website Hotkeys
          </Title>
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
            <Input.Label>Show/Hide Direction</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=show_hide_direction&gameId=21816">
              <Kbd>{showHideDirectionBinding}</Kbd>
            </Anchor>
          </Group>
          <Title order={3} size="sm" align="center">
            App Hotkeys
          </Title>
          <Group grow>
            <Input.Label>Show/Hide App</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=show_hide_app&gameId=21816">
              <Kbd>{showHideAppBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Show/Hide Minimap</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=show_hide_minimap&gameId=21816">
              <Kbd>{showHideMinimapBinding}</Kbd>
            </Anchor>
          </Group>
          <Group grow>
            <Input.Label>Setup Minimap</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=setup_minimap&gameId=21816">
              <Kbd>{setupMinimapBinding}</Kbd>
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
          <Group grow>
            <Input.Label>Show/Hide Influence Overlay</Input.Label>
            <Anchor href="overwolf://settings/games-overlay?hotkey=influence_overlay&gameId=21816">
              <Kbd>{showHideInfluenceOverlayBinding}</Kbd>
            </Anchor>
          </Group>
          <Title order={3} size="sm" align="center">
            Minimap
          </Title>
          <Checkbox
            label="Show Minimap without nodes"
            description="Because of the ToS, it's not allowed to display nodes on the Overwolf minimap. But you can setup something similar with Skeleton (see FAQ/Discord)."
            checked={showMinimap}
            onChange={(event) => setShowMinimap(event.target.checked)}
          />
          <MinimapSetup />
          <Checkbox
            label="Region borders"
            checked={settingsStore.showRegionBorders}
            description="You'll see thin lines on the map which indicates the regions."
            onChange={(event) =>
              settingsStore.setShowRegionBorders(event.target.checked)
            }
          />
          <ColorInput
            label="Player icon color"
            value={settingsStore.playerIconColor}
            onChange={settingsStore.setPlayerIconColor}
          />
          <Checkbox
            label="Extrapolate player position"
            checked={settingsStore.extrapolatePlayerPosition}
            description="The app can only get a non-accurate player position from the game due to TOS. This option tries to optimizes the positions by using the player rotation to expect where the next position should be."
            onChange={(event) =>
              settingsStore.setExtrapolatePlayerPosition(event.target.checked)
            }
          />
          <Title order={3} size="sm" align="center">
            Connection
          </Title>
          <Checkbox
            label="Peer to peer"
            checked={settingsStore.peerToPeer}
            description="If your browser or network doesn't support WebRTC, you can deactivate this to fallback to slower socket connections."
            onChange={(event) =>
              settingsStore.setPeerToPeer(event.target.checked)
            }
          />
          <Title order={3} size="sm" align="center">
            Account
          </Title>
          <Button color="red" onClick={logoutAccount} leftIcon={<IconLogout />}>
            Sign out
          </Button>
          <Debug />
        </Stack>
      </ScrollArea>
    </Paper>
  );
}

export default Settings;
