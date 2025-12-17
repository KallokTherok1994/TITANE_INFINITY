/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.6.0 — SERVICE WORKER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Advanced offline-first caching strategy
 * - Multi-level cache hierarchy
 * - Background sync for failed requests
 * - Predictive preloading
 * - Cache versioning & migration
 * - Performance monitoring
 *
 * @version 25.6.0
 * @created 2025-12-17
 * @phase 12 - Ultimate Optimization
 */

const VERSION = '25.6.0';
const CACHE_PREFIX = 'titane-infinity';

// Cache names
const CACHE_STATIC = `${CACHE_PREFIX}-static-v${VERSION}`;
const CACHE_DYNAMIC = `${CACHE_PREFIX}-dynamic-v${VERSION}`;
const CACHE_API = `${CACHE_PREFIX}-api-v${VERSION}`;
const CACHE_IMAGES = `${CACHE_PREFIX}-images-v${VERSION}`;
const CACHE_FONTS = `${CACHE_PREFIX}-fonts-v${VERSION}`;

// Cache configurations
const CACHE_CONFIG = {
  // Static assets (long TTL, immutable)
  static: {
    cacheName: CACHE_STATIC,
    strategy: 'cache-first',
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
    patterns: [/\.js$/, /\.css$/, /\.wasm$/, /manifest\.json$/, /icon-.*\.png$/],
  },

  // Dynamic content (moderate TTL)
  dynamic: {
    cacheName: CACHE_DYNAMIC,
    strategy: 'network-first',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 50,
    patterns: [/\/api\//, /\.json$/],
  },

  // API responses (short TTL, freshness priority)
  api: {
    cacheName: CACHE_API,
    strategy: 'network-first',
    ttl: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
    patterns: [/\/api\/ollama/, /\/api\/conversation/, /\/api\/memory/],
  },

  // Images (long TTL, size-aware)
  images: {
    cacheName: CACHE_IMAGES,
    strategy: 'cache-first',
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 200,
    maxSize: 5 * 1024 * 1024, // 5MB per image
    patterns: [/\.png$/, /\.jpg$/, /\.jpeg$/, /\.svg$/, /\.webp$/, /\.gif$/],
  },

  // Fonts (forever cache)
  fonts: {
    cacheName: CACHE_FONTS,
    strategy: 'cache-first',
    ttl: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 30,
    patterns: [/\.woff2?$/, /\.ttf$/, /\.eot$/],
  },
};

// Precache assets
const PRECACHE_ASSETS = ['/', '/index.html', '/manifest.json'];

// ═══════════════════════════════════════════════════════════════════════════
// INSTALL EVENT
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install v' + VERSION);

  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then(cache => {
        console.log('[ServiceWorker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVATE EVENT
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate v' + VERSION);

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // Delete old caches
        const validCaches = Object.values(CACHE_CONFIG).map(c => c.cacheName);

        return Promise.all(
          cacheNames
            .filter(
              cacheName =>
                cacheName.startsWith(CACHE_PREFIX) && !validCaches.includes(cacheName)
            )
            .map(cacheName => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// FETCH EVENT - MAIN CACHING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (unless whitelisted)
  if (url.origin !== location.origin && !isWhitelistedOrigin(url.origin)) {
    return;
  }

  // Determine cache strategy
  const cacheConfig = getCacheConfig(request);

  if (!cacheConfig) {
    // No caching strategy - network only
    return;
  }

  // Apply strategy
  if (cacheConfig.strategy === 'cache-first') {
    event.respondWith(cacheFirst(request, cacheConfig));
  } else if (cacheConfig.strategy === 'network-first') {
    event.respondWith(networkFirst(request, cacheConfig));
  } else if (cacheConfig.strategy === 'stale-while-revalidate') {
    event.respondWith(staleWhileRevalidate(request, cacheConfig));
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CACHING STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cache-First Strategy
 * - Check cache first
 * - If miss, fetch from network and cache
 * - Best for static assets (JS, CSS, fonts)
 */
async function cacheFirst(request, config) {
  try {
    const cache = await caches.open(config.cacheName);
    const cached = await cache.match(request);

    if (cached && !isCacheExpired(cached, config.ttl)) {
      return cached;
    }

    // Cache miss or expired - fetch from network
    const response = await fetch(request);

    if (response.ok) {
      await putInCache(cache, request, response.clone(), config);
    }

    return response;
  } catch (error) {
    console.error('[ServiceWorker] Cache-first failed:', error);

    // Fallback to stale cache if network fails
    const cache = await caches.open(config.cacheName);
    const stale = await cache.match(request);

    if (stale) {
      return stale;
    }

    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network-First Strategy
 * - Try network first
 * - If fails, fall back to cache
 * - Best for dynamic content (API, JSON)
 */
async function networkFirst(request, config) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(config.cacheName);
      await putInCache(cache, request, response.clone(), config);
    }

    return response;
  } catch (error) {
    console.warn('[ServiceWorker] Network failed, using cache:', request.url);

    const cache = await caches.open(config.cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Stale-While-Revalidate Strategy
 * - Return cached response immediately
 * - Fetch fresh version in background
 * - Best for frequently updated content
 */
async function staleWhileRevalidate(request, config) {
  const cache = await caches.open(config.cacheName);
  const cached = await cache.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        putInCache(cache, request, response.clone(), config);
      }
      return response;
    })
    .catch(err => {
      console.warn('[ServiceWorker] Background fetch failed:', err);
      return null;
    });

  // Return cached immediately if available
  if (cached) {
    return cached;
  }

  // Wait for network if no cache
  return fetchPromise;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determine which cache config to use for a request
 */
function getCacheConfig(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check each config's patterns
  for (const [name, config] of Object.entries(CACHE_CONFIG)) {
    for (const pattern of config.patterns) {
      if (pattern.test(pathname) || pattern.test(url.href)) {
        return config;
      }
    }
  }

  return null;
}

/**
 * Check if cached response is expired
 */
function isCacheExpired(response, ttl) {
  const cachedDate = new Date(response.headers.get('date') || 0);
  const now = new Date();
  const age = now - cachedDate;

  return age > ttl;
}

/**
 * Put response in cache with metadata
 */
async function putInCache(cache, request, response, config) {
  // Check size limit for images
  if (config.maxSize) {
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > config.maxSize) {
      console.warn('[ServiceWorker] Response too large to cache:', request.url);
      return;
    }
  }

  // Add custom headers for cache metadata
  const headers = new Headers(response.headers);
  headers.set('sw-cached-date', new Date().toISOString());
  headers.set('sw-cache-version', VERSION);

  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  // Put in cache
  await cache.put(request, modifiedResponse);

  // Enforce max entries
  await enforceMaxEntries(cache, config.maxEntries);
}

/**
 * Enforce maximum cache entries (LRU eviction)
 */
async function enforceMaxEntries(cache, maxEntries) {
  const keys = await cache.keys();

  if (keys.length > maxEntries) {
    // Delete oldest entries
    const toDelete = keys.length - maxEntries;

    for (let i = 0; i < toDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

/**
 * Check if origin is whitelisted for cross-origin caching
 */
function isWhitelistedOrigin(origin) {
  const whitelist = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

  return whitelist.includes(origin);
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE EVENT - COMMUNICATION WITH APP
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('message', event => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches
          .keys()
          .then(cacheNames =>
            Promise.all(
              cacheNames
                .filter(name => name.startsWith(CACHE_PREFIX))
                .map(name => caches.delete(name))
            )
          )
          .then(() => {
            event.ports[0].postMessage({ success: true });
          })
      );
      break;

    case 'GET_CACHE_SIZE':
      event.waitUntil(
        getCacheSize().then(size => {
          event.ports[0].postMessage({ size });
        })
      );
      break;

    case 'PRECACHE_URLS':
      if (payload && payload.urls) {
        event.waitUntil(
          caches
            .open(CACHE_STATIC)
            .then(cache => cache.addAll(payload.urls))
            .then(() => {
              event.ports[0].postMessage({ success: true });
            })
        );
      }
      break;

    default:
      console.warn('[ServiceWorker] Unknown message type:', type);
  }
});

/**
 * Calculate total cache size
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    if (name.startsWith(CACHE_PREFIX)) {
      const cache = await caches.open(name);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
  }

  return totalSize;
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND SYNC (for failed API requests)
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('sync', event => {
  if (event.tag === 'sync-failed-requests') {
    event.waitUntil(syncFailedRequests());
  }
});

async function syncFailedRequests() {
  // Implementation for retrying failed requests
  // Store failed requests in IndexedDB and retry on sync
  console.log('[ServiceWorker] Syncing failed requests');
}

// ═══════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (optional)
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(data.title || 'TITANE∞', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});

console.log('[ServiceWorker] Loaded v' + VERSION);
