import type { ReactNode } from 'react';
import { ModalProvider } from 'ui/contexts/ModalContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { FiltersProvider } from 'ui/contexts/FiltersContext';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';

type Props = {
  children: ReactNode;
};
const ProviderHell = ({ children }: Props) => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <FiltersProvider>
          <MarkersProvider>
            <ModalProvider>{children}</ModalProvider>
          </MarkersProvider>
        </FiltersProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default ProviderHell;
