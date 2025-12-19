// Healink PWA Service Worker
// Version: 1.0.0

const CACHE_VERSION = 'healink-v1';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old cache versions
              return name.startsWith('healink-') && name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== IMAGES_CACHE;
            })
            .map((name) => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip Firebase and external API calls (always use network)
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('emailjs.com')
  ) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Image caching strategy: Cache-first
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGES_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              return fetch(request)
                .then((networkResponse) => {
                  // Cache successful responses
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // Return placeholder image on failure
                  return new Response(
                    '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3f4f6"/><text x="200" y="200" font-size="24" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">Image unavailable</text></svg>',
                    { headers: { 'Content-Type': 'image/svg+xml' } }
                  );
                });
            });
        })
    );
    return;
  }
  
  // Static assets: Cache-first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                return caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                  });
              }
              return networkResponse;
            });
        })
    );
    return;
  }
  
  // HTML pages: Network-first with cache fallback
  if (request.destination === 'document' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Update cache with latest version
          if (networkResponse && networkResponse.status === 200) {
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, networkResponse.clone());
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Try cache if network fails
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return offline fallback page
              return caches.match('/')
                .then((fallback) => {
                  if (fallback) {
                    return fallback;
                  }
                  
                  // Ultimate fallback: simple HTML
                  return new Response(
                    `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Healink - Offline</title>
                      <style>
                        body {
                          font-family: system-ui, -apple-system, sans-serif;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          min-height: 100vh;
                          margin: 0;
                          background: #0F172A;
                          color: white;
                          text-align: center;
                          padding: 20px;
                        }
                        .container {
                          max-width: 400px;
                        }
                        h1 {
                          font-size: 3rem;
                          margin: 0 0 1rem 0;
                        }
                        p {
                          font-size: 1.125rem;
                          color: #94a3b8;
                          margin: 0.5rem 0;
                        }
                        .icon {
                          font-size: 4rem;
                          margin-bottom: 1rem;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="icon">📡</div>
                        <h1>You're Offline</h1>
                        <p>Healink needs an internet connection to work properly.</p>
                        <p>Please check your connection and try again.</p>
                      </div>
                    </body>
                    </html>`,
                    {
                      headers: {
                        'Content-Type': 'text/html',
                        'Cache-Control': 'no-store'
                      }
                    }
                  );
                });
            });
        })
    );
    return;
  }
  
  // Default: Network-first
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((name) => caches.delete(name))
          );
        })
        .then(() => {
          console.log('[Service Worker] All caches cleared');
        })
    );
  }
});

console.log('[Service Worker] Script loaded');
