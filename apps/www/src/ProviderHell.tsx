import type { ReactNode } from 'react';
import { ModalProvider } from 'ui/contexts/ModalContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { FiltersProvider } from 'ui/contexts/FiltersContext';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
};
const ProviderHell = ({ children }: Props) => {
  return (
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
  );
};

export default ProviderHell;
