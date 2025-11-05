import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/'));

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Customer routes
  const isCustomerRoute = pathname.startsWith('/customer');
  
  // Store Owner routes
  const isStoreOwnerRoute = pathname.startsWith('/store-owner');

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, we'll rely on client-side auth checks in layouts
  // This middleware can be extended with actual token validation if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};




