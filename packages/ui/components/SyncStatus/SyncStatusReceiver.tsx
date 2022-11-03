import { Group, Text } from '@mantine/core';
import { getWorld, getZone } from 'static';
import { useModal } from '../../contexts/ModalContext';
import { usePlayerStore } from '../../utils/playerStore';
import { useSettingsStore } from '../../utils/settingsStore';
import ShareLiveStatus from '../ShareLiveStatus/ShareLiveStatus';
import ServerTime from './ServerTime';
import styles from './SyncStatus.module.css';
import WorldName from './WorldName';
import shallow from 'zustand/shallow';
import { useUserStore } from '../../utils/userStore';

function SyncStatusReceiver() {
  const account = useUserStore((state) => state.account);
  const player = usePlayerStore((state) => state.player);

  const { addModal, closeLatestModal } = useModal();
  const { liveShareServerUrl, liveShareToken } = useSettingsStore(
    (state) => ({
      liveShareServerUrl: state.liveShareServerUrl,
      liveShareToken: state.liveShareToken,
    }),
    shallow
  );

  const isSyncing =
    (account?.liveShareToken || liveShareToken) &&
    (account?.liveShareServerUrl || liveShareServerUrl);
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
                    closeLatestModal();
                  }}
                />
              ),
            });
          }}
        >
          setup position syncing
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
