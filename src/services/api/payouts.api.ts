import apiClient from '@/lib/axios';

// Types
export interface Payout {
  id: string;
  _id?: string;
  storeId: string | { _id?: string; storeName?: string }; // Backend may populate
  ownerId: string | { _id?: string; name?: string; email?: string }; // Backend may populate
  totalAmount: number;
  commissionDeducted: number;
  netPayoutAmount: number;
  periodStart: string | Date;
  periodEnd: string | Date;
  paymentIds: string[] | Array<{ _id?: string; id?: string }>; // Backend may populate
  orderCount: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
  };
  transferId?: string;
  transferMethod?: 'NEFT' | 'RTGS' | 'IMPS' | 'UPI' | 'Wallet';
  transferResponse?: any; // Backend stores transfer response
  processedBy?: string | { _id?: string; name?: string }; // Backend may populate
  processedAt?: string | Date;
  failureReason?: string;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EarningsStatement {
  payments: Array<{
    orderId: string;
    orderDate: string;
    customerName: string;
    storeName: string;
    amount: number;
    commission: number;
    payout: number;
    status: string;
    payoutStatus: string;
  }>;
  totals: {
    totalRevenue: number;
    totalCommission: number;
    totalPayout: number;
    orderCount: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface RequestEarlyPayoutData {
  storeId: string;
  notes?: string;
}

export interface ApiResponse<T> {
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

// Payouts API
export const payoutsApi = {
  // Store Owner: Get my payouts
  getMyPayouts: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payout> & { summary?: {
    totalEarnings: number;
    pendingPayouts: number;
    completedCount: number;
  }}> => {
    const response = await apiClient.get<PaginatedResponse<Payout> & { summary?: {
      totalEarnings: number;
      pendingPayouts: number;
      completedCount: number;
    }}>('/payouts/store-owner/my-payouts', {
      params,
    });
    return response.data;
  },

  // Store Owner: Get payout by ID
  getPayoutById: async (id: string): Promise<ApiResponse<Payout>> => {
    const response = await apiClient.get<ApiResponse<Payout>>(`/payouts/store-owner/payouts/${id}`);
    return response.data;
  },

  // Store Owner: Request early payout
  requestEarlyPayout: async (data: RequestEarlyPayoutData): Promise<ApiResponse<Payout>> => {
    const response = await apiClient.post<ApiResponse<Payout>>('/payouts/store-owner/request-early', data);
    return response.data;
  },

  // Store Owner: Get earnings statement
  getEarningsStatement: async (params?: {
    storeId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any> & { summary: {
    totalRevenue: number;
    totalCommission: number;
    totalPayout: number;
    orderCount: number;
  }}> => {
    const response = await apiClient.get<PaginatedResponse<any> & { summary: {
      totalRevenue: number;
      totalCommission: number;
      totalPayout: number;
      orderCount: number;
    }}>('/payouts/store-owner/earnings-statement', {
      params,
    });
    return response.data;
  },

  // Store Owner: Download statement
  downloadStatement: async (params?: {
    storeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<EarningsStatement>> => {
    const response = await apiClient.get<ApiResponse<EarningsStatement>>('/payouts/store-owner/download-statement', {
      params,
    });
    return response.data;
  },

  // Admin: Get all payouts
  getAllPayouts: async (params?: {
    status?: string;
    storeId?: string;
    ownerId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payout>> => {
    const response = await apiClient.get<PaginatedResponse<Payout>>('/admin/payouts', {
      params,
    });
    return response.data;
  },

  // Admin: Get payout by ID
  getPayoutByIdAdmin: async (id: string): Promise<ApiResponse<Payout>> => {
    const response = await apiClient.get<ApiResponse<Payout>>(`/admin/payouts/${id}`);
    return response.data;
  },

  // Admin: Generate payout
  generatePayout: async (data: {
    storeId: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<ApiResponse<Payout>> => {
    const response = await apiClient.post<ApiResponse<Payout>>('/admin/payouts/generate', data);
    return response.data;
  },

  // Admin: Approve payout
  approvePayout: async (id: string): Promise<ApiResponse<Payout>> => {
    const response = await apiClient.post<ApiResponse<Payout>>(`/admin/payouts/${id}/approve`);
    return response.data;
  },

  // Admin: Complete payout
  completePayout: async (id: string, data: {
    transferId: string;
    transferResponse?: any;
  }): Promise<ApiResponse<Payout>> => {
    const response = await apiClient.post<ApiResponse<Payout>>(`/admin/payouts/${id}/complete`, data);
    return response.data;
  },
};



