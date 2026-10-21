// firebase.config.ts - Firebase configuration for frontend
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getMessaging, Messaging } from 'firebase/messaging';

// Sanitize sender ID: guard against any typo (missing trailing '0')
const rawSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const messagingSenderId = (!rawSenderId || rawSenderId === '3389779380') 
  ? '33897793800' 
  : rawSenderId;

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBTtTW6g02fKfjm0xaO4PJyUYF0ax-Gr4c',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'tommalu-553e0.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://tommalu-553e0-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tommalu-553e0',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'tommalu-553e0.firebasestorage.app',
  messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:33897793800:web:8e9ad37b4ee7f341bc44bd'
};

// Initialize Firebase
let app: FirebaseApp;
let db: Database;
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  // Only initialize on client side
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getDatabase(app);
  
  // Messaging only works in supported browsers
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging not supported in this browser.', error);
  }
}

export { app, db, messaging };

