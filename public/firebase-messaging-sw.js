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
  messagingSenderId: self.location.search.match(/messagingSenderId=([^&]+)/)?.[1] || "3389779380",
  appId: self.location.search.match(/appId=([^&]+)/)?.[1] || "1:33897793800:web:8e9ad37b4ee7f341bc44bd"
};

try {
  // Try to initialize firebase, but we don't have the config here easily since it's an SW.
  // Instead, the best practice is to pass it via query params when registering the SW, or hardcode it.
  // However, `messagingSenderId` is often enough to just receive messages if we initialize properly.
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/logo.png', // Add a logo.png in public folder
      badge: '/logo.png',
      data: payload.data
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
