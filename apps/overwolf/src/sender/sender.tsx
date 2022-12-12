import '../globals.css';
import { StrictMode } from 'react';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { PositionProvider } from '../contexts/PositionContext';
import { waitForOverwolf } from 'ui/utils/overwolf';
import styles from './Sender.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Welcome from './Welcome';
import Streaming from './Streaming';
import ErrorBoundary from 'ui/components/ErrorBoundary/ErrorBoundary';
import { initPlausible } from 'ui/utils/stats';
import { createRoot } from 'react-dom/client';
import Ads from '../components/Ads/Ads';
import { useUserStore } from 'ui/utils/userStore';
import AppHeader from '../components/AppHeader/AppHeader';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';
import { MantineProvider } from '@mantine/core';

const root = createRoot(document.querySelector('#root')!);

function Sender(): JSX.Element {
  const account = useUserStore((state) => state.account);

  const showAds = !account || !account.isSupporter;
  return (
    <>
      <div className={styles.container}>
        <AppHeader />
        <main className={styles.main}>
          {account ? <Streaming /> : <Welcome />}
        </main>
        {showAds && (
          <ErrorBoundary>
            <Ads />
          </ErrorBoundary>
        )}
      </div>
      <ToastContainer
        theme="dark"
        pauseOnHover={false}
        autoClose={3000}
        pauseOnFocusLoss={false}
        style={{ marginTop: 32 }}
      />
    </>
  );
}

const queryClient = new QueryClient();

waitForOverwolf().then(() => {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          theme={{
            colorScheme: 'dark',
          }}
          withGlobalStyles
          withNormalizeCSS
        >
          <ThemeProvider>
            <SettingsProvider>
              <PositionProvider>
                <Sender />
              </PositionProvider>
            </SettingsProvider>
          </ThemeProvider>
        </MantineProvider>
      </QueryClientProvider>
    </StrictMode>
  );
});

initPlausible();
