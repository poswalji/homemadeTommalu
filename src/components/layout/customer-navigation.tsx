'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingBag, 
  User, 
  MapPin,
  Star,
  AlertCircle,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLogout } from '@/hooks/api';
import { useEffect } from 'react';

const customerNavItems = [
  { name: 'Dashboard', href: '/customer', icon: Home },
  { name: 'Orders', href: '/customer/orders', icon: ShoppingBag },
  { name: 'Addresses', href: '/customer/addresses', icon: MapPin },
  { name: 'Reviews', href: '/customer/reviews', icon: Star },
  { name: 'Disputes', href: '/customer/disputes', icon: AlertCircle },
  { name: 'Profile', href: '/customer/profile', icon: User },
];

interface CustomerNavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CustomerNavigation({ isOpen = false, onClose }: CustomerNavigationProps) {
  const pathname = usePathname();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex-col z-30">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Tommalu</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {customerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-[lab(66%_50.34_52.19)] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <>
                <Spinner size="sm" className="mr-3" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 overflow-y-auto z-50 transition-transform duration-300 ease-in-out md:hidden",
          "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tommalu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {customerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-[lab(66%_50.34_52.19)] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <>
                <Spinner size="sm" className="mr-3" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 md:hidden">
        <div className="flex items-center justify-around h-14 sm:h-16 px-1 sm:px-2 pb-2 sm:pb-2">
          {customerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 h-full transition-colors min-w-0 px-1",
                  isActive
                    ? "text-[lab(66%_50.34_52.19)]"
                    : "text-gray-600"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-[9px] sm:text-[10px] font-medium truncate w-full text-center leading-tight",
                  isActive && "font-semibold"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

