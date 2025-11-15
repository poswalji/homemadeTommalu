import apiClient from '@/lib/axios';
import { StoreCategory } from './public.api';

// Types
export type UserRole = 'customer' | 'storeOwner' | 'admin' | 'delivery';
export type UserStatus = 'active' | 'suspended';
export type AdminRole = 'superAdmin' | 'supportAdmin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status?: UserStatus;
  city?: string;
  addresses?: Array<{
    label?: string;
    street: string;
    city: string;
    state?: string;
    pincode: string;
    country?: string;
    isDefault?: boolean;
  }>;
  emailVerified?: boolean;
}

export interface Store {
  id: string;
  _id?: string;
  storeName: string;
  address: string;
  phone: string;
  category: StoreCategory;
  description?: string;
  verificationStatus?: string;
  verificationNotes?: string;
  commissionRate?: number;
  deliveryFee?: number;
  minOrder?: number;
  status?: 'draft' | 'submitted' | 'pendingApproval' | 'approved' | 'active' | 'rejected' | 'suspended';
  isOpen?: boolean;
  available?: boolean;
  isVerified?: boolean;
  openingTime?: string;
  closingTime?: string;
  deliveryTime?: string;
  rating?: number;
  totalReviews?: number;
  storeImages?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  ownerId?: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateStoreMetadataData {
  category?: StoreCategory;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee?: number;
  minOrder?: number;
}

export interface UpdateStoreCommissionData {
  commissionRate: number; // 0-100
}

export interface UpdateStoreDeliveryFeeData {
  deliveryFee: number; // >= 0
}

export interface RejectStoreData {
  reason?: string;
}

export interface ResetPasswordData {
  newPassword: string;
}

export interface AdminResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    pages?: number; // Backend sometimes returns 'pages'
  };
}

export interface StoresListResponse {
  success: boolean;
  data: Store[];
}

export interface UserOrdersResponse {
  success: boolean;
  data: any[]; // Order type
}

export interface UserTransactionsResponse {
  success: boolean;
  data: any[]; // Transaction type
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  city?: string;
  phone?: string;
}

// Admin API Service
export const adminApi = {
  // List users with filters
  getUsers: async (params?: UsersQueryParams): Promise<UsersListResponse> => {
    const response = await apiClient.get<UsersListResponse>('/admin/users', { params });
    return response.data;
  },

  // Suspend a user (superAdmin)
  suspendUser: async (id: string): Promise<AdminResponse<User>> => {
    const response = await apiClient.patch<AdminResponse<User>>(`/admin/users/${id}/suspend`);
    return response.data;
  },

  // Reactivate a user (superAdmin)
  reactivateUser: async (id: string): Promise<AdminResponse<User>> => {
    const response = await apiClient.patch<AdminResponse<User>>(`/admin/users/${id}/reactivate`);
    return response.data;
  },

  // Reset a user's password (superAdmin)
  resetUserPassword: async (id: string, data: ResetPasswordData): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(`/admin/users/${id}/reset-password`, data);
    return response.data;
  },

  // Get a user's order history
  getUserOrderHistory: async (id: string): Promise<UserOrdersResponse> => {
    const response = await apiClient.get<UserOrdersResponse>(`/admin/users/${id}/history/orders`);
    return response.data;
  },

  // Get a user's transactions
  getUserTransactions: async (id: string): Promise<UserTransactionsResponse> => {
    const response = await apiClient.get<UserTransactionsResponse>(`/admin/users/${id}/history/transactions`);
    return response.data;
  },

  // List stores pending verification
  getPendingStores: async (): Promise<StoresListResponse> => {
    const response = await apiClient.get<StoresListResponse>('/admin/stores/pending');
    return response.data;
  },

  // Approve a store (superAdmin)
  approveStore: async (id: string): Promise<AdminResponse<Store>> => {
    const response = await apiClient.post<AdminResponse<Store>>(`/admin/stores/${id}/approve`);
    return response.data;
  },

  // Reject a store (superAdmin)
  rejectStore: async (id: string, data?: RejectStoreData): Promise<AdminResponse<Store>> => {
    const response = await apiClient.post<AdminResponse<Store>>(`/admin/stores/${id}/reject`, data);
    return response.data;
  },

  // Suspend a store (superAdmin)
  suspendStore: async (id: string): Promise<AdminResponse<Store>> => {
    const response = await apiClient.patch<AdminResponse<Store>>(`/admin/stores/${id}/suspend`);
    return response.data;
  },

  // Reactivate a store (superAdmin)
  reactivateStore: async (id: string): Promise<AdminResponse<Store>> => {
    const response = await apiClient.patch<AdminResponse<Store>>(`/admin/stores/${id}/reactivate`);
    return response.data;
  },

  // Update store metadata (superAdmin)
  updateStoreMetadata: async (id: string, data: UpdateStoreMetadataData): Promise<AdminResponse<Store>> => {
    const response = await apiClient.patch<AdminResponse<Store>>(`/admin/stores/${id}/metadata`, data);
    return response.data;
  },

  // Update store commission (superAdmin)
  updateStoreCommission: async (id: string, data: UpdateStoreCommissionData): Promise<AdminResponse<Store>> => {
    const response = await apiClient.patch<AdminResponse<Store>>(`/admin/stores/${id}/commission`, data);
    return response.data;
  },

  // Update store delivery fee (superAdmin)
  updateStoreDeliveryFee: async (id: string, data: UpdateStoreDeliveryFeeData): Promise<AdminResponse<Store>> => {
    const response = await apiClient.patch<AdminResponse<Store>>(`/admin/stores/${id}/delivery-fee`, data);
    return response.data;
  },

  // Get all stores with filters
  getAllStores: async (params?: {
    status?: string;
    category?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<StoresListResponse> => {
    const response = await apiClient.get<StoresListResponse>('/admin/stores', { params });
    return response.data;
  },

  // Get store by ID (admin view with full details)
  getStoreById: async (id: string): Promise<AdminResponse<Store & {
    location?: { type: string; coordinates: number[] };
    storeImages?: string[];
    openingTime?: string;
    closingTime?: string;
    rating?: number;
    totalReviews?: number;
    reviews?: any[];
    isOpen?: boolean;
    available?: boolean;
    isVerified?: boolean;
    verificationNotes?: string;
    rejectionReason?: string;
    commissionRate?: number;
    menu?: any[];
    statistics?: {
      orderCount: number;
      totalRevenue: number;
      totalEarnings: number;
      timesOrdered: number;
    };
    createdAt?: string;
    updatedAt?: string;
  }>> => {
    const response = await apiClient.get<AdminResponse<Store & {
      location?: { type: string; coordinates: number[] };
      storeImages?: string[];
      openingTime?: string;
      closingTime?: string;
      rating?: number;
      totalReviews?: number;
      reviews?: any[];
      isOpen?: boolean;
      available?: boolean;
      isVerified?: boolean;
      verificationNotes?: string;
      rejectionReason?: string;
      commissionRate?: number;
      menu?: any[];
      statistics?: {
        orderCount: number;
        totalRevenue: number;
        totalEarnings: number;
        timesOrdered: number;
      };
      createdAt?: string;
      updatedAt?: string;
    }>>(`/admin/stores/${id}`);
    return response.data;
  },

  // Analytics: Dashboard
  getDashboardAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AdminResponse<{
    orders: {
      total: number;
      completed: number;
      pending: number;
      averageOrderValue: number;
    };
    revenue: {
      total: number;
      commission: number;
      netRevenue: number;
    };
    users: {
      customers: number;
      storeOwners: number;
      total: number;
    };
    stores: {
      active: number;
    };
    recentOrders: any[];
  }>> => {
    const response = await apiClient.get<AdminResponse<{
      orders: {
        total: number;
        completed: number;
        pending: number;
        averageOrderValue: number;
      };
      revenue: {
        total: number;
        commission: number;
        netRevenue: number;
      };
      users: {
        customers: number;
        storeOwners: number;
        total: number;
      };
      stores: {
        active: number;
      };
      recentOrders: any[];
    }>>('/admin/analytics/dashboard', { params });
    return response.data;
  },

  // Analytics: Orders
  getOrderAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<AdminResponse<Array<{
    _id: string;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    cancelledOrders: number;
  }>>> => {
    const response = await apiClient.get<AdminResponse<Array<{
      _id: string;
      totalOrders: number;
      completedOrders: number;
      totalRevenue: number;
      cancelledOrders: number;
    }>>>('/admin/analytics/orders', { params });
    return response.data;
  },

  // Analytics: Stores
  getStoreAnalytics: async (params?: {
    category?: string;
    city?: string;
    top?: number;
  }): Promise<AdminResponse<{
    topStores: any[];
    categoryDistribution: Array<{
      _id: string;
      count: number;
      avgRating: number;
    }>;
  }>> => {
    const response = await apiClient.get<AdminResponse<{
      topStores: any[];
      categoryDistribution: Array<{
        _id: string;
        count: number;
        avgRating: number;
      }>;
    }>>('/admin/analytics/stores', { params });
    return response.data;
  },

  // Analytics: Revenue
  getRevenueAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AdminResponse<{
    totalRevenue: number;
    totalCommission: number;
    totalPayout: number;
    orderCount: number;
  }>> => {
    const response = await apiClient.get<AdminResponse<{
      totalRevenue: number;
      totalCommission: number;
      totalPayout: number;
      orderCount: number;
    }>>('/admin/analytics/revenue', { params });
    return response.data;
  },

  // Reports: Export
  exportReport: async (params: {
    type: 'orders' | 'payments' | 'stores' | 'users';
    startDate?: string;
    endDate?: string;
    format?: 'json' | 'csv' | 'excel';
  }): Promise<AdminResponse<any>> => {
    const response = await apiClient.get<AdminResponse<any>>('/admin/reports/export', { params });
    return response.data;
  },

  // Menu Oversight: List menu items
  listMenuItems: async (params?: {
    storeId?: string;
    category?: string;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
  }): Promise<AdminResponse<any[]>> => {
    const response = await apiClient.get<AdminResponse<any[]>>('/admin/menu/items', { params });
    return response.data;
  },

  // Menu Oversight: Get menu item by ID
  getMenuItemById: async (id: string): Promise<AdminResponse<any>> => {
    const response = await apiClient.get<AdminResponse<any>>(`/admin/menu/items/${id}`);
    return response.data;
  },

  // Menu Oversight: Disable menu item
  disableMenuItem: async (id: string): Promise<AdminResponse<any>> => {
    const response = await apiClient.patch<AdminResponse<any>>(`/admin/menu/items/${id}/disable`);
    return response.data;
  },

  // Orders: Cancel order (admin override)
  cancelOrder: async (id: string, reason?: string): Promise<AdminResponse<any>> => {
    const response = await apiClient.post<AdminResponse<any>>(`/admin/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

