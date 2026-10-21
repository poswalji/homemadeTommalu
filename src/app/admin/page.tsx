'use client';

import { useState, useMemo } from 'react';
import { useAuthMe } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    useHomemadeFoodDashboard, 
    useAdminHomemadeFoodOrders, 
    useUpdateHomemadeFoodOrderStatus,
    useAdminSubscriptionPlans 
} from '@/hooks/api';
import { subscriptionApi } from '@/services/api/subscription.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    ShoppingBag, DollarSign, Activity, Package, Clock, Calendar, 
    CreditCard, Utensils, ChefHat, Bike, Users, CheckCircle2, 
    Sun, Moon, MapPin, Phone, ArrowRight, Search, Check, X, 
    Flame, Sparkles, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const { data: authData } = useAuthMe();

    // 1. Dashboard summary stats
    const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useHomemadeFoodDashboard();

    // 2. Orders data
    const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useAdminHomemadeFoodOrders({
        limit: 100
    });

    // 3. Subscription plans
    const { data: plansData, isLoading: plansLoading } = useAdminSubscriptionPlans();

    // 4. Active subscriptions & requests
    const { data: activeSubsData, isLoading: activeSubsLoading, refetch: refetchSubs } = useQuery({
        queryKey: ['admin-active-subscriptions'],
        queryFn: () => subscriptionApi.getAllActiveSubscriptions('active')
    });

    const { data: subRequestsData, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
        queryKey: ['admin-sub-requests'],
        queryFn: () => subscriptionApi.getAllRequests('pending')
    });

    // Status update mutations
    const updateOrderStatus = useUpdateHomemadeFoodOrderStatus();

    const approveRequestMutation = useMutation({
        mutationFn: (id: string) => subscriptionApi.approveRequest(id),
        onSuccess: () => {
            toast.success("Subscription approved & activated!");
            queryClient.invalidateQueries({ queryKey: ['admin-sub-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-active-subscriptions'] });
            refetchRequests();
            refetchSubs();
        },
        onError: () => toast.error("Failed to approve subscription")
    });

    const rejectRequestMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => subscriptionApi.rejectRequest(id, reason),
        onSuccess: () => {
            toast.success("Subscription request rejected");
            queryClient.invalidateQueries({ queryKey: ['admin-sub-requests'] });
            refetchRequests();
        },
        onError: () => toast.error("Failed to reject subscription")
    });

    // Orders filtering states
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [orderSlotFilter, setOrderSlotFilter] = useState('all');

    // Extract orders list safely
    const rawOrders = useMemo(() => {
        return ordersData?.data || [];
    }, [ordersData]);

    // Active subscriptions list safely
    const activeSubscriptions = useMemo(() => {
        const subs = activeSubsData?.data;
        return Array.isArray(subs) ? subs : [];
    }, [activeSubsData]);

    // Subscription requests list safely
    const subscriptionRequests = useMemo(() => {
        const reqs = subRequestsData?.data;
        return Array.isArray(reqs) ? reqs : [];
    }, [subRequestsData]);

    // Plan models
    const subscriptionPlans = useMemo(() => {
        return plansData?.data || [];
    }, [plansData]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return rawOrders.filter((order: any) => {
            const matchesSearch = 
                (order.customer?.name || order.name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
                (order.customer?.phone || order.phone || '').includes(orderSearch) ||
                (order.deliveryAddress?.area || order.area || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
                (order.orderNumber || '').toLowerCase().includes(orderSearch.toLowerCase());

            const matchesStatus = 
                orderStatusFilter === 'all' ? true : 
                (order.status || '').toLowerCase() === orderStatusFilter.toLowerCase();

            const matchesSlot = 
                orderSlotFilter === 'all' ? true :
                (order.mealType || order.slot || '').toLowerCase() === orderSlotFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesSlot;
        });
    }, [rawOrders, orderSearch, orderStatusFilter, orderSlotFilter]);

    // Calculate aggregated operational metrics
    const totalOrdersCount = rawOrders.length;
    const lunchOrders = rawOrders.filter((o: any) => (o.mealType || o.slot)?.toLowerCase() === 'lunch');
    const dinnerOrders = rawOrders.filter((o: any) => (o.mealType || o.slot)?.toLowerCase() === 'dinner');

    const totalPlatesNeeded = rawOrders.reduce((sum: number, o: any) => sum + (Number(o.plates || o.quantity) || 1), 0);
    const lunchPlatesNeeded = lunchOrders.reduce((sum: number, o: any) => sum + (Number(o.plates || o.quantity) || 1), 0);
    const dinnerPlatesNeeded = dinnerOrders.reduce((sum: number, o: any) => sum + (Number(o.plates || o.quantity) || 1), 0);

    const pendingOrders = rawOrders.filter((o: any) => 
        ['new', 'pending'].includes((o.status || '').toLowerCase())
    );

    const preparingOrders = rawOrders.filter((o: any) => 
        ['accepted', 'confirmed', 'preparing', 'ready'].includes((o.status || '').toLowerCase())
    );

    const outForDeliveryOrders = rawOrders.filter((o: any) => 
        ['out_for_delivery', 'outfordelivery'].includes((o.status || '').toLowerCase())
    );

    const deliveredOrders = rawOrders.filter((o: any) => 
        (o.status || '').toLowerCase() === 'delivered'
    );

    const todayRevenue = rawOrders.reduce((sum: number, o: any) => {
        if ((o.status || '').toLowerCase() !== 'cancelled') {
            return sum + (Number(o.totalAmount || o.amount) || 0);
        }
        return sum;
    }, 0);

    // Quick status updater for orders
    const handleQuickStatusChange = (orderId: string, newStatus: string) => {
        updateOrderStatus.mutate({
            id: orderId,
            data: { status: newStatus as any, adminNotes: `Status changed to ${newStatus} from dashboard` }
        }, {
            onSuccess: () => {
                toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
                refetchOrders();
            },
            onError: () => toast.error("Failed to update order status")
        });
    };

    const getStatusBadge = (status: string) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'NEW':
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
            case 'ACCEPTED':
            case 'CONFIRMED':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Accepted</Badge>;
            case 'PREPARING':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">In Kitchen</Badge>;
            case 'READY':
                return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Ready</Badge>;
            case 'OUT_FOR_DELIVERY':
            case 'OUTFORDELIVERY':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Out for Delivery</Badge>;
            case 'DELIVERED':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Delivered</Badge>;
            case 'CANCELLED':
            case 'REJECTED':
                return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Top Header & Fast Nav */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                            <ChefHat className="w-5 h-5" />
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                            Tommalu Operations Hub
                        </h1>
                    </div>
                    <p className="text-stone-500 text-xs sm:text-sm">
                        Welcome back, <strong>{authData?.user?.name || 'Admin'}</strong> • Live meal orders, subscription plans & kitchen tally.
                    </p>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            refetchOrders();
                            refetchSubs();
                            refetchRequests();
                            toast.success("Dashboard refreshed");
                        }}
                        className="cursor-pointer border-stone-200 text-stone-700 hover:bg-stone-50"
                        title="Refresh data"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
                    </Button>
                    <Link href="/admin/homemade-food">
                        <Button size="sm" className="bg-stone-900 hover:bg-black text-white font-bold cursor-pointer">
                            <Utensils className="w-3.5 h-3.5 mr-1.5" /> Manage Menu
                        </Button>
                    </Link>
                    <Link href="/admin/subscriptions">
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer">
                            <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Plan Models
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Daily Orders */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Today's Orders
                            </span>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <ShoppingBag className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-stone-900">
                            {ordersLoading ? <Skeleton className="h-8 w-16" /> : totalOrdersCount}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-0.5 text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                ☀️ {lunchOrders.length} Lunch
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                🌙 {dinnerOrders.length} Dinner
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Active Subscription Plans */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Active Meal Plans
                            </span>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <CreditCard className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-purple-950">
                            {activeSubsLoading ? <Skeleton className="h-8 w-16" /> : activeSubscriptions.length}
                        </div>
                        <div className="text-xs text-purple-800 font-semibold mt-1.5 flex items-center justify-between">
                            <span>Subscribed Customers</span>
                            {subscriptionRequests.length > 0 && (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    {subscriptionRequests.length} Pending Approval
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Total Plates Needed */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Total Plates Needed
                            </span>
                            <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                <Utensils className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-orange-600">
                            {ordersLoading ? <Skeleton className="h-8 w-16" /> : totalPlatesNeeded}
                        </div>
                        <p className="text-xs text-stone-500 font-medium mt-1.5">
                            ☀️ {lunchPlatesNeeded} Lunch • 🌙 {dinnerPlatesNeeded} Dinner
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Today's Revenue */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Estimated Revenue
                            </span>
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <DollarSign className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                            ₹{todayRevenue.toLocaleString('en-IN')}
                        </div>
                        <p className="text-xs text-stone-500 font-medium mt-1.5">
                            From active food & meal plan orders
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Section: Orders vs Plans vs Kitchen Tally */}
            <Tabs defaultValue="orders" className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-100/80 p-2 rounded-2xl border border-stone-200/80 mb-4">
                    <TabsList className="bg-transparent p-0 gap-1.5 flex-wrap">
                        <TabsTrigger 
                            value="orders" 
                            className="data-[state=active]:bg-white data-[state=active]:text-orange-950 data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                            <ShoppingBag className="w-4 h-4 mr-1.5 text-orange-600" />
                            Daily Orders
                            <Badge variant="secondary" className="ml-2 bg-stone-200/80 text-stone-800 text-[11px] font-bold">
                                {filteredOrders.length}
                            </Badge>
                        </TabsTrigger>

                        <TabsTrigger 
                            value="plans" 
                            className="data-[state=active]:bg-white data-[state=active]:text-purple-950 data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                            <CreditCard className="w-4 h-4 mr-1.5 text-purple-600" />
                            Meal Plans & Subscriptions
                            {subscriptionRequests.length > 0 && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800 text-[10px] font-bold">
                                    {subscriptionRequests.length} New
                                </Badge>
                            )}
                        </TabsTrigger>

                        <TabsTrigger 
                            value="kitchen" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                            <ChefHat className="w-4 h-4 mr-1.5 text-stone-700" />
                            Kitchen Tally & Prep
                        </TabsTrigger>
                    </TabsList>

                    <div className="text-xs text-stone-500 font-medium px-2">
                        Real-time auto-synced
                    </div>
                </div>

                {/* ============================================================== */}
                {/* TAB 1: DAILY ORDERS MANAGEMENT                                 */}
                {/* ============================================================== */}
                <TabsContent value="orders" className="space-y-4 mt-0">
                    {/* Live Order Slot Mini-Tally */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                                    <Sun className="w-5 h-5" />
                                </span>
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">Lunch Slot (11:30 AM – 2:00 PM)</h4>
                                    <p className="text-xs text-stone-500">
                                        <strong>{lunchOrders.length}</strong> Orders • <strong>{lunchPlatesNeeded}</strong> Plates Needed
                                    </p>
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setOrderSlotFilter(orderSlotFilter === 'lunch' ? 'all' : 'lunch')}
                                className={`text-xs font-bold cursor-pointer ${orderSlotFilter === 'lunch' ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-300'}`}
                            >
                                {orderSlotFilter === 'lunch' ? 'Show All' : 'Filter Lunch'}
                            </Button>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                                    <Moon className="w-5 h-5" />
                                </span>
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">Dinner Slot (7:30 PM – 10:00 PM)</h4>
                                    <p className="text-xs text-stone-500">
                                        <strong>{dinnerOrders.length}</strong> Orders • <strong>{dinnerPlatesNeeded}</strong> Plates Needed
                                    </p>
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setOrderSlotFilter(orderSlotFilter === 'dinner' ? 'all' : 'dinner')}
                                className={`text-xs font-bold cursor-pointer ${orderSlotFilter === 'dinner' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-indigo-300'}`}
                            >
                                {orderSlotFilter === 'dinner' ? 'Show All' : 'Filter Dinner'}
                            </Button>
                        </div>
                    </div>

                    {/* Filter Pills & Search */}
                    <Card className="border-stone-200 shadow-2xs">
                        <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                {/* Search Input */}
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    <Input 
                                        placeholder="Search customer, phone, area, order #..."
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                        className="pl-9 text-xs sm:text-sm h-9 border-stone-200"
                                    />
                                </div>

                                {/* Status Filters */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                    {[
                                        { id: 'all', label: 'All Orders' },
                                        { id: 'pending', label: 'Pending / New' },
                                        { id: 'preparing', label: 'In Kitchen' },
                                        { id: 'out_for_delivery', label: 'Out for Delivery' },
                                        { id: 'delivered', label: 'Delivered' }
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setOrderStatusFilter(f.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                                orderStatusFilter === f.id
                                                    ? 'bg-orange-600 text-white shadow-2xs'
                                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="px-4 sm:px-5 pb-5">
                            {ordersLoading ? (
                                <div className="space-y-3 py-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-12 text-stone-400">
                                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                                    <p className="font-bold text-stone-700">No orders matching your criteria</p>
                                    <p className="text-xs text-stone-400 mt-1">Try resetting filters or search query.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredOrders.slice(0, 15).map((order: any) => {
                                        const orderId = order.id || order._id;
                                        const customerName = order.customer?.name || order.name || 'Customer';
                                        const customerPhone = order.customer?.phone || order.phone || '';
                                        const address = order.deliveryAddress?.area || order.area || order.deliveryAddress?.street || 'Delivery Address';
                                        const slot = order.mealType || order.slot || 'Meal';
                                        const plates = Number(order.plates || order.quantity) || 1;
                                        const amount = Number(order.totalAmount || order.amount) || 0;
                                        const isLunch = slot.toLowerCase() === 'lunch';
                                        const statusStr = (order.status || '').toLowerCase();

                                        return (
                                            <div 
                                                key={orderId}
                                                className="p-4 rounded-xl border border-stone-200/90 bg-white hover:border-orange-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs group"
                                            >
                                                {/* Left Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="font-bold text-stone-900 text-sm">
                                                            {customerName}
                                                        </span>
                                                        {customerPhone && (
                                                            <a 
                                                                href={`tel:${customerPhone}`}
                                                                className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded"
                                                            >
                                                                <Phone className="w-3 h-3" /> {customerPhone}
                                                            </a>
                                                        )}
                                                        <Badge variant="outline" className={`text-[10px] font-bold ${
                                                            isLunch 
                                                                ? 'border-amber-200 text-amber-800 bg-amber-50' 
                                                                : 'border-indigo-200 text-indigo-800 bg-indigo-50'
                                                        }`}>
                                                            {isLunch ? '☀️ Lunch' : '🌙 Dinner'}
                                                        </Badge>
                                                        {order.isSubscription && (
                                                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-bold">
                                                                Plan Subscriber
                                                            </Badge>
                                                        )}
                                                        {getStatusBadge(order.status)}
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                                                        <span className="font-extrabold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">
                                                            {plates} {plates > 1 ? 'Plates' : 'Plate'}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="truncate max-w-xs font-medium">
                                                            {order.items?.map((it: any) => typeof it === 'string' ? it : it.name).join(', ') || 'Homemade Thali'}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="text-stone-400 flex items-center gap-1 truncate">
                                                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                                                            {address}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: Amount & Quick Actions */}
                                                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                                                    <div className="text-left md:text-right">
                                                        <div className="text-base font-black text-stone-900">
                                                            ₹{amount.toLocaleString('en-IN')}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                                            {order.paymentStatus || 'PAID'}
                                                        </span>
                                                    </div>

                                                    {/* Quick 1-Tap Status Buttons */}
                                                    <div className="flex items-center gap-1.5">
                                                        {['new', 'pending'].includes(statusStr) && (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer shadow-2xs"
                                                                onClick={() => handleQuickStatusChange(orderId, 'accepted')}
                                                                disabled={updateOrderStatus.isPending}
                                                            >
                                                                <Check className="w-3.5 h-3.5 mr-1" /> Accept
                                                            </Button>
                                                        )}

                                                        {['accepted', 'confirmed'].includes(statusStr) && (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8 cursor-pointer shadow-2xs"
                                                                onClick={() => handleQuickStatusChange(orderId, 'preparing')}
                                                                disabled={updateOrderStatus.isPending}
                                                            >
                                                                <ChefHat className="w-3.5 h-3.5 mr-1" /> Cooking
                                                            </Button>
                                                        )}

                                                        {['preparing', 'ready'].includes(statusStr) && (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-8 cursor-pointer shadow-2xs"
                                                                onClick={() => handleQuickStatusChange(orderId, 'out_for_delivery')}
                                                                disabled={updateOrderStatus.isPending}
                                                            >
                                                                <Bike className="w-3.5 h-3.5 mr-1" /> Dispatch
                                                            </Button>
                                                        )}

                                                        {['out_for_delivery', 'outfordelivery'].includes(statusStr) && (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer shadow-2xs"
                                                                onClick={() => handleQuickStatusChange(orderId, 'delivered')}
                                                                disabled={updateOrderStatus.isPending}
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Delivered
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="pt-2 text-center">
                                        <Link href="/admin/orders">
                                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 font-bold text-xs cursor-pointer">
                                                Open Dedicated Orders Manager with Filters & History <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 2: MEAL PLANS & SUBSCRIPTIONS                              */}
                {/* ============================================================== */}
                <TabsContent value="plans" className="space-y-6 mt-0">
                    {/* Top Stats for Plans */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                            <span className="text-xs font-bold text-stone-500 uppercase">Active Subscribers</span>
                            <div className="text-2xl font-black text-purple-700 mt-1">
                                {activeSubscriptions.length}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">Customers receiving daily meals</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                            <span className="text-xs font-bold text-stone-500 uppercase">Pending Approvals</span>
                            <div className="text-2xl font-black text-amber-600 mt-1">
                                {subscriptionRequests.length}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">Awaiting admin review</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                            <span className="text-xs font-bold text-stone-500 uppercase">Configured Plans</span>
                            <div className="text-2xl font-black text-stone-900 mt-1">
                                {subscriptionPlans.length}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">Public subscription models</p>
                        </div>
                    </div>

                    {/* Pending Subscription Requests (if any) */}
                    {subscriptionRequests.length > 0 && (
                        <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-amber-950 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    Pending Subscription Requests ({subscriptionRequests.length})
                                </CardTitle>
                                <CardDescription className="text-xs text-amber-800">
                                    Review customer subscription bookings and activate them for meal delivery.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2.5">
                                {subscriptionRequests.map((req: any) => (
                                    <div 
                                        key={req._id || req.id}
                                        className="p-3 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-stone-900">
                                                    {req.customerName || req.name || 'Subscriber'}
                                                </span>
                                                <span className="text-xs text-stone-600 font-medium">
                                                    • {req.mobileNumber || req.phone}
                                                </span>
                                                <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold">
                                                    {req.planName || 'Meal Plan'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-stone-500 mt-1">
                                                Delivery Area: <strong>{req.deliveryAddress?.area || req.area || req.deliveryAddress?.street || 'Local'}</strong>
                                                {req.startDate && ` • Starts: ${format(new Date(req.startDate), 'MMM dd, yyyy')}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => rejectRequestMutation.mutate({ id: req._id || req.id, reason: 'Admin rejected' })}
                                                disabled={rejectRequestMutation.isPending}
                                                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 h-8 cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5 mr-1" /> Reject
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                onClick={() => approveRequestMutation.mutate(req._id || req.id)}
                                                disabled={approveRequestMutation.isPending}
                                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5 mr-1" /> Approve & Activate
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Subscribers List */}
                    <Card className="border-stone-200 shadow-2xs">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    Active Subscribers ({activeSubscriptions.length})
                                </CardTitle>
                                <CardDescription className="text-xs text-stone-500">
                                    Customers currently active on weekly or monthly meal subscription plans.
                                </CardDescription>
                            </div>
                            <Link href="/admin/subscriptions">
                                <Button variant="outline" size="sm" className="text-xs font-bold border-stone-200 cursor-pointer">
                                    Manage All Plans ›
                                </Button>
                            </Link>
                        </CardHeader>

                        <CardContent>
                            {activeSubsLoading ? (
                                <div className="space-y-2 py-4">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                                </div>
                            ) : activeSubscriptions.length === 0 ? (
                                <div className="text-center py-10 text-stone-400">
                                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                                    <p className="font-bold text-stone-700">No active subscribers currently</p>
                                    <p className="text-xs text-stone-400 mt-0.5">Approved subscriber plans will show up here.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {activeSubscriptions.slice(0, 10).map((sub: any) => {
                                        const address = sub.deliveryAddress?.area || sub.deliveryAddress?.street || 'Jaipur';
                                        return (
                                            <div 
                                                key={sub._id || sub.id}
                                                className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-stone-900 text-sm">
                                                            {sub.customerName || 'Subscriber'}
                                                        </span>
                                                        <a 
                                                            href={`tel:${sub.mobileNumber}`}
                                                            className="text-xs text-stone-600 font-semibold hover:underline flex items-center gap-1"
                                                        >
                                                            <Phone className="w-3 h-3 text-stone-400" />
                                                            {sub.mobileNumber}
                                                        </a>
                                                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-bold">
                                                            {sub.planName || sub.planType || 'Meal Plan'}
                                                        </Badge>
                                                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                                                        <span>📍 {address}</span>
                                                        {sub.endDate && (
                                                            <span>• Valid till: <strong>{format(new Date(sub.endDate), 'MMM dd, yyyy')}</strong></span>
                                                        )}
                                                        {sub.duration && (
                                                            <span>({sub.duration} Days Plan)</span>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-stone-900">
                                                        ₹{sub.price?.toLocaleString('en-IN') || '0'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subscription Plan Models Showcase */}
                    <Card className="border-stone-200 shadow-2xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-orange-600" />
                                Configured Subscription Plan Models ({subscriptionPlans.length})
                            </CardTitle>
                            <CardDescription className="text-xs text-stone-500">
                                Customer-facing subscription options available on the website.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {plansLoading ? (
                                <Skeleton className="h-28 w-full" />
                            ) : subscriptionPlans.length === 0 ? (
                                <div className="text-center py-6 text-stone-400 text-xs">
                                    No plan models configured yet. Create them in <Link href="/admin/subscriptions" className="text-orange-600 font-bold underline">Plan Models</Link>.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {subscriptionPlans.map((plan: any) => (
                                        <div 
                                            key={plan._id || plan.id}
                                            className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-orange-300 transition-all shadow-2xs flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                                    <h4 className="font-bold text-stone-900 text-sm">{plan.title}</h4>
                                                    <Badge className="bg-orange-100 text-orange-800 text-[10px] font-bold capitalize">
                                                        {plan.planType || 'Thali'}
                                                    </Badge>
                                                </div>
                                                <div className="text-lg font-black text-orange-600 mb-1">
                                                    ₹{plan.price}
                                                </div>
                                                <p className="text-xs text-stone-500 line-clamp-2">
                                                    {plan.description || plan.features?.join(', ') || 'Pure veg homemade meal subscription.'}
                                                </p>
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                                                <span>Status: <strong className={plan.isActive ? 'text-emerald-600' : 'text-stone-400'}>{plan.isActive ? 'Active' : 'Disabled'}</strong></span>
                                                <Link href="/admin/subscriptions" className="text-orange-600 font-bold hover:underline">
                                                    Edit Plan ›
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 3: KITCHEN TALLY & PREP CHECKLIST                          */}
                {/* ============================================================== */}
                <TabsContent value="kitchen" className="space-y-4 mt-0">
                    <Card className="border-stone-200 shadow-2xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-black text-stone-900 flex items-center gap-2">
                                <ChefHat className="w-5 h-5 text-orange-600" />
                                Kitchen Operations & Preparation Checklist
                            </CardTitle>
                            <CardDescription className="text-xs text-stone-500">
                                Live kitchen tally for chefs to prepare exact plates and rotis today.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Lunch Preparation Tally */}
                                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="p-2 bg-amber-500 text-white rounded-lg">
                                                <Sun className="w-4 h-4" />
                                            </span>
                                            <h4 className="font-black text-stone-900 text-base">Lunch Prep Tally</h4>
                                        </div>
                                        <Badge className="bg-amber-200 text-amber-900 font-bold">11:30 AM – 2:00 PM</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                                            <span className="text-[11px] font-bold text-stone-400 uppercase block">Total Orders</span>
                                            <span className="text-2xl font-black text-stone-900">{lunchOrders.length}</span>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                                            <span className="text-[11px] font-bold text-stone-400 uppercase block">Plates Needed</span>
                                            <span className="text-2xl font-black text-amber-700">{lunchPlatesNeeded}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-xs text-stone-700 bg-white p-3 rounded-xl border border-amber-200/60">
                                        <div className="flex justify-between font-medium">
                                            <span>Pending Acceptance:</span>
                                            <strong className="text-amber-800">
                                                {lunchOrders.filter((o: any) => ['new', 'pending'].includes((o.status || '').toLowerCase())).length} Orders
                                            </strong>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Currently in Cooking / Ready:</span>
                                            <strong className="text-blue-800">
                                                {lunchOrders.filter((o: any) => ['accepted', 'preparing', 'ready'].includes((o.status || '').toLowerCase())).length} Orders
                                            </strong>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Out for Delivery / Completed:</span>
                                            <strong className="text-emerald-800">
                                                {lunchOrders.filter((o: any) => ['out_for_delivery', 'delivered'].includes((o.status || '').toLowerCase())).length} Orders
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Dinner Preparation Tally */}
                                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="p-2 bg-indigo-600 text-white rounded-lg">
                                                <Moon className="w-4 h-4" />
                                            </span>
                                            <h4 className="font-black text-stone-900 text-base">Dinner Prep Tally</h4>
                                        </div>
                                        <Badge className="bg-indigo-200 text-indigo-900 font-bold">7:30 PM – 10:00 PM</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="p-3 bg-white rounded-xl border border-indigo-200/80">
                                            <span className="text-[11px] font-bold text-stone-400 uppercase block">Total Orders</span>
                                            <span className="text-2xl font-black text-stone-900">{dinnerOrders.length}</span>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-indigo-200/80">
                                            <span className="text-[11px] font-bold text-stone-400 uppercase block">Plates Needed</span>
                                            <span className="text-2xl font-black text-indigo-700">{dinnerPlatesNeeded}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-xs text-stone-700 bg-white p-3 rounded-xl border border-indigo-200/60">
                                        <div className="flex justify-between font-medium">
                                            <span>Pending Acceptance:</span>
                                            <strong className="text-amber-800">
                                                {dinnerOrders.filter((o: any) => ['new', 'pending'].includes((o.status || '').toLowerCase())).length} Orders
                                            </strong>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Currently in Cooking / Ready:</span>
                                            <strong className="text-blue-800">
                                                {dinnerOrders.filter((o: any) => ['accepted', 'preparing', 'ready'].includes((o.status || '').toLowerCase())).length} Orders
                                            </strong>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Out for Delivery / Completed:</span>
                                            <strong className="text-emerald-800">
                                                {dinnerOrders.filter((o: any) => ['out_for_delivery', 'delivered'].includes((o.status || '').toLowerCase())).length} Orders
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">Need to update today's Sabji or Thali items?</h4>
                                    <p className="text-xs text-stone-500">Edit today's seasonal sabji, paneer special, and accompaniments in the Menu Editor.</p>
                                </div>
                                <Link href="/admin/homemade-food">
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer">
                                        Open Daily Menu Editor
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
