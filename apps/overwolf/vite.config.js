import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { resolve } from 'path';

const { PORT = 3001 } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src/public'),
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../../dist/overwolf'),
    rollupOptions: {
      input: {
        minimap: resolve(__dirname, 'src/minimap.html'),
        background: resolve(__dirname, 'src/background.html'),
        sender: resolve(__dirname, 'src/sender.html'),
      },
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
