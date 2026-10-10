import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebase.config';
import { authApi } from '@/services/api/auth.api';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!messaging || !user) return;

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // Optional: Show a custom toast when app is open
      toast(payload.notification?.title || 'New Notification', {
        description: payload.notification?.body,
        icon: '🔔',
        duration: 5000,
        position: 'top-right',
        action: payload.data?.url ? {
          label: 'View',
          onClick: () => {
            if (payload.data && payload.data.url) {
                window.location.href = payload.data.url;
            }
          }
        } : undefined
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const requestPermissionAndGetToken = async () => {
    if (!messaging) {
      console.warn('Firebase Messaging is not supported or initialized');
      return null;
    }

    try {
      console.log('Requesting notification permission...');
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        console.log('Notification permission granted.');
        
        // Replace with your VAPID key
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        
        if (!vapidKey) {
          console.warn('VAPID key not found in environment variables');
        }

        const currentToken = await getToken(messaging, { vapidKey });
        
        if (currentToken) {
          console.log('FCM Token received:', currentToken.substring(0, 10) + '...');
          // Save token to backend
          if (user) {
            await authApi.saveFcmToken(currentToken);
            console.log('FCM token saved to backend');
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
    }
  };

  return {
    permission,
    requestPermission: requestPermissionAndGetToken,
  };
};
