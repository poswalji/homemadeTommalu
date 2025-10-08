// services/api.jsx
import { cookieService } from '../utills/cookies';

const API_BASE_URL = process.env.NODE_ENV === 'production'  ? 'https://your-backend-domain.com/api/v1' : 'http://localhost:3000/api';

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

// ✅ IMPROVED: Authentication check with guest support





// ✅ IMPROVED: Get headers with guest support for CART requests only
const getCartHeaders = () => {
  const isLoggedIn = isAuthenticated();
  const headers = getHeaders(isLoggedIn);
  
  // Add guest ID for non-logged-in users in CART requests
  
  
  return headers;
};

// ✅ IMPROVED: Get cart URL with guest ID for GET requests
const getCartUrl = () => {
  const isLoggedIn = isAuthenticated();
  let url = `${API_BASE_URL}/cart`;
  
  // Add guestId query parameter for guests in GET requests
  if (!isLoggedIn) {
    const guestId = guestCartService.getOrCreateGuestId();
    url += `?guestId=${guestId}`;
  }
  
  return url;
};

// Authentication Service
export const isAuthenticated = () => {
  return cookieService.isAuthenticated();
};

// ✅ SIMPLE: Authentication Service
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
      
      // ✅ Save user data in cookies
      if (result.success && result.data?.token) {
        cookieService.setAuthData(result.data.token, result.data.user);
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
      
      // ✅ Save user data in cookies
      if (result.success && result.data?.token) {
        cookieService.setAuthData(result.data.token, result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
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
      
      // ✅ Update cookies with fresh user data
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
      
      // ✅ Update cookies with updated user data
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
      
      // ✅ Save user data in cookies
      if (result.success && result.data?.token) {
        cookieService.setAuthData(result.data.token, result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      // ✅ ALWAYS clear frontend cookies
      cookieService.clearAuthData();
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear frontend data
      cookieService.clearAuthData();
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

// ✅ FIXED: Cart Service with proper guest ID handling
export const cartService = {
  addToCart: async (itemData) => {
    try {
      const isLoggedIn = isAuthenticated();
      
      console.log('🍪 Cookie Based - Add to Cart');
      console.log('🔐 User Status:', isLoggedIn ? 'Logged In' : 'Anonymous');
      console.log('🛒 Item Data:', itemData);

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: getHeaders(isLoggedIn),
        body: JSON.stringify(itemData),
        credentials: 'include', // ✅ IMPORTANT: This sends cookies automatically
      });
      
      const result = await handleResponse(response);
      console.log('✅ Add to cart response:', result);
      return result;
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      throw error;
    }
  },

  getCart: async () => {
    try {
      const isLoggedIn = isAuthenticated();
      
      console.log('🍪 Cookie Based - Get Cart');
      console.log('🔐 User Status:', isLoggedIn ? 'Logged In' : 'Anonymous');

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getHeaders(isLoggedIn),
        credentials: 'include', // ✅ IMPORTANT: This sends cookies automatically
      });
      
      const result = await handleResponse(response);
      console.log('✅ Get cart response:', result);
      return result;
    } catch (error) {
      console.error('❌ Get cart error:', error);
      throw error;
    }
  },

  updateCartQuantity: async (menuItemId, quantity) => {
    try {
      const isLoggedIn = isAuthenticated();
      
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: 'PATCH',
        headers: getHeaders(isLoggedIn),
        body: JSON.stringify({ menuItemId, quantity }),
        credentials: 'include', // ✅ IMPORTANT
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update cart error:', error);
      throw error;
    }
  },

  removeFromCart: async (menuItemId) => {
    try {
      const isLoggedIn = isAuthenticated();
      
      const response = await fetch(`${API_BASE_URL}/cart/remove`, {
        method: 'DELETE',
        headers: getHeaders(isLoggedIn),
        body: JSON.stringify({ menuItemId }),
        credentials: 'include', // ✅ IMPORTANT
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const isLoggedIn = isAuthenticated();
      
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders(isLoggedIn),
        credentials: 'include', // ✅ IMPORTANT
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  },

  mergeCart: async () => {
    try {
      // ✅ Cookie based - no need for guest ID, backend automatically merges
      const response = await fetch(`${API_BASE_URL}/cart/merge-from-cart`, {
        method: 'POST',
        headers: getHeaders(true), // Must be logged in
        credentials: 'include', // ✅ IMPORTANT
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Merge cart error:', error);
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
  return localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  // ✅ Clear guest ID when user logs in
  guestCartService.clearGuestId();
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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