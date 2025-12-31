'use client';

import React from 'react';
import { useNotifications } from '@/hooks/api/use-notifications';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotifications();

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order_created': return '🆕';
            case 'order_confirmed': return '✅';
            case 'order_delivered': return '📦';
            case 'order_cancelled': return '❌';
            case 'order_status_updated': return '🔄';
            case 'payment_received': return '💰';
            case 'delivery_assigned': return '🚚';
            case 'delivery_started': return '🚗';
            case 'delivery_completed': return '✅';
            default: return '🔔';
        }
    };

    const getNotificationColor = (type: string, read: boolean) => {
        if (read) return 'bg-white';
        switch (type) {
            case 'order_created': return 'bg-blue-50 border-blue-200';
            case 'order_confirmed': return 'bg-green-50 border-green-200';
            case 'order_delivered': return 'bg-purple-50 border-purple-200';
            case 'order_cancelled': return 'bg-red-50 border-red-200';
            case 'delivery_assigned':
            case 'delivery_started': return 'bg-orange-50 border-orange-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <Spinner size="lg" />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    You have {unreadCount} unread notifications
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {notifications.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteAllNotifications()}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear All
                                </Button>
                            )}
                            {unreadCount > 0 && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => markAllAsRead()}
                                >
                                    <CheckCheck className="w-4 h-4 mr-2" />
                                    Mark All Read
                                </Button>
                            )}
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <Card className="p-12 text-center text-gray-500">
                            <div className="text-4xl mb-4">🔕</div>
                            <p className="text-lg font-medium">No notifications yet</p>
                            <p className="text-sm mt-2">We'll notify you when something happens!</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-all hover:shadow-md cursor-pointer border",
                                        getNotificationColor(notification.type, notification.read),
                                        !notification.read && "border-l-4 border-l-blue-500 shadow-sm"
                                    )}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex gap-4">
                                        <div className="text-2xl pt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className={cn(
                                                    "font-semibold text-base",
                                                    notification.read ? "text-gray-700" : "text-gray-900"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {/* Delete single notification button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
