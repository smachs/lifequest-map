import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { IconKey, IconServer } from '@tabler/icons-react';
import { servers } from 'realtime';
import { getWorld, getZone } from 'static';
import { shallow } from 'zustand/shallow';
import { usePlayerStore } from '../../utils/playerStore';
import { useSettingsStore } from '../../utils/settingsStore';
import { trackOutboundLinkClick } from '../../utils/stats';
import { useUserStore } from '../../utils/userStore';
import ServerTime from '../SyncStatus/ServerTime';
import WorldName from '../SyncStatus/WorldName';

export default function CurrentLocation() {
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
  const { following, toggleFollowing } = useSettingsStore(
    (state) => ({
      following: state.following,
      toggleFollowing: state.toggleFollowing,
    }),
    shallow
  );

  return (
    <>
      <Text size="sm" weight={500}>
        Display current location
      </Text>
      <Text>
        You can connect your location from in-game with this map by installing{' '}
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
        on Overwolf. Use the same token in your group to see each other on the
        map.
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
              {player.position.location[1].toFixed(0)},{' '}
              {player.position.location[0].toFixed(0)}]{' '}
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
    </>
  );
}
