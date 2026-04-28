'use client';

import { useAuthMe } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHomemadeFoodDashboard } from '@/hooks/api/use-homemade-food';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, DollarSign, Activity, Package, Clock, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: authData } = useAuthMe();
  const { data: dashboardData, isLoading: dashboardLoading } = useHomemadeFoodDashboard();

  const customers = dashboardData?.data?.customers || [];
  
  // Calculate specific metrics
  const totalOrders = customers.length;
  const lunchOrders = customers.filter((c: any) => c.mealType?.toLowerCase() === 'lunch').length;
  const dinnerOrders = customers.filter((c: any) => c.mealType?.toLowerCase() === 'dinner').length;

  const subscriptionOrders = customers.filter((c: any) => c.isSubscription).length;
  const plateWiseOrders = customers.filter((c: any) => !c.isSubscription).length;

  const totalRevenue = dashboardData?.data?.stats?.totalRevenue || 0;
  
  const pendingOrdersList = customers.filter((c: any) => c.status?.toLowerCase() === 'pending');
  const pendingOrdersCount = pendingOrdersList.length;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      subtitle: `${lunchOrders} Lunch • ${dinnerOrders} Dinner`,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/homemade-food',
    },
    {
      title: 'Daily Orders',
      value: totalOrders,
      subtitle: `${subscriptionOrders} Subscription • ${plateWiseOrders} ₹99 Plates`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/homemade-food',
    },
    {
      title: 'Total Revenue (Today)',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtitle: 'Based on received/pending payments',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/homemade-food',
    },
    {
      title: 'Pending Orders',
      value: pendingOrdersCount,
      subtitle: 'Require immediate action',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/admin/homemade-food',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Homemade Food Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Welcome back, {authData?.user?.name || 'Admin'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/homemade-food">
            <Button variant="default" size="sm" className="bg-orange-600 hover:bg-orange-700">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Manage Menu
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
                    {dashboardLoading ? (
                      <Skeleton className="h-8 w-24 mt-2" />
                    ) : (
                      <>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                          {stat.value}
                        </p>
                        {stat.subtitle && (
                          <p className="text-xs text-gray-500 mt-1 font-medium text-orange-600">
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

      {/* Actionable Orders and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Orders List */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" />
              Actionable / Pending Orders
            </CardTitle>
            <Link href="/admin/homemade-food">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All Orders
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingOrdersList.length > 0 ? (
              <div className="space-y-3">
                {pendingOrdersList.slice(0, 10).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {order.name}
                        </p>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs capitalize">
                          {order.status}
                        </Badge>
                        {order.isSubscription && (
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                            Subscription
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <span className="font-medium">{order.plates} Plates</span> • {order.mealType} • {order.area}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-sm sm:text-base text-gray-900">
                        ₹{(order.amount || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                <Activity className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
                <p className="font-medium text-gray-900">All caught up!</p>
                <p className="text-sm mt-1">No pending orders require your action.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
