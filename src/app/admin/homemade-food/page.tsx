'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsDashboard } from '@/components/admin/homemade/AnalyticsDashboard';
import { DailyMenuEditor } from '@/components/admin/homemade/DailyMenuEditor';
import { SubscriptionManager } from '@/components/admin/homemade/SubscriptionManager';
import { SubscriberRequests } from '@/components/admin/homemade/SubscriberRequests';
import { ActiveSubscriptions } from '@/components/admin/homemade/ActiveSubscriptions';
import {
    Activity,
    Utensils,
    Package,
    ChefHat,
    RefreshCw,
    Search,
    Truck,
    ShoppingCart,
    Loader2,
    Users,
    Phone,
    MapPin,
    CheckCircle
} from 'lucide-react';
import {
    useAdminHomemadeFoodOrders,
    useHomemadeFoodAnalytics,
    useCreateHomemadeFood,
    useUpdateHomemadeFood,
    useUpdateHomemadeFoodOrderStatus
} from '@/hooks/api';
import { toast } from 'sonner';
import { type HomemadeFoodOrderStatus } from '@/services/api/homemade-food.api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';

export default function HomemadeFoodAdminPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [orderFilters, setOrderFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 20,
    });

    // Fetch Analytics
    const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useHomemadeFoodAnalytics();

    // Fetch Orders
    const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useAdminHomemadeFoodOrders({
        status: orderFilters.status !== 'all' ? orderFilters.status : undefined,
        search: orderFilters.search || undefined,
        page: orderFilters.page,
        limit: orderFilters.limit,
    });

    const orders = ordersData?.data || [];

    const handleRefresh = () => {
        refetchAnalytics();
        refetchOrders();
    };

    // State for Dialogs and Forms
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [itemForm, setItemForm] = useState({
        name: '',
        description: '',
        image: '',
        price: 0,
        availableQuantity: -1,
        servingSize: '',
        preparationTime: '',
        cuisine: '',
        features: '',
        isActive: true,
        isTodaysSpecial: false,
    });
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState<any>('');

    const createFood = useCreateHomemadeFood();
    const updateFood = useUpdateHomemadeFood();
    const updateOrderStatus = useUpdateHomemadeFoodOrderStatus();

    const handleSaveItem = () => {
        if (!itemForm.name || !itemForm.price) return;

        const payload = {
            ...itemForm,
            features: itemForm.features.split(',').map(f => f.trim()).filter(Boolean)
        };

        if (editingItem) {
            updateFood.mutate({ id: editingItem._id, data: payload }, {
                onSuccess: () => {
                    setIsItemDialogOpen(false);
                    toast.success("Food item updated successfully");
                    setEditingItem(null);
                    setItemForm({
                        name: '', description: '', image: '', price: 0, availableQuantity: -1,
                        servingSize: '', preparationTime: '', cuisine: '', features: '', isActive: true, isTodaysSpecial: false,
                    });
                },
                onError: () => toast.error("Failed to update food item")
            });
        } else {
            createFood.mutate(payload, {
                onSuccess: () => {
                    setIsItemDialogOpen(false);
                    toast.success("Food item created successfully");
                    setItemForm({
                        name: '', description: '', image: '', price: 0, availableQuantity: -1,
                        servingSize: '', preparationTime: '', cuisine: '', features: '', isActive: true, isTodaysSpecial: false,
                    });
                },
                onError: () => toast.error("Failed to create food item")
            });
        }
    };

    const handleUpdateOrderStatus = () => {
        if (!selectedOrder || !newStatus) return;

        updateOrderStatus.mutate({ id: selectedOrder._id, data: { status: newStatus, adminNotes } }, {
            onSuccess: () => {
                setIsOrderDialogOpen(false);
                toast.success("Order status updated successfully");
                setSelectedOrder(null);
            },
            onError: () => toast.error("Failed to update order status")
        });
    };

    return (
        <div className="space-y-6 container mx-auto p-4 sm:p-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-orange-600" />
                        Homemade Food Admin
                    </h1>
                    <p className="text-gray-600 mt-1">Manage subscriptions, menus, and track business performance.</p>
                </div>
                <Button variant="outline" onClick={handleRefresh} className="shadow-sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                </Button>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 max-w-3xl bg-gray-100/50 p-1">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Activity className="w-4 h-4 mr-2" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="menu" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Utensils className="w-4 h-4 mr-2" />
                        Daily Menu
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Package className="w-4 h-4 mr-2" />
                        Orders
                    </TabsTrigger>
                    <TabsTrigger value="subscriptions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Subscriptions
                    </TabsTrigger>

                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                    <AnalyticsDashboard
                        data={analyticsData?.data || {}}
                        isLoading={analyticsLoading}
                        onPendingOrdersClick={() => {
                            setActiveTab('orders');
                            setOrderFilters(prev => ({ ...prev, status: 'pending' }));
                        }}
                    />
                </TabsContent>

                {/* Daily Menu Tab */}
                <TabsContent value="menu" className="space-y-4">
                    <DailyMenuEditor />
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions" className="space-y-6">
                    <Tabs defaultValue="requests" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList>
                                <TabsTrigger value="models">Plan Models</TabsTrigger>
                                <TabsTrigger value="requests" className="relative">
                                    Requests
                                </TabsTrigger>
                                <TabsTrigger value="active_subs">
                                    Active Subscribers
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="models" className="mt-0">
                            <SubscriptionManager />
                        </TabsContent>

                        <TabsContent value="requests" className="mt-0">
                            <SubscriberRequests />
                        </TabsContent>

                        <TabsContent value="active_subs" className="mt-0">
                            <ActiveSubscriptions />
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle>Recent Orders</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search customer/phone..."
                                            className="pl-9 w-48 sm:w-64"
                                            value={orderFilters.search}
                                            onChange={(e) => setOrderFilters(prev => ({ ...prev, search: e.target.value }))}
                                        />
                                    </div>
                                    <Select
                                        value={orderFilters.status}
                                        onValueChange={(value) => setOrderFilters(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
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
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>No orders found matching criteria</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any) => (
                                        <div
                                            key={order._id}
                                            className="flex flex-col sm:flex-row justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-all gap-4 cursor-pointer"
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setNewStatus(order.status);
                                                setAdminNotes(order.adminNotes || '');
                                                setIsOrderDialogOpen(true);
                                            }}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-800">#{order.orderNumber}</span>
                                                    <Badge className="capitalize" variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <p className="font-medium text-gray-900">
                                                    {order.foodName || order.items?.[0]?.itemName || 'Ordered Item'} x{order.quantity}
                                                </p>
                                                {order.specialInstructions && (
                                                    <p className="text-sm font-semibold text-orange-600">
                                                        {order.specialInstructions}
                                                    </p>
                                                )}
                                                <div className="text-sm text-gray-500">
                                                    {order.customerName} • {order.mobileNumber}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end justify-center gap-1">
                                                <p className="text-lg font-bold text-orange-600">₹{order.finalAmount}</p>
                                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                                                {order.deliveryAddress?.street && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Truck className="w-3 h-3" />
                                                        <span className="max-w-[200px] truncate">{order.deliveryAddress.street}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {ordersData?.pagination && ordersData.pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={orderFilters.page === 1}
                                        onClick={() => setOrderFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4 text-sm font-medium">
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
            </Tabs>

            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Food Item' : 'Add Food Item'}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Update the details of this food item' : 'Create a new homemade food item'}
                        </DialogDescription>
                    </DialogHeader>
                    {/* Item Form Implementation - Same as before */}
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
                                    <span>{selectedOrder.foodName || selectedOrder.items?.[0]?.itemName || 'Ordered Item'}</span>
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
                                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
        </div >
    );
}
