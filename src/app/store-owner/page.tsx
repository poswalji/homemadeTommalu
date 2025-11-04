'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyStores, useStoreOwnerOrders } from '@/hooks/api';
import { useMyPayouts, useEarningsStatement } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Store, ShoppingBag, DollarSign, TrendingUp, Package,
  AlertCircle, CreditCard, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useAuthMe } from '@/hooks/api';

export default function StoreOwnerDashboard() {
  const { data: authData } = useAuthMe();
  const { data: storesData, isLoading: storesLoading } = useMyStores();
  const { data: ordersData, isLoading: ordersLoading } = useStoreOwnerOrders();
  const { data: payoutsData, isLoading: payoutsLoading } = useMyPayouts({ limit: 10 });
  const { data: earningsData, isLoading: earningsLoading } = useEarningsStatement({ limit: 1 });

  const stores = storesData?.data || [];
  const orders = ordersData?.data || [];
  const payouts = payoutsData?.data || [];
  const earningsSummary = payoutsData?.summary;
  const earnings = earningsData?.summary;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeStores = stores.filter((s: any) => s.status === 'active').length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingStores = stores.filter((s: any) => s.status === 'pendingApproval' || s.status === 'submitted').length;
  const totalOrders = orders.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingOrders = orders.filter((o: any) => o.status === 'Pending').length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedOrders = orders.filter((o: any) => o.status === 'Delivered').length;
  
  const totalEarnings = earningsSummary?.totalEarnings || earnings?.totalPayout || 0;
  const pendingPayouts = earningsSummary?.pendingPayouts || 0;

  const stats = [
    {
      title: 'Active Stores',
      value: activeStores,
      subtitle: `${pendingStores} pending`,
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/store-owner/stores',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      subtitle: `${completedOrders} completed`,
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/store-owner/orders',
    },
    {
      title: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString('en-IN')}`,
      subtitle: `₹${pendingPayouts.toLocaleString('en-IN')} pending`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/store-owner/earnings',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      subtitle: 'Require attention',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/store-owner/orders',
    },
  ];

  const isLoading = storesLoading || ordersLoading || payoutsLoading || earningsLoading;

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Welcome back, {authData?.user?.name || 'Store Owner'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/store-owner/earnings">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Earnings
            </Button>
          </Link>
          <Link href="/store-owner/payouts">
            <Button variant="outline" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Payouts
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.link}>
              <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-4 hover:border-l-current group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-2" />
                    ) : (
                      <>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                          {stat.value}
                        </p>
                        {stat.subtitle && (
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.subtitle}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders and Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
            <Link href="/store-owner/orders">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {orders.slice(0, 5).map((order: any) => (
                  <Link key={order.id} href={`/store-owner/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {order.customerName || 'Customer'}
                          </p>
                          <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          Order #{order.id.slice(-8)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-sm sm:text-base">
                          ₹{order.finalPrice?.toLocaleString('en-IN') || '0'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Recent Payouts</CardTitle>
            <Link href="/store-owner/payouts">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {payoutsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : payouts.length > 0 ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {payouts.slice(0, 5).map((payout: any) => (
                  <Link key={payout.id} href={`/store-owner/payouts/${payout.id}`}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {payout.storeId?.storeName || 'Store'}
                          </p>
                          <Badge 
                            variant={
                              payout.status === 'completed' ? 'default' : 
                              payout.status === 'approved' ? 'default' : 
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {payout.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {payout.orderCount} orders
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-sm sm:text-base">
                          ₹{payout.netPayoutAmount?.toLocaleString('en-IN') || '0'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No payouts yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/store-owner/stores">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <Store className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Manage Stores</div>
                  <div className="text-xs text-gray-500">{activeStores} active</div>
                </div>
              </Button>
            </Link>
            <Link href="/store-owner/orders">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <ShoppingBag className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">View Orders</div>
                  <div className="text-xs text-gray-500">{pendingOrders} pending</div>
                </div>
              </Button>
            </Link>
            <Link href="/store-owner/earnings">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <TrendingUp className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Earnings</div>
                  <div className="text-xs text-gray-500">View statements</div>
                </div>
              </Button>
            </Link>
            <Link href="/store-owner/payouts">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <CreditCard className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Payouts</div>
                  <div className="text-xs text-gray-500">₹{pendingPayouts.toLocaleString('en-IN')} pending</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

