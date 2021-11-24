import { useAccount } from '../../contexts/UserContext';
import { setJSONItem, usePersistentState } from '../../utils/storage';
import Button from '../Button/Button';
import styles from './ShareLiveStatus.module.css';
import { v4 as uuid } from 'uuid';
import { copyTextToClipboard } from '../../utils/clipboard';
import { toast } from 'react-toastify';
import ShareFromOverwolf from './ShareFromOverwolf';
import { isOverwolfApp } from '../../utils/overwolf';
import ShareFromWebsite from './ShareFromWebsite';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { patchLiveShareToken } from './api';

type ShareLiveStatusProps = {
  onActivate: () => void;
};
function ShareLiveStatus({ onActivate }: ShareLiveStatusProps): JSX.Element {
  const { account, refreshAccount } = useAccount();
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
  }, [account?.liveShareToken]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

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
    onActivate();
  }
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {isOverwolfApp ? <ShareFromOverwolf /> : <ShareFromWebsite />}
      <p className={styles.guide}>
        Use the same token in the app and on the website to share your live
        status. Connect with your friends by using the same token 🤗.
      </p>
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
        {isOverwolfApp && (
          <>
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
          </>
        )}
      </div>
      <small>
        Pro tip: Login with Steam in the app and on the website to automatically
        update the token.
      </small>
      <Button disabled={!token} type="submit">
        Share Live Status
      </Button>
    </form>
  );
}

export default ShareLiveStatus;
