import { useAccount } from '../../contexts/UserContext';
import { usePersistentState } from '../../utils/storage';
import Button from '../Button/Button';
import styles from './ShareLiveStatus.module.css';
import { v4 as uuid } from 'uuid';
import { copyTextToClipboard } from '../../utils/clipboard';
import { toast } from 'react-toastify';
import ShareFromOverwolf from './ShareFromOverwolf';
import { isOverwolfApp } from '../../utils/overwolf';
import ShareFromWebsite from './ShareFromWebsite';

type ShareLiveStatusProps = {
  onActivate: () => void;
};
function ShareLiveStatus({ onActivate }: ShareLiveStatusProps): JSX.Element {
  const { account } = useAccount();
  const [token, setToken] = usePersistentState('share-token', '');

  return (
    <section className={styles.container}>
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
          Token
          <input
            value={token}
            placeholder="Use this token to connect your apps..."
            onChange={(event) => setToken(event.target.value)}
          />
        </label>
        <Button
          disabled={!token}
          onClick={() => {
            copyTextToClipboard(token);
            toast.info(`Copied to clipboard 📝`);
          }}
        >
          Copy to clipboard
        </Button>
        <Button onClick={() => setToken(uuid())}>Create random</Button>
        <Button disabled={!account} onClick={() => setToken(account!.steamId)}>
          Use SteamID
        </Button>
      </div>
      <Button onClick={onActivate} disabled={!token}>
        Share Live Status
      </Button>
    </section>
  );
}

export default ShareLiveStatus;
