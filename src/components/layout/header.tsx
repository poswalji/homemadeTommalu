"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { ShoppingCart, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { cartCount } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2" aria-label="TomMalu Home">
          <Image src="/logo.png" alt="TomMalu" width={120} height={32} priority  />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Home
          </Link>
        
          <Link href="/food" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Food
          </Link>
          <Link href="/grocery" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Grocery
          </Link>
          <Link href="/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            My Orders
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
          <Button onClick={() => router.push('/login')} variant="default" className="hidden md:inline-flex">Sign In</Button>
          
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
              href="/food" 
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
            <Link 
              href="/orders" 
              className="text-base font-medium text-gray-600 hover:text-gray-900 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Orders
            </Link>
            <div className="pt-4 border-t">
              <Button onClick={() => router.push('/login')} variant="default" className="w-full">Sign In</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

