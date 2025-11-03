import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { cookieService } from '@/utills/cookies';

// API Base URL from environment or config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = cookieService.getCurrentToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Clear auth and redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only clear auth if this was an authenticated call (had Bearer) or an auth endpoint
      const hadAuthHeader = !!(
        originalRequest.headers &&
        (originalRequest.headers as Record<string, unknown>).Authorization
      );
      const url = (originalRequest.url || '').toString();
      const isAuthEndpoint = url.includes('/auth/');

      if (hadAuthHeader || isAuthEndpoint) {
        cookieService.clearAuthData();
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        // Redirect to home or show error
        console.error('Access forbidden');
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function for handling API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ 
      success?: boolean;
      error?: {
        message?: string;
        type?: string;
        path?: string;
        method?: string;
        stack?: string;
      };
      message?: string;
    }>;
    
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      
      // Handle backend error format: { success: false, error: { message: ... } }
      if (data.error?.message) {
        return data.error.message;
      }
      
      // Fallback to direct message property
      if (data.message) {
        return data.message;
      }
      
      // Fallback to axios error message
      if (axiosError.message) {
        return axiosError.message;
      }
    }
    
    if (axiosError.request) {
      return 'Network error. Please check your connection.';
    }
    
    return 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export default apiClient;

