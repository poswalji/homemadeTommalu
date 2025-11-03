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
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-login: Check for existing auth token
  const { data: authData, isLoading, refetch } = useAuthMe();

  // Initialize user from cookie on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = cookieService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsInitialized(true);
    }
  }, []);

  // Update user when auth data changes
  useEffect(() => {
    if (authData?.success && authData?.user) {
      setUser(authData.user);
      // Update cookie with latest user data
      const token = cookieService.getCurrentToken();
      if (token) {
        cookieService.setAuthData(token, authData.user);
      }
    } else if (authData && !authData.success) {
      setUser(null);
    }
  }, [authData]);

  // Auto-redirect if authenticated and on login/register page
  useEffect(() => {
    if (isInitialized && user && (pathname === '/login' || pathname === '/register')) {
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
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



