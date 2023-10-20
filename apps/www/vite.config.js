import dotenv from 'dotenv';
dotenv.config();

import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const { PORT = 3001 } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      injectRegister: 'inline',
      registerType: 'prompt',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'android-chrome-512x512.png',
      ],
      manifest: {
        name: 'Aeternum Map - New World Map',
        short_name: 'Aeternum Map',
        description:
          'Maximize your New World gameplay with Aeternum Map! Discover locations, chests, lore, expeditions & more. Realtime tracking & farming routes. Open-source companion app.',
        lang: 'en',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/maskable_icon_x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        theme_color: '#2c2e33',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        dir: 'ltr',
      },
      workbox: {
        globPatterns: ['**/*.{js,html,css,ico,png,svg,webp,jpg}'],
        navigateFallbackDenylist: [/^\/api/, /^\/assets/, /^\/sitemap/],
        ignoreURLParametersMatching: [/.*/],
      },
    }),
  ],
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
        external: resolve(__dirname, 'src/external.html'),
        minimap: resolve(__dirname, 'src/minimap.html'),
        privacy: resolve(__dirname, 'src/privacy.html'),
        index: resolve(__dirname, 'src/index.html'),
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
