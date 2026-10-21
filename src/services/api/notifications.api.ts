// notifications.api.ts
import axios from '@/lib/axios';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  relatedModel?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
  };
}

export const notificationsApi = {
  // Get user notifications
  getNotifications: async (params?: {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationResponse> => {
    const response = await axios.get('/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; data: { unreadCount: number } }> => {
    const response = await axios.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<{ success: boolean; message: string; data: Notification }> => {
    const response = await axios.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean; message: string; data: { modifiedCount: number } }> => {
    const response = await axios.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<{ success: boolean; message: string; data: Notification }> => {
    const response = await axios.delete(`/notifications/${id}`);
    return response.data;
  },

  // Delete all notifications
  deleteAll: async (): Promise<{ success: boolean; message: string; data: { deletedCount: number } }> => {
    const response = await axios.delete('/notifications');
    return response.data;
  },

  // Update FCM token
  updateFCMToken: async (fcmToken: string): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await axios.post('/notifications/fcm-token', { fcmToken });
    return response.data;
  },

  // Test Push Notification
  testPush: async (): Promise<{ success: boolean; message: string; tokensCount: number }> => {
    const response = await axios.post('/notifications/test-push');
    return response.data;
  },

  // Broadcast Notification (Admin sends to customers / all users)
  broadcast: async (data: {
    title: string;
    message: string;
    url?: string;
    targetRole?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      targetedUsers: number;
      deviceTokensTargeted: number;
      pushDelivered: number;
      pushFailed: number;
    };
  }> => {
    const response = await axios.post('/notifications/broadcast', data);
    return response.data;
  },

  // Get Notification & Push Subscriber stats (Admin)
  getStats: async (): Promise<{
    success: boolean;
    data: {
      totalUsers: number;
      totalCustomers: number;
      totalStoreOwners: number;
      usersWithPush: number;
    };
  }> => {
    const response = await axios.get('/notifications/stats');
    return response.data;
  }
};

