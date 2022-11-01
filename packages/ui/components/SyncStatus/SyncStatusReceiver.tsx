import { Group, Text } from '@mantine/core';
import { getWorld, getZone } from 'static';
import { useModal } from '../../contexts/ModalContext';
import { usePlayer } from '../../contexts/PlayerContext';
import ShareLiveStatus from '../ShareLiveStatus/ShareLiveStatus';
import ServerTime from './ServerTime';
import styles from './SyncStatus.module.css';
import WorldName from './WorldName';

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

  const world = player?.worldName && getWorld(player.worldName);
  const zone = world && getZone(world.zone);

  return (
    <>
      {player?.position?.location && (
        <small>
          <span className={styles.success}>Playing</span>
          {player.username && ` as ${player.username}`} at [
          {player.position.location[1]}, {player.position.location[0]}]{' '}
          <Group spacing="xs">
            <Text size="xs">
              {player.region && `${player.location || player.region}`}
            </Text>
            {world && zone && <WorldName world={world} zone={zone} />}
            {zone && <ServerTime zone={zone} />}
          </Group>
        </small>
      )}
      {player && !player.position && (
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
