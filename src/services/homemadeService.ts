
import axios from 'axios';

// Get base URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Setup axios instance with auth interceptor if needed (assuming token is stored in localStorage)
const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getHomemadeDashboardStats = async () => {
    try {
        const response = await api.get('/homemade/dashboard');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateHomemadeMenu = async (data: any) => {
    try {
        const response = await api.patch('/homemade/update', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const confirmHomemadeOrder = async (orderId: string) => {
    try {
        const response = await api.patch(`/homemade/order/${orderId}/confirm`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodayMenu = async () => {
    try {
        const response = await api.get('/homemade/today'); // Public route
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const placeHomemadeOrder = async (orderData: any) => {
    try {
        const response = await api.post('/homemade/order', orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
