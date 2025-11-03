import apiClient from '@/lib/axios';

// Types
export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  storeId: string;
  amount: number;
  commissionAmount: number;
  storePayoutAmount: number;
  commissionRate: number;
  paymentMethod: 'cash_on_delivery' | 'online' | 'wallet';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payoutStatus: 'pending' | 'eligible' | 'processing' | 'completed' | 'cancelled';
  paymentGateway?: string;
  transactionId?: string;
  refundAmount?: number;
  refundStatus?: string;
  createdAt: string;
}

export interface CreatePaymentData {
  orderId: string;
  paymentMethod?: 'cash_on_delivery' | 'online' | 'wallet';
  paymentGateway?: string;
}

export interface UpdatePaymentStatusData {
  status: string;
  transactionId?: string;
  gatewayOrderId?: string;
  gatewayResponse?: any;
}

export interface ProcessRefundData {
  reason: string;
  refundTransactionId?: string;
}

export interface PaymentResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Payment API Service
export const paymentApi = {
  // Create payment record
  createPayment: async (data: CreatePaymentData): Promise<PaymentResponse<Payment>> => {
    const response = await apiClient.post<PaymentResponse<Payment>>('/payments', data);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (paymentId: string, data: UpdatePaymentStatusData): Promise<PaymentResponse<Payment>> => {
    const response = await apiClient.patch<PaymentResponse<Payment>>(`/payments/${paymentId}/status`, data);
    return response.data;
  },

  // Process refund
  processRefund: async (paymentId: string, data: ProcessRefundData): Promise<PaymentResponse<Payment>> => {
    const response = await apiClient.post<PaymentResponse<Payment>>(`/payments/${paymentId}/refund`, data);
    return response.data;
  },

  // Get user payments
  getUserPayments: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/payments/customer/payments', { params });
    return response.data;
  },

  // Get store payments
  getStorePayments: async (params?: { status?: string; payoutStatus?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Payment> & { totals?: any }> => {
    const response = await apiClient.get('/payments/store/payments', { params });
    return response.data;
  },

  // Get eligible payouts for store
  getEligiblePayouts: async (storeId: string): Promise<PaymentResponse<{ payments: Payment[]; summary: any }>> => {
    const response = await apiClient.get(`/payments/store/payouts/eligible/${storeId}`);
    return response.data;
  },

  // Admin: Get all payments
  getAllPayments: async (params?: { status?: string; payoutStatus?: string; storeId?: string; userId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/payments/admin/payments', { params });
    return response.data;
  },

  // Admin: Get payment by ID
  getPaymentById: async (id: string): Promise<PaymentResponse<Payment>> => {
    const response = await apiClient.get<PaymentResponse<Payment>>(`/payments/admin/payments/${id}`);
    return response.data;
  },
};



