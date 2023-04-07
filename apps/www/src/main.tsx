import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { initPlausible } from 'ui/utils/stats';
import './globals.css';
import router from './router';
import { initWakelock } from './wakelock';

const root = createRoot(document.querySelector('#root')!);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

initPlausible();
initWakelock();
