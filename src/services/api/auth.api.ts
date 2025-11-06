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
  emailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
    token: string;
    user: User;
  message?: string;
  verificationToken?: string;
}

export interface VerifyEmailData {
  code: string;
  verificationToken: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ResendVerificationData {
  verificationToken: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Auth API Service
export const authApi = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Auto-save auth data if token is present
      if (response.data?.token) {
        cookieService.setAuthData(response.data.token);
      }
      if (response.data?.user) {
        cookieService.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Login with email and password
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      // Auto-save auth data if token is present
      if (response.data?.token) {
        cookieService.setAuthData(response.data.token);
      }
      if (response.data?.user) {
        cookieService.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
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
    try {
      const response = await apiClient.post<AuthResponse>('/auth/google', data);
      
      // Auto-save auth data if token is present
      if (response.data?.token) {
        cookieService.setAuthData(response.data.token);
      }
      if (response.data?.user) {
        cookieService.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Get current user profile
  getMe: async (): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
      
      // Update stored user data
      if (response.data?.success && response.data.user) {
        const token = cookieService.getCurrentToken();
        if (token) {
          cookieService.setAuthData(token);
        }
        cookieService.setUser(response.data.user);
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
    try {
      const response = await apiClient.put<{ success: boolean; data: User }>('/auth/update', data);
      
      // Update stored user data
      if (response.data.success && response.data.data) {
        const token = cookieService.getCurrentToken();
        if (token) {
          cookieService.setAuthData(token);
        }
        cookieService.setUser(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Change user password
  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.put<{ success: boolean; message?: string }>('/auth/change-password', data);
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Delete current user account
  deleteAccount: async (): Promise<void> => {
    try {
      await apiClient.delete('/auth/delete');
      cookieService.clearAuthData();
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Verify email with code
  verifyEmail: async (data: VerifyEmailData): Promise<VerifyEmailResponse> => {
    try {
      const response = await apiClient.post<VerifyEmailResponse>('/auth/verify-email', data);
      
      // Auto-save auth data if token is present
      if (response.data?.token) {
          cookieService.setAuthData(response.data.token);
      }
      if (response.data?.user) {
          cookieService.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Resend verification code
  resendVerificationCode: async (data: ResendVerificationData): Promise<ResendVerificationResponse> => {
    try {
      const response = await apiClient.post<ResendVerificationResponse>('/auth/resend-verification', data);
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Forgot password - request password reset
  forgotPassword: async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
    try {
      const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
      
      // Auto-save auth data if token is present
      if (response.data?.token) {
        cookieService.setAuthData(response.data.token);
      }
      if (response.data?.user) {
        cookieService.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },
};

