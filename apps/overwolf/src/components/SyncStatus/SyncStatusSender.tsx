import { ColorSwatch, List, Paper, Stack, Text, Title } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { IconClick, IconClock, IconKeyboard } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { usePosition } from '../../contexts/PositionContext';
import { useNewWorldGameInfo } from '../store';
import styles from './SyncStatus.module.css';
import useOverlayActivated from './useOverlayActivated';

function SyncStatusSender() {
  const activated = useOverlayActivated();
  const { position, username, worldName, map } = usePosition();
  const newWorldGameInfo = useNewWorldGameInfo();
  const [activity, setActivity] =
    useState<overwolf.games.inputTracking.InputActivity | null>(null);

  const interval = useInterval(() => {
    overwolf.games.inputTracking.getActivityInformation((info) => {
      setActivity(info.activity);
    });
  }, 1000);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  if (!activated) {
    return (
      <small>
        <span className={styles.warning}>Overlay is disabled!</span>
        <br />
        Open <a href="overwolf://settings">Overwolf settings</a> and{' '}
        <a
          href="https://support.overwolf.com/en/support/solutions/articles/9000178795-overwolf-game-settings"
          target="_blank"
          rel="noreferrer"
        >
          read more
        </a>{' '}
        for more details.
      </small>
    );
  }

  const hasIssue =
    !newWorldGameInfo?.isRunning ||
    !username ||
    !position?.location ||
    !worldName ||
    worldName === 'Unknown';

  return (
    <Paper p="sm">
      <Stack spacing="xs">
        <Title order={2} size="sm" align="center">
          Realtime Status
        </Title>
        <List center spacing="xs">
          <List.Item icon={<IconClock size={14} />}>
            Active Time: {activity?.aTime || 0} minutes
          </List.Item>
          <List.Item icon={<IconClock size={14} />}>
            Idle Time: {activity?.iTime || 0} minutes
          </List.Item>
          <List.Item icon={<IconClock size={14} />}>
            APM: {activity?.apm}
          </List.Item>
          <List.Item icon={<IconClick size={14} />}>
            Left Click: {activity?.mouse?.keys?.M_Left || 0}
          </List.Item>
          <List.Item icon={<IconClick size={14} />}>
            Right Click: {activity?.mouse?.keys?.M_Right || 0}
          </List.Item>
          <List.Item icon={<IconKeyboard size={14} />}>
            Q Key: {activity?.keyboard?.keys?.Q || 0}
          </List.Item>
          <List.Item icon={<IconKeyboard size={14} />}>
            R Key: {activity?.keyboard?.keys?.R || 0}
          </List.Item>
          <List.Item icon={<IconKeyboard size={14} />}>
            F Key: {activity?.keyboard?.keys?.F || 0}
          </List.Item>
          <List.Item
            icon={
              <ColorSwatch
                color={newWorldGameInfo?.isRunning ? 'green' : 'orange'}
                size={14}
              />
            }
          >
            {newWorldGameInfo?.isRunning
              ? 'New World is running'
              : 'New World is not running'}
          </List.Item>
          <List.Item
            icon={
              <ColorSwatch color={username ? 'green' : 'orange'} size={14} />
            }
          >
            {username ? `Username: ${username}` : 'Username is not detected'}
          </List.Item>
          <List.Item
            icon={
              <ColorSwatch
                color={position?.location ? 'green' : 'orange'}
                size={14}
              />
            }
          >
            {position?.location
              ? 'Position is detected'
              : 'Position is not detected'}
          </List.Item>
          <List.Item
            icon={
              <ColorSwatch
                color={
                  worldName && worldName !== 'Unknown' ? 'green' : 'orange'
                }
                size={14}
              />
            }
          >
            {worldName && worldName !== 'Unknown'
              ? `Server: ${worldName}`
              : 'Server is not detected'}
          </List.Item>
          <List.Item
            icon={<ColorSwatch color={map ? 'green' : 'orange'} size={14} />}
          >
            {map ? `Map: ${map}` : 'Map is not detected'}
          </List.Item>
        </List>
        <Text color={hasIssue ? 'orange' : 'dimmed'} size="sm" align="center">
          {hasIssue
            ? 'Start this app before starting New World'
            : 'Everything works fine 🤘'}
        </Text>
      </Stack>
    </Paper>
  );
}

export default SyncStatusSender;
