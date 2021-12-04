import './globals.css';
import type { FormEvent } from 'react';
import { StrictMode, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import ReactDOM from 'react-dom';
import AppHeader from './components/AppHeader/AppHeader';
import { PositionProvider } from './contexts/PositionContext';
import { SettingsProvider } from './contexts/SettingsContext';
import type { AccountDTO } from './contexts/UserContext';
import { useAccount, UserProvider } from './contexts/UserContext';
import { waitForOverwolf } from './utils/overwolf';
import styles from './Sender.module.css';
import { useIsNewWorldRunning } from './utils/games';
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
  const isNewWorldRunning = useIsNewWorldRunning();
  const [isLive, setIsLive] = useShareLivePosition();

  const [token, setToken] = usePersistentState('live-share-token', '');
  const [lastTokens] = usePersistentState<string[]>(
    'last-live-share-tokens',
    []
  );
  const [isGroupInFocus, setIsGroupInFocus] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isLive) {
      setIsLive(false);
      return;
    }

    if (!token) {
      toast.error('Token is required 🙄');
      return;
    }
    const newLastGroupTokens = [
      token,
      ...lastTokens.filter((last) => last !== token),
    ].slice(0, 2);
    setJSONItem('last-group-tokens', newLastGroupTokens);

    if (account && account.liveShareToken !== token) {
      patchLiveShareToken(token);
    }
    setIsLive(true);
  }

  return (
    <div className={styles.streaming}>
      <p className={styles.user}>
        Welcome back, {account!.name}!{' '}
        <button onClick={logoutAccount} className={styles.logout}>
          Sign out
        </button>
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className={styles.guide}>
          Use the same token in the app and on the website to share your live
          status. Connect with your friends by using the same token 🤗.
        </p>
        <div className={styles.tokenContainer}>
          <Button type="button" onClick={() => setToken(uuid())}>
            Create random
          </Button>
          <Button
            type="button"
            disabled={!token}
            onClick={() => {
              copyTextToClipboard(token);
            }}
          >
            Copy to clipboard
          </Button>
          <label className={styles.label}>
            Token
            <input
              value={token}
              placeholder="Use this token to access your live status..."
              onChange={(event) => setToken(event.target.value)}
              onFocus={() => setIsGroupInFocus(true)}
              onBlur={() => setIsGroupInFocus(false)}
            />
            {isGroupInFocus && lastTokens.length > 0 && (
              <div className={styles.suggestions}>
                {lastTokens.map((lastGroupToken) => (
                  <button
                    key={lastGroupToken}
                    onMouseDown={() => setToken(lastGroupToken)}
                    className={styles.suggestion}
                  >
                    {lastGroupToken}
                  </button>
                ))}
              </div>
            )}
          </label>
        </div>
        <Button disabled={!token} type="submit">
          {isLive ? 'Stop sharing Live Status' : 'Share Live Status'}
        </Button>
        <Button
          type="button"
          onClick={() =>
            overwolf.utils.openUrlInDefaultBrowser('https://aeternum-map.gg')
          }
        >
          Open Website
        </Button>
      </form>
      {isNewWorldRunning && <p>New World is running</p>}
      {!isNewWorldRunning && <p>Could not detect New World</p>}
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
          <PositionProvider>
            <Sender />
          </PositionProvider>
        </UserProvider>
      </SettingsProvider>
    </StrictMode>,
    document.querySelector('#root')
  );
});
