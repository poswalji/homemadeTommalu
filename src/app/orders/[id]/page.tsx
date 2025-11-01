'use client';

import { useParams } from 'next/navigation';
import { useOrderPublic } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  CheckCircle, 
  Truck,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function PublicOrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const { data, isLoading, error } = useOrderPublic(orderId);

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
              <p className="font-medium">{order.items?.length || 0} items</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="font-medium">₹{order.finalPrice?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

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

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

