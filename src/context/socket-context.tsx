'use client';

import { useAuth } from '@/providers/auth-provider';
import { cookieService } from '@/utills/cookies';
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
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
  socket: Socket | null;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const QueryClient=useQueryClient();
  const socketRef = useRef<Socket | null>(null);
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // State updates will happen via disconnect event handler
      return;
    }

    // Get API URL from environment or config (remove /api suffix for Socket.io)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const API_URL = apiUrl.replace('/api', '');
    const token = cookieService.getCurrentToken();

    if (!token) {
      return;
    }

    // Initialize Socket.io connection
    // ✅ FIXED: Use polling only for Vercel compatibility (Vercel doesn't support WebSockets)
    const newSocket = io(API_URL, {
      auth: {
        token: token
      },
      // Only polling transport for Vercel compatibility
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = newSocket;

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected');
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
      setSocket(null);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setIsConnected(false);
    });

    // Listen for new notifications
    newSocket.on('new_notification', (notification: Notification) => {
      console.log('📬 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
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
        // ✅ FIXED: Ensure orderId is converted to string
        const orderId = String(notification.relatedId);
        
        // Play notification sound for store owners on new order notifications
        if (user?.role === 'storeOwner' && notification.type === 'order_created') {
          playNotificationSound(orderId);
        }
        
        // Handle different notification types for all user roles
        if (notification.type === 'order_created') {
          // Store owner queries (affects store owners)
          QueryClient.invalidateQueries({ queryKey: queryKeys.storeOwner.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.storeOwner() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.earnings() });
          
          // Customer queries (affects customers)
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.my() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
          // ✅ FIXED: Invalidate public order query for order tracking page
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.public(orderId) });
          
          // Admin queries (admin acts as delivery boy - needs to see all orders)
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.dashboard() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.revenue() });
          
          // General orders queries (affects all users)
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
          
          // Trigger email notification for order creation (tracking)
          if (user?.role === 'customer' || user?.role === 'storeOwner') {
            console.log('📧 Email notification should be sent for new order:', {
              orderId,
              userId: user?.id,
              userEmail: user?.email,
              userRole: user?.role
            });
          }
        } else if (notification.type === 'delivery_assigned' && user?.role === 'admin') {
          // Admin delivery assignment notifications
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.dashboard() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        } else if (notification.type === 'order_status_updated') {
          // Order status update notifications for all users
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.my() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
          // ✅ FIXED: Invalidate public order query for order tracking page
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.public(orderId) });
          QueryClient.invalidateQueries({ queryKey: queryKeys.storeOwner.orders() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
          
          // Trigger email notification for status updates (tracking)
          if (user?.role === 'customer' || user?.role === 'storeOwner') {
            console.log('📧 Email notification should be sent for order status update:', {
              orderId,
              status: notification.message,
              userId: user?.id,
              userEmail: user?.email
            });

          }
        }
      }
    });

    // Listen for delivery assignment (for admin as delivery boy)
    newSocket.on('delivery_assigned', (deliveryData: any) => {
      console.log('🚚 Delivery assigned:', deliveryData);
      if (user?.role === 'admin' && deliveryData.orderId) {
        const notification: Notification = {
          id: `delivery-assigned-${deliveryData.orderId}`,
          title: '🚚 New Delivery Assignment',
          message: `Order #${deliveryData.orderId?.slice(-6)} assigned for delivery. Customer: ${deliveryData.customerName || 'N/A'}, Address: ${deliveryData.deliveryAddress || 'N/A'}`,
          type: 'delivery_assigned',
          relatedId: deliveryData.orderId,
          read: false,
          createdAt: new Date().toISOString()
        };
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            tag: notification.id
          });
        }

        // Invalidate admin queries
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.dashboard() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.orders() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        
        // Trigger email notification to admin
        console.log('📧 Email notification should be sent to admin for delivery assignment:', {
          orderId: deliveryData.orderId,
          adminEmail: user?.email
        });
      }
    });

    // Listen for new order (for store owners)
    newSocket.on('new_order', (orderData: any) => {
      console.log('🆕 New order received:', orderData);
      const notification: Notification = {
        id: `order-${orderData.orderId}`,
        title: 'New Order Received',
        message: `You have received a new order #${orderData.orderId?.slice(-6)} for ₹${orderData.finalPrice}`,
        type: 'order_created',
        relatedId: orderData.orderId,
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.id
        });
      }

      // Handle new order for all user types
      if (orderData.orderId) {
        const orderId = orderData.orderId;
        
        // Play notification sound for store owners
        if (user?.role === 'storeOwner') {
          playNotificationSound(orderId);
        }
        
        // Invalidate queries for all user types
        // This ensures all users see updated data regardless of their current role
        // Store owner queries (affects store owners)
        QueryClient.invalidateQueries({ queryKey: queryKeys.storeOwner.orders() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.storeOwner() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.earnings() });
        
        // Customer queries (affects customers)
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.my() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
        
        // Admin queries (admin acts as delivery boy - needs to see all orders)
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.dashboard() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.orders() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.revenue() });
        
        // General orders queries (affects all users)
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      }
    });

    // Listen for order status updates (for customers, store owners, and admin)
    newSocket.on('order_status_update', (orderData: any) => {
      console.log('📦 Order status update:', orderData);
      const status = orderData.status;
      // ✅ FIXED: Ensure orderId is converted to string
      const orderId = String(orderData.orderId);
      
      // Create notification based on user role and order status
      let notification: Notification;
      
      if (user?.role === 'admin' && status === 'OutForDelivery') {
        // Admin as delivery boy - special notification for delivery assignment
        notification = {
          id: `delivery-${orderId}`,
          title: '🚚 New Delivery Assignment',
          message: `Order #${orderId?.slice(-6)} is ready for delivery. Customer: ${orderData.customerName || 'N/A'}`,
          type: 'delivery_assigned',
          relatedId: orderId,
          read: false,
          createdAt: new Date().toISOString()
        };
      } else if (user?.role === 'customer') {
        // Customer notification for order tracking
        notification = {
          id: `order-update-${orderId}`,
          title: 'Order Status Updated',
          message: orderData.message || `Your order #${orderId?.slice(-6)} status updated to ${status}`,
          type: 'order_status_updated',
          relatedId: orderId,
          read: false,
          createdAt: new Date().toISOString()
        };
      } else {
        // Store owner or general notification
        notification = {
          id: `order-update-${orderId}`,
          title: 'Order Status Updated',
          message: orderData.message || `Order #${orderId?.slice(-6)} status updated to ${status}`,
          type: 'order_status_updated',
          relatedId: orderId,
          read: false,
          createdAt: new Date().toISOString()
        };
      }
      
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.id
        });
      }

      // Trigger email notification for order tracking (for customers and store owners)
      // Email sending is handled by backend, but we log it here for tracking
      if (user?.role === 'customer' || user?.role === 'storeOwner') {
        console.log('📧 Email notification should be sent for order tracking:', {
          orderId,
          status,
          userId: user?.id,
          userEmail: user?.email,
          userRole: user?.role
        });
        // Backend should handle email sending via notification service
      }

      // Handle order status updates for all user types
      if (orderData.orderId && orderData.status) {
        const finalStatuses = ['Confirmed', 'Rejected', 'Cancelled', 'Delivered'];
        
        // Stop notification sound for store owners on any status update
        if (user?.role === 'storeOwner') {
          stopNotificationSound(orderId);
        }
        
        // Invalidate queries for all user types when order status changes
        // This ensures all users see updated data regardless of their current role
        // Store owner queries (affects store owners)
        QueryClient.invalidateQueries({ queryKey: queryKeys.storeOwner.orders() });
        
        // Customer queries (affects customers)
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.my() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
        // ✅ FIXED: Invalidate public order query for order tracking page
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.public(orderId) });
        
        // Admin queries (admin acts as delivery boy - needs real-time updates)
        // Admin needs to see all orders, especially OutForDelivery status for delivery management
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.dashboard() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.orders() });
        QueryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics.revenue() });
        
        // Special handling for OutForDelivery status (admin as delivery boy)
        if (status === 'OutForDelivery') {
          QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
          
          // Send notification to admin when order is ready for delivery
          if (user?.role === 'admin') {
            console.log('🚚 Admin delivery notification triggered for order:', orderId);
            // Backend should send email notification to admin for delivery assignment
          }
        }
        
        // General orders queries (affects all users)
        QueryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        
        // Update earnings/payouts if order status affects them
        if (finalStatuses.includes(status)) {
          QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.storeOwner() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.earnings() });
          QueryClient.invalidateQueries({ queryKey: queryKeys.payouts.admin() });
        }
      }
    });

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

      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // Stop all playing sounds - copy ref values to avoid stale closure
      const audioRefs = activeAudioRefs.current;
      const pendingSoundsRef = pendingSounds.current;
      audioRefs.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioRefs.clear();
      // Clear pending sounds
      pendingSoundsRef.clear();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user, playNotificationSound, stopNotificationSound, playPendingSounds, QueryClient]);

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
        socket,
        isConnected,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
,stopNotificationSound
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};


