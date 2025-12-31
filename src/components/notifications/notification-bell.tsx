'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '@/context/socket-context';
import { notificationsApi } from '@/services/api/notifications.api';
import { NotificationDropdown } from './notification-dropdown';
import { Badge } from '@/components/ui/badge';

export const NotificationBell: React.FC = () => {
  const { unreadCount, notifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load notifications from API
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationsApi.getNotifications({ limit: 10 });
        console.log(response);
        setAllNotifications(response.data?.notifications || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Merge real-time notifications with API notifications
  const mergedNotifications = [
    ...notifications,
    ...allNotifications?.filter(
      (apiNotif) => !notifications.find((n) => n.id === apiNotif.id)
    )
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.createdAt).getTime();
    const dateB = new Date(b.createdAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      // Update local state
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setAllNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationsApi.deleteAll();
      setAllNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={mergedNotifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteAll={handleDeleteAll}
          onClose={() => setIsOpen(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

