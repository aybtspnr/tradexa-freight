/// <reference lib="webworker" />

// Service Worker for Tradexa Fretes
// Provides offline caching and push notification support

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `tradexa-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `tradexa-images-${CACHE_VERSION}`;
const PAGE_CACHE = `tradexa-pages-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// ── Install: cache static assets ────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    }),
  );
});

// ── Activate: clean old caches ──────────────────────────────
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        }),
      );
    }).then(() => {
      return self.clients.claim();
    }),
  );
});

// ── Fetch: cache-first for static assets, network-first for pages ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls
  if (url.hostname.includes('supabase')) return;

  // Cache-first for static assets (CSS, JS, fonts)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      }),
    );
    return;
  }

  // Cache-first for images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          return caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      }),
    );
    return;
  }

  // Network-first for navigation (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        return caches.open(PAGE_CACHE).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      }).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match('/');
        });
      }),
    );
    return;
  }
});

// ── Push notification handling ──────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const { title, body, icon, badge, url, ...extra } = data;

  const options = {
    body: body || 'Você tem uma nova notificação do Tradexa Fretes.',
    icon: icon || '/icon-192x192.png',
    badge: badge || '/icon-96x96.png',
    data: { url: url || '/' },
    vibrate: [200, 100, 200],
    ...extra,
  };

  event.waitUntil(
    self.registration.showNotification(
      title || 'Tradexa Fretes',
      options,
    ),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  const promiseChain = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
      // Focus an existing window if one is open
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window/tab
      return self.clients.openWindow(targetUrl);
    });

  event.waitUntil(promiseChain);
});
