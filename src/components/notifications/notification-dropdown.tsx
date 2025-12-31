'use client';

import React from 'react';
import { X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteAll: () => void;
  onClose: () => void;
  loading?: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteAll,
  onClose,
  loading = false
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
        return '🆕';
      case 'order_confirmed':
        return '✅';
      case 'order_delivered':
        return '📦';
      case 'order_cancelled':
        return '❌';
      case 'order_status_updated':
        return '🔄';
      case 'payment_received':
        return '💰';
      case 'delivery_assigned':
        return '🚚';
      case 'delivery_started':
        return '🚗';
      case 'delivery_completed':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'bg-white hover:bg-gray-50';

    switch (type) {
      case 'order_created':
        return 'bg-blue-50 border-blue-200';
      case 'order_confirmed':
        return 'bg-green-50 border-green-200';
      case 'order_delivered':
        return 'bg-purple-50 border-purple-200';
      case 'order_cancelled':
        return 'bg-red-50 border-red-200';
      case 'delivery_assigned':
      case 'delivery_started':
        return 'bg-orange-50 border-orange-200';
      case 'delivery_completed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="absolute right-[-60px] sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-[-60px] sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteAll}
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Delete all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              title="Mark all read"
            >
              <CheckCheck className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors cursor-pointer border-b border-gray-100 ${getNotificationColor(notification.type, notification.read)
                  } ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <span className="flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-600"
            onClick={onClose}
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
};
