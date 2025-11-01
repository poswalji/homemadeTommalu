import apiClient from '@/lib/axios';

// Types
export type StoreCategory = 
  | 'Restaurant' 
  | 'Grocery Store' 
  | 'Bakery' 
  | 'Pharmacy' 
  | 'Vegetable & Fruits' 
  | 'Meat & Fish' 
  | 'Dairy' 
  | 'Other';

export interface Store {
  id: string;
  _id?: string;
  storeName: string;
  address: string;
  phone: string;
  category: StoreCategory;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee?: number;
  minOrder?: number;
  isOpen?: boolean;
  rating?: number;
  image?: string;
  ownerId?: string | { name?: string; email?: string; id?: string };
  status?: 'draft' | 'submitted' | 'pendingApproval' | 'approved' | 'active' | 'rejected' | 'suspended';
  verificationStatus?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  available?: boolean;
  stockQuantity?: number;
  image?: string;
}

export interface StoresResponse {
  success: boolean;
  data: Store[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem[];
  store?: {
    id: string;
    storeName: string;
    isOpen?: boolean;
  };
  menuByCategory?: Record<string, MenuItem[]>;
  totalItems?: number;
}

export interface StoresQueryParams {
  page?: number;
  limit?: number;
  category?: StoreCategory;
  isOpen?: boolean;
  minRating?: number;
}

export interface StoreSearchParams extends StoresQueryParams {
  q?: string;
}

// Public API Service
export const publicApi = {
  // List available stores
  getStores: async (params?: StoresQueryParams): Promise<StoresResponse> => {
    const response = await apiClient.get<StoresResponse>('/public/stores', { params });
    return response.data;
  },

  // Get menu for a store
  getStoreMenu: async (storeId: string): Promise<MenuResponse> => {
    const response = await apiClient.get<MenuResponse>(`/public/stores/${storeId}/menu`);
    return response.data;
  },

  // Search stores
  searchStores: async (params?: StoreSearchParams): Promise<StoresResponse> => {
    const response = await apiClient.get<StoresResponse>('/public/stores/search', { params });
    return response.data;
  },

  // Get public stats (for landing page)
  getStats: async (): Promise<{
    success: boolean;
    data: {
      totalCustomers: number;
      totalOrders: number;
      totalStores: number;
      averageRating: number;
    };
  }> => {
    try {
      // Try to get from public endpoint first
      const response = await apiClient.get<{
        success: boolean;
        data: {
          totalCustomers: number;
          totalOrders: number;
          totalStores: number;
          averageRating: number;
        };
      }>('/public/stats');
      return response.data;
    } catch {
      // Fallback: Return default stats if endpoint doesn't exist
      return {
        success: true,
        data: {
          totalCustomers: 50000,
          totalOrders: 200000,
          totalStores: 1000,
          averageRating: 4.8,
        },
      };
    }
  },
};


