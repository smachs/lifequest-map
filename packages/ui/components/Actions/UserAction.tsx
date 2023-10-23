import {
  ActionIcon,
  Anchor,
  Button,
  Divider,
  Group,
  Popover,
  SegmentedControl,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconHelp,
  IconLogout,
  IconSettings,
  IconShare,
  IconUser,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AETERNUM_MAP } from 'static';
import { shallow } from 'zustand/shallow';
import { fetchJSON } from '../../utils/api';
import { useRealmStore } from '../../utils/realmStore';
import { isEmbed, useRouteParams } from '../../utils/routes';
import { trackOutboundLinkClick } from '../../utils/stats';
import type { AccountDTO } from '../../utils/userStore';
import { useUserStore } from '../../utils/userStore';
import FAQModal from '../FAQ/FAQModal';
import ResetDiscoveredNodes from '../Settings/ResetDiscoveredNodes';
import SettingsDialog from '../Settings/SettingsDialog';
import SupporterInput from '../SupporterInput/SupporterInput';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import DiscordIcon from '../icons/DiscordIcon';
import GitHubIcon from '../icons/GitHubIcon';
import ServerStatus from './ServerStatus';
const { VITE_API_ENDPOINT = '' } = import.meta.env;

const UserAction = () => {
  const { account, setAccount, logoutAccount, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account,
      setAccount: state.setAccount,
      logoutAccount: state.logoutAccount,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );

  const [verifyingSessionId, setVerifyingSessionId] = useState('');
  const [opened, setOpened] = useState(false);

  const [showFAQ, setShowFAQ] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const clipboard = useClipboard({ timeout: 500 });
  const { nodeId, map, routeId, world } = useRouteParams();
  const realmStore = useRealmStore();

  useEffect(() => {
    if (account) {
      refreshAccount();
    }
  }, []);

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
    return () => clearInterval(intervalId);
  }, [verifyingSessionId]);

  const handleLogin = async () => {
    const newSessionId = await fetchJSON<string>('/api/auth/session');

    const url = `${VITE_API_ENDPOINT}/api/auth/steam?sessionId=${newSessionId}`;
    window.open(url, '_blank');

    setVerifyingSessionId(newSessionId);
  };

  const handleShareLink = () => {
    let url = 'https://aeternum-map.gg';
    if (map !== AETERNUM_MAP.title) {
      url += `/${map}`;
    }

    if (world) {
      url += `/influences/${world}`;
    } else if (nodeId) {
      url += `/nodes/${nodeId}`;
    } else if (routeId) {
      url += `/routes/${routeId}`;
    } else if (map === AETERNUM_MAP.title) {
      url += `?bounds=${latestLeafletMap!.getBounds().toBBoxString()}`;
    }
    clipboard.copy(url);
    notifications.show({
      message: 'Copied URL to clipboard',
    });
  };

  if (isEmbed) {
    return <></>;
  }

  return (
    <Group spacing="xs">
      <FAQModal opened={showFAQ} onClose={() => setShowFAQ(false)} />
      <SegmentedControl
        data={[
          { label: 'LIVE', value: 'live' },
          { label: 'PTR', value: 'ptr' },
        ]}
        size="xs"
        radius="xl"
        value={realmStore.isPTR ? 'ptr' : 'live'}
        onChange={(value) => {
          realmStore.setIsPTR(value === 'ptr');
        }}
      />
      <ServerStatus />
      <Tooltip label="Settings">
        <ActionIcon
          size="lg"
          variant="default"
          radius="xl"
          onClick={() => {
            setShowSettings(true);
            setOpened(false);
          }}
          aria-label="Settings"
        >
          <IconSettings />
        </ActionIcon>
      </Tooltip>
      <Popover
        width={300}
        withArrow
        shadow="md"
        position="bottom"
        opened={opened}
        onChange={setOpened}
        keepMounted
        withinPortal
      >
        <Popover.Target>
          <Button
            radius="xl"
            color={account ? 'teal' : 'blue'}
            variant="filled"
            leftIcon={<IconUser />}
            onClick={() => setOpened((o) => !o)}
          >
            <Text
              component="span"
              sx={{
                maxWidth: 100,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {account?.name || 'Sign in'}
            </Text>
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack>
            {!account ? (
              <>
                <Text size="xs" color="dimmed" align="center">
                  For some features like location sharing, creating routes and
                  setting nodes as discovered, an account is required. Please
                  sign in:
                </Text>
                <UnstyledButton
                  onClick={handleLogin}
                  sx={{
                    margin: '0 auto',
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
                  <Text
                    variant="gradient"
                    gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                    sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
                    ta="center"
                    fw={700}
                  >
                    Waiting for Steam
                  </Text>
                )}
              </>
            ) : (
              <>
                <SupporterInput />
                <ResetDiscoveredNodes />
                <Button
                  color="red"
                  onClick={logoutAccount}
                  leftIcon={<IconLogout />}
                  variant="outline"
                >
                  Sign out
                </Button>
              </>
            )}
            <Divider />

            <Group spacing="xs" position="center">
              <Tooltip label="Share link">
                <ActionIcon
                  variant="default"
                  onClick={handleShareLink}
                  radius="sm"
                  size="xl"
                  aria-label="Share link"
                >
                  <IconShare />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="FAQ">
                <ActionIcon
                  variant="default"
                  onClick={() => setShowFAQ(true)}
                  radius="sm"
                  size="xl"
                  aria-label="FAQ"
                >
                  <IconHelp />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Open Source on GitHub">
                <ActionIcon
                  component="a"
                  color="dark"
                  variant="filled"
                  href="https://github.com/lmachens/aeternum-map"
                  target="_blank"
                  onClick={() =>
                    trackOutboundLinkClick(
                      'https://github.com/lmachens/aeternum-map'
                    )
                  }
                  size="xl"
                  radius="sm"
                  aria-label="Open Source on GitHub"
                >
                  <GitHubIcon />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Join Discord Community">
                <ActionIcon
                  component="a"
                  href="https://discord.gg/NTZu8Px"
                  target="_blank"
                  onClick={() =>
                    trackOutboundLinkClick('https://discord.gg/NTZu8Px')
                  }
                  sx={{
                    backgroundColor: 'rgb(88, 101, 242)',
                    ':hover': {
                      backgroundColor: 'rgb(105, 116, 243)',
                    },
                  }}
                  size="xl"
                  radius="sm"
                  aria-label="Join Discord Community"
                >
                  <DiscordIcon />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Divider />
            <Group spacing="xs" position="center">
              <Anchor
                size="xs"
                href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
                title="Aeternum Map Companion"
                target="_blank"
              >
                Overwolf App
              </Anchor>
              <Anchor
                size="xs"
                href="https://aeternum-tracker.th.gl/"
                title="Aeternum Tracker"
                target="_blank"
              >
                Aeternum Tracker
              </Anchor>
              <Anchor
                size="xs"
                href="https://influence.th.gl/"
                title="New World Faction Territory Map"
                target="_blank"
              >
                New World Territory Map
              </Anchor>
              <Anchor
                size="xs"
                href="https://www.th.gl/"
                title="The Hidden Gaming Lair"
                target="_blank"
              >
                More Gaming Apps & Tools
              </Anchor>
              <Anchor
                size="xs"
                href="https://palia.th.gl/"
                title="Palia Map"
                target="_blank"
              >
                Palia Map
              </Anchor>
              <Anchor
                size="xs"
                href="https://sotf.th.gl/"
                title="Sons Of The Forest"
                target="_blank"
              >
                Sons Of The Forest
              </Anchor>
              <Anchor
                size="xs"
                href="https://www.hogwarts.gg/"
                title="Hogwarts Legacy fansite"
                target="_blank"
              >
                Hogwarts Legacy
              </Anchor>
              <Anchor
                size="xs"
                href="https://www.arkesia.gg/"
                title="Interactive map for Lost Ark"
                target="_blank"
              >
                Lost Ark
              </Anchor>
              <Anchor
                size="xs"
                href="https://lol.th.gl/"
                title="Trophies app for League of Legends"
                target="_blank"
              >
                League of Legends
              </Anchor>
              <Anchor
                size="xs"
                href="https://www.soc.gg/"
                title="A Songs of Conquest fansite"
                target="_blank"
              >
                Songs of Conquest
              </Anchor>
              <Anchor
                size="xs"
                href="https://github.com/lmachens/skeleton"
                title="Simply display any website as customizable Overlay"
                target="_blank"
              >
                Customizable Overlays
              </Anchor>
              <Anchor
                size="xs"
                href="https://gaming.tools/newworld/"
                title="New World Trade Skill Leveling Guides and Crafting Calculators"
                target="_blank"
              >
                Crafting Guides
              </Anchor>
              <Anchor size="xs" href="/privacy.html" target="_blank">
                Privacy Policy
              </Anchor>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <SettingsDialog
        opened={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </Group>
  );
};

export default UserAction;
