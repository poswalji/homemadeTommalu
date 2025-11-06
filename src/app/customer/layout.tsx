'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomerNavigation } from '@/components/layout/customer-navigation';
import { Suspense, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Suspense>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex relative">
          {/* Mobile Menu Button */}
          <div className="md:hidden fixed top-20 left-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white shadow-md"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Unified Navigation (Sidebar for desktop, Bottom bar for mobile) */}
          <CustomerNavigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content */}
          <main className="flex-1 md:ml-64 pt-4 md:pt-4 pb-20 md:pb-8 min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        {/* Footer - Hidden on mobile for customer pages since we have bottom navigation */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    </Suspense>
  );
}
