import { StrictMode } from 'react';
import './globals.css';
import { initPlausible } from 'ui/utils/stats';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';

const root = createRoot(document.querySelector('#root')!);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

initPlausible();
