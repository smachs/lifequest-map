import type { ReactNode } from 'react';
import { UserProvider } from 'ui/contexts/UserContext';
import { ModalProvider } from 'ui/contexts/ModalContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { PlayerProvider } from 'ui/contexts/PlayerContext';
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
        <UserProvider>
          <FiltersProvider>
            <MarkersProvider>
              <PlayerProvider>
                <ModalProvider>{children}</ModalProvider>
              </PlayerProvider>
            </MarkersProvider>
          </FiltersProvider>
        </UserProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default ProviderHell;
