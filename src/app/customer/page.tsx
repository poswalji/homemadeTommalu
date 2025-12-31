'use client';

import { useAuth } from '@/providers/auth-provider';
import { useMyOrders } from '@/hooks/api/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, MapPin, Star, User, Package, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: ordersData, isLoading } = useMyOrders();
  const orders = ordersData?.data || [];

  // Calculate stats
  const activeOrders = orders.filter(o =>
    ['Pending', 'Confirmed', 'OutForDelivery'].includes(o.status)
  );
  const totalOrders = orders.length;
  // Mock total spent calculation or other stats if needed

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'OutForDelivery': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your account.</p>
        </div>
        <Link href="/category/Restaurant">
          <Button className="bg-[lab(66%_50.34_52.19)] hover:bg-[lab(60%_50.34_52.19)]">
            Browse Food
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Orders</p>
              <h3 className="text-2xl font-bold mt-1">{activeOrders.length}</h3>
            </div>
            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{totalOrders}</h3>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for other stats */}
        <Link href="/customer/addresses" className="block">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Saved Addresses</p>
                <h3 className="text-2xl font-bold mt-1">{user?.addresses?.length || 0}</h3>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/customer/orders">
            <Button variant="ghost" size="sm" className="text-[lab(66%_50.34_52.19)]">
              View All <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : recentOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No orders placed yet.</p>
              <Link href="/category/Restaurant" className="mt-4 inline-block">
                <Button variant="outline">Start Ordering</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:border-gray-300 transition-colors">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.storeName || 'Unknown Store'} • {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        ₹{order.finalPrice.toFixed(2)} • {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <Link href={`/customer/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
