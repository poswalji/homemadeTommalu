// services/api.jsx
import { cookieService } from '../utills/cookies';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tommalubackendservice.vercel.app/api' 
  : 'http://localhost:3000/api';

// Common headers for API requests
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = cookieService.getCurrentToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Authentication check
export const isAuthenticated = () => {
  return cookieService.isAuthenticated();
};

// ✅ UPDATED: Cart Service for Separate Cart Model
export const cartService = {
  // Add item to cart
  addToCart: async (itemData) => {
    try {
      const isLoggedIn = isAuthenticated();
      
      console.log('🛒 Add to Cart - User Status:', isLoggedIn ? 'Logged In' : 'Guest');
      console.log('📦 Item Data:', itemData);

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: getHeaders(isLoggedIn),
        body: JSON.stringify(itemData),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Add to cart success:', result);
      return result;
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      throw error;
    }
  },

  // Get cart details
  getCart: async () => {
    try {
      const isLoggedIn = isAuthenticated();

      console.log('🛒 Get Cart - User Status:', isLoggedIn ? 'Logged In' : 'Guest');

      // Guests should not call the auth-only endpoint; return empty cart structure
      if (!isLoggedIn) {
        return {
          success: true,
          data: {
            items: [],
            storeId: null,
            storeName: null,
            totalAmount: 0,
            deliveryCharge: 0,
            discountAmount: 0,
            finalAmount: 0,
          },
          userType: 'guest',
        };
      }

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getHeaders(true),
        credentials: 'include',
      });

      const result = await handleResponse(response);
      console.log('✅ Get cart success:', result);
      return result;
    } catch (error) {
      console.error('❌ Get cart error:', error);
      // Return empty cart structure on error
      return {
        success: true,
        data: {
          items: [],
          storeId: null,
          storeName: null,
          totalAmount: 0,
          deliveryCharge: 0,
          discountAmount: 0,
          finalAmount: 0
        },
        userType: isAuthenticated() ? 'authenticated' : 'guest'
      };
    }
  },

  // Update item quantity
  updateCartQuantity: async (menuItemId, quantity) => {
    try {
      const isLoggedIn = isAuthenticated();
      
      console.log('🛒 Update Quantity:', { menuItemId, quantity });

      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: 'PATCH',
        headers: getHeaders(isLoggedIn),
        body: JSON.stringify({ menuItemId, quantity }),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Update quantity success:', result);
      return result;
    } catch (error) {
      console.error('❌ Update quantity error:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (menuItemId) => {
    try {
      const isLoggedIn = isAuthenticated();
      
      console.log('🛒 Remove Item:', menuItemId);

      const response = await fetch(`${API_BASE_URL}/cart/remove`, {
        method: 'DELETE',
        headers: getHeaders(isLoggedIn),
        body: JSON.stringify({ menuItemId }),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Remove item success:', result);
      return result;
    } catch (error) {
      console.error('❌ Remove item error:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const isLoggedIn = isAuthenticated();
      
      console.log('🛒 Clear Cart');

      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders(isLoggedIn),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Clear cart success:', result);
      return result;
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      throw error;
    }
  },

  // Merge guest cart with user cart (after login)
  mergeCart: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User must be logged in to merge cart');
      }

      console.log('🛒 Merging Guest Cart with User Cart');

      const response = await fetch(`${API_BASE_URL}/cart/merge`, {
        method: 'POST',
        headers: getHeaders(true),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Merge cart success:', result);
      return result;
    } catch (error) {
      console.error('❌ Merge cart error:', error);
      throw error;
    }
  },

  // Apply discount code
  applyDiscount: async (discountCode) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User must be logged in to apply discount');
      }

      console.log('🛒 Applying Discount:', discountCode);

      const response = await fetch(`${API_BASE_URL}/cart/apply-discount`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ discountCode }),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Apply discount success:', result);
      return result;
    } catch (error) {
      console.error('❌ Apply discount error:', error);
      throw error;
    }
  },

  // Remove discount
  removeDiscount: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User must be logged in to remove discount');
      }

      console.log('🛒 Removing Discount');

      const response = await fetch(`${API_BASE_URL}/cart/remove-discount`, {
        method: 'DELETE',
        headers: getHeaders(true),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Remove discount success:', result);
      return result;
    } catch (error) {
      console.error('❌ Remove discount error:', error);
      throw error;
    }
  },

  // Get cart status (health check)
  getCartStatus: async () => {
    try {
      if (!isAuthenticated()) {
        // For guests, just return basic cart info
        return await cartService.getCart();
      }

      console.log('🛒 Getting Cart Status');

      const response = await fetch(`${API_BASE_URL}/cart/status`, {
        method: 'GET',
        headers: getHeaders(true),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Cart status:', result);
      return result;
    } catch (error) {
      console.error('❌ Get cart status error:', error);
      throw error;
    }
  },

  // Clean cart (remove invalid items)
  cleanCart: async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('User must be logged in to clean cart');
      }

      console.log('🛒 Cleaning Cart');

      const response = await fetch(`${API_BASE_URL}/cart/clean`, {
        method: 'POST',
        headers: getHeaders(true),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      console.log('✅ Clean cart success:', result);
      return result;
    } catch (error) {
      console.error('❌ Clean cart error:', error);
      throw error;
    }
  }
};

// ✅ UPDATED: Auth Service with automatic cart merging
export const authService = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      
      // Save user data and automatically merge cart
      if (result.success && result.data?.token) {
        cookieService.setAuthData(result.data.token, result.data.user);
        
        // Auto-merge guest cart with user cart after login
        try {
          await cartService.mergeCart();
          console.log('✅ Cart automatically merged after login');
        } catch (mergeError) {
          console.warn('⚠️ Cart merge failed after login:', mergeError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      
      // Save user data and automatically merge cart
      if (result.success && result.data?.token) {
        cookieService.setAuthData(result.data.token, result.data.user);
        
        // Auto-merge guest cart with user cart after registration
        try {
          await cartService.mergeCart();
          console.log('✅ Cart automatically merged after registration');
        } catch (mergeError) {
          console.warn('⚠️ Cart merge failed after registration:', mergeError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  googleLogin: async (googleToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ token: googleToken }),
        credentials: 'include'
      });
      
      const result = await handleResponse(response);
      
      if (result.success && result.data?.token) {
        cookieService.setAuthData(result.data.token, result.data.user);
        
        // Auto-merge cart after Google login
        try {
          await cartService.mergeCart();
          console.log('✅ Cart automatically merged after Google login');
        } catch (mergeError) {
          console.warn('⚠️ Cart merge failed after Google login:', mergeError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear cart before logout
      await cartService.clearCart();
      
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      // ALWAYS clear frontend cookies
      cookieService.clearAuthData();
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear frontend data
      cookieService.clearAuthData();
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
      });
      
      const result = await handleResponse(response);
      
      if (result.success && result.data) {
        const user = result.data.user || result.data;
        const token = cookieService.getCurrentToken();
        if (token) {
          cookieService.setAuthData(token, user);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      const result = await handleResponse(response);
      
      if (result.success && result.data) {
        const user = result.data.user || result.data;
        const token = cookieService.getCurrentToken();
        if (token) {
          cookieService.setAuthData(token, user);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

// Store Service
export const storeService = {
  getStores: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${API_BASE_URL}/public/stores?${queryParams}` : `${API_BASE_URL}/public/stores`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get stores error:', error);
      throw error;
    }
  },

  getStoreById: async (storeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/stores/${storeId}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get store error:', error);
      throw error;
    }
  },

  getStoresByCategory: async (category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/stores/category/${category}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get stores by category error:', error);
      throw error;
    }
  },

  searchStores: async (query, filters = {}) => {
    try {
      const searchParams = new URLSearchParams({ q: query, ...filters }).toString();
      const response = await fetch(`${API_BASE_URL}/public/stores/search?${searchParams}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Search stores error:', error);
      throw error;
    }
  },

  getPopularStores: async (limit = 6) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/stores?limit=${limit}&sort=popular`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get popular stores error:', error);
      throw error;
    }
  }
};

// Menu Service
export const menuService = {
  getMenuByStoreId: async (storeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/stores/${storeId}/menu`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get menu error:', error);
      throw error;
    }
  },

  getItemById: async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/menu/items/${itemId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get item error:', error);
      throw error;
    }
  },

  searchMenuItems: async (query, storeId = null) => {
    try {
      const params = new URLSearchParams({ q: query });
      if (storeId) params.append('storeId', storeId);
      
      const response = await fetch(`${API_BASE_URL}/public/menu/search?${params}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Search menu items error:', error);
      throw error;
    }
  }
};

// Order Service
export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  createOrderFromCart: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/orders/from-cart`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Create order from cart error:', error);
      throw error;
    }
  },

  getCustomerOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/orders`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get customer orders error:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/orders/${orderId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId, cancellationReason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ cancellationReason }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  trackOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/orders/${orderId}/track`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Track order error:', error);
      throw error;
    }
  }
};

// Customer Service
export const customerService = {
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get customer profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update customer profile error:', error);
      throw error;
    }
  },

  deleteProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete customer profile error:', error);
      throw error;
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/addresses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(addressData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/addresses/${addressId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(addressData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/addresses/${addressId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }
};

// Utility functions
export const getCurrentToken = () => {
  return cookieService.getCurrentToken();
};

export const getCurrentUser = () => {
  return cookieService.getCurrentUser();
};

export const setAuthData = (token, user) => {
  cookieService.setAuthData(token, user);
};

export const clearAuthData = () => {
  cookieService.clearAuthData();
};

export default {
  authService,
  storeService,
  menuService,
  cartService,
  orderService,
  customerService,
  
  isAuthenticated,
  getCurrentToken,
  getCurrentUser,
  setAuthData,
  clearAuthData
};