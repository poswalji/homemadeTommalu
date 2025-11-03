import { useRouter } from 'next/navigation';
import type { UserRole } from '@/services/api/auth.api';

/**
 * Get the dashboard route based on user role
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'storeOwner':
      return '/store-owner/stores';
    case 'customer':
      // No dedicated /customer route; send customers to main browsing page
      return '/browse';
    default:
      return '/';
  }
}

/**
 * Check if user has access to a route based on their role
 */
export function canAccessRoute(userRole: UserRole | undefined, route: string): boolean {
  if (!userRole) return false;

  if (route.startsWith('/admin')) {
    return userRole === 'admin';
  }

  if (route.startsWith('/store-owner')) {
    return userRole === 'storeOwner';
  }

  if (route.startsWith('/browse')) {
    return userRole === 'customer';
  }

  // Public routes
  return true;
}

/**
 * Hook to redirect user to their dashboard based on role
 */
export function useRoleBasedRedirect(role: UserRole | undefined) {
  const router = useRouter();

  const redirectToDashboard = () => {
    if (!role) {
      router.push('/login');
      return;
    }

    const dashboardRoute = getDashboardRoute(role);
    router.push(dashboardRoute);
  };

  return { redirectToDashboard };
}

