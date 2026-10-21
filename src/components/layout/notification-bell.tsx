'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, ExternalLink, Sparkles, X, ChevronRight } from 'lucide-react';
import { useSocket } from '@/context/socket-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { notificationsApi, Notification as ApiNotification } from '@/services/api/notifications.api';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [dbNotifications, setDbNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { notifications: socketNotifications, unreadCount: socketUnread, markAllAsRead: socketMarkAllRead } = useSocket();
  const { permission, requestPermission, isRegistering } = usePushNotifications();

  // Load persistent notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationsApi.getNotifications({ limit: 30 });
      if (res.success && res.data?.notifications) {
        setDbNotifications(res.data.notifications);
      }
    } catch (err) {
      // safe fallback if not logged in
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync when socket receives a new notification
  useEffect(() => {
    if (socketNotifications.length > 0) {
      fetchNotifications();
    }
  }, [socketNotifications.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Combine and deduplicate
  const allNotifications = dbNotifications.length > 0 ? dbNotifications : (socketNotifications as any[]);
  const unreadCount = allNotifications.filter(n => !n.read).length || socketUnread;

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      socketMarkAllRead();
      setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      if (!notif.read && notif.id) {
        await notificationsApi.markAsRead(notif.id);
        setDbNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
        );
      }
    } catch (e) {
      // ignore
    }
    setIsOpen(false);

    const targetUrl = notif.metadata?.url || notif.url || (notif.type === 'order_created' ? '/customer/orders' : '/homemade');
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationsApi.deleteAll();
      setDbNotifications([]);
    } catch (e) {
      console.warn('Clear all error:', e);
    }
  };

  const getEmojiForType = (type: string, title: string = '') => {
    const lower = (type + ' ' + title).toLowerCase();
    if (lower.includes('hungry') || lower.includes('thali') || lower.includes('food') || lower.includes('meal')) return '🍛';
    if (lower.includes('order_created') || lower.includes('placed') || lower.includes('confirmed')) return '🎉';
    if (lower.includes('delivery') || lower.includes('way') || lower.includes('picked')) return '🛵';
    if (lower.includes('discount') || lower.includes('offer') || lower.includes('promo')) return '🎁';
    if (lower.includes('cancelled') || lower.includes('refund')) return '⚠️';
    return '🔔';
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className='relative inline-block text-left' ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type='button'
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className='relative p-2 rounded-xl text-stone-700 hover:text-orange-600 hover:bg-orange-50 border border-stone-200/80 transition-all duration-200 cursor-pointer shadow-2xs group flex items-center justify-center'
        aria-label='View Notifications'
        title='Notifications'>
        <Bell className={`w-5 h-5 transition-transform group-hover:scale-110 ${unreadCount > 0 ? 'text-orange-600 animate-wiggle' : 'text-stone-600'}`} />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[10px] min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-in zoom-in-75'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu (Swiggy / Zomato style) */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-[340px] sm:w-[390px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-stone-200/90 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200'>
          {/* Header */}
          <div className='p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 backdrop-blur'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold'>
                <Bell className='w-4 h-4' />
              </div>
              <div>
                <h3 className='font-black text-stone-900 text-sm leading-tight'>Notifications</h3>
                <p className='text-[11px] text-stone-500'>
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              {unreadCount > 0 && (
                <button
                  type='button'
                  onClick={handleMarkAllRead}
                  className='text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-100/60 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer'
                  title='Mark all as read'>
                  <CheckCheck className='w-3.5 h-3.5' /> Mark Read
                </button>
              )}
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200/50 transition-colors'>
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Push Permission Prompt if not enabled yet */}
          {permission !== 'granted' && (
            <div className='bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-3 border-b border-orange-100 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2.5'>
                <span className='text-lg'>🔔</span>
                <div>
                  <p className='text-xs font-black text-orange-950 leading-tight'>Turn on Push Alerts</p>
                  <p className='text-[11px] text-orange-800/80'>Get live meal updates & ₹99 deals</p>
                </div>
              </div>
              <button
                type='button'
                onClick={async () => {
                  await requestPermission();
                }}
                disabled={isRegistering}
                className='bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50'>
                {isRegistering ? 'Allowing...' : 'Enable'}
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className='max-h-[380px] overflow-y-auto divide-y divide-stone-100/80 overscroll-contain'>
            {isLoading && allNotifications.length === 0 ? (
              <div className='p-8 text-center text-stone-400 text-xs'>
                <div className='w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2' />
                Loading alerts...
              </div>
            ) : allNotifications.length === 0 ? (
              <div className='p-8 text-center'>
                <div className='w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs'>
                  <Sparkles className='w-6 h-6' />
                </div>
                <h4 className='text-xs font-black text-stone-800'>No Notifications Yet</h4>
                <p className='text-[11px] text-stone-500 mt-1 max-w-[220px] mx-auto'>
                  We’ll notify you here when your meals are prepared or when special ₹99 offers go live!
                </p>
              </div>
            ) : (
              allNotifications.map((notif: any) => {
                const isUnread = !notif.read;
                const emoji = getEmojiForType(notif.type, notif.title);
                return (
                  <div
                    key={notif._id || notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer group hover:bg-orange-50/60 ${
                      isUnread ? 'bg-orange-50/30' : 'bg-white'
                    }`}>
                    {/* Emoji Avatar */}
                    <div className='w-10 h-10 rounded-2xl bg-stone-100 group-hover:bg-orange-100 flex items-center justify-center text-lg shrink-0 transition-colors shadow-2xs'>
                      {emoji}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-1'>
                        <h5 className={`text-xs font-black leading-snug line-clamp-1 ${isUnread ? 'text-stone-950 font-black' : 'text-stone-700'}`}>
                          {notif.title}
                        </h5>
                        {isUnread && (
                          <span className='w-2 h-2 rounded-full bg-orange-500 shrink-0 ring-2 ring-orange-200' />
                        )}
                      </div>
                      <p className='text-xs text-stone-600 mt-0.5 line-clamp-2 leading-relaxed'>
                        {notif.message}
                      </p>
                      <div className='flex items-center justify-between mt-2 pt-1 text-[10px] text-stone-400 font-semibold'>
                        <span>{formatTime(notif.createdAt)}</span>
                        <span className='text-orange-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-bold'>
                          Open <ChevronRight className='w-3 h-3' />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {allNotifications.length > 0 && (
            <div className='p-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs px-3'>
              <span className='text-[11px] text-stone-500 font-medium'>
                {allNotifications.length} notification{allNotifications.length > 1 ? 's' : ''}
              </span>
              <button
                type='button'
                onClick={handleClearAll}
                className='text-stone-400 hover:text-red-600 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-stone-200/50'>
                <Trash2 className='w-3 h-3' /> Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
