import type { AccountDTO } from '../../contexts/UserContext';
import { useAccount, useUser } from '../../contexts/UserContext';
import { fetchJSON } from '../../utils/api';
import styles from './User.module.css';
import steamSrc from './steam.png';
import { useEffect, useState } from 'react';
import { isOverwolfApp } from '../../utils/overwolf';

const { VITE_API_ENDPOINT } = import.meta.env;

function User(): JSX.Element {
  const user = useUser();
  const { account, setAccount, logoutAccount } = useAccount();

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
    if (!isOverwolfApp) {
      window.open(url, '_blank');
    } else {
      overwolf.utils.openUrlInDefaultBrowser(url);
    }

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
          <button onClick={logoutAccount}>Sign out</button>
        </p>
      )}
      {user ? (
        <small>Playing as {user.username}</small>
      ) : (
        <small>Could not detect New World character</small>
      )}
    </section>
  );
}

export default User;
