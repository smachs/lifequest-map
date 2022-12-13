import type { ReactNode } from 'react';
import { ModalProvider } from 'ui/contexts/ModalContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { FiltersProvider } from 'ui/contexts/FiltersContext';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';

const queryClient = new QueryClient();
broadcastQueryClient({
  queryClient,
  broadcastChannel: 'aeternum-map',
});

const helmetContext = {};

type Props = {
  children: ReactNode;
};
const ProviderHell = ({ children }: Props) => {
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SettingsProvider>
            <FiltersProvider>
              <MarkersProvider>
                <ModalProvider>{children}</ModalProvider>
              </MarkersProvider>
            </FiltersProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default ProviderHell;
