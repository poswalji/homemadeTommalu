import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebase.config';
import { authApi } from '@/services/api/auth.api';
import { notificationsApi } from '@/services/api/notifications.api';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

// Module-level singleton state to prevent duplicate listeners across multiple component instances
let isGlobalMessageListenerAttached = false;
const recentPushes = new Map<string, number>();

function setupGlobalForegroundMessageListener() {
  if (isGlobalMessageListenerAttached || !messaging) return;
  isGlobalMessageListenerAttached = true;

  onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message received:', payload);

    const title = payload.notification?.title || payload.data?.title || 'Tommalu Notification';
    const body = payload.notification?.body || payload.data?.body || payload.data?.message || '';
    const orderId = payload.data?.orderId || payload.data?.relatedId || '';
    const dedupeKey = String(orderId || `${title}-${body}`);

    // Deduplicate: ignore if same alert was received in the last 60 seconds
    const now = Date.now();
    const lastSeen = recentPushes.get(dedupeKey);
    if (lastSeen && (now - lastSeen < 60000)) {
      console.log(`[FCM] Suppressed duplicate foreground push for: ${dedupeKey}`);
      return;
    }
    recentPushes.set(dedupeKey, now);

    // If the user is on /admin pages, AdminRealtimeListener owns order ringing and rich toast
    const isOnAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isOnAdmin && (payload.data?.type === 'new_order' || orderId)) {
      console.log('[FCM] User is on /admin; AdminRealtimeListener is handling order alert');
      return;
    }

    // Play chime sound for customer
    try {
      const audio = new Audio('/notification-ring.wav');
      audio.play().catch(() => {});
    } catch (e) {
      // audio playback failure safe to ignore
    }

    // Show single toast
    toast(title, {
      id: `fcm-${dedupeKey}`,
      description: body,
      icon: '🔔',
      duration: 6000,
      position: 'top-right',
      action: payload.data?.url
        ? {
            label: 'View',
            onClick: () => {
              if (payload.data?.url) {
                window.location.href = payload.data.url;
              }
            },
          }
        : undefined,
    });

    // Desktop notification with tag to prevent duplicate stacking
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/icons/icon-192x192.png',
          tag: `order-${dedupeKey}`,
        });
      }
    } catch (e) {
      console.log('[FCM] Desktop notification display error:', e);
    }
  });
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    setupGlobalForegroundMessageListener();
  }, []);

  const requestPermissionAndGetToken = useCallback(async () => {
    if (!messaging) {
      console.warn('Firebase Messaging is not supported or initialized in this environment');
      return null;
    }

    setIsRegistering(true);
    try {
      console.log('Requesting notification permission...');
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        console.log('Notification permission granted.');
        
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BKroVyv-HpCqe5p6GVLZOOXa6AXTOL45ZUj9_eHQGN4cp_tXlKnlY0lr3JvV3Zaz6UDqZN7h1uKdaVPLDds7F2E';

        let swReg: ServiceWorkerRegistration | undefined;
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          try {
            swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js?messagingSenderId=33897793800&projectId=tommalu-553e0');
            await navigator.serviceWorker.ready;
          } catch (swErr) {
            console.warn('Service Worker registration warning:', swErr);
          }
        }

        const currentToken = await getToken(messaging, { 
          vapidKey,
          serviceWorkerRegistration: swReg
        });
        
        if (currentToken) {
          console.log('✅ FCM Token received:', currentToken.substring(0, 10) + '...');
          // Save token to backend across both endpoints for 100% redundancy
          if (user) {
            try {
              await Promise.allSettled([
                authApi.saveFcmToken(currentToken),
                notificationsApi.updateFCMToken(currentToken)
              ]);
              console.log('✅ FCM token saved to backend for user:', user._id || user.id);
            } catch (saveErr) {
              console.warn('FCM backend save warning:', saveErr);
            }
          }
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
          return null;
        }
      } else {
        console.log('Notification permission denied or dismissed.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [user]);

  // Auto-sync token if permission is already granted and user is logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && user) {
      requestPermissionAndGetToken();
    }
  }, [user, requestPermissionAndGetToken]);

  const testPush = useCallback(async () => {
    try {
      const result = await notificationsApi.testPush();
      toast.success(result.message || 'Test notification dispatched!');
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to dispatch test push';
      toast.error(msg);
      throw err;
    }
  }, []);

  return {
    permission,
    isRegistering,
    requestPermission: requestPermissionAndGetToken,
    testPush,
  };
};
