"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/hooks/api/use-cart";
import { getGuestCart } from "@/lib/cart-storage";
import { useLogout } from "@/hooks/api/use-auth";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { data: cartData } = useCart();
  const logout = useLogout();

  const guestCount = useMemo(() => {
    try {
      return getGuestCart().items.reduce((sum, it) => sum + (it.quantity || 0), 0);
    } catch { return 0; }
  }, []);

  const cartCount = useMemo(() => {
    if (isAuthenticated) {
      return cartData?.data?.totalItems || 0;
    }
    return guestCount;
  }, [isAuthenticated, cartData, guestCount]);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/85 backdrop-blur ">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2" aria-label="TomMalu Home">
          <Image src="/logo.png" alt="TomMalu" width={120} height={32} priority  />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-base font-medium text-gray-900 ">
            Home
          </Link>
        
          <Link href="/browse" className="text-base font-medium text-gray-900 ">
            Food
          </Link>
          <Link href="/grocery" className="text-base font-medium text-gray-900 ">
            Grocery
          </Link>
          <Link href="/partner" className="text-base font-medium text-gray-900 ">
            Partner with Tommalu
          </Link>
        
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[lab(66%_50.34_52.19)] text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          {!isAuthenticated ? (
            <>
              <Button onClick={() => router.push('/login')} variant="default" className="hidden md:inline-flex">Sign In</Button>
              <Button onClick={() => router.push('/register')} variant="outline" className="hidden md:inline-flex">Sign Up</Button>
            </>
          ) : (
            <>
              <Button onClick={() => router.push(pathname?.startsWith('/store-owner') ? '/store-owner/stores' : '/browse')} variant="outline" className="hidden md:inline-flex">
                {user?.role === 'storeOwner' ? 'Dashboard' : 'Browse'}
              </Button>
              <Button onClick={() => logout.mutate()} variant="ghost" className="hidden md:inline-flex">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            <Link 
              href="/" 
              className="text-base font-medium text-gray-600 hover:text-gray-900 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
           
            <Link 
              href="/browse" 
              className="text-base font-medium text-gray-600 hover:text-gray-900 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Food
            </Link>
            <Link 
              href="/grocery" 
              className="text-base font-medium text-gray-600 hover:text-gray-900 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Grocery
            </Link>
           
            <div className="pt-4 border-t space-y-2">
              {!isAuthenticated ? (
                <>
                  <Button onClick={() => router.push('/login')} variant="default" className="w-full">Sign In</Button>
                  <Button onClick={() => router.push('/register')} variant="outline" className="w-full">Sign Up</Button>
                  <Button onClick={() => router.push('/partner')} variant="outline" className="w-full">Partner with Tommalu</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => router.push(user?.role === 'storeOwner' ? '/store-owner/stores' : '/browse')} variant="outline" className="w-full">{user?.role === 'storeOwner' ? 'Dashboard' : 'Browse'}</Button>
                  <Button onClick={() => logout.mutate()} variant="ghost" className="w-full">Logout</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

