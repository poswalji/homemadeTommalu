'use client';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Menubar } from '@/components/layout/menubar';
import { useAuthMe } from '@/hooks/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AdminLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const { data: authData, isLoading } = useAuthMe();
   const router = useRouter();
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   useEffect(() => {
      if (!isLoading && (!authData?.user || authData.user.role !== 'admin')) {
         router.push('/login');
      }
   }, [authData, isLoading, router]);

   if (!isMounted) {
      return null;
   }

   if (isLoading) {
      return (
         <>
            <div className='flex flex-col items-center justify-center h-screen bg-white'>
               <div className='relative mb-6'>
                  {/* Rotating rounded animated border */}
                  <div
                     className='absolute inset-0 border-[#d7660f] rounded-full border-4 border-lab animate-spin border-lab-500 border-t-transparent'
                     style={{
                        width: '60px',
                        height: '60px',
                        borderTopColor: 'transparent',
                     }}></div>
               </div>
            </div>
            <style
               jsx
               global>{`
               @keyframes spin {
                  to {
                     transform: rotate(360deg);
                  }
               }
               .animate-spin {
                  animation: spin 1s linear infinite;
               }
            `}</style>
         </>
      );
   }
   if (!authData?.user || authData.user.role !== 'admin') {
      return null;
   }

   return (
      <div className='flex min-h-screen bg-gray-50'>
         <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
         <div className='flex-1 flex flex-col min-w-0'>
            <Menubar
               title="Tommalu Admin"
               isMenuOpen={sidebarOpen}
               onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <main className='flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300'>
               {children}
            </main>
         </div>
      </div>
   );
}
