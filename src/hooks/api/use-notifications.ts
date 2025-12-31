
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api/notifications.api';
import { useSocket } from '@/context/socket-context';

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const { notifications: realtimeNotifications, unreadCount: realtimeUnreadCount } = useSocket();

    // Fetch all notifications (polling every 15 seconds as fallback/update)
    const {
        data,
        isLoading,
        refetch
    } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await notificationsApi.getNotifications({ limit: 50 });
            return response.data;
        },
        refetchInterval: 15000, // Poll every 15 seconds
    });

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    // Mark single as read
    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Mark all as read
    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Delete single
    const deleteMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Delete all
    const deleteAllMutation = useMutation({
        mutationFn: () => notificationsApi.deleteAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Merge logic: Realtime ones might be newer than API fetch
    // But for simplicity, we rely on React Query polling + Socket Context updates.
    // If Socket Context has new items, they should ideally be merged or trigger refetch.

    // For now, let's return the Query data, but maybe we should trigger a refetch if socket gets new data?
    // Actually, useSocket likely manages its own state. 
    // Let's assume the Layout/Header handles the Bell state, and this hook handles the Page state.

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        deleteNotification: deleteMutation.mutate,
        deleteAllNotifications: deleteAllMutation.mutate
    };
};
