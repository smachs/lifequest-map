import Button from '../components/Button/Button';
import { usePersistentState } from '../utils/storage';
import { patchLiveShareToken } from '../components/ShareLiveStatus/api';
import { copyTextToClipboard } from '../utils/clipboard';
import useShareLivePosition from '../utils/useShareLivePosition';
import { writeError } from '../utils/logs';
import CopyIcon from '../components/icons/CopyIcon';
import RefreshIcon from '../components/icons/RefreshIcon';
import BroadcastIcon from '../components/icons/BroadcastIcon';
import { classNames } from '../utils/styles';
import { getGameInfo, useIsNewWorldRunning } from '../utils/games';
import { toast } from 'react-toastify';
import { v4 as uuid } from 'uuid';
import type { FormEvent } from 'react';
import type { Position } from '../contexts/PositionContext';
import { useEffect, useState } from 'react';
import { useAccount } from '../contexts/UserContext';
import styles from './Streaming.module.css';

function Streaming(): JSX.Element {
  const { account, logoutAccount } = useAccount();
  const { status, isConnected, isSharing, setIsSharing } =
    useShareLivePosition();
  const newWorldIsRunning = useIsNewWorldRunning();

  const [token, setToken] = usePersistentState('live-share-token', '');
  const [position, setPosition] = useState<Position | null>(null);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    if (!newWorldIsRunning) {
      return;
    }

    overwolf.games.events.setRequiredFeatures(['game_info'], () => undefined);

    let handler = setTimeout(updatePosition, 50);
    let active = true;

    let lastLocation: [number, number] | null = null;
    let lastRotation: number | null = null;
    let hasError = false;
    let lastPlayerName = '';
    async function updatePosition() {
      try {
        const gameInfo = await getGameInfo();
        const { player_name, location: locationList } =
          gameInfo?.game_info || {};
        if (locationList) {
          const location: [number, number] = [
            +locationList.match(/position.y,(\d+.\d+)/)[1],
            +locationList.match(/position.x,(\d+.\d+)/)[1],
          ];
          const rotation = +locationList.match(/rotation.z,(\d+)/)[1];
          if (
            lastLocation?.[0] !== location[0] ||
            lastLocation?.[1] !== location[1] ||
            lastRotation !== rotation
          ) {
            lastLocation = location;
            lastRotation = rotation;
            setPosition({
              location,
              rotation,
            });
            hasError = false;
          }
        }
        if (player_name && player_name !== lastPlayerName) {
          lastPlayerName = player_name;
          setPlayerName(player_name);
        }
      } catch (error) {
        if (!hasError) {
          writeError(error);
          hasError = true;
        }
      } finally {
        if (active) {
          handler = setTimeout(updatePosition, 50);
        }
      }
    }

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [newWorldIsRunning]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      if (isSharing) {
        setIsSharing(false);
        return;
      }

      if (!token) {
        toast.error('Token is required 🙄');
        return;
      }

      if (account && account.liveShareToken !== token) {
        patchLiveShareToken(token);
      }
      setIsSharing(true);
    } catch (error) {
      writeError(error);
    }
  }

  const players = status ? Object.values(status.group) : [];
  return (
    <div className={styles.streaming}>
      <p className={styles.user}>
        <p>
          Welcome back, {account!.name}!<br />
          {newWorldIsRunning && position && (
            <small>
              <span className={styles.success}>Playing</span> as {playerName} at
              [{position.location[1]}, {position.location[0]}]
            </small>
          )}
          {newWorldIsRunning && !position && (
            <small>
              <span className={styles.waiting}>Connected</span> to New World.
              Waiting for position.
            </small>
          )}
          {!newWorldIsRunning && (
            <small>
              <span className={styles.warning}>Not connected</span> to New
              World. Please run the game first.
            </small>
          )}
        </p>{' '}
        <button onClick={logoutAccount} className={styles.logout}>
          Sign out
        </button>
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className={styles.guide}>
          Use the this token here and on{' '}
          <a href="https://aeternum-map.gg" target="_blank">
            aeternum-map.gg
          </a>{' '}
          to share your live status. You can use any device, even your phone
          🐱‍💻. Connect with your friends by using the same token 🤗.
        </p>
        <div className={styles.tokenContainer}>
          <label className={styles.label}>
            Token
            <input
              value={token}
              placeholder="Use this token to access your live status..."
              onChange={(event) => setToken(event.target.value)}
            />
          </label>
          <Button
            className={styles.action}
            type="button"
            onClick={() => setToken(uuid())}
            title="Generate Random Token"
          >
            <RefreshIcon />
          </Button>
          <Button
            className={styles.action}
            type="button"
            disabled={!token}
            onClick={() => {
              copyTextToClipboard(token);
            }}
            title="Copy Token"
          >
            <CopyIcon />
          </Button>
        </div>
        <div className={styles.status}>
          <aside>
            <h5>Senders</h5>
            <ul className={styles.list}>
              {players.length > 0 ? (
                players.map((player) => (
                  <li key={player.username}>
                    {player.username ? player.username : player.steamName}
                  </li>
                ))
              ) : (
                <li>No connections</li>
              )}
            </ul>
          </aside>
          <Button
            disabled={!token}
            type="submit"
            className={classNames(
              styles.submit,
              isSharing && !isConnected && styles.connecting,
              isSharing && isConnected && styles.connected
            )}
          >
            <BroadcastIcon />
            {isSharing && !isConnected && 'Connecting'}
            {isSharing && isConnected && 'Sharing'}
            {!isSharing && 'Share'}
          </Button>

          <aside>
            <h5>Receivers</h5>
            <ul className={styles.list}>
              {status?.connections.length ? (
                status.connections.map((connection) => (
                  <li key={connection}>Browser</li>
                ))
              ) : (
                <li>No connections</li>
              )}
            </ul>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default Streaming;
