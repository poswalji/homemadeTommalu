'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardAnalytics, useOrderAnalytics } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Chart } from '@/components/ui/chart';
import { 
  BarChart3, DollarSign, ShoppingBag, Users, Calendar, Download, Utensils,
  TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Repeat
} from 'lucide-react';

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

  const analytics = dashboardData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Homemade Analytics</h1>
          <p className="text-gray-600 mt-2 text-sm">Comprehensive homemade food insights</p>
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
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Financial Overview */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Financial Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(analytics?.revenue?.total || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">From non-cancelled orders</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Expenses</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(analytics?.expenses?.total || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Recorded backend expenses</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Profit</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(analytics?.profit?.netProfit || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Revenue - Expenses</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Dues</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(analytics?.revenue?.pending || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Uncollected order payments</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Overview */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Operations & Subscriptions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed Orders</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {analytics?.orders?.completed || 0}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Subs</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {analytics?.subscriptions?.active || 0}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming Renewals</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {analytics?.subscriptions?.upcomingRenewals || 0}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Expiring in 7 days</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Lunch Plates Delivered</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {analytics?.orders?.lunchCount || 0}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Includes multiple plates per order</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Dinner Plates Delivered</p>
                {dashboardLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {analytics?.orders?.dinnerCount || 0}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Includes multiple plates per order</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Financial Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Financial Trajectory (Revenue vs Expense vs Profit)</CardTitle>
        </CardHeader>
        <CardContent>
          {orderLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : orderAnalytics?.data && orderAnalytics.data.length > 0 ? (
            <div className="w-full overflow-x-auto pb-4">
              <div className="min-w-[600px] pr-4">
                <Chart
                  data={orderAnalytics.data.map((item: any) => ({
                    ...item,
                    label: item._id,
                  }))}
                  config={{
                    totalRevenue: { label: 'Gross Revenue', color: '#3B82F6' },
                    totalExpenses: { label: 'Total Expenses', color: '#EF4444' },
                    netProfit: { label: 'Net Profit', color: '#10B981' },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No financial data available for selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Order Operations Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {orderLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : orderAnalytics?.data && orderAnalytics.data.length > 0 ? (
            <div className="w-full overflow-x-auto pb-4">
              <div className="min-w-[600px] pr-4">
                <Chart
                  data={orderAnalytics.data.map((item: any) => ({
                    ...item,
                    label: item._id,
                  }))}
                  config={{
                    totalOrders: { label: 'Total Orders', color: '#f97316' },
                    completedOrders: { label: 'Completed', color: '#10B981' },
                    cancelledOrders: { label: 'Cancelled', color: '#EF4444' },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No order data available for selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Customer Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-600">Total Registered Customers</p>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.users?.customers || 0}
                </p>
              )}
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(analytics?.orders?.averageOrderValue || 0).toFixed(2)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Based on completed orders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
