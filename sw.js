// Service Worker for Jolong Enterprises PWA

const CACHE_NAME = 'jolong-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/bar-restaurant.html',
  '/apartments.html',
  '/transportation.html',
  '/warehouse.html',
  '/farming.html',
  '/ferry.html',
  '/dashboard.html',
  '/user-dashboard.html',
  '/css/style.css',
  '/js/main.js',
  '/logo.png',
  '/assets/icons/icon-192x192.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update cache
self.addEventListener('activate', event => {
  const cacheWhitelist = ['jolong-cache-v1'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    const url = event.notification.data.url;
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

console.log('📱 Jolong Enterprises PWA - Service Worker Active');
