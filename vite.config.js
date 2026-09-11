import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const DAY = 60 * 60 * 24

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Offline only — no install prompt was asked for, so no web app manifest.
      manifest: false,
      workbox: {
        // Single self-contained sw.js. The split build importScripts() a separately
        // hashed workbox-*.js, which is one more thing to serve correctly and to keep
        // in sync with the service worker that references it.
        inlineWorkboxRuntime: true,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // config.js is rewritten on every container start; precaching it would pin the
        // app to whatever configuration the image was built with.
        globIgnores: ['**/config.js'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Kept out of the precache above, but still cached so a reload works offline.
            urlPattern: /\/config\.js$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'runtime-config',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Host-agnostic on purpose: the API origin is runtime-configurable.
            urlPattern: /\/api\/event\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'event-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * DAY },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Speaker photos. Immutable once published, and there are ~170 of them.
            urlPattern: /^https:\/\/storage\.startupmission\.in\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'speaker-photos',
              expiration: { maxEntries: 400, maxAgeSeconds: 30 * DAY },
              // <img> requests are not CORS, so these come back opaque (status 0).
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
