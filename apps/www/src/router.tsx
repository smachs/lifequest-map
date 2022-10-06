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

export default router;
