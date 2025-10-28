"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export function Header() {
  const { cartCount } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2" aria-label="TomMalu Home">
          <Image src="/logo.png" alt="TomMalu" width={120} height={32} priority  />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            About
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
          <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B6B] text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          <Button variant="default">Sign In</Button>
        </div>
      </div>
    </header>
  );
}

