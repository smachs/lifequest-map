import useOverlayActivated from './useOverlayActivated';
import type { Position } from '../../utils/useReadLivePosition';
import styles from './SyncStatus.module.css';

type SyncStatusProps = {
  newWorldIsRunning: boolean;
  player: {
    username: string | null;
    position: Position | null;
    region: string | null;
    location: string | null;
  } | null;
};
function SyncStatusSender({ newWorldIsRunning, player }: SyncStatusProps) {
  const activated = useOverlayActivated();

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
    <>
      {newWorldIsRunning && player?.username && player?.position && (
        <small>
          <span className={styles.success}>Playing</span> as {player.username}{' '}
          at [{player.position.location[1]}, {player.position.location[0]}]{' '}
          <span className={styles.region}>
            {player.region && `${player.location || player.region}`}
          </span>
        </small>
      )}
      {newWorldIsRunning && (!player?.position || !player?.username) && (
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
    </>
  );
}

export default SyncStatusSender;
