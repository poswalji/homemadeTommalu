'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomerSidebar } from '@/components/layout/customer-sidebar';
import { Suspense, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Suspense>

    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-20 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white shadow-md"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Sidebar */}
        <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-20 md:pt-4 pb-8">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
    </Suspense>

  );
}
