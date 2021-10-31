import { useAccount, useUser } from '../../contexts/UserContext';
import { fetchJSON } from '../../utils/api';
import styles from './User.module.css';
import steamSrc from './steam.png';
import { useEffect, useState } from 'react';

const { VITE_API_ENDPOINT } = import.meta.env;

function User(): JSX.Element {
  const user = useUser();
  const { account, refreshAccount, logoutAccount } = useAccount();

  const [verifyingSessionId, setVerifyingSessionId] = useState('');

  useEffect(() => {
    if (!verifyingSessionId) {
      return;
    }
    const intervalId = setInterval(async () => {
      try {
        await refreshAccount(verifyingSessionId);
        setVerifyingSessionId('');
      } catch (error) {
        // Keep waiting
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [verifyingSessionId]);

  async function handleLogin() {
    const newSessionId = await fetchJSON<string>('/api/auth/session');

    overwolf.utils.openUrlInDefaultBrowser(
      `${VITE_API_ENDPOINT}/api/auth/steam?sessionId=${newSessionId}`
    );

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
