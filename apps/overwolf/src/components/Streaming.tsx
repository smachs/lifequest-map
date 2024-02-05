import {
  ActionIcon,
  Anchor,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useEffect } from 'react';
import { patchLiveShareToken } from 'ui/components/ShareLiveStatus/api';
import useServers from 'ui/components/ShareLiveStatus/useServers';
import CopyIcon from 'ui/components/icons/CopyIcon';
import RefreshIcon from 'ui/components/icons/RefreshIcon';
import { useUserStore } from 'ui/utils/userStore';
import { v4 as uuid } from 'uuid';
import { shallow } from 'zustand/shallow';
import DebouncedInput from '../components/DebouncedInput/DebouncedInput';
import useShareLivePosition from './useShareLivePosition';

function Streaming(): JSX.Element {
  const { account, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account!,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );
  const { status, isConnected, peerConnections } = useShareLivePosition();

  const servers = useServers();

  useEffect(() => {
    refreshAccount();
  }, []);

  useEffect(() => {
    if (
      !account.liveShareServerUrl ||
      !servers.some((server) => server.url === account.liveShareServerUrl)
    ) {
      const onlineServers = [...servers]
        .filter((server) => server.delay)
        .sort((a, b) => a.delay! - b.delay!);
      const server = onlineServers[0];
      if (server) {
        updateAccount(account.liveShareToken, server.url);
      }
    }
  }, [servers, account.liveShareServerUrl]);

  const updateAccount = (
    token: string | undefined,
    serverUrl: string | undefined
  ) => {
    patchLiveShareToken(token || uuid(), serverUrl || servers[0].url)
      .then(() => refreshAccount())
      .catch((error) => console.error(error));
  };

  const players = status ? Object.values(status.group) : [];

  return (
    <Paper p="sm">
      <Stack spacing="xs">
        <Title order={2} size="sm" align="center">
          Welcome back, {account!.name}!
        </Title>
        <Text size="xs" color="dimmed">
          Use the token shown below on{' '}
          <Anchor href="https://aeternum-map.th.gl" target="_blank">
            aeternum-map.th.gl
          </Anchor>{' '}
          or{' '}
          <Anchor href="https://newworld-map.com" target="_blank">
            newworld&#8209;map.com
          </Anchor>{' '}
          to see your live location on the map. You can use any device that has
          a browser. Share this token and server with your friends to see each
          others' location 🤗.
        </Text>
        <Text
          color={isConnected ? 'dimmed' : 'orange'}
          size="sm"
          align="center"
        >
          {isConnected ? 'Connected to live server' : 'Connecting...'}
        </Text>
        <SegmentedControl
          value={account.liveShareServerUrl}
          onChange={(serverUrl) =>
            updateAccount(account.liveShareToken, serverUrl)
          }
          data={servers.map((server) => ({
            label: (
              <Text>
                {server.name}
                <br />
                <Text component="span" size="xs">
                  {!server.delay ? 'Offline' : `${server.delay}ms`}
                </Text>
              </Text>
            ),
            value: server.url,
          }))}
        />
        <DebouncedInput
          value={account.liveShareToken}
          placeholder="Use this token to access your live status..."
          label="Token"
          description="This token is used to identify you on the map. You can use the
        same token in your group to see each other."
          onChange={(value) => updateAccount(value, account.liveShareServerUrl)}
          styles={{
            rightSection: {
              width: 'fit-content',
            },
          }}
          rightSection={
            <Group spacing="xs">
              <Tooltip label="Generate Random Token">
                <ActionIcon
                  onClick={() =>
                    updateAccount(uuid(), account.liveShareServerUrl)
                  }
                >
                  <RefreshIcon />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Copy Token">
                <ActionIcon
                  disabled={!account.liveShareToken}
                  onClick={() => {
                    overwolf.utils.placeOnClipboard(account.liveShareToken!);
                  }}
                >
                  <CopyIcon />
                </ActionIcon>
              </Tooltip>
            </Group>
          }
        />
        <Group grow align="baseline">
          <Stack>
            <Title order={3} size="sm" align="center">
              App Users
            </Title>

            {players.length > 0 ? (
              players.map((player) => (
                <Text key={player.steamName} size="sm" align="center">
                  {player.username ? player.username : player.steamName}
                </Text>
              ))
            ) : (
              <Text size="sm" align="center">
                No users
              </Text>
            )}
          </Stack>
          <Stack>
            <Title order={3} size="sm" align="center">
              Browsers
            </Title>
            {status?.connections.length ? (
              status.connections.map((connection) => (
                <Text key={connection} size="sm" align="center">
                  Browser{' '}
                  {peerConnections[connection]?.open ? '(Direct)' : '(Socket)'}
                </Text>
              ))
            ) : (
              <Text size="sm" align="center">
                No connections
              </Text>
            )}
          </Stack>
        </Group>
      </Stack>
    </Paper>
  );
}

export default Streaming;
