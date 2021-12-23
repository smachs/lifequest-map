import { useAccount } from '../../contexts/UserContext';
import { setJSONItem, usePersistentState } from '../../utils/storage';
import Button from '../Button/Button';
import styles from './ShareLiveStatus.module.css';
import { toast } from 'react-toastify';
import ShareFromWebsite from './ShareFromWebsite';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { liveServers } from '../LiveServer/liveServers';
import ServerRadioButton from '../LiveServer/ServerRadioButton';

type ShareLiveStatusProps = {
  onActivate: () => void;
};
function ShareLiveStatus({ onActivate }: ShareLiveStatusProps): JSX.Element {
  const { account, refreshAccount } = useAccount();
  const [serverUrl, setServerUrl] = usePersistentState(
    'live-share-server-url',
    ''
  );
  const [token, setToken] = usePersistentState('live-share-token', '');
  const [lastTokens] = usePersistentState<string[]>(
    'last-live-share-tokens',
    []
  );
  const [isGroupInFocus, setIsGroupInFocus] = useState(false);

  useEffect(() => {
    if (account) {
      refreshAccount();
    }
  }, []);

  useEffect(() => {
    if (account?.liveShareToken) {
      setToken(account.liveShareToken);
    }
    if (account?.liveShareServerUrl) {
      setServerUrl(account.liveShareServerUrl);
    }
  }, [account?.liveShareToken, account?.liveShareServerUrl]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!token || !serverUrl) {
      toast.error('Token and server are required 🙄');
      return;
    }
    const newLastGroupTokens = [
      token,
      ...lastTokens.filter((last) => last !== token),
    ].slice(0, 2);
    setJSONItem('last-group-tokens', newLastGroupTokens);

    onActivate();
  }
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <ShareFromWebsite />
      <p className={styles.guide}>
        Use the same token and server in the app and on the website to share
        your live status. Connect with your friends by using the same token 🤗.
      </p>
      <div>
        Server
        {liveServers.map((liveServer) => (
          <ServerRadioButton
            key={liveServer.name}
            disabled={false}
            server={liveServer}
            checked={serverUrl === liveServer.url}
            onChange={setServerUrl}
          />
        ))}
      </div>
      <div className={styles.tokenContainer}>
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
      <small>
        Pro tip: Login with Steam in the app and on the website to automatically
        update the token.
      </small>
      <Button disabled={!token || !serverUrl} type="submit">
        Share Live Status
      </Button>
    </form>
  );
}

export default ShareLiveStatus;
