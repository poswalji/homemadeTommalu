import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    homemadeFoodPublicApi,
    homemadeFoodAdminApi,
    type SubmitOrderData,
    type CreateHomemadeFoodData,
    type UpdateOrderStatusData,
} from '@/services/api/homemade-food.api';

// Query Keys
export const homemadeFoodKeys = {
    all: ['homemade-food'] as const,
    todaysSpecial: () => [...homemadeFoodKeys.all, 'todays-special'] as const,
    active: () => [...homemadeFoodKeys.all, 'active'] as const,
    admin: {
        all: () => [...homemadeFoodKeys.all, 'admin'] as const,
        foods: (params?: any) => [...homemadeFoodKeys.admin.all(), 'foods', params || ''] as const,
        food: (id: string) => [...homemadeFoodKeys.admin.all(), 'food', id] as const,
        orders: (params?: any) => [...homemadeFoodKeys.admin.all(), 'orders', params || ''] as const,
        order: (id: string) => [...homemadeFoodKeys.admin.all(), 'order', id] as const,
        analytics: (params?: any) => [...homemadeFoodKeys.admin.all(), 'analytics', params || ''] as const,
    },
};

// ============================================
// PUBLIC HOOKS
// ============================================

// Get today's special
export const useTodaysSpecial = () => {
    return useQuery({
        queryKey: homemadeFoodKeys.todaysSpecial(),
        queryFn: () => homemadeFoodPublicApi.getTodaysSpecial(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get all active homemade foods
export const useActiveHomemadeFoods = () => {
    return useQuery({
        queryKey: homemadeFoodKeys.active(),
        queryFn: () => homemadeFoodPublicApi.getActiveHomemadeFoods(),
        staleTime: 1000 * 60 * 5,
    });
};

// Submit order
export const useSubmitHomemadeFoodOrder = () => {
    return useMutation({
        mutationFn: (data: SubmitOrderData) => homemadeFoodPublicApi.submitOrder(data),
    });
};

// Track order
export const useTrackHomemadeFoodOrder = (orderNumber: string, mobileNumber: string, enabled = false) => {
    return useQuery({
        queryKey: ['homemade-food', 'track', orderNumber, mobileNumber],
        queryFn: () => homemadeFoodPublicApi.trackOrder(orderNumber, mobileNumber),
        enabled: enabled && !!orderNumber && !!mobileNumber,
    });
};

// ============================================
// ADMIN HOOKS
// ============================================

// Get all food items (admin)
export const useAdminHomemadeFoods = (params?: {
    isActive?: boolean;
    isTodaysSpecial?: boolean;
}) => {
    return useQuery({
        queryKey: homemadeFoodKeys.admin.foods(params),
        queryFn: () => homemadeFoodAdminApi.getAllHomemadeFoods(params),
        staleTime: 1000 * 60 * 2,
    });
};

// Create food item
export const useCreateHomemadeFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateHomemadeFoodData) => homemadeFoodAdminApi.createHomemadeFood(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.foods() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.todaysSpecial() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.active() });
        },
    });
};

// Update food item
export const useUpdateHomemadeFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateHomemadeFoodData> }) =>
            homemadeFoodAdminApi.updateHomemadeFood(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.foods() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.food(variables.id) });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.todaysSpecial() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.active() });
        },
    });
};

// Delete food item
export const useDeleteHomemadeFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => homemadeFoodAdminApi.deleteHomemadeFood(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.foods() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.todaysSpecial() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.active() });
        },
    });
};

// Set today's special
export const useSetTodaysSpecial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => homemadeFoodAdminApi.setTodaysSpecial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.foods() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.todaysSpecial() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.active() });
        },
    });
};

// Get all orders (admin)
export const useAdminHomemadeFoodOrders = (params?: {
    status?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}) => {
    return useQuery({
        queryKey: homemadeFoodKeys.admin.orders(params),
        queryFn: () => homemadeFoodAdminApi.getAllOrders(params),
        staleTime: 1000 * 60 * 1,
    });
};

// Get order by ID (admin)
export const useAdminHomemadeFoodOrder = (id: string, enabled = true) => {
    return useQuery({
        queryKey: homemadeFoodKeys.admin.order(id),
        queryFn: () => homemadeFoodAdminApi.getOrderById(id),
        enabled: enabled && !!id,
    });
};

// Update order status
export const useUpdateHomemadeFoodOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusData }) =>
            homemadeFoodAdminApi.updateOrderStatus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.orders() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.order(variables.id) });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.analytics() });
        },
    });
};

// Update payment status
export const useUpdateHomemadeFoodPaymentStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { paymentStatus: string; paymentId?: string } }) =>
            homemadeFoodAdminApi.updatePaymentStatus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.orders() });
            queryClient.invalidateQueries({ queryKey: homemadeFoodKeys.admin.order(variables.id) });
        },
    });
};

// Get analytics
export const useHomemadeFoodAnalytics = (params?: { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: homemadeFoodKeys.admin.analytics(params),
        queryFn: () => homemadeFoodAdminApi.getAnalytics(params),
        staleTime: 1000 * 60 * 5,
    });
};
