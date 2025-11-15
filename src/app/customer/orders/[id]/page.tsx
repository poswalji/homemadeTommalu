'use client';

import { useParams } from 'next/navigation';
import { useOrder, useCancelOrder, useMyReviews } from '@/hooks/api';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  MapPin, 
  Calendar, 
  XCircle, 
  CheckCircle, 
  Truck,
  ArrowLeft,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { OrderReviewModal } from '@/components/reviews/order-review-modal';

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const orderId = (params?.id as string) || '';
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data, isLoading, error } = useOrder(orderId);
  const { data: reviewsData } = useMyReviews();
  const cancelOrder = useCancelOrder();

  // Check if this order has been reviewed
  const hasBeenReviewed = useMemo(() => {
    const reviews = reviewsData?.data || [];
    return reviews.some((review: any) => review.orderId === orderId);
  }, [reviewsData, orderId]);

  const handleCancelOrder = async () => {
    try {
      await cancelOrder.mutateAsync({
        id: orderId,
        cancellationReason: cancellationReason || undefined,
      });
      toast.success('Order cancelled successfully');
      setIsCancelDialogOpen(false);
      setCancellationReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
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
        <Link href="/customer/orders">
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
        <Link href="/customer/orders">
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
      <Link href="/customer/orders">
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
        <p className="text-gray-600">Order details and tracking</p>
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

          {order.status === 'Delivered' && !hasBeenReviewed && (
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Star className="w-12 h-12 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How was your order?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Share your experience and help others make better choices
                  </p>
                </div>
                <Button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              </div>
            </Card>
          )}

          {order.status === 'Delivered' && hasBeenReviewed && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-green-800">
                  Thank you for your review!
                </p>
                <Link href="/customer/reviews">
                  <Button variant="outline" size="sm" className="mt-2">
                    View Your Reviews
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {['Pending', 'Confirmed'].includes(order.status) && (
            <Card className="p-6">
              <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this order?
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
                      onClick={() => setIsCancelDialogOpen(false)}
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
            </Card>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {order && order.status === 'Delivered' && !hasBeenReviewed && (
        <OrderReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          orderId={order.id}
          storeId={typeof order.storeId === 'string' ? order.storeId : (order.storeId?._id || '')}
          storeName={order.storeName}
          items={(order.items || []).map((item: any) => ({
            id: item.menuItemId || item.id || '',
            name: item.itemName || item.name || 'Item',
          }))}
          onReviewSubmitted={() => {
            setIsReviewModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

