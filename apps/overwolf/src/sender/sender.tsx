import { StrictMode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { waitForOverwolf } from 'ui/utils/overwolf';
import { PositionProvider } from '../contexts/PositionContext';
import '../globals.css';
import styles from './Sender.module.css';

import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from 'ui/components/ErrorBoundary/ErrorBoundary';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';
import { initPlausible } from 'ui/utils/stats';
import { useUserStore } from 'ui/utils/userStore';
import Ads from '../components/Ads/Ads';
import AppHeader from '../components/AppHeader/AppHeader';
import Streaming from './Streaming';
import Welcome from './Welcome';

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
            <PositionProvider>
              <Sender />
            </PositionProvider>
          </ThemeProvider>
        </MantineProvider>
      </QueryClientProvider>
    </StrictMode>
  );
});

initPlausible();
