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
import { MantineProvider } from '@mantine/core';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'nodes/:nodeId',
        element: null,
      },
      {
        path: 'routes/:routeId',
        element: null,
      },
      {
        path: ':map',
        element: null,
      },
      {
        path: ':map/nodes/:nodeId',
        element: null,
      },
      {
        path: ':map/routes/:routeId',
        element: null,
      },
    ],
  },
]);

const root = createRoot(document.querySelector('#root')!);
root.render(
  <StrictMode>
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
                <ModalProvider>
                  <RouterProvider router={router} />
                </ModalProvider>
              </PlayerProvider>
            </MarkersProvider>
          </FiltersProvider>
        </UserProvider>
      </SettingsProvider>
    </MantineProvider>
  </StrictMode>
);

initPlausible();
