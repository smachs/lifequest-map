import {
  ActionIcon,
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  HoverCard,
  Slider,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconCompass,
  IconCurrentLocation,
  IconKey,
  IconMinus,
  IconPlus,
  IconServer,
  IconUsers,
} from '@tabler/icons';
import { servers } from 'realtime';
import { getWorld, getZone } from 'static';
import shallow from 'zustand/shallow';
import { usePlayerStore } from '../../utils/playerStore';
import { isEmbed } from '../../utils/routes';
import { useSettingsStore } from '../../utils/settingsStore';
import { trackOutboundLinkClick } from '../../utils/stats';
import { usePersistentState } from '../../utils/storage';
import { useUserStore } from '../../utils/userStore';
import OtherPlayersServerSelect from '../OtherPlayersServerSelect/OtherPlayersServerSelect';
import ServerTime from '../SyncStatus/ServerTime';
import WorldName from '../SyncStatus/WorldName';
import { latestLeafletMap } from '../WorldMap/useWorldMap';

const MapActions = () => {
  const { account, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );
  const player = usePlayerStore((state) => state.player);
  const world = player?.worldName && getWorld(player.worldName);
  const zone = world && getZone(world.zone);
  const {
    following,
    toggleFollowing,
    showOtherPlayers,
    toggleShowOtherPlayers,
    otherPlayersSize,
    setOtherPlayersSize,
  } = useSettingsStore(
    (state) => ({
      following: state.following,
      toggleFollowing: state.toggleFollowing,
      showOtherPlayers: state.showOtherPlayers,
      toggleShowOtherPlayers: state.toggleShowOtherPlayers,
      otherPlayersSize: state.otherPlayersSize,
      setOtherPlayersSize: state.setOtherPlayersSize,
    }),
    shallow
  );
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

  const zoomControls = (
    <Button.Group orientation="vertical">
      <Button
        compact
        variant="default"
        p={0}
        onClick={() => latestLeafletMap!.zoomIn()}
        aria-label="Zoom in"
      >
        <IconPlus />
      </Button>
      <Button
        compact
        variant="default"
        p={0}
        onClick={() => latestLeafletMap!.zoomOut()}
        aria-label="Zoom out"
      >
        <IconMinus />
      </Button>
    </Button.Group>
  );
  if (isEmbed) {
    return zoomControls;
  }

  return (
    <Stack spacing="xs">
      <HoverCard width={320} shadow="md" position="left">
        <HoverCard.Target>
          <ActionIcon
            variant="default"
            size="md"
            radius="sm"
            onClick={() => {
              if (player?.position?.location) {
                latestLeafletMap!.panTo(
                  [player.position.location[0], player.position.location[1]],
                  {
                    animate: true,
                    easeLinearity: 1,
                    duration: 1,
                    noMoveStart: true,
                  }
                );
              }
            }}
            aria-label="Current location"
          >
            <IconCurrentLocation size={20} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm" weight={500}>
            Display current location
          </Text>
          <Text>
            You can connect your location from in-game with this map by
            installing{' '}
            <Anchor
              href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
              target="_blank"
              onClick={() =>
                trackOutboundLinkClick(
                  'https://www.overwolf.com/app/Leon_Machens-Aeternum_Map'
                )
              }
              inline
            >
              Aeternum Map
            </Anchor>{' '}
            on Overwolf. Use the same token in your group to see each other on
            the map.
          </Text>
          {!account ? (
            <Text color="orange">You need to sign in to use this feature.</Text>
          ) : (
            <Text color="dimmed">
              Please configure the server and token in the app.
            </Text>
          )}
          {account && (
            <Stack spacing="xs" mt="xs">
              <Divider />
              <Group noWrap spacing={10}>
                <IconServer stroke={1.5} size={16} />
                <Text size="xs" color="dimmed">
                  {servers.find(
                    (server) => server.url === account.liveShareServerUrl
                  )?.name ||
                    account.liveShareServerUrl ||
                    'Unknown'}
                </Text>
              </Group>
              <Group noWrap spacing={10}>
                <IconKey stroke={1.5} size={16} />
                <Text size="xs" color="dimmed">
                  {account.liveShareToken || 'Unknown'}
                </Text>
              </Group>
              {player?.position?.location && (
                <Text size="xs">
                  <Text component="span" color="green">
                    Playing
                  </Text>
                  {player.username && ` as ${player.username}`} at [
                  {player.position.location[1].toFixed(3)},{' '}
                  {player.position.location[0].toFixed(3)}]{' '}
                  <Group spacing="xs">
                    <Text size="xs">
                      {player.region && `${player.location || player.region}`}
                    </Text>
                    {world && zone && <WorldName world={world} zone={zone} />}
                    {zone && <ServerTime zone={zone} />}
                  </Group>
                </Text>
              )}
              {player && !player.position && (
                <Text>
                  <Text component="span" color="teal">
                    Connected
                  </Text>{' '}
                  to Overwolf app.
                  <Text color="orange">Waiting for player position.</Text>
                </Text>
              )}
              {!player && (
                <Text>
                  <Text component="span" color="teal">
                    Connected
                  </Text>{' '}
                  to live server.
                  <Text color="orange">Waiting for Overwolf app.</Text>
                </Text>
              )}
              <Button onClick={refreshAccount} compact>
                Refresh
              </Button>
              <Divider />
              <Checkbox
                label="Follow location"
                checked={following}
                description="The map will be follow your player icon"
                onChange={() => toggleFollowing()}
              />
            </Stack>
          )}
        </HoverCard.Dropdown>
      </HoverCard>
      <HoverCard width={320} shadow="md" position="left">
        <HoverCard.Target>
          <ActionIcon
            variant="default"
            size="md"
            radius="sm"
            aria-label="Minimap"
          >
            <IconCompass size={20} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
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
              to display a minimap as overlay 🤘 if location sharing is active.
              Keep in mind, that this is definitly in the grey area of AGS ToS.
              Use at own risk 💀!
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
                min={0}
                max={6}
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
        </HoverCard.Dropdown>
      </HoverCard>
      <HoverCard width={320} shadow="md" position="left">
        <HoverCard.Target>
          <ActionIcon
            color="blue"
            variant={showOtherPlayers ? 'filled' : 'default'}
            size="md"
            radius="sm"
            onClick={toggleShowOtherPlayers}
            aria-label="Other players"
          >
            <IconUsers size={20} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm" weight={500}>
            Other users
          </Text>
          <Text>
            See the player movement of other players to get an understanding of
            crowded areas. Only{' '}
            <Anchor
              href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
              target="_blank"
              onClick={() =>
                trackOutboundLinkClick(
                  'https://www.overwolf.com/app/Leon_Machens-Aeternum_Map'
                )
              }
              inline
            >
              Aeternum Map
            </Anchor>{' '}
            users are visible.
          </Text>
          <Stack spacing="xs">
            <Text weight={500} size="sm">
              Marker Size
              <Slider
                value={otherPlayersSize}
                min={1}
                max={20}
                onChange={(value) => setOtherPlayersSize(value)}
              />
            </Text>
            <OtherPlayersServerSelect />
            <Button compact onClick={toggleShowOtherPlayers} fullWidth>
              {showOtherPlayers ? 'Hide other players' : 'Show other players'}
            </Button>
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>
      {zoomControls}
    </Stack>
  );
};

export default MapActions;
