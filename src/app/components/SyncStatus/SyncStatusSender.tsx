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
  return (
    <>
      {newWorldIsRunning && player?.position && (
        <small>
          <span className={styles.success}>Playing</span> as {player.username}{' '}
          at [{player.position.location[1]}, {player.position.location[0]}]{' '}
          <span className={styles.region}>
            {player.region && `${player.location || player.region}`}
          </span>
        </small>
      )}
      {newWorldIsRunning && !player?.position && (
        <small>
          <span className={styles.waiting}>Connected</span> to New World.
          Waiting for position.
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
