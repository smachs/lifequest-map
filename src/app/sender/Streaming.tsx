import Button from '../components/Button/Button';
import { usePersistentState } from '../utils/storage';
import { patchLiveShareToken } from '../components/ShareLiveStatus/api';
import { copyTextToClipboard } from '../utils/clipboard';
import useShareLivePosition from './useShareLivePosition';
import { writeError } from '../utils/logs';
import CopyIcon from '../components/icons/CopyIcon';
import RefreshIcon from '../components/icons/RefreshIcon';
import BroadcastIcon from '../components/icons/BroadcastIcon';
import { classNames } from '../utils/styles';
import { useIsNewWorldRunning } from '../utils/games';
import { toast } from 'react-toastify';
import { v4 as uuid } from 'uuid';
import type { FormEvent } from 'react';
import { usePosition } from '../contexts/PositionContext';
import { useEffect, useState } from 'react';
import { useAccount, useUser } from '../contexts/UserContext';
import styles from './Streaming.module.css';
import MenuIcon from '../components/icons/MenuIcon';
import Settings from './Settings';
import useMinimap from '../components/Minimap/useMinimap';
import ServerRadioButton from '../components/LiveServer/ServerRadioButton';
import useServers from './useServers';

function Streaming(): JSX.Element {
  const { account } = useAccount();
  const [token, setToken] = usePersistentState(
    'live-share-token',
    account!.liveShareToken || ''
  );
  const [serverUrl, setServerUrl] = usePersistentState(
    'live-share-server-url',
    account!.liveShareServerUrl || ''
  );
  const { status, isConnected, isSharing, setIsSharing } = useShareLivePosition(
    token,
    serverUrl
  );
  const newWorldIsRunning = useIsNewWorldRunning();
  const { position, location, region } = usePosition();
  const user = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [showMinimap, setShowMinimap] = useMinimap();
  const servers = useServers();

  useEffect(() => {
    if (!serverUrl || !servers.some((server) => server.url === serverUrl)) {
      const onlineServers = [...servers]
        .filter((server) => server.delay !== Infinity)
        .sort((a, b) => a.delay - b.delay);
      const server = onlineServers[0];
      if (server) {
        setServerUrl(server.url);
      }
    }
  }, [servers, serverUrl]);

  useEffect(() => {
    if (account!.liveShareToken) {
      setToken(account!.liveShareToken);
    }
    if (account!.liveShareServerUrl) {
      setServerUrl(account!.liveShareServerUrl);
    }
  }, [account!.liveShareToken, account!.liveShareServerUrl]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      if (isSharing) {
        setIsSharing(false);
        return;
      }

      if (!token || !serverUrl) {
        toast.error('Token and server are required 🙄');
        return;
      }

      if (
        account!.liveShareToken !== token ||
        account!.liveShareServerUrl !== serverUrl
      ) {
        patchLiveShareToken(token, serverUrl);
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
          {newWorldIsRunning && user && position && (
            <small>
              <span className={styles.success}>Playing</span> as {user.username}{' '}
              at [{position.location[1]}, {position.location[0]}]{' '}
              <div>{region && `${location || region}`}</div>
            </small>
          )}
          {newWorldIsRunning && !user && (
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
        <button onClick={() => setShowSettings(true)}>
          <MenuIcon />
        </button>
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className={styles.guide}>
          Use the token shown below on{' '}
          <a href="https://aeternum-map.gg" target="_blank">
            aeternum-map.gg
          </a>{' '}
          to see your live location on the map. You can use any device that has
          a browser. Share this token and server with your friends to see each
          others' location 🤗.
        </p>
        <div>
          Server
          {servers.map((server) => (
            <ServerRadioButton
              key={server.name}
              disabled={isSharing}
              server={server}
              checked={serverUrl === server.url}
              onChange={setServerUrl}
            />
          ))}
        </div>
        <div className={styles.tokenContainer}>
          <label className={styles.label}>
            Token
            <input
              disabled={isSharing}
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
            disabled={isSharing}
          >
            <RefreshIcon />
          </Button>
          <Button
            className={styles.action}
            type="button"
            disabled={!token || !serverUrl}
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
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          showMinimap={showMinimap}
          onShowMinimap={setShowMinimap}
        />
      )}
    </div>
  );
}

export default Streaming;
