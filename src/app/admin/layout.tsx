'use client';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useAuthMe } from '@/hooks/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: authData, isLoading } = useAuthMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!authData?.user || authData.user.role !== 'admin')) {
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

  if (!authData?.user || authData.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

