// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: self.location.search.match(/apiKey=([^&]+)/)?.[1] || "AIzaSyBTtTW6g02fKfjm0xaO4PJyUYF0ax-Gr4c",
  authDomain: self.location.search.match(/authDomain=([^&]+)/)?.[1] || "tommalu-553e0.firebaseapp.com",
  projectId: self.location.search.match(/projectId=([^&]+)/)?.[1] || "tommalu-553e0",
  storageBucket: self.location.search.match(/storageBucket=([^&]+)/)?.[1] || "tommalu-553e0.firebasestorage.app",
  messagingSenderId: self.location.search.match(/messagingSenderId=([^&]+)/)?.[1] || "33897793800",
  appId: self.location.search.match(/appId=([^&]+)/)?.[1] || "1:33897793800:web:8e9ad37b4ee7f341bc44bd"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Tommalu Notification';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || payload.data?.message || 'You have a new update.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: payload.data?.orderId || 'tommalu-alert',
      renotify: true,
      data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log("Failed to initialize Firebase Messaging SW", e);
}

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// --- PWA Lifecycle & Offline Caching ---
const CACHE_NAME = 'tommalu-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/homemade',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/apple-touch-icon.png',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.log('[SW] Pre-caching partial fail (safe to ignore)', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Avoid intercepting API calls, socket, or chrome-extension requests
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/homemade') || caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
