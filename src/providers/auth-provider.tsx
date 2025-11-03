"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthMe } from '@/hooks/api/use-auth';
import { cookieService } from '@/utills/cookies';
import type { User } from '@/services/api/auth.api';
import { getDashboardRoute } from '@/lib/auth-utils';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user from cookie directly (only on client side)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      return cookieService.getCurrentUser();
    }
    return null;
  });
  const [isInitialized, setIsInitialized] = useState(() => typeof window !== 'undefined');
  const router = useRouter();
  const pathname = usePathname();

  // Auto-login: Check for existing auth token
  const { data: authData, isLoading, refetch } = useAuthMe();

  // Update user when auth data changes
  useEffect(() => {
    if (authData?.success && authData?.user) {
      setTimeout(() => {
        setUser(authData.user);
      }, 1000);
      // Update cookie with latest user data
      const token = cookieService.getCurrentToken();
      if (token) {
        cookieService.setAuthData(token);
      }
    } else if (authData && !authData.success) {
      setTimeout(() => {
        setUser(null);
      }, 1000);
    }
  }, [authData]);

  useEffect(() => {
    if (isInitialized && user && (pathname === '/login' || pathname === '/register' || pathname === '/verify-email')) {
      // Only redirect if email is verified
      if (user.emailVerified !== false) {
        const dashboardRoute = getDashboardRoute(user.role);
        router.push(dashboardRoute);
      }
    }
  }, [user, pathname, isInitialized, router]);

  const value: AuthContextType = {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
    refetch: async () => {
      await refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



