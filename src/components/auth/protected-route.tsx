'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthMe } from '@/hooks/api';
import { Spinner } from '@/components/ui/spinner';
import { canAccessRoute, getDashboardRoute } from '@/lib/auth-utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'storeOwner' | 'customer';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: authData, isLoading, isError } = useAuthMe();

  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      // If not authenticated, redirect to login
      if (isError || !authData?.user) {
        router.push(redirectTo || '/login');
        return;
      }

      // If role is required and doesn't match, redirect to appropriate dashboard
      if (requiredRole && authData.user.role !== requiredRole) {
        const dashboardRoute = getDashboardRoute(authData.user.role);
        router.push(dashboardRoute);
        return;
      }

      // If user is on login/register page but authenticated, redirect to dashboard
      const currentPath = window.location.pathname;
      if ((currentPath === '/login' || currentPath === '/register') && authData.user) {
        const dashboardRoute = getDashboardRoute(authData.user.role);
        router.push(dashboardRoute);
      }
    }
  }, [authData, isLoading, isError, requiredRole, redirectTo, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (isError || !authData?.user) {
    return null;
  }

  // Check role access
  if (requiredRole && authData.user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}




