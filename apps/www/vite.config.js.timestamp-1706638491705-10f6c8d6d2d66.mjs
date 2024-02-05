// vite.config.js
import dotenv from 'file:///D:/Apps/lifequest/node_modules/dotenv/lib/main.js';
import react from 'file:///D:/Apps/lifequest/node_modules/@vitejs/plugin-react-swc/index.mjs';
import { resolve } from 'path';
import { defineConfig } from 'file:///D:/Apps/lifequest/node_modules/vite/dist/node/index.js';
import { VitePWA } from 'file:///D:/Apps/lifequest/node_modules/vite-plugin-pwa/dist/index.js';
var __vite_injected_original_dirname = 'D:\\Apps\\lifequest\\apps\\www';
dotenv.config();
var { PORT = 3001 } = process.env;
var vite_config_default = defineConfig({
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
        globPatterns: ['**/*.{js,css,ico,png,svg,webp,jpg}'],
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
  root: resolve(__vite_injected_original_dirname, 'src'),
  publicDir: resolve(__vite_injected_original_dirname, 'src/public'),
  build: {
    outDir: resolve(__vite_injected_original_dirname, 'dist'),
    rollupOptions: {
      input: {
        external: resolve(
          __vite_injected_original_dirname,
          'src/external.html'
        ),
        minimap: resolve(__vite_injected_original_dirname, 'src/minimap.html'),
        privacy: resolve(__vite_injected_original_dirname, 'src/privacy.html'),
        index: resolve(__vite_injected_original_dirname, 'src/index.html'),
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxBcHBzXFxcXGxpZmVxdWVzdFxcXFxhcHBzXFxcXHd3d1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQXBwc1xcXFxsaWZlcXVlc3RcXFxcYXBwc1xcXFx3d3dcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0FwcHMvbGlmZXF1ZXN0L2FwcHMvd3d3L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnO1xyXG5kb3RlbnYuY29uZmlnKCk7XHJcblxyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcblxyXG5jb25zdCB7IFBPUlQgPSAzMDAxIH0gPSBwcm9jZXNzLmVudjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICBzdHJhdGVnaWVzOiAnZ2VuZXJhdGVTVycsXHJcbiAgICAgIGluamVjdFJlZ2lzdGVyOiAnaW5saW5lJyxcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAncHJvbXB0JyxcclxuICAgICAgaW5jbHVkZUFzc2V0czogW1xyXG4gICAgICAgICdmYXZpY29uLmljbycsXHJcbiAgICAgICAgJ2FwcGxlLXRvdWNoLWljb24ucG5nJyxcclxuICAgICAgICAnYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmcnLFxyXG4gICAgICBdLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdBZXRlcm51bSBNYXAgLSBOZXcgV29ybGQgTWFwJyxcclxuICAgICAgICBzaG9ydF9uYW1lOiAnQWV0ZXJudW0gTWFwJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdNYXhpbWl6ZSB5b3VyIE5ldyBXb3JsZCBnYW1lcGxheSB3aXRoIEFldGVybnVtIE1hcCEgRGlzY292ZXIgbG9jYXRpb25zLCBjaGVzdHMsIGxvcmUsIGV4cGVkaXRpb25zICYgbW9yZS4gUmVhbHRpbWUgdHJhY2tpbmcgJiBmYXJtaW5nIHJvdXRlcy4gT3Blbi1zb3VyY2UgY29tcGFuaW9uIGFwcC4nLFxyXG4gICAgICAgIGxhbmc6ICdlbicsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2FuZHJvaWQtY2hyb21lLTE5MngxOTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvYW5kcm9pZC1jaHJvbWUtMjU2eDI1Ni5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzI1NngyNTYnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9tYXNrYWJsZV9pY29uX3g1MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgIHB1cnBvc2U6ICdtYXNrYWJsZScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgcHVycG9zZTogJ2FueScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMmMyZTMzJyxcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnYW55JyxcclxuICAgICAgICBkaXI6ICdsdHInLFxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxpY28scG5nLHN2Zyx3ZWJwLGpwZ30nXSxcclxuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXlxcL2FwaS8sIC9eXFwvYXNzZXRzLywgL15cXC9zaXRlbWFwL10sXHJcbiAgICAgICAgaWdub3JlVVJMUGFyYW1ldGVyc01hdGNoaW5nOiBbLy4qL10sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3NCxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHtQT1JUfWAsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHJvb3Q6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXHJcbiAgcHVibGljRGlyOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9wdWJsaWMnKSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiByZXNvbHZlKF9fZGlybmFtZSwgJ2Rpc3QnKSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6IHtcclxuICAgICAgICBleHRlcm5hbDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvZXh0ZXJuYWwuaHRtbCcpLFxyXG4gICAgICAgIG1pbmltYXA6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL21pbmltYXAuaHRtbCcpLFxyXG4gICAgICAgIHByaXZhY3k6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3ByaXZhY3kuaHRtbCcpLFxyXG4gICAgICAgIGluZGV4OiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC5odG1sJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgfSxcclxuICBlc2J1aWxkOiB7XHJcbiAgICBqc3hJbmplY3Q6IGBpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnYCxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUSxPQUFPLFlBQVk7QUFHN1IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGVBQWU7QUFOeEIsSUFBTSxtQ0FBbUM7QUFDekMsT0FBTyxPQUFPO0FBT2QsSUFBTSxFQUFFLE9BQU8sS0FBSyxJQUFJLFFBQVE7QUFHaEMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osZ0JBQWdCO0FBQUEsTUFDaEIsY0FBYztBQUFBLE1BQ2QsZUFBZTtBQUFBLFFBQ2I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQ0U7QUFBQSxRQUNGLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLEtBQUs7QUFBQSxNQUNQO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsb0NBQW9DO0FBQUEsUUFDbkQsMEJBQTBCLENBQUMsVUFBVSxhQUFhLFlBQVk7QUFBQSxRQUM5RCw2QkFBNkIsQ0FBQyxJQUFJO0FBQUEsTUFDcEM7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRLG9CQUFvQixJQUFJO0FBQUEsUUFDaEMsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU0sUUFBUSxrQ0FBVyxLQUFLO0FBQUEsRUFDOUIsV0FBVyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxFQUMxQyxPQUFPO0FBQUEsSUFDTCxRQUFRLFFBQVEsa0NBQVcsTUFBTTtBQUFBLElBQ2pDLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLFVBQVUsUUFBUSxrQ0FBVyxtQkFBbUI7QUFBQSxRQUNoRCxTQUFTLFFBQVEsa0NBQVcsa0JBQWtCO0FBQUEsUUFDOUMsU0FBUyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLFFBQzlDLE9BQU8sUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxNQUM1QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxXQUFXO0FBQUEsRUFDYjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
