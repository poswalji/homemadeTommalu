import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebase.config';
import { authApi } from '@/services/api/auth.api';
import { notificationsApi } from '@/services/api/notifications.api';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!messaging) return;

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);

      // Play chime sound
      try {
        const audio = new Audio('/notification-ring.wav');
        audio.play().catch(() => {});
      } catch (e) {
        // audio playback failure safe to ignore
      }

      const title = payload.notification?.title || payload.data?.title || 'Tommalu Notification';
      const body = payload.notification?.body || payload.data?.body || payload.data?.message;

      // Show toast
      toast(title, {
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

      // Also trigger browser desktop notification if permitted and window in background
      try {
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
          new Notification(title, {
            body: body,
            icon: '/icons/icon-192x192.png',
          });
        }
      } catch (e) {
        console.log('[FCM] Desktop notification display error:', e);
      }
    });

    return () => {
      unsubscribe();
    };
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
        
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.warn('VAPID key not found in environment variables');
        }

        let swReg: ServiceWorkerRegistration | undefined;
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          try {
            swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
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
