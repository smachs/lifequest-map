import './globals.css';
import type { FormEvent } from 'react';
import { StrictMode, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import ReactDOM from 'react-dom';
import AppHeader from './components/AppHeader/AppHeader';
import type { Position } from './contexts/PositionContext';
import { SettingsProvider } from './contexts/SettingsContext';
import type { AccountDTO } from './contexts/UserContext';
import { useAccount, UserProvider } from './contexts/UserContext';
import { waitForOverwolf } from './utils/overwolf';
import styles from './Sender.module.css';
import { getGameInfo, useIsNewWorldRunning } from './utils/games';
import Ads from './components/Ads/Ads';
import steamSrc from './components/User/steam.png';
import { fetchJSON } from './utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from './components/Button/Button';
import { setJSONItem, usePersistentState } from './utils/storage';
import { patchLiveShareToken } from './components/ShareLiveStatus/api';
import { copyTextToClipboard } from './utils/clipboard';
import useShareLivePosition from './utils/useShareLivePosition';
import { writeError } from './utils/logs';
import CopyIcon from './components/icons/CopyIcon';
import RefreshIcon from './components/icons/RefreshIcon';
import BroadcastIcon from './components/icons/BroadcastIcon';
import { classNames } from './utils/styles';

const { VITE_API_ENDPOINT = '' } = import.meta.env;

function Welcome(): JSX.Element {
  const [verifyingSessionId, setVerifyingSessionId] = useState('');
  const { setAccount } = useAccount();

  useEffect(() => {
    if (!verifyingSessionId) {
      return;
    }
    const toastId = toast('Waiting for Steam Sign In', {
      type: 'info',
      autoClose: false,
    });
    const intervalId = setInterval(async () => {
      try {
        const init: RequestInit = {};
        if (verifyingSessionId) {
          init.headers = {
            'x-session-id': verifyingSessionId,
            'x-prevent-logout': 'true',
          };
        }
        const newAccount = await fetchJSON<AccountDTO>(
          `/api/auth/account`,
          init
        );
        setAccount(newAccount);
        setVerifyingSessionId('');
      } catch (error) {
        // Keep waiting
      }
    }, 3000);
    return () => {
      clearInterval(intervalId);
      toast.dismiss(toastId);
    };
  }, [verifyingSessionId]);

  const handleLogin = async () => {
    const newSessionId = await fetchJSON<string>('/api/auth/session');

    const url = `${VITE_API_ENDPOINT}/api/auth/steam?sessionId=${newSessionId}`;
    overwolf.utils.openUrlInDefaultBrowser(url);

    setVerifyingSessionId(newSessionId);
  };

  return (
    <div className={styles.welcome}>
      <p>
        Connect to{' '}
        <a href="https://aeternum-map.gg" target="_blank">
          https://aeternum-map.gg
        </a>
        , an interactive New World map with routes and community managed
        markers.
      </p>
      <ul>
        <li>🚀 Live Tracking of your In-Game position</li>
        <li>🤗 See your friends by using the same token</li>
        <li>🔀 Farming/Marker Routes</li>
        <li>✅ Check markers as done (like lore documents)</li>
        <li>🗺️ Minimap view</li>
        <li>
          🤷‍♂️{' '}
          <a
            href="https://discord.com/channels/320539672663031818/896014490808745994/911185526210576394"
            target="_blank"
          >
            Conforms to AGS ToS
          </a>
        </li>
      </ul>
      <button onClick={handleLogin}>
        <img src={steamSrc} alt="Sign in through Steam" />
      </button>
    </div>
  );
}

function Streaming(): JSX.Element {
  const { account, logoutAccount } = useAccount();
  const { isConnected, isSharing, setIsSharing } = useShareLivePosition();
  const newWorldIsRunning = useIsNewWorldRunning();

  const [token, setToken] = usePersistentState('live-share-token', '');
  const [position, setPosition] = useState<Position | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [logs, setLogs] = useState<string[]>(['App started']);

  useEffect(() => {
    if (newWorldIsRunning) {
      setLogs((logs) => [...logs, 'New World is connected']);
    }
  }, [newWorldIsRunning]);

  useEffect(() => {
    if (playerName) {
      setLogs((logs) => [...logs, `Found player name '${playerName}'`]);
    }
  }, [playerName]);

  useEffect(() => {
    if (isConnected) {
      setLogs((logs) => [...logs, 'Sharing started']);
    }
  }, [isConnected]);

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
            <ul className={styles.logs}>
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </aside>
        </div>
      </form>
    </div>
  );
}

function Sender(): JSX.Element {
  const { account } = useAccount();

  return (
    <div className={styles.container}>
      <AppHeader />
      <main className={styles.main}>
        {account ? <Streaming /> : <Welcome />}
      </main>
      <Ads active />
      <ToastContainer
        theme="dark"
        pauseOnHover={false}
        autoClose={3000}
        pauseOnFocusLoss={false}
        style={{ marginTop: 32 }}
      />
    </div>
  );
}

waitForOverwolf().then(() => {
  ReactDOM.render(
    <StrictMode>
      <SettingsProvider>
        <UserProvider>
          <Sender />
        </UserProvider>
      </SettingsProvider>
    </StrictMode>,
    document.querySelector('#root')
  );
});
