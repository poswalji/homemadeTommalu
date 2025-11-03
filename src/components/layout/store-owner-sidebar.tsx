'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  Package, 
  ShoppingBag,
  Settings, 
  Plus,
  LogOut,
  DollarSign,
  BarChart3,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLogout } from '@/hooks/api';

const storeOwnerNavItems = [
  { name: 'Dashboard', href: '/store-owner', icon: BarChart3 },
  { name: 'My Stores', href: '/store-owner/stores', icon: Store },
  { name: 'Create Store', href: '/store-owner/stores/new', icon: Plus },
  { name: 'Orders', href: '/store-owner/orders', icon: ShoppingBag },
  { name: 'Earnings', href: '/store-owner/earnings', icon: DollarSign },
  { name: 'Payouts', href: '/store-owner/payouts', icon: CreditCard },
  { name: 'Settings', href: '/store-owner/settings', icon: Settings },
];

export function StoreOwnerSidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Tommalu Store</h2>
      </div>
      
      <nav className="p-4 space-y-2">
        {storeOwnerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ;
          
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
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
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
  );
}


