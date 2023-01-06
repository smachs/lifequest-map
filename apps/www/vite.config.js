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
    port: 5174,
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
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        minimap: resolve(__dirname, 'src/minimap.html'),
        privacy: resolve(__dirname, 'src/privacy.html'),
        index: resolve(__dirname, 'src/index.html'),
      },
    },
    sourcemap: true,
    emptyOutDir: true
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
