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
import { useState } from 'react';

type ShareLiveStatusProps = {
  onActivate: () => void;
};
function ShareLiveStatus({ onActivate }: ShareLiveStatusProps): JSX.Element {
  const { account } = useAccount();
  const [playerToken, setPlayerToken] = usePersistentState('player-token', '');
  const [groupToken, setGroupToken] = usePersistentState('group-token', '');
  const [lastGroupTokens] = usePersistentState<string[]>(
    'last-group-tokens',
    []
  );
  const [isGroupInFocus, setIsGroupInFocus] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (playerToken === groupToken) {
      toast.error('Tokens can not be equal 🙄');
      return;
    }
    const newLastGroupTokens = [
      groupToken,
      ...lastGroupTokens.filter((last) => last !== groupToken),
    ].slice(0, 2);
    setJSONItem('last-group-tokens', newLastGroupTokens);

    onActivate();
  }
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {isOverwolfApp ? <ShareFromOverwolf /> : <ShareFromWebsite />}
      <p>
        If you like to build your own applications based on your live status,
        make sure to{' '}
        <a href="https://discord.gg/NTZu8Px" target="_blank">
          Join Discord Community
        </a>
        .
      </p>
      <div className={styles.tokenContainer}>
        <label className={styles.label}>
          Player Token
          <input
            value={playerToken}
            placeholder="Use this token to identify your character..."
            onChange={(event) => setPlayerToken(event.target.value)}
          />
        </label>
        <Button
          type="button"
          disabled={!account}
          onClick={() => setPlayerToken(account!.steamId)}
        >
          Use SteamID
        </Button>
        <Button type="button" onClick={() => setPlayerToken(uuid())}>
          Create random
        </Button>
        <Button
          type="button"
          disabled={!playerToken}
          onClick={() => {
            copyTextToClipboard(playerToken);
          }}
        >
          Copy to clipboard
        </Button>
      </div>
      <div className={styles.tokenContainer}>
        <label className={styles.label}>
          Group Token
          <input
            value={groupToken}
            placeholder="Use this token to share with your group..."
            onChange={(event) => setGroupToken(event.target.value)}
            onFocus={() => setIsGroupInFocus(true)}
            onBlur={() => setIsGroupInFocus(false)}
          />
          {isGroupInFocus && lastGroupTokens.length > 0 && (
            <div className={styles.suggestions}>
              {lastGroupTokens.map((lastGroupToken) => (
                <button
                  key={lastGroupToken}
                  onMouseDown={() => setGroupToken(lastGroupToken)}
                  className={styles.suggestion}
                >
                  {lastGroupToken}
                </button>
              ))}
            </div>
          )}
        </label>
        <Button type="button" onClick={() => setGroupToken(uuid())}>
          Create random
        </Button>
        <Button
          type="button"
          disabled={!groupToken}
          onClick={() => {
            copyTextToClipboard(groupToken);
          }}
        >
          Copy to clipboard
        </Button>
      </div>
      <small>
        The player token is used to identify your character and should only used
        by yourself.
        <br />
        The group token is used to connect you with friends and companies.
      </small>
      <Button disabled={!playerToken || !groupToken} type="submit">
        Share Live Status
      </Button>
    </form>
  );
}

export default ShareLiveStatus;
