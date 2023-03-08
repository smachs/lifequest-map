import {
  Anchor,
  Group,
  List,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { fetchJSON } from 'ui/utils/api';
import type { AccountDTO } from 'ui/utils/userStore';
import { useUserStore } from 'ui/utils/userStore';

const { VITE_API_ENDPOINT = '' } = import.meta.env;

function Welcome(): JSX.Element {
  const [verifyingSessionId, setVerifyingSessionId] = useState('');
  const setAccount = useUserStore((state) => state.setAccount);

  useEffect(() => {
    if (!verifyingSessionId) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const init: RequestInit = {};
        if (verifyingSessionId) {
          init.headers = {
            'x-session-id': verifyingSessionId,
            'x-prevent-logout': 'true',
          };
        }
        const newAccount = await fetchJSON<AccountDTO>(
          `/api/auth/account`,
          init
        );
        setAccount(newAccount);
        setVerifyingSessionId('');
      } catch (error) {
        // Keep waiting
      }
    }, 3000);
    return () => {
      clearInterval(intervalId);
    };
  }, [verifyingSessionId]);

  const handleLogin = async () => {
    const newSessionId = await fetchJSON<string>('/api/auth/session');

    const url = `${VITE_API_ENDPOINT}/api/auth/steam?sessionId=${newSessionId}`;
    overwolf.utils.openUrlInDefaultBrowser(url);

    setVerifyingSessionId(newSessionId);
  };

  return (
    <Paper p="sm">
      <Stack spacing="xs">
        <Title order={2} size="md" color="orange" align="center" weight="bold">
          Looking for map nodes?
        </Title>
        <Text>
          Sign in and connect to{' '}
          <Anchor href="https://aeternum-map.gg" target="_blank">
            aeternum-map.gg
          </Anchor>
          , an interactive New World map with routes and community managed
          nodes. As alternative, you can use{' '}
          <Anchor href="https://newworld-map.com" target="_blank">
            newworld&#8209;map.com
          </Anchor>{' '}
          with limited functionality.
        </Text>
        <List size="sm">
          <List.Item icon="🚀">
            Live Tracking of your In-Game position
          </List.Item>
          <List.Item icon="🤗">
            See your friends by using the same token
          </List.Item>
          <List.Item icon="🔀">Farming/Marker Routes</List.Item>
          <List.Item icon="✅">
            Check nodes as done (Like lore documents)
          </List.Item>
          <List.Item icon="🗺️">Minimap view</List.Item>
          <List.Item icon="🤷‍♂️">Conforms to AGS ToS</List.Item>
        </List>
        <UnstyledButton
          onClick={handleLogin}
          sx={{
            margin: '0 auto',
            ':hover': {
              filter: 'brightness(1.2)',
            },
          }}
        >
          <img
            src="/steam.png"
            width={180}
            height={35}
            alt="Sign in through Steam"
          />
        </UnstyledButton>
        {verifyingSessionId && (
          <Group position="center">
            <Text color="lime" weight="bold">
              Waiting for Steam Sign In
            </Text>
            <Loader size="xs" />
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

export default Welcome;
