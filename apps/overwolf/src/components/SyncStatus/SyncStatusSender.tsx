import useOverlayActivated from './useOverlayActivated';
import styles from './SyncStatus.module.css';
import { usePosition } from '../../contexts/PositionContext';
import { IconAlertCircle } from '@tabler/icons';
import { Group, Tooltip, ActionIcon } from '@mantine/core';

type SyncStatusProps = {
  newWorldIsRunning: boolean;
};
function SyncStatusSender({ newWorldIsRunning }: SyncStatusProps) {
  const activated = useOverlayActivated();
  const { position, location, region, username } = usePosition();

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
  return (
    <Group spacing="xs">
      <Tooltip
        multiline
        label={
          "Make sure to run Overwolf before New World. If this doesn't help, please activate 'Show FPS' in-game to display coordinates. This app is using screen capture as fallback with limited functionalty."
        }
      >
        <ActionIcon>
          <IconAlertCircle size={18} />
        </ActionIcon>
      </Tooltip>
      {newWorldIsRunning && position && (
        <small>
          <span className={styles.success}>Playing</span>
          {username && ` as ${username}`} at [{position.location[1]},{' '}
          {position.location[0]}]{' '}
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
