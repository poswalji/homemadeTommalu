'use client';

import { useAuthMe } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsers } from '@/hooks/api';
import { useAllOrders } from '@/hooks/api';
import { usePendingStores } from '@/hooks/api';
import { useDashboardAnalytics } from '@/hooks/api';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { 
  Users, ShoppingBag, Store, AlertCircle, TrendingUp, DollarSign, 
  BarChart3, Package, Activity, FileText, Settings, CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Chart } from '@/components/ui/chart';

export default function AdminDashboard() {
  const { data: authData } = useAuthMe();
  const { data: analyticsData, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 1 });
  const { data: ordersData, isLoading: ordersLoading } = useAllOrders();
  const { data: storesData, isLoading: storesLoading } = usePendingStores();

  // Use analytics data if available, otherwise fallback to direct queries
  const analytics = analyticsData?.data;
  const totalUsers = analytics?.users?.total || usersData?.total || usersData?.data?.length || 0;
  const totalOrders = analytics?.orders?.total || ordersData?.total || ordersData?.data?.length || 0;
  const pendingStores = storesData?.data?.length || 0;
  const completedOrders = analytics?.orders?.completed || ordersData?.data?.filter((o: any) => o.status === 'Delivered').length || 0;
  const pendingOrders = analytics?.orders?.pending || ordersData?.data?.filter((o: any) => o.status === 'Pending').length || 0;
  const totalRevenue = analytics?.revenue?.total || ordersData?.data?.reduce((sum: number, o: any) => sum + (o.finalPrice || 0), 0) || 0;
  const totalCommission = analytics?.revenue?.commission || 0;
  const netRevenue = analytics?.revenue?.netRevenue || (totalRevenue - totalCommission);
  const activeStores = analytics?.stores?.active || 0;
  const totalCustomers = analytics?.users?.customers || 0;
  const totalStoreOwners = analytics?.users?.storeOwners || 0;
  const avgOrderValue = analytics?.orders?.averageOrderValue || 0;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      subtitle: `${completedOrders} delivered`,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtitle: `₹${netRevenue.toLocaleString('en-IN')} net`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/analytics',
    },
    {
      title: 'Active Stores',
      value: activeStores,
      subtitle: `${pendingStores} pending approval`,
      icon: Store,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/admin/stores',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      subtitle: `${totalCustomers} customers, ${totalStoreOwners} store owners`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/users',
    },
  ];

  const quickStats = [
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    {
      title: 'Completed Orders',
      value: completedOrders,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Avg Order Value',
      value: `₹${avgOrderValue.toFixed(2)}`,
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Commission',
      value: `₹${totalCommission.toLocaleString('en-IN')}`,
      icon: CreditCard,
      color: 'text-purple-600',
    },
  ];

  const isLoading = analyticsLoading || usersLoading || ordersLoading || storesLoading;
  const recentOrders = analytics?.recentOrders || [];

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Welcome back, {authData?.user?.name || 'Admin'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/disputes">
            <Button variant="outline" size="sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Disputes
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

      {/* Charts and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')} ${stat.color}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">{stat.title}</span>
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        {stat.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {order.customer || 'Customer'}
                        </p>
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {order.store || 'Store'}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-sm sm:text-base">
                        ₹{order.amount?.toLocaleString('en-IN') || '0'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent orders</p>
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
            <Link href="/admin/stores/pending">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <Store className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Pending Stores</div>
                  <div className="text-xs text-gray-500">{pendingStores} waiting</div>
                </div>
              </Button>
            </Link>
            <Link href="/admin/disputes">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <AlertCircle className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Disputes</div>
                  <div className="text-xs text-gray-500">Manage issues</div>
                </div>
              </Button>
            </Link>
            <Link href="/admin/payouts">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <CreditCard className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Payouts</div>
                  <div className="text-xs text-gray-500">Manage payments</div>
                </div>
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <BarChart3 className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs text-gray-500">View reports</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

