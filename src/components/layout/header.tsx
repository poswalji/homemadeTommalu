'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
   ShoppingCart,
   Menu,
   X,
   LogOut,
   Home,
   ShoppingBag,
   User,
   MapPin,
   Star,
   AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/hooks/api/use-cart';
import { getGuestCart } from '@/lib/cart-storage';
import { useLogout } from '@/hooks/api/use-auth';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const customerNavItems = [
   { name: 'Dashboard', href: '/customer', icon: Home },
   { name: 'Orders', href: '/customer/orders', icon: ShoppingBag },
   { name: 'Addresses', href: '/customer/addresses', icon: MapPin },
   { name: 'Reviews', href: '/customer/reviews', icon: Star },
   { name: 'Disputes', href: '/customer/disputes', icon: AlertCircle },
   { name: 'Profile', href: '/customer/profile', icon: User },
];

export function Header() {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [customerSidebarOpen, setCustomerSidebarOpen] = useState(false);
   const router = useRouter();
   const pathname = usePathname();
   const { isAuthenticated, user } = useAuth();
   const { data: cartData } = useCart();
   const logout = useLogout();

   // Check if we're on a customer page
   const isCustomerPage = pathname?.startsWith('/customer');

   // Close menus on route change

   const guestCount = useMemo(() => {
      try {
         return getGuestCart().items.reduce(
            (sum, it) => sum + (it.quantity || 0),
            0
         );
      } catch {
         return 0;
      }
   }, []);

   const cartCount = useMemo(() => {
      if (isAuthenticated) {
         return cartData?.data?.totalItems || 0;
      }
      return guestCount;
   }, [isAuthenticated, cartData, guestCount]);

   return (
      <>
         <header className='sticky top-0 z-50 w-full border-b bg-white/85 backdrop-blur'>
            <div className='container flex h-16 items-center justify-between px-4 mx-auto'>
               <Link
                  href='/'
                  className='flex items-center space-x-2'
                  aria-label='TomMalu Home'>
                  <Image
                     src='/logo.png'
                     alt='TomMalu'
                     width={120}
                     height={32}
                     priority
                  />
               </Link>

               {/* Desktop Navigation */}
               <nav className='hidden md:flex items-center space-x-6'>
                  {!isCustomerPage ? (
                     <>
                        <Link
                           href='/'
                           className='text-base font-medium text-gray-900'>
                           Home
                        </Link>
                        <Link
                           href='/category/Restaurant'
                           className='text-base font-medium text-gray-900'>
                           Food
                        </Link>
                        <Link
                           href='/category/Bakery'
                           className='text-base font-medium text-gray-900'>
                           Bakery
                        </Link>
                        <Link
                           href='/category/Grocery%20Store'
                           className='text-base font-medium text-gray-900'>
                           Grocery
                        </Link>

                        {!isAuthenticated && (
                           <Link
                              href='/partner'
                              className='text-base font-medium text-gray-900'>
                              Partner with Tommalu
                           </Link>
                        )}
                        {user?.role === 'storeOwner' && (
                           <Link
                              href='/store-owner/stores'
                              className='text-base font-medium text-gray-900'>
                              My Stores
                           </Link>
                        )}
                        {user?.role === 'customer' && (
                           <Link
                              href='/customer'
                              className='text-base font-medium text-gray-900'>
                              Dashboard
                           </Link>
                        )}
                     </>
                  ) : null}
               </nav>

               <div className='flex items-center space-x-4'>
                  {isAuthenticated && <NotificationBell />}
                  <Link href='/cart'>
                     <Button
                        variant='ghost'
                        size='icon'
                        className='relative'>
                        <ShoppingCart className='h-5 w-5' />
                        {cartCount > 0 && (
                           <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[lab(66%_50.34_52.19)] text-xs text-white'>
                              {cartCount}
                           </span>
                        )}
                     </Button>
                  </Link>
                  {!isAuthenticated ? (
                     <>
                        <Button
                           onClick={() => router.push('/login')}
                           variant='default'
                           className='hidden md:inline-flex'>
                           Sign In
                        </Button>
                     </>
                  ) : (
                     <>
                        <Button
                           onClick={() => logout.mutate()}
                           variant='ghost'
                           className='hidden md:inline-flex'>
                           <LogOut className='h-4 w-4 mr-2' /> Logout
                        </Button>
                     </>
                  )}

                  {/* Mobile Menu Button */}
                  <Button
                     variant='ghost'
                     size='icon'
                     className='md:hidden'
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                     {mobileMenuOpen ? (
                        <X className='h-6 w-6' />
                     ) : (
                        <Menu className='h-6 w-6' />
                     )}
                  </Button>
               </div>
            </div>

            {/* Mobile Menu - All Pages */}
            {mobileMenuOpen && (
               <div className='md:hidden border-t bg-white'>
                  <nav className='flex flex-col px-4 py-4 space-y-1'>
                     <Link
                        href='/'
                        className='flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors'
                        onClick={() => setMobileMenuOpen(false)}>
                        <Home className='w-5 h-5 text-gray-500' />
                        Home
                     </Link>
                     <Link
                        href='/category/Restaurant'
                        className='flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors'
                        onClick={() => setMobileMenuOpen(false)}>
                        <div className='w-5 h-5 flex items-center justify-center text-xl'>🍽️</div>
                        Food
                     </Link>
                     <Link
                        href='/category/Bakery'
                        className='flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors'
                        onClick={() => setMobileMenuOpen(false)}>
                        <div className='w-5 h-5 flex items-center justify-center text-xl'>🥐</div>
                        Bakery
                     </Link>
                     <Link
                        href='/category/Grocery%20Store'
                        className='flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors'
                        onClick={() => setMobileMenuOpen(false)}>
                        <div className='w-5 h-5 flex items-center justify-center text-xl'>🛒</div>
                        Grocery
                     </Link>

                     <div className='pt-4 border-t space-y-2'>
                        {!isAuthenticated ? (
                           <>
                              <Button
                                 onClick={() => {
                                    router.push('/login');
                                    setMobileMenuOpen(false);
                                 }}
                                 variant='default'
                                 className='w-full'>
                                 Sign In
                              </Button>
                              <Button
                                 onClick={() => {
                                    router.push('/partner');
                                    setMobileMenuOpen(false);
                                 }}
                                 variant='outline'
                                 className='w-full'>
                                 Partner with Tommalu
                              </Button>
                           </>
                        ) : (
                           <div className='flex justify-between space-x-2'>
                              <Button
                                 onClick={() => {
                                    router.push(
                                       user?.role === 'storeOwner'
                                          ? '/store-owner/stores'
                                          : '/customer'
                                    );
                                    setMobileMenuOpen(false);
                                 }}
                                 variant='outline'
                                 className='w-full'>
                                 Dashboard
                              </Button>
                              <Button
                                 onClick={() => {
                                    logout.mutate();
                                    setMobileMenuOpen(false);
                                 }}
                                 variant='ghost'
                                 className='w-full'>
                                 Logout
                              </Button>
                           </div>
                        )}
                     </div>
                  </nav>
               </div>
            )}
         </header >

         {/* Customer Sidebar - Desktop */}
         {
            isCustomerPage && (
               <aside className='hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex-col z-30'>
                  <div className='p-6 border-b border-gray-200'>
                     <h2 className='text-xl font-bold text-gray-900'>Tommalu</h2>
                  </div>

                  <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
                     {customerNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                           <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                 isActive
                                    ? 'bg-[lab(66%_50.34_52.19)] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                              )}>
                              <Icon className='w-5 h-5 shrink-0' />
                              <span className='font-medium'>{item.name}</span>
                           </Link>
                        );
                     })}
                  </nav>

                  <div className='p-4 border-t border-gray-200 bg-white mt-auto'>
                     <Button
                        variant='ghost'
                        className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50'
                        onClick={() => logout.mutate()}
                        disabled={logout.isPending}>
                        {logout.isPending ? (
                           <>
                              <Spinner
                                 size='sm'
                                 className='mr-3'
                              />
                              Logging out...
                           </>
                        ) : (
                           <>
                              <LogOut className='w-5 h-5 mr-3' />
                              Logout
                           </>
                        )}
                     </Button>
                  </div>
               </aside>
            )
         }

         {/* Customer Mobile Bottom Navigation */}
         {isCustomerPage && (
            <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 md:hidden'>
               <div className='flex items-center justify-around h-14 sm:h-16 px-1 sm:px-2 pb-2 sm:pb-2'>
                  {customerNavItems.map((item) => {
                     const Icon = item.icon;
                     const isActive = pathname === item.href;
                     return (
                        <Link
                           key={item.href}
                           href={item.href}
                           className={cn(
                              'flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 h-full transition-colors min-w-0 px-1',
                              isActive
                                 ? 'text-[lab(66%_50.34_52.19)]'
                                 : 'text-gray-600'
                           )}>
                           <Icon
                              className={cn(
                                 'w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform',
                                 isActive && 'scale-110'
                              )}
                           />
                           <span
                              className={cn(
                                 'text-[9px] sm:text-[10px] font-medium truncate w-full text-center leading-tight',
                                 isActive && 'font-semibold'
                              )}>
                              {item.name}
                           </span>
                        </Link>
                     );
                  })}
               </div>
            </nav>
         )}

      </>
   );
}
