'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex relative">
          {/* Main Content */}
          <main className="flex-1 md:ml-64 pt-4 md:pt-4 pb-20 md:pb-8 min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        {/* Footer - Hidden on mobile for customer pages since we have bottom navigation */}
       
      </div>
    </Suspense>
  );
}
