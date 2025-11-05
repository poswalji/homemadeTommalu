'use client';

import { StoreOwnerSidebar } from '@/components/layout/store-owner-sidebar';
import { Menubar } from '@/components/layout/menubar';
import { useAuthMe } from '@/hooks/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: authData, isLoading } = useAuthMe();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!authData?.user || authData.user.role !== 'storeOwner')) {
      router.push('/login');
    }
  }, [authData, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!authData?.user || authData.user.role !== 'storeOwner') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StoreOwnerSidebar name={authData.user.name} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className='flex-1 flex flex-col min-w-0'>
        <Menubar 
          title={authData.user.name} 
          isMenuOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

