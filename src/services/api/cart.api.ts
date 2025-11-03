import apiClient from '@/lib/axios';

// Types
export interface CartItem {
  menuItemId: string;
  itemName: string;
  price: number;
  quantity: number;
  image?: string;
  storeId?: string;
  storeName?: string;
  description?: string;
  category?: string;
  isAvailable?: boolean;
}

export interface Cart {
  id?: string;
  userId?: string;
  storeId?: string;
  storeName?: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  deliveryCharge: number;
  finalAmount: number;
  discount?: {
    code: string;
    discountAmount: number;
  };
}

export interface AddToCartData {
  menuItemId: string;
  quantity?: number;
}

export interface UpdateCartQuantityData {
  menuItemId: string;
  quantity: number;
}

export interface RemoveFromCartData {
  menuItemId: string;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data: Cart;
}

// Cart API Service
export const cartApi = {
  // Add item to cart
  addToCart: async (data: AddToCartData): Promise<CartResponse> => {
    const response = await apiClient.post<CartResponse>('/cart/add', data);
    return response.data;
  },

  // Get cart
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await apiClient.get<CartResponse>('/cart');
      return response.data;
    } catch (error: any) {
      // If cart doesn't exist or user not logged in, return empty cart
      if (error?.response?.status === 404 || error?.response?.status === 401) {
        return {
          success: true,
          data: {
            items: [],
            totalItems: 0,
            totalAmount: 0,
            deliveryCharge: 0,
            finalAmount: 0,
          },
        };
      }
      throw error;
    }
  },

  // Update cart quantity
  updateQuantity: async (data: UpdateCartQuantityData): Promise<CartResponse> => {
    const response = await apiClient.patch<CartResponse>('/cart/update', data);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (data: RemoveFromCartData): Promise<CartResponse> => {
    const response = await apiClient.delete<CartResponse>('/cart/remove', { data });
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/cart/clear');
    return response.data;
  },

  // Apply discount code
  applyDiscount: async (discountCode: string): Promise<CartResponse> => {
    const response = await apiClient.post<CartResponse>('/cart/apply-discount', { discountCode });
    return response.data;
  },

  // Remove discount
  removeDiscount: async (): Promise<CartResponse> => {
    const response = await apiClient.delete<CartResponse>('/cart/remove-discount');
    return response.data;
  },

  // Merge guest cart with user cart (on login)
  mergeCart: async (): Promise<CartResponse> => {
    const response = await apiClient.post<CartResponse>('/cart/merge');
    return response.data;
  },
};

