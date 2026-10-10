'use client';

import { useEffect, useRef } from 'react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/providers/auth-provider';

export function PushNotificationManager() {
   const { user } = useAuth();
   const { requestPermission } = usePushNotifications();
   const hasRequested = useRef(false);

   useEffect(() => {
      // Only request if user is logged in and we haven't already requested in this session
      if (user && !hasRequested.current) {
         hasRequested.current = true;
         // Give it a small delay so it doesn't block initial render
         const timer = setTimeout(() => {
            requestPermission();
         }, 3000);
         
         return () => clearTimeout(timer);
      }
   }, [user, requestPermission]);

   return null;
}
