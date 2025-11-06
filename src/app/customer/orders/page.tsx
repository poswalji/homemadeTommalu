'use client';

import { useState } from 'react';
import { useMyOrders, useCancelOrder } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Package, Calendar, MapPin, Search, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CustomerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { data, isLoading, error } = useMyOrders();
  const cancelOrder = useCancelOrder();

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      await cancelOrder.mutateAsync({
        id: selectedOrder,
        cancellationReason: cancellationReason || undefined,
      });
      toast.success('Order cancelled successfully');
      setIsCancelDialogOpen(false);
      setSelectedOrder(null);
      setCancellationReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
    }
  };

  const openCancelDialog = (orderId: string) => {
    setSelectedOrder(orderId);
    setCancellationReason('');
    setIsCancelDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading orders</p>
      </div>
    );
  }

  const orders = data?.data || [];
  const filteredOrders = orders.filter((order) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id?.toLowerCase().includes(searchLower) ||
        order.storeName?.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'OutForDelivery':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">View and track your orders</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 w-full sm:max-w-md text-sm sm:text-base"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Start ordering from our stores</p>
            <Link href="/">
              <Button>Browse Stores</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold truncate">
                        Order #{order.id?.slice(0, 8)}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{order.storeName}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold">₹{order.finalPrice}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">Order Date</p>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium">Delivery Address</p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {order.deliveryAddress.street}, {order.deliveryAddress.city}
                          {order.deliveryAddress.pincode && ` - ${order.deliveryAddress.pincode}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.itemName || item.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{((item.itemPrice || item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(order.rejectionReason || order.cancellationReason) && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    order.rejectionReason ? 'bg-red-50' : 'bg-orange-50'
                  }`}>
                    <p className={`text-sm font-medium mb-1 ${
                      order.rejectionReason ? 'text-red-800' : 'text-orange-800'
                    }`}>
                      {order.rejectionReason ? 'Rejection Reason:' : 'Cancellation Reason:'}
                    </p>
                    <p className={`text-sm ${
                      order.rejectionReason ? 'text-red-700' : 'text-orange-700'
                    }`}>
                      {order.rejectionReason || order.cancellationReason}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/customer/orders/${order.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-xs sm:text-sm">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  </Link>
                  {['Pending', 'Confirmed'].includes(order.status) && (
                    <Dialog open={isCancelDialogOpen && selectedOrder === order.id} onOpenChange={(open) => {
                      setIsCancelDialogOpen(open);
                      if (!open) {
                        setSelectedOrder(null);
                        setCancellationReason('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => openCancelDialog(order.id)}
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Cancel Order</span>
                          <span className="sm:hidden">Cancel</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Order</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel Order #{order.id?.slice(0, 8)}?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="cancellationReason">Reason (Optional)</Label>
                            <Textarea
                              id="cancellationReason"
                              placeholder="Enter reason for cancellation..."
                              value={cancellationReason}
                              onChange={(e) => setCancellationReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsCancelDialogOpen(false);
                              setSelectedOrder(null);
                            }}
                          >
                            Keep Order
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleCancelOrder}
                            disabled={cancelOrder.isPending}
                          >
                            {cancelOrder.isPending ? (
                              <>
                                <Spinner size="sm" className="mr-2" />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel Order'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  {order.status === 'Delivered' && (
                    <Button variant="outline" className="flex-1">
                      Reorder
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

