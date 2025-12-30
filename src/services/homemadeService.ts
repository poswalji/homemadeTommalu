
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
