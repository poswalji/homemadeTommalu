'use client';

import { useParams } from 'next/navigation';
import { useOrderPublic, useMyReviews } from '@/hooks/api';
import { useAuth } from '@/providers/auth-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  CheckCircle, 
  Truck,
  XCircle,
  Clock,
  Star
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { OrderReviewModal } from '@/components/reviews/order-review-modal';

export default function PublicOrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data, isLoading, error } = useOrderPublic(orderId);
  const { user, isAuthenticated } = useAuth();
  const { data: reviewsData } = useMyReviews();

  // Check if this order has been reviewed (only if user is authenticated)
  const hasBeenReviewed = useMemo(() => {
    if (!isAuthenticated || !reviewsData?.data) return false;
    const reviews = reviewsData.data || [];
    return reviews.some((review: any) => review.orderId === orderId);
  }, [reviewsData, orderId, isAuthenticated]);

  // Check if the order belongs to the authenticated user
  const isOrderOwner = useMemo(() => {
    if (!isAuthenticated || !user || !data?.data) return false;
    const order = data.data;
    return order.userId === user.id 
  }, [isAuthenticated, user, data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Order not found or invalid order ID</p>
          <Link href="/">
            <Button variant="outline">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const order = data?.data;

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link href="/">
            <Button variant="outline">Go to Home</Button>
          </Link>
        </div>
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
        return <CheckCircle className="w-6 h-6" />;
      case 'OutForDelivery':
        return <Truck className="w-6 h-6" />;
      case 'Rejected':
      case 'Cancelled':
        return <XCircle className="w-6 h-6" />;
      case 'Pending':
        return <Clock className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { id: 1, name: 'Order Placed', status: 'Pending' },
      { id: 2, name: 'Confirmed', status: 'Confirmed' },
      { id: 3, name: 'Out for Delivery', status: 'OutForDelivery' },
      { id: 4, name: 'Delivered', status: 'Delivered' },
    ];

    return steps.map((step) => {
      const currentStepIndex = steps.findIndex((s) => s.status === status);
      const stepIndex = steps.findIndex((s) => s.status === step.status);
      const isCompleted = stepIndex <= currentStepIndex;
      const isCurrent = step.status === status;

      return {
        ...step,
        isCompleted,
        isCurrent,
      };
    });
  };

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Tracking
          </h1>
          <p className="text-gray-600">Track your order status in real-time</p>
        </div>

        <Card className="p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="text-xl font-semibold">#{order.id?.slice(0, 8)}</p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              <span className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </Badge>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Store</p>
            <p className="font-medium">{order.storeName || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Items</p>
              <p className="font-medium">{order?.items?.length || 'N/A'} items</p>
              
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="font-medium">₹{order.finalPrice?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          {order?.items?.map((item, index) => (
            <div key={item.menuId} className="mb-6 flex items-center justify-between">
              {index === 0 && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Order Items</p>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white p-2 rounded-md">
                <p className="text-sm text-gray-600 mb-1">{item.itemName}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.quantity} x ₹{item.itemPrice?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          ))}

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Date</p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6">Order Status</h2>
          <div className="space-y-6">
            {statusSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  step.isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full ${
                      step.isCurrent ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p className={`font-medium ${
                    step.isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  {step.isCurrent && (
                    <p className="text-sm text-blue-600 mt-1">Current status</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Review Prompt for Delivered Orders */}
        {order.status === 'Delivered' && isAuthenticated && isOrderOwner && (
          <>
            {!hasBeenReviewed ? (
              <Card className="p-8 bg-yellow-50 border-yellow-200">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Star className="w-16 h-16 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      How was your order?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Share your experience and help others make better choices
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    size="lg"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Write a Review
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 bg-green-50 border-green-200">
                <div className="text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Thank you for your review!
                  </h3>
                  <p className="text-sm text-green-700">
                    Your feedback helps us improve
                  </p>
                  {isAuthenticated && (
                    <Link href="/customer/reviews">
                      <Button variant="outline" size="sm" className="mt-2">
                        View Your Reviews
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>

      {/* Review Modal */}
      {order && order.status === 'Delivered' && isAuthenticated && isOrderOwner && !hasBeenReviewed && (
        <OrderReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          orderId={order.id}
          storeId={typeof order.storeId === 'string' ? order.storeId : (order.storeId?._id || '')}
          storeName={order.storeName }
          items={(order.items || []).map((item: any) => ({
            id: item.menuItemId || item.id || item.menuId || '',
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

