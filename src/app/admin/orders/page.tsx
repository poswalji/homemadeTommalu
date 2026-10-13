'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Package, MapPin, Phone, Loader2, ListFilter, Clock, CheckCircle2, Truck, Check, Users, User } from 'lucide-react';
import { useAdminHomemadeFoodOrders, useUpdateHomemadeFoodOrderStatus } from '@/hooks/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminOrdersPage() {
    const [filters, setFilters] = useState({
        status: 'all',
        area: 'all',
        mealType: 'all',
        search: '',
        page: 1,
        limit: 50,
    });

    const [searchInput, setSearchInput] = useState('');

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const { data: ordersData, isLoading, refetch } = useAdminHomemadeFoodOrders({
        status: filters.status !== 'all' ? filters.status : undefined,
        area: filters.area !== 'all' ? filters.area : undefined,
        mealType: filters.mealType !== 'all' ? filters.mealType : undefined,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit,
    });

    const orders = ordersData?.data || [];
    const updateOrderStatus = useUpdateHomemadeFoodOrderStatus();

    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const handleQuickStatusUpdate = (orderId: string, status: any) => {
        updateOrderStatus.mutate({ id: orderId, data: { status, adminNotes: '' } }, {
            onSuccess: () => {
                toast.success(`Order marked as ${status}`);
                refetch();
            },
            onError: () => toast.error("Failed to update order status")
        });
    };

    const handleFullStatusUpdate = () => {
        if (!selectedOrder || !newStatus) return;
        updateOrderStatus.mutate({ id: selectedOrder.id || selectedOrder._id, data: { status: newStatus as any, adminNotes } }, {
            onSuccess: () => {
                setIsStatusDialogOpen(false);
                toast.success("Order status updated successfully");
                setSelectedOrder(null);
                setAdminNotes('');
                refetch();
            },
            onError: () => toast.error("Failed to update order status")
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'NEW':
            case 'PENDING': return 'bg-blue-100 text-blue-800';
            case 'ACCEPTED':
            case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800';
            case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
            case 'READY': return 'bg-orange-100 text-orange-800';
            case 'OUT_FOR_DELIVERY':
            case 'OUTFORDELIVERY': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED':
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Package className="w-6 h-6 text-orange-600" />
                        Order Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders in real-time.</p>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="border-stone-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search Name, Phone or ID..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9 bg-gray-50"
                            />
                        </div>
                        
                        <Select value={filters.status} onValueChange={(val) => setFilters(p => ({ ...p, status: val, page: 1 }))}>
                            <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">New</SelectItem>
                                <SelectItem value="confirmed">Accepted</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.mealType} onValueChange={(val) => setFilters(p => ({ ...p, mealType: val, page: 1 }))}>
                            <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Meal Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Meals</SelectItem>
                                <SelectItem value="lunch">Lunch</SelectItem>
                                <SelectItem value="dinner">Dinner</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.area} onValueChange={(val) => setFilters(p => ({ ...p, area: val, page: 1 }))}>
                            <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Area" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Areas</SelectItem>
                                <SelectItem value="nims">NIMS</SelectItem>
                                <SelectItem value="achrol">Achrol</SelectItem>
                                <SelectItem value="chomu">Chomu</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                    <p className="text-gray-500">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map((order: any) => (
                        <Card key={order.id || order._id} className="overflow-hidden border-stone-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Info */}
                                    <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-stone-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-bold text-gray-900">
                                                        #{order.orderNumber}
                                                    </span>
                                                    <Badge className={`${getStatusColor(order.status)} border-0 font-semibold uppercase text-[10px] tracking-wider`}>
                                                        {order.status}
                                                    </Badge>
                                                    {order.mealType && (
                                                        <Badge variant="outline" className="text-stone-500 border-stone-200 text-[10px]">
                                                            {order.mealType}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleString('en-IN', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-orange-600">₹{order.total || order.finalAmount}</div>
                                                <div className="text-xs font-medium text-stone-500 uppercase">{order.paymentMethod?.replace(/_/g, ' ') || 'COD'}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="w-4 h-4 text-stone-400" />
                                                    <span className="font-medium text-stone-700">{order.customer?.name || order.customerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-stone-400" />
                                                    <span className="text-stone-600">{order.customer?.phone || order.mobileNumber}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                                                    <span className="text-stone-600 line-clamp-2">{order.deliveryAddress?.street || 'No address'}</span>
                                                </div>
                                            </div>

                                            <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100/50">
                                                <h4 className="text-xs font-semibold text-orange-800 mb-2 uppercase tracking-wide">Order Items</h4>
                                                <ul className="text-sm space-y-1">
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <li key={idx} className="flex justify-between text-stone-700">
                                                            <span>{item.quantity} × {item.name}</span>
                                                        </li>
                                                    )) || (
                                                        <li className="flex justify-between text-stone-700">
                                                            <span>{order.quantity} × {order.foodName}</span>
                                                        </li>
                                                    )}
                                                </ul>
                                                {order.specialInstructions && (
                                                    <div className="mt-2 text-xs text-red-600 font-medium bg-red-50 p-1.5 rounded">
                                                        Note: {order.specialInstructions}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="w-full md:w-56 bg-stone-50 p-4 flex flex-col justify-center gap-2">
                                        <Link href={`/admin/orders/${order.id || order._id}`} className="w-full">
                                            <Button variant="outline" className="w-full bg-white">View Details</Button>
                                        </Link>

                                        {(order.status?.toUpperCase() === 'NEW' || order.status?.toUpperCase() === 'PENDING') && (
                                            <Button onClick={() => handleQuickStatusUpdate(order.id || order._id, 'Confirmed')} disabled={updateOrderStatus.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Order
                                            </Button>
                                        )}
                                        {(order.status?.toUpperCase() === 'ACCEPTED' || order.status?.toUpperCase() === 'CONFIRMED') && (
                                            <Button onClick={() => handleQuickStatusUpdate(order.id || order._id, 'preparing')} disabled={updateOrderStatus.isPending} className="w-full bg-yellow-600 hover:bg-yellow-700">
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.status?.toUpperCase() === 'PREPARING' && (
                                            <Button onClick={() => handleQuickStatusUpdate(order.id || order._id, 'ready')} disabled={updateOrderStatus.isPending} className="w-full bg-orange-600 hover:bg-orange-700">
                                                Mark Ready
                                            </Button>
                                        )}
                                        {order.status?.toUpperCase() === 'READY' && (
                                            <Button onClick={() => handleQuickStatusUpdate(order.id || order._id, 'OutForDelivery')} disabled={updateOrderStatus.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                                                <Truck className="w-4 h-4 mr-2" /> Out for Delivery
                                            </Button>
                                        )}
                                        {(order.status?.toUpperCase() === 'OUT_FOR_DELIVERY' || order.status?.toUpperCase() === 'OUTFORDELIVERY') && (
                                            <Button onClick={() => handleQuickStatusUpdate(order.id || order._id, 'Delivered')} disabled={updateOrderStatus.isPending} className="w-full bg-green-600 hover:bg-green-700">
                                                <Check className="w-4 h-4 mr-2" /> Mark Delivered
                                            </Button>
                                        )}

                                        <Dialog open={isStatusDialogOpen && selectedOrder?.id === (order.id || order._id)} onOpenChange={(open) => {
                                            setIsStatusDialogOpen(open);
                                            if (open) {
                                                setSelectedOrder(order);
                                                setNewStatus(order.originalStatus || order.status);
                                                setAdminNotes(order.adminNotes || '');
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" className="w-full text-xs text-stone-500 hover:text-stone-900">
                                                    Update Status manually
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Update Order #{order.orderNumber}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Status</Label>
                                                        <Select value={newStatus} onValueChange={setNewStatus}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Pending">New / Pending</SelectItem>
                                                                <SelectItem value="Confirmed">Accepted</SelectItem>
                                                                <SelectItem value="preparing">Preparing</SelectItem>
                                                                <SelectItem value="ready">Ready</SelectItem>
                                                                <SelectItem value="OutForDelivery">Out for Delivery</SelectItem>
                                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Admin Notes (Reason for cancel, delay, etc.)</Label>
                                                        <Textarea 
                                                            placeholder="Optional internal notes..."
                                                            value={adminNotes}
                                                            onChange={(e) => setAdminNotes(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button onClick={handleFullStatusUpdate} className="w-full bg-orange-600" disabled={updateOrderStatus.isPending}>
                                                        {updateOrderStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
