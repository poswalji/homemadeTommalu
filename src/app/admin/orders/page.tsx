'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Package, Truck, Users, Phone, MapPin, Loader2 } from 'lucide-react';
import { useAdminHomemadeFoodOrders, useUpdateHomemadeFoodOrderStatus } from '@/hooks/api';
import { toast } from 'sonner';
import { type HomemadeFoodOrderStatus } from '@/services/api/homemade-food.api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';

export default function AdminOrdersPage() {
    const [orderFilters, setOrderFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 50,
    });

    const { data: ordersData, isLoading: ordersLoading } = useAdminHomemadeFoodOrders({
        status: orderFilters.status !== 'all' ? orderFilters.status : undefined,
        search: orderFilters.search || undefined,
        page: orderFilters.page,
        limit: orderFilters.limit,
    });

    const orders = ordersData?.data || [];

    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState<any>('');

    const updateOrderStatus = useUpdateHomemadeFoodOrderStatus();

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
                        <Package className="w-8 h-8 text-orange-600" />
                        Orders Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage homemade food orders and deliveries.</p>
                </div>
            </div>

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
                </CardContent>
            </Card>

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
        </div>
    );
}
