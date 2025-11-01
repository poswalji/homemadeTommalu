'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardAnalytics, useOrderAnalytics, useStoreAnalytics, useRevenueAnalytics } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Chart } from '@/components/ui/chart';
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingBag, Store, Users,
  Calendar, Download
} from 'lucide-react';
import { Select } from '@/components/ui/select';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardAnalytics({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  });

  const { data: orderAnalytics, isLoading: orderLoading } = useOrderAnalytics({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
    groupBy,
  });

  const { data: storeAnalytics, isLoading: storeLoading } = useStoreAnalytics();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  });

  const analytics = dashboardData?.data;
  const revenue = revenueData?.data;
  const stores = storeAnalytics?.data;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm">Comprehensive analytics and insights</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filter by Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="groupBy">Group By</Label>
              <select
                id="groupBy"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(revenue?.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Commission</p>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(revenue?.totalCommission || 0).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Revenue</p>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(revenue?.totalPayout || 0).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {analytics?.orders?.total || 0}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Order Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {orderLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : orderAnalytics?.data && orderAnalytics.data.length > 0 ? (
            <Chart
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={orderAnalytics.data.map((item: any) => ({
                ...item,
                label: item._id,
              }))}
              config={{
                totalOrders: { label: 'Total Orders', color: '#3B82F6' },
                completedOrders: { label: 'Completed', color: '#10B981' },
                cancelledOrders: { label: 'Cancelled', color: '#EF4444' },
              }}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data available for selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Analytics */}
      {stores && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Top Stores</CardTitle>
            </CardHeader>
            <CardContent>
              {storeLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stores.topStores && stores.topStores.length > 0 ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {stores.topStores.slice(0, 5).map((store: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">{store.storeName}</p>
                          <p className="text-xs text-gray-500">{store.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm sm:text-base">
                          ₹{((store.totalRevenue || 0)).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500">{store.orderCount} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No store data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {storeLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stores.categoryDistribution && stores.categoryDistribution.length > 0 ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {stores.categoryDistribution.map((cat: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm sm:text-base">{cat._id}</p>
                        <p className="text-xs text-gray-500">
                          {cat.count} stores • Avg Rating: {cat.avgRating?.toFixed(1) || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm sm:text-base">{cat.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-600">Total Users</p>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.users?.total || 0}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {analytics?.users?.customers || 0} customers, {analytics?.users?.storeOwners || 0} store owners
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.orders?.completed || 0}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Avg: ₹{(analytics?.orders?.averageOrderValue || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-medium text-gray-600">Active Stores</p>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.stores?.active || 0}
                </p>
              )}
              {/* Pending stores count removed - not available in dashboard analytics */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

