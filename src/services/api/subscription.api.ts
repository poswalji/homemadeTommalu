import { apiClient } from '@/lib/axios';

export const subscriptionApi = {
    // Requests
    createRequest: async (data: any) => {
        const response = await apiClient.post('/subscriptions/request', data);
        return response.data;
    },
    getMyRequests: async () => {
        const response = await apiClient.get('/subscriptions/my-requests');
        return response.data;
    },

    // Admin: Requests
    getAllRequests: async (status?: string, page = 1) => {
        const response = await apiClient.get(`/subscriptions/requests?page=${page}${status ? `&status=${status}` : ''}`);
        return response.data;
    },
    approveRequest: async (id: string) => {
        const response = await apiClient.post(`/subscriptions/requests/${id}/approve`);
        return response.data;
    },
    rejectRequest: async (id: string, reason: string) => {
        const response = await apiClient.post(`/subscriptions/requests/${id}/reject`, { reason });
        return response.data;
    },

    // Admin: Active Subscriptions
    getAllActiveSubscriptions: async (status?: string, page = 1) => {
        const response = await apiClient.get(`/subscriptions?page=${page}${status ? `&status=${status}` : ''}`);
        return response.data;
    },
    updateStatus: async (id: string, status: string, adminNotes?: string) => {
        const response = await apiClient.patch(`/subscriptions/${id}/status`, { status, adminNotes });
        return response.data;
    },
    updatePeriod: async (id: string, startDate: Date | string, endDate: Date | string) => {
        const response = await apiClient.patch(`/subscriptions/${id}/period`, { startDate, endDate });
        return response.data;
    },
    updatePrice: async (id: string, newPrice: number) => {
        const response = await apiClient.patch(`/subscriptions/${id}/price`, { newPrice });
        return response.data;
    },
    adminAddPause: async (id: string, date: string, reason?: string) => {
        const response = await apiClient.post(`/subscriptions/${id}/admin-pause`, { date, reason });
        return response.data;
    },
    
    // Pause Requests
    approvePauseRequest: async (id: string, requestId: string) => {
        const response = await apiClient.post(`/subscriptions/${id}/pause-request/${requestId}/approve`);
        return response.data;
    },
    rejectPauseRequest: async (id: string, requestId: string, reason?: string) => {
        const response = await apiClient.post(`/subscriptions/${id}/pause-request/${requestId}/reject`, { reason });
        return response.data;
    }
};
