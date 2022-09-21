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
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        minimap: resolve(__dirname, 'minimap.html'),
        background: resolve(__dirname, 'background.html'),
        sender: resolve(__dirname, 'sender.html'),
      },
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
