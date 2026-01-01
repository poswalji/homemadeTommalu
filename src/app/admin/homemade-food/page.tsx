'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChefHat,
    Plus,
    Edit,
    Trash2,
    Star,
    MoreVertical,
    Package,
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Loader2,
    Search,
    Calendar,
    Eye,
    Phone,
    MapPin,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    IndianRupee,
    Users,
    Activity
} from 'lucide-react';
import {
    useAdminHomemadeFoods,
    useCreateHomemadeFood,
    useUpdateHomemadeFood,
    useDeleteHomemadeFood,
    useSetTodaysSpecial,
    useAdminHomemadeFoodOrders,
    useUpdateHomemadeFoodOrderStatus,
    useHomemadeFoodAnalytics,
} from '@/hooks/api';
import { toast } from 'sonner';
import type { HomemadeFood, HomemadeFoodOrder, HomemadeFoodOrderStatus } from '@/services/api/homemade-food.api';
import { getTodayMenu, updateHomemadeMenu } from '@/services/homemadeService';
import { Utensils } from 'lucide-react';

// Status badge colors
const statusColors: Record<HomemadeFoodOrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refund_initiated: 'bg-amber-100 text-amber-800',
    refund_completed: 'bg-emerald-100 text-emerald-800',
    payment_pending: 'bg-gray-100 text-gray-800',
    payment_received: 'bg-green-100 text-green-800',
    payment_failed: 'bg-red-100 text-red-800',
};

// Format status for display
const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function HomemadeFoodAdminPage() {
    const [activeTab, setActiveTab] = useState('daily-menu'); // Default to daily-menu
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HomemadeFood | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<HomemadeFoodOrder | null>(null);
    const [orderFilters, setOrderFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 20,
    });
    const [newStatus, setNewStatus] = useState<HomemadeFoodOrderStatus>('pending');

    const [adminNotes, setAdminNotes] = useState('');

    // Daily Menu State
    const [menuForm, setMenuForm] = useState({
        lunchSabji: "",
        dinnerSabji: "",
        weekdayPrice: 89,
        weekdayItems: "",
        sundayItemName: "",
        sundayPrice: 120,
        sundayDinnerOpen: false
    });

    useEffect(() => {
        const loadMenu = async () => {
            try {
                const res = await getTodayMenu();
                if (res.success) {
                    const d = res.data;
                    const isSunday = d.isSunday; // Check if api returns this
                    // We load both/either depending on what backend returns
                    if (isSunday) {
                        setMenuForm(prev => ({
                            ...prev,
                            sundayItemName: d.product?.itemName || "",
                            sundayPrice: d.product?.price || 120,
                            sundayDinnerOpen: d.slots?.dinner?.isOpen || false
                        }));
                    } else {
                        setMenuForm(prev => ({
                            ...prev,
                            lunchSabji: d.product?.lunchSabji || "",
                            dinnerSabji: d.product?.dinnerSabji || "",
                            weekdayPrice: d.product?.price || 89,
                            weekdayItems: d.product?.includes?.join(', ') || "",
                        }));
                    }
                }
            } catch (e) {
                console.error("Failed to load daily menu", e);
            }
        };
        loadMenu();
    }, []);

    const handleMenuUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {};
            if (menuForm.lunchSabji) payload.lunchSabji = menuForm.lunchSabji;
            if (menuForm.dinnerSabji) payload.dinnerSabji = menuForm.dinnerSabji;
            if (menuForm.weekdayPrice) payload.weekdayPrice = Number(menuForm.weekdayPrice);
            if (menuForm.weekdayItems) payload.weekdayItems = menuForm.weekdayItems.split(',').map((i: string) => i.trim()); // Typed explicitly

            if (menuForm.sundayItemName) payload.sundayItemName = menuForm.sundayItemName;
            if (menuForm.sundayPrice) payload.sundayPrice = Number(menuForm.sundayPrice);
            payload.sundayDinnerOpen = menuForm.sundayDinnerOpen;

            const res = await updateHomemadeMenu(payload);
            if (res.success) {
                toast.success("Today's Menu updated successfully!");
            }
        } catch (err) {
            toast.error("Failed to update menu");
        }
    };

    // Form state for food item
    const [itemForm, setItemForm] = useState({
        name: '',
        description: '',
        image: '',
        price: 0,
        features: '',
        isActive: true,
        isTodaysSpecial: false,
        availableQuantity: -1,
        servingSize: '1 Thali',
        preparationTime: '30-45 mins',
        cuisine: 'Indian',
    });

    // Queries
    const { data: foodsData, isLoading: foodsLoading, refetch: refetchFoods } = useAdminHomemadeFoods();
    const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useAdminHomemadeFoodOrders({
        status: orderFilters.status !== 'all' ? orderFilters.status : undefined,
        search: orderFilters.search || undefined,
        page: orderFilters.page,
        limit: orderFilters.limit,
    });
    const { data: analyticsData, isLoading: analyticsLoading } = useHomemadeFoodAnalytics();

    // Mutations
    const createFood = useCreateHomemadeFood();
    const updateFood = useUpdateHomemadeFood();
    const deleteFood = useDeleteHomemadeFood();
    const setTodaysSpecial = useSetTodaysSpecial();
    const updateOrderStatus = useUpdateHomemadeFoodOrderStatus();

    const foods = foodsData?.data || [];
    const orders = ordersData?.data || [];
    const analytics = analyticsData?.data;

    // Handle food item form
    const handleOpenItemDialog = (item?: HomemadeFood) => {
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                description: item.description,
                image: item.image,
                price: item.price,
                features: item.features?.join(', ') || '',
                isActive: item.isActive,
                isTodaysSpecial: item.isTodaysSpecial,
                availableQuantity: item.availableQuantity,
                servingSize: item.servingSize || '1 Thali',
                preparationTime: item.preparationTime || '30-45 mins',
                cuisine: item.cuisine || 'Indian',
            });
        } else {
            setEditingItem(null);
            setItemForm({
                name: '',
                description: '',
                image: '',
                price: 0,
                features: '',
                isActive: true,
                isTodaysSpecial: false,
                availableQuantity: -1,
                servingSize: '1 Thali',
                preparationTime: '30-45 mins',
                cuisine: 'Indian',
            });
        }
        setIsItemDialogOpen(true);
    };

    const handleSaveItem = async () => {
        try {
            const data = {
                ...itemForm,
                features: itemForm.features.split(',').map(f => f.trim()).filter(Boolean),
            };

            if (editingItem) {
                await updateFood.mutateAsync({ id: editingItem._id, data });
                toast.success('Food item updated successfully');
            } else {
                await createFood.mutateAsync(data);
                toast.success('Food item created successfully');
            }
            setIsItemDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save food item');
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteFood.mutateAsync(id);
            toast.success('Food item deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete item');
        }
    };

    const handleSetTodaysSpecial = async (id: string) => {
        try {
            await setTodaysSpecial.mutateAsync(id);
            toast.success("Today's special updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to set today's special");
        }
    };

    // Handle order status update
    const handleOpenOrderDialog = (order: HomemadeFoodOrder) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setAdminNotes(order.adminNotes || '');
        setIsOrderDialogOpen(true);
    };

    const handleUpdateOrderStatus = async () => {
        if (!selectedOrder) return;
        try {
            await updateOrderStatus.mutateAsync({
                id: selectedOrder._id,
                data: { status: newStatus, adminNotes },
            });
            toast.success('Order status updated');
            setIsOrderDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update order');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-orange-500" />
                        Homemade Food
                    </h1>
                    <p className="text-gray-600 mt-1">Manage today's special and track orders</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { refetchOrders(); }}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600">Total Orders</p>
                                {analyticsLoading ? (
                                    <Skeleton className="h-8 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.totalOrders || 0}</p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                                {analyticsLoading ? (
                                    <Skeleton className="h-8 w-24 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">₹{(analytics?.summary?.totalRevenue || 0).toLocaleString('en-IN')}</p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <IndianRupee className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Delivered</p>
                                {analyticsLoading ? (
                                    <Skeleton className="h-8 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.totalDelivered || 0}</p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Pending</p>
                                {analyticsLoading ? (
                                    <Skeleton className="h-8 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.totalPending || 0}</p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily-menu" className="flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        Today's Menu
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Orders
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>



                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle>Orders</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search orders..."
                                            className="pl-9 w-48"
                                            value={orderFilters.search}
                                            onChange={(e) => setOrderFilters(prev => ({ ...prev, search: e.target.value }))}
                                        />
                                    </div>
                                    <Select
                                        value={orderFilters.status}
                                        onValueChange={(value) => setOrderFilters(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="preparing">Preparing</SelectItem>
                                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {ordersLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No orders found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {orders.map((order) => (
                                        <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-shadow border-stone-200">
                                            <div className="p-4 space-y-3">
                                                {/* Header */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-medium text-stone-500">Order #{order.orderNumber}</p>
                                                        <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <Badge className={statusColors[order.status]}>
                                                        {formatStatus(order.status)}
                                                    </Badge>
                                                </div>

                                                {/* Customer Info */}
                                                <div className="bg-stone-50 p-3 rounded-lg text-sm space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-stone-400" />
                                                        <span className="font-medium text-stone-700">{order.customerName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-stone-400" />
                                                        <a href={`tel:${order.mobileNumber}`} className="text-blue-600 hover:underline">{order.mobileNumber}</a>
                                                    </div>
                                                </div>

                                                {/* Price & Quantity */}
                                                <div className="flex justify-between items-center py-2 border-t border-b border-stone-100">
                                                    <div>
                                                        <p className="text-xs text-stone-500">Quantity</p>
                                                        <p className="font-medium">{order.quantity} Thali(s)</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-stone-500">Total Amount</p>
                                                        <p className="text-lg font-bold text-orange-600">₹{order.finalAmount}</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <Button
                                                    onClick={() => handleOpenOrderDialog(order)}
                                                    className="w-full bg-stone-800 hover:bg-stone-900 text-white"
                                                    size="sm"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {ordersData?.pagination && ordersData.pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={orderFilters.page === 1}
                                        onClick={() => setOrderFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-gray-600">
                                        Page {orderFilters.page} of {ordersData.pagination.pages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={orderFilters.page >= ordersData.pagination.pages}
                                        onClick={() => setOrderFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Status Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Status Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <Skeleton key={i} className="h-10 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {analytics?.statusBreakdown?.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge className={statusColors[item._id as HomemadeFoodOrderStatus] || 'bg-gray-100'}>
                                                        {formatStatus(item._id)}
                                                    </Badge>
                                                </div>

                                                {/* Food Item Name */}
                                                <div className="pb-2">
                                                    <p className="font-bold text-gray-800 text-lg">{order.foodName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{item.count} orders</p>
                                                    <p className="text-sm text-gray-500">₹{item.revenue.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        )) || (
                                                <p className="text-gray-500 text-center py-4">No data available</p>
                                            )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Popular Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {analytics?.popularItems?.map((item, index) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium">{item.foodName}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{item.totalOrders} orders</p>
                                                    <p className="text-sm text-gray-500">{item.totalQuantity} thalis</p>
                                                </div>
                                            </div>
                                        )) || (
                                                <p className="text-gray-500 text-center py-4">No data available</p>
                                            )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Revenue Chart Placeholder */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsLoading ? (
                                    <Skeleton className="h-64 w-full" />
                                ) : analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
                                    <div className="space-y-2">
                                        {analytics.dailyRevenue.slice(-7).map((day) => (
                                            <div key={day._id} className="flex items-center gap-4">
                                                <span className="w-24 text-sm text-gray-500">
                                                    {new Date(day._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-400 to-amber-400 h-full rounded-full flex items-center justify-end pr-2"
                                                        style={{
                                                            width: `${Math.min(100, (day.revenue / Math.max(...analytics.dailyRevenue.map(d => d.revenue))) * 100)}%`
                                                        }}
                                                    >
                                                        <span className="text-xs text-white font-medium">₹{day.revenue}</span>
                                                    </div>
                                                </div>
                                                <span className="w-16 text-sm text-gray-600">{day.orders} orders</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No revenue data available yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Daily Menu Tab */}
                <TabsContent value="daily-menu" className="space-y-4">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Utensils className="w-6 h-6 text-orange-600" />
                            Update Today's Live Menu
                        </h2>

                        <div className="mb-6 p-4 bg-blue-50 text-blue-700 text-sm rounded-xl">
                            <p className="font-semibold mb-1">Live Updates</p>
                            <p>Changes made here are instantly visible on the "Homemade" page for all customers.</p>
                        </div>

                        <form onSubmit={handleMenuUpdate} className="space-y-8">
                            {/* Weekday Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Weekday Details (Mon-Sat)</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lunch Sabji</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="e.g. Aloo Gobhi"
                                            value={menuForm.lunchSabji}
                                            onChange={(e) => setMenuForm({ ...menuForm, lunchSabji: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dinner Sabji</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="e.g. Dal Makhani"
                                            value={menuForm.dinnerSabji}
                                            onChange={(e) => setMenuForm({ ...menuForm, dinnerSabji: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            value={menuForm.weekdayPrice}
                                            onChange={(e) => setMenuForm({ ...menuForm, weekdayPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fixed Items</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="e.g. 4 Roti, Salad, Chhach"
                                            value={menuForm.weekdayItems}
                                            onChange={(e) => setMenuForm({ ...menuForm, weekdayItems: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Comma separated list of items</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sunday Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center justify-between">
                                    <span>Sunday Special</span>
                                    <span className="text-xs font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded">If Today is Sunday</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Special Item Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="e.g. Chole Bhature"
                                            value={menuForm.sundayItemName}
                                            onChange={(e) => setMenuForm({ ...menuForm, sundayItemName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Special Price (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            value={menuForm.sundayPrice}
                                            onChange={(e) => setMenuForm({ ...menuForm, sundayPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                            checked={menuForm.sundayDinnerOpen}
                                            onChange={(e) => setMenuForm({ ...menuForm, sundayDinnerOpen: e.target.checked })}
                                        />
                                        <span className="text-gray-700 font-medium">Open Dinner Slot on Sunday?</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-95"
                            >
                                Save Menu Changes
                            </button>
                        </form>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Food Item' : 'Add Food Item'}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Update the details of this food item' : 'Create a new homemade food item'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="name">Item Name *</Label>
                                <Input
                                    id="name"
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Standard Homemade Thali"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description">Description / Sabji Details *</Label>
                                <Textarea
                                    id="description"
                                    value={itemForm.description}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="e.g., Aloo Gobhi with mild spices..."
                                    rows={3}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="image">Image URL *</Label>
                                <Input
                                    id="image"
                                    value={itemForm.image}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, image: e.target.value }))}
                                    placeholder="https://..."
                                />
                                {itemForm.image && (
                                    <img src={itemForm.image} alt="Preview" className="w-24 h-24 rounded-lg object-cover mt-2" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={itemForm.price}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    min={0}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="availableQuantity">Daily Limit (-1 for unlimited)</Label>
                                <Input
                                    id="availableQuantity"
                                    type="number"
                                    value={itemForm.availableQuantity}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, availableQuantity: Number(e.target.value) }))}
                                    min={-1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="servingSize">Serving Size</Label>
                                <Input
                                    id="servingSize"
                                    value={itemForm.servingSize}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, servingSize: e.target.value }))}
                                    placeholder="1 Thali"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preparationTime">Preparation Time</Label>
                                <Input
                                    id="preparationTime"
                                    value={itemForm.preparationTime}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, preparationTime: e.target.value }))}
                                    placeholder="30-45 mins"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cuisine">Cuisine</Label>
                                <Input
                                    id="cuisine"
                                    value={itemForm.cuisine}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, cuisine: e.target.value }))}
                                    placeholder="Indian"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={itemForm.isActive ? 'active' : 'inactive'}
                                    onValueChange={(value) => setItemForm(prev => ({ ...prev, isActive: value === 'active' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="features">Fixed Items / Includes (comma-separated)</Label>
                                <Input
                                    id="features"
                                    value={itemForm.features}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, features: e.target.value }))}
                                    placeholder="e.g., 4 Roti, Salad, Chhach, Pickle"
                                />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isTodaysSpecial"
                                    checked={itemForm.isTodaysSpecial}
                                    onChange={(e) => setItemForm(prev => ({ ...prev, isTodaysSpecial: e.target.checked }))}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <Label htmlFor="isTodaysSpecial" className="cursor-pointer">
                                    Set as Today's Special
                                </Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveItem}
                                disabled={createFood.isPending || updateFood.isPending}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                {(createFood.isPending || updateFood.isPending) && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                {editingItem ? 'Update Item' : 'Create Item'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Order #{selectedOrder?.orderNumber}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 mt-4">
                            {/* Order Summary */}
                            <div className="bg-orange-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium">Food Item</span>
                                    <span>{selectedOrder.foodName}</span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium">Quantity</span>
                                    <span>{selectedOrder.quantity} thali(s)</span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium">Delivery Charge</span>
                                    <span>₹{selectedOrder.deliveryCharge}</span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-orange-200">
                                    <span className="font-bold">Total Amount</span>
                                    <span className="text-xl font-bold text-orange-600">₹{selectedOrder.finalAmount}</span>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-3">
                                <h4 className="font-semibold">Customer Details</h4>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                    <p className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span>{selectedOrder.customerName}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <a href={`tel:${selectedOrder.mobileNumber}`} className="text-blue-600">
                                            {selectedOrder.mobileNumber}
                                        </a>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                        <span>
                                            {selectedOrder.deliveryAddress.street}
                                            {selectedOrder.deliveryAddress.landmark && `, ${selectedOrder.deliveryAddress.landmark}`}
                                            <br />
                                            {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            {selectedOrder.specialInstructions && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Special Instructions</h4>
                                    <p className="bg-yellow-50 rounded-xl p-4 text-sm italic">
                                        "{selectedOrder.specialInstructions}"
                                    </p>
                                </div>
                            )}

                            {/* Status Update */}
                            <div className="space-y-3">
                                <h4 className="font-semibold">Update Status</h4>
                                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as HomemadeFoodOrderStatus)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="ready">Ready</SelectItem>
                                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="refund_initiated">Refund Initiated</SelectItem>
                                        <SelectItem value="refund_completed">Refund Completed</SelectItem>
                                        <SelectItem value="payment_received">Payment Received</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="adminNotes">Admin Notes</Label>
                                <Textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes..."
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateOrderStatus}
                                    disabled={updateOrderStatus.isPending}
                                    className="bg-orange-500 hover:bg-orange-600"
                                >
                                    {updateOrderStatus.isPending && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    Update Status
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
