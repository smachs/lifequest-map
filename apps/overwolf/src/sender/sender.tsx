import '../globals.css';
import { StrictMode } from 'react';
import AppHeader from './AppHeader';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { useAccount, UserProvider } from 'ui/contexts/UserContext';
import { PositionProvider } from 'ui/contexts/PositionContext';
import { waitForOverwolf } from 'ui/utils/overwolf';
import styles from './Sender.module.css';
import Ads from 'ui/components/Ads/Ads';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Welcome from './Welcome';
import Streaming from './Streaming';
import ErrorBoundary from 'ui/components/ErrorBoundary/ErrorBoundary';
import { initPlausible } from 'ui/utils/stats';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.querySelector('#root')!);

function Sender(): JSX.Element {
  const { account } = useAccount();

  return (
    <div className={styles.container}>
      <AppHeader />
      <main className={styles.main}>
        {account ? <Streaming /> : <Welcome />}
      </main>
      <ErrorBoundary>
        <Ads active />
      </ErrorBoundary>
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
  root.render(
    <StrictMode>
      <SettingsProvider>
        <UserProvider>
          <PositionProvider>
            <Sender />
          </PositionProvider>
        </UserProvider>
      </SettingsProvider>
    </StrictMode>
  );
});

initPlausible();
