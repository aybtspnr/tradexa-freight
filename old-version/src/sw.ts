/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const clients: Clients;

// Precache all built assets (manifest injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);

// ── Cache-first for CSS, JS, and font assets ──────────────────────
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
);

// ── Cache-first for images (including app icons) ──────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
);

// ── Cache-first for documents / navigation requests (HTML shell) ──
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new CacheFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// ── Push notification handling ────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const { title, body, icon, badge, url, ...extra } = data;

  const options: NotificationOptions = {
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

  const promiseChain = clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
      // Focus an existing window if one is open
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window/tab
      return clients.openWindow(targetUrl);
    });

  event.waitUntil(promiseChain);
});
