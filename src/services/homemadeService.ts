
import { apiClient } from '@/lib/axios';

export const getHomemadeDashboardStats = async () => {
    try {
        const response = await apiClient.get('/homemade/dashboard');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateHomemadeMenu = async (data: any) => {
    try {
        const response = await apiClient.patch('/homemade/update', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const confirmHomemadeOrder = async (orderId: string) => {
    try {
        const response = await apiClient.patch(`/homemade/order/${orderId}/confirm`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodayMenu = async () => {
    try {
        const response = await apiClient.get('/homemade/today'); // Public route
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const placeHomemadeOrder = async (orderData: any) => {
    try {
        const response = await apiClient.post('/homemade/order', orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const purchaseSubscriptionPlan = async (data: any) => {
    try {
        // This endpoint is DEPRECATED on backend, but leaving wrapper for now if needed.
        // Ideally should not be called.
        const response = await apiClient.post('/homemade/plans/purchase', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const submitSubscription = async (data: any) => {
    try {
        const response = await apiClient.post('/subscriptions/request', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
