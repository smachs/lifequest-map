import {
  ActionIcon,
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  HoverCard,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconCurrentLocation,
  IconKey,
  IconMinus,
  IconPlus,
  IconServer,
  IconUsers,
} from '@tabler/icons';
import shallow from 'zustand/shallow';
import { useUserStore } from '../../utils/userStore';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import { servers } from 'realtime';
import { usePlayerStore } from '../../utils/playerStore';
import { getWorld, getZone } from 'static';
import WorldName from '../SyncStatus/WorldName';
import ServerTime from '../SyncStatus/ServerTime';
import { useSettingsStore } from '../../utils/settingsStore';

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
  } = useSettingsStore(
    (state) => ({
      following: state.following,
      toggleFollowing: state.toggleFollowing,
      showOtherPlayers: state.showOtherPlayers,
      toggleShowOtherPlayers: state.toggleShowOtherPlayers,
    }),
    shallow
  );

  return (
    <Stack spacing="xs">
      <HoverCard width={280} shadow="md" position="left">
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
              inline
            >
              Aeternum Map
            </Anchor>{' '}
            on Overwolf.
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
                <Text size="xs">
                  <Text component="span" color="teal">
                    Connected
                  </Text>{' '}
                  to Overwolf app. Waiting for player position.
                </Text>
              )}
              {!player && (
                <Text>
                  <Text component="span" color="teal">
                    Connected
                  </Text>{' '}
                  to live server. Waiting for Overwolf app.
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
      <Tooltip
        label="Displays locations of other app users from all servers."
        position="left"
      >
        <ActionIcon
          color="blue"
          variant={showOtherPlayers ? 'filled' : 'default'}
          size="md"
          radius="sm"
          onClick={toggleShowOtherPlayers}
        >
          <IconUsers size={20} />
        </ActionIcon>
      </Tooltip>
      <Button.Group orientation="vertical">
        <Button
          compact
          variant="default"
          p={0}
          onClick={() => latestLeafletMap!.zoomIn()}
        >
          <IconPlus />
        </Button>
        <Button
          compact
          variant="default"
          p={0}
          onClick={() => latestLeafletMap!.zoomOut()}
        >
          <IconMinus />
        </Button>
      </Button.Group>
    </Stack>
  );
};

export default MapActions;
