import useOverlayActivated from './useOverlayActivated';
import styles from './SyncStatus.module.css';
import { usePosition } from '../../contexts/PositionContext';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons';
import { Group, Tooltip, ActionIcon, Stack, Text } from '@mantine/core';
import WorldName from 'ui/components/SyncStatus/WorldName';
import { getWorld, getZone } from 'static';
import { useNewWorldGameInfo } from '../store';

function SyncStatusSender() {
  const activated = useOverlayActivated();
  const { position, location, region, username, worldName } = usePosition();
  const newWorldGameInfo = useNewWorldGameInfo();

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

  const details = (
    <Stack spacing="xs" mt="xs">
      <Text size="xs">
        <Text component="span" color="dimmed">
          Username:{' '}
        </Text>
        {username}
      </Text>
      <Text size="xs">
        <Text component="span" color="dimmed">
          Position:{' '}
        </Text>
        [{position?.location?.[1] || '?'}, {position?.location?.[0] || '?'}]
      </Text>
      <Text size="xs">
        <Text component="span" color="dimmed">
          Rotation:{' '}
        </Text>
        {position?.rotation || 0}
      </Text>
      <Text size="xs">
        <Text component="span" color="dimmed">
          Location:{' '}
        </Text>
        {location || 'Unknown'}
      </Text>
      <Text size="xs">
        <Text component="span" color="dimmed">
          Region:{' '}
        </Text>
        {region || 'Unknown'}
      </Text>
      <Text size="xs">
        <Text component="span" color="dimmed">
          World Name:{' '}
        </Text>
        {worldName || 'Unknown'}
      </Text>
    </Stack>
  );

  const world = worldName && getWorld(worldName);
  const zone = world && getZone(world.zone);

  return (
    <Group spacing="xs">
      {location && (
        <Tooltip multiline label={<>Everything works fine 🤘.{details}</>}>
          <ActionIcon>
            <IconCircleCheck size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {!location && (
        <Tooltip
          multiline
          label={
            <>
              Did you run Overwolf before New World?
              {details}
            </>
          }
        >
          <ActionIcon>
            <IconAlertCircle size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {newWorldGameInfo?.isRunning && position && (
        <small>
          <span className={styles.success}>Playing</span>
          {username && ` as ${username}`} at [
          {position.location?.[1].toFixed(3)},{' '}
          {position.location?.[0].toFixed(3)}]{' '}
          <Group spacing="xs">
            <Text size="xs">{region && `${location || region}`}</Text>
            {world && zone && <WorldName world={world} zone={zone} />}
          </Group>
        </small>
      )}
      {newWorldGameInfo?.isRunning && !position && (
        <small>
          <span className={styles.waiting}>Connected</span> to New World.
          Waiting for position.
          <br />
          <span className={styles.warning}>
            Make sure to run Overwolf before New World.
          </span>
        </small>
      )}
      {!newWorldGameInfo?.isRunning && (
        <small>
          <span className={styles.warning}>Not connected</span> to New World.
          Please run the game first.
        </small>
      )}
    </Group>
  );
}

export default SyncStatusSender;
