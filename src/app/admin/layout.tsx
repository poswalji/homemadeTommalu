'use client';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useAuthMe } from '@/hooks/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

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
         <AdminSidebar />
         <main className='flex-1 ml-64 p-8'>{children}</main>
      </div>
   );
}
