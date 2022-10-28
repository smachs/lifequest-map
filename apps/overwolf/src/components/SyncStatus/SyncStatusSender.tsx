import useOverlayActivated from './useOverlayActivated';
import styles from './SyncStatus.module.css';
import { usePosition } from '../../contexts/PositionContext';
import { IconAlertCircle, IconCircleCheck, IconEyeCheck } from '@tabler/icons';
import { Group, Tooltip, ActionIcon, Stack, Text } from '@mantine/core';

type SyncStatusProps = {
  newWorldIsRunning: boolean;
};
function SyncStatusSender({ newWorldIsRunning }: SyncStatusProps) {
  const activated = useOverlayActivated();
  const { position, location, region, username, worldName, isOCR } =
    usePosition();

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

  return (
    <Group spacing="xs">
      {location && isOCR && (
        <Tooltip
          multiline
          label={
            <>
              Could not detect position from Overwolf API, but fallback to OCR
              works 🤘.
              {details}
            </>
          }
        >
          <ActionIcon>
            <IconEyeCheck size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {location && !isOCR && (
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
              Make sure to run Overwolf before New World. If this doesn't help,
              please activate 'Show FPS' in-game to display coordinates. This
              app is using screen capture as fallback with limited functionalty.
              {details}
            </>
          }
        >
          <ActionIcon>
            <IconAlertCircle size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {newWorldIsRunning && position && (
        <small>
          <span className={styles.success}>Playing</span>
          {username && ` as ${username}`} at [{position.location?.[1]},{' '}
          {position.location?.[0]}]{' '}
          <span className={styles.region}>
            {region && `${location || region}`}
          </span>
        </small>
      )}
      {newWorldIsRunning && !position && (
        <small>
          <span className={styles.waiting}>Connected</span> to New World.
          Waiting for position.
          <br />
          <span className={styles.warning}>
            Make sure to run Overwolf before New World.
          </span>
        </small>
      )}
      {!newWorldIsRunning && (
        <small>
          <span className={styles.warning}>Not connected</span> to New World.
          Please run the game first.
        </small>
      )}
    </Group>
  );
}

export default SyncStatusSender;
