import { fetchJSON } from '../../utils/api';
import styles from './User.module.css';
import steamSrc from './steam.png';
import { useEffect, useState } from 'react';
import SyncStatusReceiver from '../SyncStatus/SyncStatusReceiver';
import shallow from 'zustand/shallow';
import type { AccountDTO } from '../../utils/userStore';
import { useUserStore } from '../../utils/userStore';

const { VITE_API_ENDPOINT = '' } = import.meta.env;

function User(): JSX.Element {
  const { account, setAccount, logoutAccount } = useUserStore(
    (state) => ({
      account: state.account,
      setAccount: state.setAccount,
      logoutAccount: state.logoutAccount,
    }),
    shallow
  );

  const [verifyingSessionId, setVerifyingSessionId] = useState('');

  useEffect(() => {
    if (!verifyingSessionId) {
      return;
    }
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
    return () => clearInterval(intervalId);
  }, [verifyingSessionId]);

  async function handleLogin() {
    const newSessionId = await fetchJSON<string>('/api/auth/session');

    const url = `${VITE_API_ENDPOINT}/api/auth/steam?sessionId=${newSessionId}`;
    window.open(url, '_blank');

    setVerifyingSessionId(newSessionId);
  }

  return (
    <section className={styles.container}>
      {!account ? (
        <button onClick={handleLogin}>
          <img src={steamSrc} alt="Sign in through Steam" />
        </button>
      ) : (
        <p className={styles.welcome}>
          Welcome back, {account.name}!{' '}
          <button className={styles.logout} onClick={logoutAccount}>
            Sign out
          </button>
        </p>
      )}
      <SyncStatusReceiver />
    </section>
  );
}

export default User;
