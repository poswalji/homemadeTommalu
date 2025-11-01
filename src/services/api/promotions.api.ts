import apiClient from '@/lib/axios';

// Types
export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_delivery' | 'buy_one_get_one';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  applicableTo: 'all' | 'category' | 'store' | 'item';
  categories?: string[];
  storeIds?: string[];
  itemIds?: string[];
  targetUsers: 'all' | 'new_users' | 'existing_users' | 'vip';
  cityFilter?: string[];
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatePromotionData {
  code: string;
  orderAmount: number;
  storeId?: string;
}

export interface ValidatePromotionResponse {
  success: boolean;
  valid: boolean;
  reason?: string;
  data?: {
    code: string;
    name: string;
    type: string;
    discountValue: number;
    discount: number;
    maxDiscount?: number;
    minOrderAmount: number;
  };
}

export interface ApplyPromotionData {
  code: string;
  orderId: string;
  orderAmount: number;
  storeId?: string;
}

export interface CreatePromotionData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_delivery' | 'buy_one_get_one';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  applicableTo?: 'all' | 'category' | 'store' | 'item';
  categories?: string[];
  storeIds?: string[];
  itemIds?: string[];
  targetUsers?: 'all' | 'new_users' | 'existing_users' | 'vip';
  cityFilter?: string[];
  maxUses?: number;
  maxUsesPerUser?: number;
  validFrom?: string;
  validUntil: string;
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

// Promotions API
export const promotionsApi = {
  // Get active promotions (public)
  getActivePromotions: async (params?: {
    city?: string;
    storeId?: string;
  }): Promise<ApiResponse<Promotion[]>> => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>('/promotions/active', {
      params,
    });
    return response.data;
  },

  // Validate promotion code
  validatePromotion: async (data: ValidatePromotionData): Promise<ValidatePromotionResponse> => {
    const response = await apiClient.post<ValidatePromotionResponse>('/promotions/validate', data);
    return response.data;
  },

  // Apply promotion to order (customer)
  applyPromotion: async (data: ApplyPromotionData): Promise<ApiResponse<{
    code: string;
    discount: number;
    discountValue: number;
    type: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      code: string;
      discount: number;
      discountValue: number;
      type: string;
    }>>('/promotions/apply', data);
    return response.data;
  },

  // Admin: Get all promotions
  getAllPromotions: async (params?: {
    isActive?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Promotion>> => {
    const response = await apiClient.get<PaginatedResponse<Promotion>>('/promotions/admin/all', {
      params,
    });
    return response.data;
  },

  // Admin: Get promotion by ID
  getPromotionById: async (id: string): Promise<ApiResponse<Promotion>> => {
    const response = await apiClient.get<ApiResponse<Promotion>>(`/promotions/admin/${id}`);
    return response.data;
  },

  // Admin: Create promotion
  createPromotion: async (data: CreatePromotionData): Promise<ApiResponse<Promotion>> => {
    const response = await apiClient.post<ApiResponse<Promotion>>('/promotions/admin', data);
    return response.data;
  },

  // Admin: Update promotion
  updatePromotion: async (id: string, data: Partial<CreatePromotionData>): Promise<ApiResponse<Promotion>> => {
    const response = await apiClient.patch<ApiResponse<Promotion>>(`/promotions/admin/${id}`, data);
    return response.data;
  },

  // Admin: Toggle promotion status
  togglePromotion: async (id: string): Promise<ApiResponse<Promotion>> => {
    const response = await apiClient.patch<ApiResponse<Promotion>>(`/promotions/admin/${id}/toggle`);
    return response.data;
  },

  // Admin: Delete promotion
  deletePromotion: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/promotions/admin/${id}`);
    return response.data;
  },

  // Admin: Get promotion stats
  getPromotionStats: async (id: string): Promise<ApiResponse<{
    promotion: {
      code: string;
      name: string;
      usedCount: number;
      maxUses?: number;
      totalDiscount: number;
      uniqueUsers: number;
      usageRate?: string;
    };
    usageHistory: any[];
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      promotion: {
        code: string;
        name: string;
        usedCount: number;
        maxUses?: number;
        totalDiscount: number;
        uniqueUsers: number;
        usageRate?: string;
      };
      usageHistory: any[];
    }>>(`/promotions/admin/${id}/stats`);
    return response.data;
  },
};

