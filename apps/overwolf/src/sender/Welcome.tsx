import { Image, UnstyledButton } from '@mantine/core';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchJSON } from 'ui/utils/api';
import type { AccountDTO } from 'ui/utils/userStore';
import { useUserStore } from 'ui/utils/userStore';
import styles from './Welcome.module.css';

const { VITE_API_ENDPOINT = '' } = import.meta.env;

function Welcome(): JSX.Element {
  const [verifyingSessionId, setVerifyingSessionId] = useState('');
  const setAccount = useUserStore((state) => state.setAccount);

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
        Sign in and connect to{' '}
        <a href="https://aeternum-map.gg" target="_blank">
          aeternum-map.gg
        </a>
        , an interactive New World map with routes and community managed
        markers. As alternative, you can use{' '}
        <a href="https://newworld-map.com" target="_blank">
          newworld&#8209;map.com
        </a>{' '}
        with limited functionality.
      </p>
      <ul>
        <li>🚀 Live Tracking of your In-Game position</li>
        <li>🤗 See your friends by using the same token</li>
        <li>🔀 Farming/Marker Routes</li>
        <li>✅ Check markers as done (like lore documents)</li>
        <li>🗺️ Minimap view</li>
        <li>🤷‍♂️ Conforms to AGS ToS</li>
      </ul>
      <UnstyledButton onClick={handleLogin}>
        <Image
          src="/steam.png"
          width={180}
          height={35}
          alt="Sign in through Steam"
          sx={{
            margin: '0 auto',
          }}
        />
      </UnstyledButton>
    </div>
  );
}

export default Welcome;
