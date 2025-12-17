// TITANE∞ Service Worker — Phase 4 P2-B
// v25.7.5 — Offline-first caching for -400ms repeat visit TTI

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Pre-cache critical chunks built by Vite
// This array is populated by workbox-build in vite.config.ts
precacheAndRoute(self.__WB_MANIFEST);

// Strategy 1: Stale-While-Revalidate for CSS/JS assets
// → Serve from cache, update in background
registerRoute(
  ({ request, url }) =>
    (request.destination === 'script' || request.destination === 'style') &&
    url.pathname.includes('/assets/'),
  new StaleWhileRevalidate({
    cacheName: 'titane-assets-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Strategy 2: Cache-First for fonts and static images
// → Serve from cache, fetch only if missing
registerRoute(
  ({ request }) => request.destination === 'font' || request.destination === 'image',
  new CacheFirst({
    cacheName: 'titane-static-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Strategy 3: Network-First for API calls
// → Try network, fallback to cache if offline
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws/'),
  new NetworkFirst({
    cacheName: 'titane-api-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
    networkTimeoutSeconds: 3, // Fallback to cache after 3s
  })
);

// Strategy 4: Stale-While-Revalidate for ONNX models
// → Serve from cache immediately, update in background
registerRoute(
  ({ url }) => url.pathname.endsWith('.onnx'),
  new StaleWhileRevalidate({
    cacheName: 'titane-onnx-models-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year (models rarely change)
      }),
    ],
  })
);

// Skip waiting to activate immediately
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const currentCaches = [
    'titane-assets-v1',
    'titane-static-v1',
    'titane-api-v1',
    'titane-onnx-models-v1',
  ];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('🧹 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

console.log('✅ TITANE∞ Service Worker v25.7.5 activated');
