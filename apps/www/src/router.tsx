import App from './App';
import { createBrowserRouter } from 'react-router-dom';
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
            id: 'routes-2',
            path: 'routes',
            element: null,
          },
          {
            id: 'settings-2',
            path: 'settings',
            element: null,
          },
          {
            id: 'nodes-2',
            path: '',
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
        id: 'routes-1',
        path: 'routes',
        element: null,
      },
      {
        id: 'settings-1',
        path: 'settings',
        element: null,
      },
      {
        id: 'nodes-1',
        path: '',
        element: null,
      },
    ],
  },
]);

export default router;
