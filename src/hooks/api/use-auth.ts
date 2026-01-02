import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  authApi,
  type RegisterData,
  type LoginData,
  type GoogleLoginData,
  type UpdateUserData,
  type ChangePasswordData,
  type VerifyEmailData,
  type ResendVerificationData,
  type ForgotPasswordData,
  type ResetPasswordData,
} from '@/services/api/auth.api';
import { useAuth } from '@/providers/auth-provider';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Get current user profile
export const useAuthMe = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch (error) {
        // If 401, clear auth data
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          if (axiosError.response?.status === 401) {
            const { cookieService } = await import('@/utills/cookies');
            cookieService.clearAuthData();
          }
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: typeof window !== 'undefined', // Only run in browser
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.me(), { success: true, user: data.user });
        // Redirect is handled by the component to support role-based routing
      }
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const result = await authApi.login(data);
      console.log('Login result:', result);
      return result;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.me(), { success: true, user: data.user });
        // Redirect is handled by the component to support role-based routing
      }
    },
  });
};

// Google login mutation
export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoogleLoginData) => authApi.googleLogin(data),
    onSuccess: (data) => {
      if (data.success) {
        // Fix: Structure must match AuthResponse (user, not data)
        queryClient.setQueryData(authKeys.me(), { success: true, user: data.user });
        queryClient.invalidateQueries({ queryKey: authKeys.me() });
        // Redirect is handled by the component
      }
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { setUser } = useAuth()

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
      const { cookieService } = await import('@/utills/cookies');
      cookieService.clearAuthData();

    },
    onSuccess: () => {
      queryClient.clear();
      setUser(null)

      router.push('/login');
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserData) => authApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
  });
};

// Delete account mutation
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });
};

// Verify email mutation
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyEmailData) => authApi.verifyEmail(data),
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.me(), { success: true, user: data.user });
      }
    },
  });
};

// Resend verification code mutation
export const useResendVerificationCode = () => {
  return useMutation({
    mutationFn: (data: ResendVerificationData) => authApi.resendVerificationCode(data),
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
  });
};

// Reset password mutation
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResetPasswordData) => authApi.resetPassword(data),
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.me(), { success: true, user: data.user });
      }
    },
  });
};

