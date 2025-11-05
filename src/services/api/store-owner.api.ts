import apiClient from '@/lib/axios';
import { StoreCategory, Store, MenuItem } from './public.api';

// Types
export type LicenseType = 'FSSAI' | 'GST' | 'Shop Act' | 'Trade License' | 'Other';
export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'OutForDelivery' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'Rejected';

export interface StoreOwnerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'storeOwner';
}

export interface CreateStoreData {
  storeName: string;
  address: string;
  phone: string;
  licenseNumber: string;
  licenseType: LicenseType;
  category: StoreCategory;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee?: number;
  minOrder?: number;
}

export interface UpdateStoreData {
  storeName?: string;
  address?: string;
  phone?: string;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee?: number;
  minOrder?: number;
}

export interface CreateMenuItemData {
  name: string;
  price: number;
  category?: string;
  description?: string;
  foodType?: string;
  available?: boolean;
  stockQuantity?: number;
  image?: File;
}

export interface UpdateMenuItemData {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  foodType?: string;
  available?: boolean;
  stockQuantity?: number;
  image?: File;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface StoreOwnerResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface StoresListResponse {
  success: boolean;
  data: Store[];
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem[];
}

export interface OrdersResponse {
  success: boolean;
  data: any[]; // Order type from orders.api.ts
}

// Store Owner API Service
export const storeOwnerApi = {
  // Get current store owner profile
  getProfile: async (): Promise<StoreOwnerResponse<StoreOwnerProfile>> => {
    const response = await apiClient.get<StoreOwnerResponse<StoreOwnerProfile>>('/store-owner/profile');
    return response.data;
  },

  // List stores owned by the user
  getMyStores: async (): Promise<StoresListResponse> => {
    const response = await apiClient.get<StoresListResponse>('/store-owner/stores');
    return response.data;
  },

  // Create a new store
  createStore: async (data: CreateStoreData): Promise<StoreOwnerResponse<Store>> => {
    const response = await apiClient.post<StoreOwnerResponse<Store>>('/store-owner/stores', data);
    return response.data;
  },

  // Get a specific store by ID
  getStoreById: async (id: string): Promise<StoreOwnerResponse<Store>> => {
    const response = await apiClient.get<StoreOwnerResponse<Store>>(`/store-owner/stores/${id}`);
    return response.data;
  },

  // Update editable store fields
  updateStore: async (id: string, data: UpdateStoreData): Promise<StoreOwnerResponse<Store>> => {
    const response = await apiClient.patch<StoreOwnerResponse<Store>>(`/store-owner/stores/${id}`, data);
    return response.data;
  },

  // Delete a store
  deleteStore: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/store-owner/stores/${id}`);
    return response.data;
  },

  // Toggle store open/closed
  toggleStoreStatus: async (id: string): Promise<StoreOwnerResponse<Store>> => {
    const response = await apiClient.patch<StoreOwnerResponse<Store>>(`/store-owner/stores/${id}/toggle-status`);
    return response.data;
  },

  // Get menu items for a store
  getStoreMenu: async (storeId: string): Promise<MenuResponse> => {
    const response = await apiClient.get<MenuResponse>(`/store-owner/stores/${storeId}/menu`);
    return response.data;
  },

  // Add a menu item (multipart/form-data)
  createMenuItem: async (storeId: string, data: CreateMenuItemData): Promise<StoreOwnerResponse<MenuItem>> => {
    const formData = new FormData();
    
    formData.append('name', data.name);
    formData.append('price', data.price.toString());
    if (data.category) formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.foodType) formData.append('foodType', data.foodType);
    if (data.available !== undefined) formData.append('available', data.available.toString());
    if (data.stockQuantity !== undefined) formData.append('stockQuantity', data.stockQuantity.toString());
    if (data.image) formData.append('image', data.image);

    const response = await apiClient.post<StoreOwnerResponse<MenuItem>>(
      `/store-owner/stores/${storeId}/menu`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update a menu item (multipart/form-data)
  updateMenuItem: async (menuItemId: string, data: UpdateMenuItemData): Promise<StoreOwnerResponse<MenuItem>> => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.category) formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.foodType) formData.append('foodType', data.foodType);
    if (data.available !== undefined) formData.append('available', data.available.toString());
    if (data.stockQuantity !== undefined) formData.append('stockQuantity', data.stockQuantity.toString());
    if (data.image) formData.append('image', data.image);

    const response = await apiClient.patch<StoreOwnerResponse<MenuItem>>(
      `/store-owner/menu/${menuItemId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Delete a menu item
  deleteMenuItem: async (menuItemId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/store-owner/menu/${menuItemId}`);
    return response.data;
  },

  // Toggle menu item availability
  toggleMenuItemAvailability: async (menuItemId: string): Promise<StoreOwnerResponse<MenuItem>> => {
    const response = await apiClient.patch<StoreOwnerResponse<MenuItem>>(`/store-owner/menu/${menuItemId}/toggle-availability`);
    return response.data;
  },

  // List orders across owner's stores
  getOrders: async (): Promise<OrdersResponse> => {
    const response = await apiClient.get<OrdersResponse>('/store-owner/orders');
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, data: UpdateOrderStatusData): Promise<StoreOwnerResponse<any>> => {
    const response = await apiClient.patch<StoreOwnerResponse<any>>(`/store-owner/orders/${orderId}/status`, data);
    return response.data;
  },
};




