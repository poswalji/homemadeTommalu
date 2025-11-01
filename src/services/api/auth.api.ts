import apiClient from '@/lib/axios';
import { cookieService } from '@/utills/cookies';

// Types
export type UserRole = 'customer' | 'storeOwner' | 'admin';
export type AddressLabel = 'Home' | 'Work' | 'Other';

export interface Address {
  label?: AddressLabel;
  street: string;
  city: string;
  state?: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  addresses?: Address[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  token: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  addresses?: Address[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  addresses?: Address[];
}

export interface AuthResponse {
  success: boolean;
    token: string;
    user: User;
  message?: string;
}

// Auth API Service
export const authApi = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Auto-save auth data if token is present
    if (response.data?.token) {
      cookieService.setAuthData(response.data.token, response.data.user);
    }
    
    return response.data;
  },

  // Login with email and password
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    // Auto-save auth data if token is present
    if (response.data?.token) {
      cookieService.setAuthData(response.data.token, response.data.user);
    }
    
    return response.data;
  },

  // Logout current user
  logout: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>('/auth/logout');
      cookieService.clearAuthData();
      return response.data;
    } catch (error) {
      // Still clear auth data even if request fails
      cookieService.clearAuthData();
      throw error;
    }
  },

  // Login/Register via Google
  googleLogin: async (data: GoogleLoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google', data);
    
    // Auto-save auth data if token is present
    if (response.data?.token) {
      cookieService.setAuthData(response.data.token, response.data.user);
    }
    
    return response.data;
  },

  // Get current user profile
  getMe: async (): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
      
      // Update stored user data
      if (response.data?.success && response.data.user) {
        const token = cookieService.getCurrentToken();
        if (token) {
          cookieService.setAuthData(token, response.data.user);
        }
      }
      
      return {
        success: response.data?.success || false,
        user: response.data?.user || null,
      };
    } catch (error: any) {
      // If 401, clear auth data
      if (error?.response?.status === 401) {
        cookieService.clearAuthData();
      }
      throw error;
    }
  },

  // Update user details
  updateProfile: async (data: UpdateUserData): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.put<{ success: boolean; data: User }>('/auth/update', data);
    
    // Update stored user data
    if (response.data.success && response.data.data) {
      const token = cookieService.getCurrentToken();
      if (token) {
        cookieService.setAuthData(token, response.data.data);
      }
    }
    
    return response.data;
  },

  // Change user password
  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.put<{ success: boolean; message?: string }>('/auth/change-password', data);
    return response.data;
  },

  // Delete current user account
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/delete');
    cookieService.clearAuthData();
  },
};

