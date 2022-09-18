import '../globals.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
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
  ReactDOM.render(
    <StrictMode>
      <SettingsProvider>
        <UserProvider>
          <PositionProvider>
            <Sender />
          </PositionProvider>
        </UserProvider>
      </SettingsProvider>
    </StrictMode>,
    document.querySelector('#root')
  );
});

initPlausible();
