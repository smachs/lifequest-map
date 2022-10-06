import type { ReactNode } from 'react';
import { UserProvider } from 'ui/contexts/UserContext';
import { ModalProvider } from 'ui/contexts/ModalContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { PlayerProvider } from 'ui/contexts/PlayerContext';
import { FiltersProvider } from 'ui/contexts/FiltersContext';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { MantineProvider } from '@mantine/core';

type Props = {
  children: ReactNode;
};
const ProviderHell = ({ children }: Props) => {
  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
      }}
    >
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
    </MantineProvider>
  );
};

export default ProviderHell;
