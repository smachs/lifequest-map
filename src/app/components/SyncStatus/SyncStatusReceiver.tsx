import { useModal } from '../../contexts/ModalContext';
import { usePlayer } from '../../contexts/PlayerContext';
import ShareLiveStatus from '../ShareLiveStatus/ShareLiveStatus';
import styles from './SyncStatus.module.css';

function SyncStatusReceiver() {
  const { player, isSyncing, setIsSyncing } = usePlayer();

  const { addModal, closeLatestModal } = useModal();

  if (!isSyncing) {
    return (
      <small>
        <span className={styles.warning}>Not syncing</span>. Please{' '}
        <a
          onClick={() => {
            addModal({
              title: 'Share Live Status',
              children: (
                <ShareLiveStatus
                  onActivate={() => {
                    setIsSyncing(true);
                    closeLatestModal();
                  }}
                />
              ),
            });
          }}
        >
          share live status
        </a>
        .
      </small>
    );
  }
  return (
    <>
      {player?.position && player.username && (
        <small>
          <span className={styles.success}>Playing</span> as {player.username}{' '}
          at [{player.position.location[1]}, {player.position.location[0]}]{' '}
          <div>{player.region && `${player.location || player.region}`}</div>
        </small>
      )}
      {player && (!player.position || !player.username) && (
        <small>
          <span className={styles.waiting}>Connected</span> to Overwolf app.
          Waiting for player position.
        </small>
      )}
      {!player && (
        <small>
          <span className={styles.waiting}>Connected</span> to live server.
          Waiting for Overwolf app.
        </small>
      )}
    </>
  );
}

export default SyncStatusReceiver;
