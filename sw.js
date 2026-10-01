const CACHE_NAME = 'oportulab-v6';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/pwa.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/oportulab-logo.jpeg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // No permitir que un recurso puntual impida instalar todo el Service Worker.
      await Promise.allSettled(
        APP_SHELL.map(url => cache.add(new Request(url, { cache: 'reload' })))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('oportulab-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const offlineResponse = () =>
  new Response(
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b2f63"><title>OportuLab sin conexión</title></head><body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#f7f9fc;color:#0b2f63;display:grid;place-items:center;min-height:100dvh;padding:24px;box-sizing:border-box"><main style="max-width:420px;text-align:center;background:#fff;padding:28px;border-radius:22px;border:1px solid #e4eaf2"><h1 style="margin-top:0">Sin conexión</h1><p>OportuLab necesita internet para actualizar algunos contenidos. Revisá tu conexión y volvé a intentar.</p><button onclick="location.reload()" style="border:0;border-radius:12px;background:#0b2f63;color:#fff;padding:14px 20px;font-weight:700">Reintentar</button></main></body></html>',
    {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }
  );

const networkFirst = async request => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
};

const staleWhileRevalidate = async request => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || networkPromise;
};

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.headers.has('range')) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/', response.clone());
          }
          return response;
        } catch {
          return (await caches.match('/')) || offlineResponse();
        }
      })()
    );
    return;
  }

  if (
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/pwa.js'
  ) {
    event.respondWith(networkFirst(request).then(response => response || caches.match(request)));
    return;
  }

  if (
    url.pathname.startsWith('/icons/') ||
    /\.(?:png|jpe?g|svg|webp|gif|ico|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
