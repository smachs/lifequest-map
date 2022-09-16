import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import './globals.css';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { ModalProvider } from './contexts/ModalContext';
import { MarkersProvider } from './contexts/MarkersContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { FiltersProvider } from './contexts/FiltersContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { initPlausible } from './utils/stats';

ReactDOM.render(
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
  </StrictMode>,
  document.querySelector('#root')
);

initPlausible();
