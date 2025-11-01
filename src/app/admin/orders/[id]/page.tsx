'use client';

import { useParams } from 'next/navigation';
import { useOrder, useUpdateOrderStatus } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  MapPin, 
  Calendar, 
  XCircle, 
  CheckCircle, 
  Truck,
  ArrowLeft,
  User,
  Store
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [statusUpdate, setStatusUpdate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async () => {
    if (!statusUpdate) {
      toast.error('Please select a status');
      return;
    }

    try {
      await updateStatus.mutateAsync({
        id: orderId,
        data: {
          status: statusUpdate as any,
        },
      });
      toast.success(`Order status updated to ${statusUpdate}`);
      setIsDialogOpen(false);
      setStatusUpdate('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    }
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
        <p className="text-red-600">Error loading order</p>
        <Link href="/admin/orders">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const order = data?.data;

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Order not found</p>
        <Link href="/admin/orders">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'OutForDelivery':
        return <Truck className="w-5 h-5" />;
      case 'Rejected':
      case 'Cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/orders">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id?.slice(0, 8)}
          </h1>
          <Badge className={getStatusColor(order.status)}>
            <span className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              {order.status}
            </span>
          </Badge>
        </div>
        <p className="text-gray-600">Order details and management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.itemName || item.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity || 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{((item.itemPrice || item.price) * (item.quantity || 1)).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹{(item.itemPrice || item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">{order.customerName || 'N/A'}</p>
                <p className="text-sm text-gray-600">{order.customerEmail || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Store Information</h2>
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">{order.storeName || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {order.deliveryAddress && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">{order.deliveryAddress.label || 'Home'}</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
                  </p>
                  <p className="text-gray-600">
                    {order.deliveryAddress.pincode}
                    {order.deliveryAddress.country && `, ${order.deliveryAddress.country}`}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {(order.rejectionReason || order.cancellationReason) && (
            <Card className={`p-6 ${
              order.rejectionReason ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                order.rejectionReason ? 'text-red-800' : 'text-orange-800'
              }`}>
                {order.rejectionReason ? 'Rejection Reason' : 'Cancellation Reason'}
              </h2>
              <p className={`${
                order.rejectionReason ? 'text-red-700' : 'text-orange-700'
              }`}>
                {order.rejectionReason || order.cancellationReason}
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{(order.finalPrice + (order.discount || 0)).toFixed(2)}
                </span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              {order.promoCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Promo Code</span>
                  <span className="font-medium">{order.promoCode}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-lg">₹{order.finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Order Date</p>
                  <p className="text-sm text-gray-600">
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
              {order.updatedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.updatedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  onClick={() => setStatusUpdate(order.status)}
                >
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Order Status</DialogTitle>
                  <DialogDescription>
                    Update the status for Order #{order.id?.slice(0, 8)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={statusUpdate}
                      onValueChange={setStatusUpdate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="OutForDelivery">Out for Delivery</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={updateStatus.isPending}>
                    {updateStatus.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </div>
    </div>
  );
}

