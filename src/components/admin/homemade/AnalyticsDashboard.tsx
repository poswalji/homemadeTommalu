import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, IndianRupee, Truck, Clock, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsDashboardProps {
    data: any;
    isLoading: boolean;
    onPendingOrdersClick?: () => void;
}

export function AnalyticsDashboard({ data, isLoading, onPendingOrdersClick }: AnalyticsDashboardProps) {
    if (isLoading) {
        return <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
            <Skeleton className="h-64 w-full" />
        </div>;
    }

    const { overall, today, monthly, statusBreakdown, dailyTrend } = data || {};

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Orders (All Time)"
                    value={overall?.totalOrders || 0}
                    icon={<ShoppingCart className="w-6 h-6 text-orange-600" />}
                    bg="bg-orange-50 border-orange-200"
                />
                <StatCard
                    title="Today's Revenue"
                    value={`₹${(today?.totalRevenue || 0).toLocaleString('en-IN')}`}
                    subvalue={`${today?.lunchOrders || 0} Lunch, ${today?.dinnerOrders || 0} Dinner`}
                    icon={<IndianRupee className="w-6 h-6 text-green-600" />}
                    bg="bg-green-50 border-green-200"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹${(monthly?.totalRevenue || 0).toLocaleString('en-IN')}`}
                    subvalue={`${monthly?.totalOrders || 0} Orders`}
                    icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
                    bg="bg-blue-50 border-blue-200"
                />
                <StatCard
                    title="Pending Orders"
                    value={statusBreakdown?.find((s: any) => s._id.toLowerCase() === 'pending')?.count || 0}
                    subvalue="Action Required"
                    icon={<Clock className="w-6 h-6 text-red-600" />}
                    bg="bg-red-50 border-red-200"
                    onClick={onPendingOrdersClick}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Trend Chart */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dailyTrend && dailyTrend.length > 0 ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-4 text-sm font-semibold text-gray-500 pb-2 border-b">
                                    <div>Date</div>
                                    <div>Lunch</div>
                                    <div>Dinner</div>
                                    <div className="text-right">Revenue</div>
                                </div>
                                {dailyTrend.map((day: any) => (
                                    <div key={day._id} className="grid grid-cols-4 items-center py-2 border-b last:border-0 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">{day._id}</span>
                                        </div>
                                        <div className="text-sm">{day.lunch || 0}</div>
                                        <div className="text-sm">{day.dinner || 0}</div>
                                        <div className="text-sm font-bold text-right text-green-600">₹{day.revenue}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">No trend data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, subvalue, icon, bg, onClick }: any) {
    return (
        <Card
            className={`${bg} shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-600 opacity-90">{title}</p>
                        <h3 className="text-2xl font-bold mt-1 mb-1">{value}</h3>
                        {subvalue && <p className="text-xs text-gray-500">{subvalue}</p>}
                    </div>
                    <div className="p-2 bg-white/50 rounded-xl">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}
