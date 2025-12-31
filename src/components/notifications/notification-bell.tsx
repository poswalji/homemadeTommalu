'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/api/use-notifications';
import { NotificationDropdown } from './notification-dropdown';
import { Badge } from '@/components/ui/badge';

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications
  } = useNotifications();

  // Track previous notifications to detect new ones
  const [prevNotifications, setPrevNotifications] = React.useState<any[]>([]);
  const isFirstLoad = React.useRef(true);

  React.useEffect(() => {
    if (isLoading) return;

    // Skip toast on first load
    if (isFirstLoad.current) {
      if (notifications.length > 0) {
        setPrevNotifications(notifications);
      }
      isFirstLoad.current = false;
      return;
    }

    // Find new notifications
    const newNotifications = notifications.filter(
      current => !prevNotifications.find(prev => prev.id === current.id)
    );

    if (newNotifications.length > 0) {
      newNotifications.forEach(notif => {
        // Show toast for new notification
        import('sonner').then(({ toast }) => {
          toast.success(notif.title, {
            description: notif.message,
            duration: 5000,
          });
        });
      });
      setPrevNotifications(notifications);
    }
  }, [notifications, isLoading, prevNotifications]);

  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
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
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteAll={deleteAllNotifications}
          onClose={() => setIsOpen(false)}
          loading={isLoading}
        />
      )}
    </div>
  );
};

