import dotenv from 'dotenv';
dotenv.config();

import react from "@vitejs/plugin-react-swc";
import { resolve } from 'path';
import { defineConfig } from 'vite';

const { PORT = 3001 } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
        influence: resolve(__dirname, 'influence.html'),
      },
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
