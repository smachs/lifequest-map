import { StrictMode } from 'react';
import './globals.css';
import App from './App';
import { UserProvider } from 'ui/contexts/UserContext';
import { ModalProvider } from 'ui/contexts/ModalContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import { PlayerProvider } from 'ui/contexts/PlayerContext';
import { FiltersProvider } from 'ui/contexts/FiltersContext';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { initPlausible } from 'ui/utils/stats';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.querySelector('#root')!);
root.render(
  <StrictMode>
    <SettingsProvider>
      <UserProvider>
        <FiltersProvider>
          <MarkersProvider>
            <PlayerProvider>
              <ModalProvider>
                <App />
              </ModalProvider>
            </PlayerProvider>
          </MarkersProvider>
        </FiltersProvider>
      </UserProvider>
    </SettingsProvider>
  </StrictMode>
);

initPlausible();
