'use client';

import { useAuth } from '@/providers/auth-provider';
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { ref, onValue, off, query, orderByChild, limitToLast, DatabaseReference } from 'firebase/database';
import { db } from '@/config/firebase.config';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/query.config';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

interface SocketContextType {
  socket: null; // Kept for backward compatibility, but always null now
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  stopNotificationSound: (orderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const QueryClient = useQueryClient();
  const userNotificationRef = useRef<DatabaseReference | null>(null);
  const roleNotificationRef = useRef<DatabaseReference | null>(null);
  // Track active audio elements for each order
  const activeAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  // Track pending sounds that couldn't play due to autoplay restrictions
  const pendingSounds = useRef<Set<string>>(new Set());
  // Track if user has interacted with the page
  const hasUserInteracted = useRef(false);

  // Function to play notification sound for a specific order
  const playNotificationSound = useCallback((orderId: string, forcePlay = false) => {
    // Stop any existing sound for this order
    const existingAudio = activeAudioRefs.current.get(orderId);
    if (existingAudio) {
      existingAudio.pause();
      existingAudio.currentTime = 0;
      activeAudioRefs.current.delete(orderId);
    }

    try {
      // Use the audio file from assets folder
      const audio = new Audio('/notification-ring.wav');
      audio.loop = true; // Loop until stopped
      audio.volume = 0.7; // Set volume to 70%
      
      // Store the audio element for this order
      activeAudioRefs.current.set(orderId, audio);
      
      // Try to play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Sound started playing successfully
            pendingSounds.current.delete(orderId);
          })
          .catch((error) => {
            // Autoplay was prevented
            if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
              if (forcePlay) {
                // We're forcing play after user interaction - if it still fails, log error
                console.error('Error playing notification sound after user interaction:', error);
              } else {
                // Normal autoplay attempt that was blocked - queue it for later
                pendingSounds.current.add(orderId);
                console.log('Audio autoplay blocked. Sound will play on next user interaction.');
              }
            } else {
              // Other error
              console.error('Error playing notification sound:', error);
            }
          });
      }
    } catch (error) {
      console.error('Error creating audio element:', error);
    }
  }, []);

  // Function to play all pending sounds (called after user interaction)
  const playPendingSounds = useCallback(() => {
    if (pendingSounds.current.size > 0) {
      const orderIds = Array.from(pendingSounds.current);
      orderIds.forEach((orderId) => {
        playNotificationSound(orderId, true);
      });
    }
  }, [playNotificationSound]);

  // Function to stop notification sound for a specific order
  const stopNotificationSound = useCallback((orderId: string) => {
    const audio = activeAudioRefs.current.get(orderId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      activeAudioRefs.current.delete(orderId);
    }
    // Also remove from pending sounds
    pendingSounds.current.delete(orderId);
  }, []);

  // Process notification from Firebase
  const processNotification = useCallback((snapshot: any, userId: string, userRole: string) => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    const notificationKey = snapshot.key;
    
    // Handle both single notification and object of notifications
    let notificationsToProcess: any[] = [];
    
    if (data.event && data.data) {
      // Single notification object
      notificationsToProcess = [{
        key: notificationKey,
        event: data.event,
        data: data.data,
        timestamp: data.timestamp
      }];
    } else {
      // Object of notifications (multiple)
      notificationsToProcess = Object.entries(data).map(([key, value]: [string, any]) => ({
        key,
        event: value.event,
        data: value.data,
        timestamp: value.timestamp
      }));
    }

    notificationsToProcess.forEach((notif) => {
      const { event, data: notificationData } = notif;
      
      // Convert Firebase notification to app notification format
      let notification: Notification;
      
      if (event === 'new_notification') {
        // Direct notification format
        notification = {
          id: notificationData.id || notif.key,
          title: notificationData.title || 'Notification',
          message: notificationData.message || '',
          type: notificationData.type || 'general',
          relatedId: notificationData.relatedId,
          read: notificationData.read || false,
          createdAt: notificationData.createdAt || new Date().toISOString()
        };
      } else if (event === 'new_order') {
        notification = {
          id: `order-${notificationData.orderId}`,
          title: 'New Order Received',
          message: `You have received a new order #${notificationData.orderId?.slice(-6)} for ₹${notificationData.finalPrice}`,
          type: 'order_created',
          relatedId: notificationData.orderId,
          read: false,
          createdAt: notificationData.createdAt || new Date().toISOString()
        };
      } else if (event === 'order_status_update') {
        notification = {
          id: `order-update-${notificationData.orderId}`,
          title: 'Order Status Updated',
          message: notificationData.message || `Order #${notificationData.orderId?.slice(-6)} status updated to ${notificationData.status}`,
          type: 'order_status_updated',
          relatedId: notificationData.orderId,
          read: false,
          createdAt: new Date().toISOString()
        };
      } else if (event === 'delivery_assigned') {
        notification = {
          id: `delivery-assigned-${notificationData.orderId}`,
          title: '🚚 New Delivery Assignment',
          message: `Order #${notificationData.orderId?.slice(-6)} assigned for delivery. Customer: ${notificationData.customerName || 'N/A'}`,
          type: 'delivery_assigned',
          relatedId: notificationData.orderId,
          read: false,
          createdAt: new Date().toISOString()
        };
      } else {
        // Generic notification
        notification = {
          id: notif.key,
          title: notificationData.title || 'Notification',
          message: notificationData.message || '',
          type: event,
          relatedId: notificationData.relatedId || notificationData.orderId,
          read: false,
          createdAt: new Date(notif.timestamp).toISOString()
        };
      }

      // Add notification to state
      setNotifications((prev) => {
        // Check if notification already exists
        const exists = prev.some(n => n.id === notification.id);
        if (exists) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.id
        });
      }

      // Handle notifications for all user types
      if (notification.relatedId) {
        const orderId = String(notification.relatedId);
        
        // Play notification sound for store owners on new order notifications
        if (userRole === 'storeOwner' && notification.type === 'order_created') {
          playNotificationSound(orderId);
        }
        
        // Handle different notification types for all user roles
        if (notification.type === 'order_created') {
          // Store owner queries
          QueryClient.invalidateQueries({ queryKey: queryKeys.storeOwner.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.storeOwner() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.earnings() });
          
          // Customer queries
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.my() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.public(orderId) });
          
          // Admin queries
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.dashboard() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.revenue() });
          
          // General orders queries
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        } else if (notification.type === 'delivery_assigned' && userRole === 'admin') {
          // Admin delivery assignment notifications
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.dashboard() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        } else if (notification.type === 'order_status_updated') {
          // Order status update notifications for all users
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.my() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.public(orderId) });
          QueryClient.invalidateQueries({ queryKey: queryKeys.storeOwner.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
          
          // Stop notification sound for store owners on any status update
          if (userRole === 'storeOwner') {
            stopNotificationSound(orderId);
          }
          
          // Update earnings/payouts if order status affects them
          const finalStatuses = ['Confirmed', 'Rejected', 'Cancelled', 'Delivered'];
          if (finalStatuses.includes(notificationData.status)) {
            QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.storeOwner() });
            QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.earnings() });
            QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.admin() });
          }
        }
      }
    });
  }, [QueryClient, playNotificationSound, stopNotificationSound]);

  useEffect(() => {
    if (!isAuthenticated || !user || typeof window === 'undefined' || !db) {
      // Disconnect if not authenticated or on server
      if (userNotificationRef.current) {
        off(userNotificationRef.current);
        userNotificationRef.current = null;
      }
      if (roleNotificationRef.current) {
        off(roleNotificationRef.current);
        roleNotificationRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const userId = user.id || user._id;
    const userRole = user.role;

    if (!userId) {
      return;
    }

    try {
      // Listen to user-specific notifications
      const userNotificationsPath = `notifications/user:${userId}`;
      userNotificationRef.current = query(
        ref(db, userNotificationsPath),
        orderByChild('timestamp'),
        limitToLast(50)
      );

      const userUnsubscribe = onValue(
        userNotificationRef.current,
        (snapshot) => {
          setIsConnected(true);
          processNotification(snapshot, userId, userRole);
        },
        (error) => {
          console.error('Firebase user notification error:', error);
          setIsConnected(false);
        }
      );

      // Listen to role-specific notifications
      const roleNotificationsPath = `notifications/role:${userRole}`;
      roleNotificationRef.current = query(
        ref(db, roleNotificationsPath),
        orderByChild('timestamp'),
        limitToLast(50)
      );

      const roleUnsubscribe = onValue(
        roleNotificationRef.current,
        (snapshot) => {
          setIsConnected(true);
          processNotification(snapshot, userId, userRole);
        },
        (error) => {
          console.error('Firebase role notification error:', error);
          setIsConnected(false);
        }
      );

      // Request notification permission on mount
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Set up user interaction listeners to enable audio playback
      const handleUserInteraction = () => {
        if (!hasUserInteracted.current) {
          hasUserInteracted.current = true;
          // Try to play any pending sounds
          playPendingSounds();
        }
      };

      // Listen for various user interactions
      const events = ['click', 'keydown', 'touchstart', 'mousedown'];
      events.forEach((event) => {
        document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
      });

      // Cleanup on unmount or dependency change
      return () => {
        // Cleanup interaction listeners
        events.forEach((event) => {
          document.removeEventListener(event, handleUserInteraction);
        });

        // Unsubscribe from Firebase listeners
        if (userNotificationRef.current) {
          off(userNotificationRef.current);
          userNotificationRef.current = null;
        }
        if (roleNotificationRef.current) {
          off(roleNotificationRef.current);
          roleNotificationRef.current = null;
        }

        // Stop all playing sounds
        const audioRefs = activeAudioRefs.current;
        const pendingSoundsRef = pendingSounds.current;
        audioRefs.forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
        audioRefs.clear();
        pendingSoundsRef.clear();
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      setIsConnected(false);
    }
  }, [isAuthenticated, user, processNotification, playPendingSounds]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: null, // Kept for backward compatibility
        isConnected,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        stopNotificationSound
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
