'use client';

import { useParams } from 'next/navigation';
import { useAdminHomemadeFoodOrder, useUpdateHomemadeFoodOrderStatus } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  MapPin,
  Calendar,
  XCircle,
  CheckCircle,
  Truck,
  ArrowLeft,
  User,
  ExternalLink,
  Phone,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useAdminHomemadeFoodOrder(orderId);
  const updateStatus = useUpdateHomemadeFoodOrderStatus();

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
          adminNotes: adminNotes
        },
      });
      toast.success(`Order status updated successfully`);
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-red-100">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-xl font-medium text-gray-900 mb-2">Order not found</p>
        <p className="text-gray-500 mb-6">This order might have been deleted or the ID is invalid.</p>
        <Link href="/admin/orders">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const order = data.data as any;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-indigo-100 text-indigo-800';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
      case 'READY': return 'bg-orange-100 text-orange-800';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return <CheckCircle className="w-5 h-5" />;
      case 'OUT_FOR_DELIVERY': return <Truck className="w-5 h-5" />;
      case 'REJECTED':
      case 'CANCELLED': return <XCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <Link href="/admin/orders">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-900 -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-sm border-0 font-semibold tracking-wider uppercase`}>
          <span className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            {order.status}
          </span>
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Order #{order.orderNumber}
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-stone-200 shadow-sm">
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Order Items
              </h2>
            </div>
            <div className="p-0">
              <div className="divide-y divide-stone-100">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                        {item.quantity || 1}x
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                        <p className="text-sm text-gray-500">₹{Number(item.price || 0).toFixed(2)} per item</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {order.specialInstructions && (
                <div className="bg-yellow-50 p-4 border-t border-yellow-100 text-yellow-800">
                  <strong className="block text-sm uppercase tracking-wider mb-1">Customer Note:</strong>
                  {order.specialInstructions}
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 border-stone-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Customer
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{order.customer?.name || order.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{order.customer?.phone || order.mobileNumber || 'N/A'}</p>
                    <a href={`tel:${order.customer?.phone || order.mobileNumber}`} className="text-orange-600 hover:text-orange-700 bg-orange-50 p-1.5 rounded-md">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-stone-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                Delivery
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Area</p>
                  <Badge variant="outline" className="uppercase text-[10px] mt-0.5 font-bold tracking-wider">{order.area}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900 text-sm leading-relaxed mt-0.5">
                    {order.deliveryAddress?.street || 'No address provided'}
                  </p>
                  {order.deliveryAddress?.locationLink && (
                    <a href={order.deliveryAddress.locationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded transition-colors">
                      <ExternalLink className="w-3 h-3 mr-1" /> Open Map
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </div>
          
          {(order.adminNotes || order.cancellationReason) && (
            <Card className="p-6 bg-stone-50 border-stone-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-stone-800">
                    <Clock className="w-5 h-5 text-stone-500" />
                    Admin Notes & History
                </h2>
                <div className="space-y-3">
                    {order.cancellationReason && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-800 text-sm">
                            <strong className="block mb-1">Cancellation Reason:</strong>
                            {order.cancellationReason}
                        </div>
                    )}
                    {order.adminNotes && (
                        <div className="bg-white p-3 rounded-lg border border-stone-200 text-stone-700 text-sm whitespace-pre-wrap">
                            {order.adminNotes}
                        </div>
                    )}
                </div>
            </Card>
          )}

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-stone-200 shadow-sm sticky top-6">
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{order.total || order.finalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-medium text-green-600">
                    {order.deliveryCharge ? `₹${order.deliveryCharge}` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method</span>
                  <span className="font-medium text-gray-900 uppercase">{order.paymentMethod?.replace(/_/g, ' ') || 'COD'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Meal Type</span>
                  <span className="font-medium text-gray-900">{order.mealType}</span>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-600">₹{order.total || order.finalAmount}</span>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (open) {
                        setStatusUpdate(order.originalStatus || order.status);
                        setAdminNotes(order.adminNotes || '');
                    }
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-md">
                      Update Order Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Order #{order.orderNumber}</DialogTitle>
                      <DialogDescription>
                        Change the current lifecycle status of this order.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
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
                          <Label>Admin Notes</Label>
                          <Textarea 
                              placeholder="Reason for cancellation, delay, or internal notes..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                          />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleStatusUpdate} disabled={updateStatus.isPending} className="bg-orange-600">
                        {updateStatus.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
