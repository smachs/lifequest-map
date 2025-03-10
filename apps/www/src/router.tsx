import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ProviderHell from './ProviderHell';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProviderHell>
        <App />
      </ProviderHell>
    ),
    children: [
      {
        id: 'map',
        path: ':map',
        element: null,
        children: [
          {
            id: 'nodeDetails-2',
            path: 'nodes/:nodeId',
            element: null,
          },
          {
            id: 'routeDetails-2',
            path: 'routes/:routeId',
            element: null,
          },
          {
            path: '*',
            element: null,
          },
        ],
      },
      {
        id: 'nodeDetails-1',
        path: 'nodes/:nodeId',
        element: null,
      },
      {
        id: 'routeDetails-1',
        path: 'routes/:routeId',
        element: null,
      },
      {
        id: 'influenceDetails',
        path: 'influences/:world',
        element: null,
      },
    ],
  },
]);

export default router;
