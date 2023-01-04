import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import { useSettingsStore } from '../../utils/settingsStore';
import { useUserStore } from '../../utils/userStore';
import Button from '../Button/Button';
import ServerRadioButton from '../LiveServer/ServerRadioButton';
import ShareFromWebsite from './ShareFromWebsite';
import styles from './ShareLiveStatus.module.css';
import useServers from './useServers';

type ShareLiveStatusProps = {
  onActivate: () => void;
};
function ShareLiveStatus({ onActivate }: ShareLiveStatusProps): JSX.Element {
  const { account, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );

  const {
    liveShareServerUrl,
    liveShareToken,
    setLiveShareServerUrl,
    setLiveShareToken,
  } = useSettingsStore();

  const servers = useServers();

  useEffect(() => {
    if (account) {
      refreshAccount();
    }
  }, []);

  useEffect(() => {
    if (account?.liveShareToken) {
      setLiveShareToken(account.liveShareToken);
    }
    if (account?.liveShareServerUrl) {
      setLiveShareServerUrl(account.liveShareServerUrl);
    }
  }, [account?.liveShareToken, account?.liveShareServerUrl]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!liveShareToken || !liveShareServerUrl) {
      toast.error('Token and server are required 🙄');
      return;
    }

    onActivate();
  }
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <ShareFromWebsite />
      <p className={styles.guide}>
        Use the same token and server in the app and on the website to share
        your live status. If you are logged in, you only need to reload this
        page after changing the token in the app. Connect with your friends by
        using the same token 🤗.
      </p>
      <div>
        Server
        {servers.map((server) => (
          <ServerRadioButton
            key={server.name}
            disabled={!!account}
            server={server}
            checked={liveShareServerUrl === server.url}
            onChange={setLiveShareServerUrl}
          />
        ))}
      </div>
      <div className={styles.tokenContainer}>
        <label className={styles.label}>
          Token
          <input
            value={liveShareToken}
            disabled={!!account}
            placeholder="Use this token to access your live status..."
            onChange={(event) => setLiveShareToken(event.target.value)}
          />
        </label>
      </div>
      <small>
        Pro tip: Login with Steam in the app and on the website to automatically
        update the token.
      </small>
      <Button
        disabled={!!account || !liveShareToken || !liveShareServerUrl}
        type="submit"
      >
        {account ? 'Use the app to setup live share' : 'Save live share'}
      </Button>
    </form>
  );
}

export default ShareLiveStatus;
