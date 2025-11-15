import apiClient from '@/lib/axios';

// Types
export interface Dispute {
  id: string;
  _id?: string;
  orderId: string | { _id?: string; id?: string }; // Backend may populate
  userId: string | { _id?: string; name?: string; email?: string }; // Backend may populate
  storeId: string | { _id?: string; storeName?: string }; // Backend may populate
  type: 'order_issue' | 'payment_issue' | 'quality_issue' | 'delivery_issue' | 'other';
  title: string;
  description: string;
  attachments?: string[];
  status: 'open' | 'under_review' | 'escalated' | 'resolved' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  resolution?: {
    action: 'refund_full' | 'refund_partial' | 'store_action' | 'no_action' | 'other';
    amount?: number;
    notes?: string;
    resolvedAt?: string | Date;
    resolvedBy?: string | { _id?: string; name?: string }; // Backend may populate
  };
  timeline: Array<{
    action: string;
    performedBy: string | { _id?: string; name?: string }; // Backend may populate
    notes?: string;
    timestamp: string | Date;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateDisputeData {
  orderId: string;
  type: 'order_issue' | 'payment_issue' | 'quality_issue' | 'delivery_issue' | 'other';
  title: string;
  description: string;
  attachments?: string[];
}

export interface ResolveDisputeData {
  action: 'refund_full' | 'refund_partial' | 'store_action' | 'no_action' | 'other';
  amount?: number;
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

// Disputes API
export const disputesApi = {
  // Customer: Create dispute
  createDispute: async (data: CreateDisputeData): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.post<ApiResponse<Dispute>>('/disputes', data);
    return response.data;
  },

  // Get user disputes
  getMyDisputes: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Dispute>> => {
    const response = await apiClient.get<PaginatedResponse<Dispute>>('/disputes/customer/my-disputes', {
      params,
    });
    return response.data;
  },

  // Get dispute by ID
  getDisputeById: async (id: string): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.get<ApiResponse<Dispute>>(`/disputes/${id}`);
    return response.data;
  },

  // Store Owner: Get disputes for their stores
  getStoreDisputes: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Dispute>> => {
    const response = await apiClient.get<PaginatedResponse<Dispute>>('/disputes/store/all', {
      params,
    });
    return response.data;
  },

  // Admin: Get all disputes
  getAllDisputes: async (params?: {
    status?: string;
    priority?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Dispute>> => {
    const response = await apiClient.get<PaginatedResponse<Dispute>>('/admin/disputes', {
      params,
    });
    return response.data;
  },

  // Admin: Resolve dispute
  resolveDispute: async (id: string, data: ResolveDisputeData): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.post<ApiResponse<Dispute>>(`/admin/disputes/${id}/resolve`, data);
    return response.data;
  },

  // Admin: Escalate dispute
  escalateDispute: async (id: string, notes?: string): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.post<ApiResponse<Dispute>>(`/admin/disputes/${id}/escalate`, { notes });
    return response.data;
  },

  // Admin: Close dispute
  closeDispute: async (id: string, notes?: string): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.post<ApiResponse<Dispute>>(`/admin/disputes/${id}/close`, { notes });
    return response.data;
  },
};



