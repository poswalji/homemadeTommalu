'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useStoreById,
  useUpdateStoreDeliveryFee,
  useUpdateStoreMetadata,
  useUpdateStoreCommission,
  useApproveStore,
  useRejectStore,
  useSuspendStore,
  useReactivateStore,
  useAllPayouts,
  useGeneratePayout,
  useApprovePayout,
  useCompletePayout,
} from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  Percent,
  FileText,
  Image as ImageIcon,
  CreditCard,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import Link from 'next/link';
import { StoreCategory } from '@/services/api/public.api';
import { Textarea } from '@/components/ui/textarea';

export default function AdminStoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.id as string;

  const { data: storeData, isLoading, error } = useStoreById(storeId);
  const store = storeData?.data;

  const [editDialog, setEditDialog] = useState<{
    type: 'deliveryFee' | 'metadata' | 'commission' | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  const [payoutDialog, setPayoutDialog] = useState<{
    type: 'generate' | 'complete' | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [payoutForm, setPayoutForm] = useState({
    periodStart: '',
    periodEnd: '',
    transferId: '',
    transferResponse: '',
  });

  const [formData, setFormData] = useState({
    deliveryFee: 30,
    category: '',
    description: '',
    openingTime: '',
    closingTime: '',
    minOrder: 0,
    commissionRate: 0,
  });

  const updateDeliveryFee = useUpdateStoreDeliveryFee();
  const updateMetadata = useUpdateStoreMetadata();
  const updateCommission = useUpdateStoreCommission();
  const approveStore = useApproveStore();
  const rejectStore = useRejectStore();
  const suspendStore = useSuspendStore();
  const reactivateStore = useReactivateStore();

  // Payout hooks
  const { data: payoutsData, isLoading: payoutsLoading } = useAllPayouts({
    storeId: storeId,
    limit: 10,
  });
  const generatePayout = useGeneratePayout();
  const approvePayout = useApprovePayout();
  const completePayout = useCompletePayout();

  const storePayouts = payoutsData?.data || [];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive'; label: string }
    > = {
      active: { variant: 'default', label: 'Active' },
      approved: { variant: 'default', label: 'Approved' },
      pendingApproval: { variant: 'secondary', label: 'Pending' },
      submitted: { variant: 'secondary', label: 'Submitted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      suspended: { variant: 'destructive', label: 'Suspended' },
      draft: { variant: 'secondary', label: 'Draft' },
    };

    const config = statusConfig[status] || {
      variant: 'secondary',
      label: status,
    };
    return (
      <Badge
        variant={
          config.variant as
            | 'default'
            | 'secondary'
            | 'success'
            | 'outline'
            | null
            | undefined
        }
      >
        {config.label}
      </Badge>
    );
  };

  const handleOpenEditDialog = (type: 'deliveryFee' | 'metadata' | 'commission') => {
    if (!store) return;

    if (type === 'deliveryFee') {
      setFormData({ ...formData, deliveryFee: store.deliveryFee || 30 });
    } else if (type === 'metadata') {
      setFormData({
        ...formData,
        category: store.category || '',
        description: store.description || '',
        openingTime: store.openingTime || '',
        closingTime: store.closingTime || '',
        minOrder: (store as any).minOrder || 0,
      });
    } else if (type === 'commission') {
      setFormData({ ...formData, commissionRate: store.commissionRate || 0 });
    }

    setEditDialog({ type, isOpen: true });
  };

  const handleUpdateDeliveryFee = async () => {
    if (!store) return;

    try {
      await updateDeliveryFee.mutateAsync({
        id: storeId,
        data: { deliveryFee: formData.deliveryFee },
      });
      toast.success('Delivery charge updated successfully!');
      setEditDialog({ type: null, isOpen: false });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleUpdateMetadata = async () => {
    if (!store) return;

    try {
      await updateMetadata.mutateAsync({
        id: storeId,
        data: {
          category: formData.category as StoreCategory,
          description: formData.description,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          minOrder: formData.minOrder,
        },
      });
      toast.success('Store metadata updated successfully!');
      setEditDialog({ type: null, isOpen: false });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleUpdateCommission = async () => {
    if (!store) return;

    try {
      await updateCommission.mutateAsync({
        id: storeId,
        data: { commissionRate: formData.commissionRate },
      });
      toast.success('Commission rate updated successfully!');
      setEditDialog({ type: null, isOpen: false });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleApprove = async () => {
    try {
      await approveStore.mutateAsync(storeId);
      toast.success('Store approved successfully!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await rejectStore.mutateAsync({ id: storeId, data: { reason } });
      toast.success('Store rejected');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Are you sure you want to suspend this store?')) return;

    try {
      await suspendStore.mutateAsync(storeId);
      toast.success('Store suspended');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('Are you sure you want to reactivate this store?')) return;

    try {
      await reactivateStore.mutateAsync(storeId);
      toast.success('Store reactivated successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleGeneratePayout = async () => {
    if (!payoutForm.periodStart || !payoutForm.periodEnd) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      await generatePayout.mutateAsync({
        storeId,
        periodStart: payoutForm.periodStart,
        periodEnd: payoutForm.periodEnd,
      });
      toast.success('Payout generated successfully');
      setPayoutDialog({ type: null, isOpen: false });
      setPayoutForm({ periodStart: '', periodEnd: '', transferId: '', transferResponse: '' });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await approvePayout.mutateAsync(payoutId);
      toast.success('Payout approved successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleCompletePayout = async () => {
    if (!selectedPayout || !payoutForm.transferId) {
      toast.error('Please enter transfer ID');
      return;
    }

    try {
      await completePayout.mutateAsync({
        id: selectedPayout.id || selectedPayout._id,
        data: {
          transferId: payoutForm.transferId,
          transferResponse: payoutForm.transferResponse ? JSON.parse(payoutForm.transferResponse) : undefined,
        },
      });
      toast.success('Payout completed successfully');
      setPayoutDialog({ type: null, isOpen: false });
      setSelectedPayout(null);
      setPayoutForm({ periodStart: '', periodEnd: '', transferId: '', transferResponse: '' });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const getPayoutStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      processing: { variant: 'default', label: 'Processing' },
      completed: { variant: 'default', label: 'Completed' },
      failed: { variant: 'destructive', label: 'Failed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return (
      <Badge
        variant={
          config.variant as
            | 'default'
            | 'secondary'
            | 'success'
            | 'outline'
            | null
            | undefined
        }
      >
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Store Not Found</h2>
          <p className="text-gray-600 mb-4">
            The store you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/admin/stores')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stores
          </Button>
        </Card>
      </div>
    );
  }

  const statistics = store.statistics || {
    orderCount: 0,
    totalRevenue: 0,
    totalEarnings: 0,
    timesOrdered: 0,
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/stores')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{store.storeName}</h1>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(store.status || '')}
                {store.isVerified && (
                  <Badge variant="default">Verified</Badge>
                )}
                {store.available ? (
                  <Badge variant="default">Available</Badge>
                ) : (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {store.status === 'pendingApproval' ||
            store.status === 'submitted' ||
            store.status === 'draft' ? (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={approveStore.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectStore.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            ) : store.status === 'active' ? (
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={suspendStore.isPending}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Suspend
              </Button>
            ) : store.status === 'suspended' ? (
              <Button
                onClick={handleReactivate}
                disabled={reactivateStore.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Reactivate
              </Button>
            ) : null}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{statistics.orderCount}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{statistics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Store Earnings</p>
                <p className="text-2xl font-bold">
                  ₹{statistics.totalEarnings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Times Ordered</p>
                <p className="text-2xl font-bold">{statistics.timesOrdered}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Store Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Store Information</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditDialog('metadata')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Store Name</p>
                    <p className="font-medium">{store.storeName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{store.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{store.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <Badge variant="outline">{store.category}</Badge>
                  </div>
                </div>
                {store.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium">{store.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Business Hours & Settings */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Business Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditDialog('metadata')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Operating Hours</p>
                      <p className="font-medium">
                        {store.openingTime || 'N/A'} -{' '}
                        {store.closingTime || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {store.isOpen ? (
                    <Badge variant="default">Open</Badge>
                  ) : (
                    <Badge variant="secondary">Closed</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Fee</p>
                      <p className="font-medium">₹{store.deliveryFee || 0}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog('deliveryFee')}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Minimum Order</p>
                      <p className="font-medium">₹{(store as any).minOrder || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Percent className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Commission Rate</p>
                      <p className="font-medium">
                        {store.commissionRate || 0}%
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog('commission')}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Store Images */}
            {store.storeImages && store.storeImages.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Store Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {store.storeImages.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border"
                    >
                      <img
                        src={image}
                        alt={`Store image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Menu Items */}
            {store.menu && store.menu.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Menu Items</h2>
                <div className="space-y-2">
                  {store.menu.slice(0, 10).map((item: any) => (
                    <div
                      key={item._id || item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ₹{item.price} • {item.category}
                        </p>
                      </div>
                      {item.isAvailable ? (
                        <Badge variant="default">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </div>
                  ))}
                  {store.menu.length > 10 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{store.menu.length - 10} more items
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Owner & Additional Info */}
          <div className="space-y-6">
            {/* Owner Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Owner Information</h2>
              {store.ownerId ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">
                      {(typeof store.ownerId === 'object' ? store.ownerId?.name : null) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {(typeof store.ownerId === 'object' ? store.ownerId?.email : null) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {(typeof store.ownerId === 'object' ? store.ownerId?.phone : null) || 'N/A'}
                    </p>
                  </div>
                  {(store.ownerId as any).role && (
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <Badge variant="outline">{(store.ownerId as any).role}</Badge>
                    </div>
                  )}
                  {(store.ownerId as any).status && (
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge
                        variant={
                          (store.ownerId as any).status === 'active'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {(store.ownerId as any).status}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No owner information available</p>
              )}
            </Card>

            {/* Ratings & Reviews */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Ratings & Reviews</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {store.rating?.toFixed(1) || '0.0'}
                    </p>
                    <span className="text-gray-500">
                      ({store.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payouts Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Payouts</h2>
                <Button
                  size="sm"
                  onClick={() => {
                    setPayoutDialog({ type: 'generate', isOpen: true });
                    setPayoutForm({ periodStart: '', periodEnd: '', transferId: '', transferResponse: '' });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Payout
                </Button>
              </div>
              {payoutsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : storePayouts.length > 0 ? (
                <div className="space-y-3">
                  {storePayouts.map((payout: any) => (
                    <div
                      key={payout.id || payout._id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            <div className="flex items-center gap-2">
                              {getPayoutStatusBadge(payout.status)}
                              <span className="text-sm text-gray-500">
                                {new Date(payout.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                            <div>
                              <span className="text-gray-500">Amount: </span>
                              <span className="font-semibold">
                                ₹{payout.netPayoutAmount?.toLocaleString('en-IN') || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Commission: </span>
                              <span className="font-semibold">
                                ₹{payout.commissionDeducted?.toLocaleString('en-IN') || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Orders: </span>
                              <span className="font-semibold">{payout.orderCount || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Period: </span>
                              <span className="font-semibold text-xs">
                                {new Date(payout.periodStart).toLocaleDateString()} -{' '}
                                {new Date(payout.periodEnd).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {payout.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprovePayout(payout.id || payout._id)}
                              disabled={approvePayout.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          {payout.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedPayout(payout);
                                setPayoutDialog({ type: 'complete', isOpen: true });
                                setPayoutForm({ periodStart: '', periodEnd: '', transferId: '', transferResponse: '' });
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                          )}
                          <Link href={`/admin/payouts/${payout.id || payout._id}`}>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Link href="/admin/payouts">
                      <Button variant="outline" className="w-full">
                        View All Payouts
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No payouts found for this store</p>
                </div>
              )}
            </Card>

            {/* Additional Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Additional Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Store ID</p>
                  <p className="font-mono text-xs">{store.id || (store as any)._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium">
                    {store.createdAt
                      ? new Date(store.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {store.updatedAt
                      ? new Date(store.updatedAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                {store.rejectionReason && (
                  <div>
                    <p className="text-sm text-gray-600">Rejection Reason</p>
                    <p className="font-medium text-red-600">
                      {store.rejectionReason}
                    </p>
                  </div>
                )}
                {store.verificationNotes && (
                  <div>
                    <p className="text-sm text-gray-600">Verification Notes</p>
                    <p className="font-medium">{store.verificationNotes}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Delivery Fee Dialog */}
      <Dialog
        open={editDialog.isOpen && editDialog.type === 'deliveryFee'}
        onOpenChange={(open) =>
          setEditDialog({ type: open ? 'deliveryFee' : null, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Charge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="delivery-fee">Delivery Charge (₹) *</Label>
              <Input
                id="delivery-fee"
                type="number"
                min="0"
                value={formData.deliveryFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryFee: Number(e.target.value),
                  })
                }
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">Default: ₹30</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ type: null, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDeliveryFee}
              disabled={updateDeliveryFee.isPending}
            >
              {updateDeliveryFee.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      <Dialog
        open={editDialog.isOpen && editDialog.type === 'metadata'}
        onOpenChange={(open) =>
          setEditDialog({ type: open ? 'metadata' : null, isOpen: open })
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Store Metadata</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Category</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Grocery Store">Grocery Store</option>
                <option value="Bakery">Bakery</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Vegetable & Fruits">Vegetable & Fruits</option>
                <option value="Meat & Fish">Meat & Fish</option>
                <option value="Dairy">Dairy</option>
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openingTime">Opening Time</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, openingTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="closingTime">Closing Time</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, closingTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="minOrder">Minimum Order (₹)</Label>
              <Input
                id="minOrder"
                type="number"
                min="0"
                value={formData.minOrder}
                onChange={(e) =>
                  setFormData({ ...formData, minOrder: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ type: null, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMetadata}
              disabled={updateMetadata.isPending}
            >
              {updateMetadata.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commission Dialog */}
      <Dialog
        open={editDialog.isOpen && editDialog.type === 'commission'}
        onOpenChange={(open) =>
          setEditDialog({ type: open ? 'commission' : null, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Commission Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commission-rate">Commission Rate (%) *</Label>
              <Input
                id="commission-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commissionRate: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter commission rate as a percentage (0-100)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ type: null, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCommission}
              disabled={updateCommission.isPending}
            >
              {updateCommission.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Payout Dialog */}
      <Dialog
        open={payoutDialog.isOpen && payoutDialog.type === 'generate'}
        onOpenChange={(open) =>
          setPayoutDialog({ type: open ? 'generate' : null, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="store-name-payout">Store</Label>
              <Input
                id="store-name-payout"
                value={store?.storeName || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="period-start">Period Start *</Label>
              <Input
                id="period-start"
                type="date"
                value={payoutForm.periodStart}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, periodStart: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="period-end">Period End *</Label>
              <Input
                id="period-end"
                type="date"
                value={payoutForm.periodEnd}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, periodEnd: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayoutDialog({ type: null, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePayout}
              disabled={generatePayout.isPending}
            >
              {generatePayout.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Payout Dialog */}
      <Dialog
        open={payoutDialog.isOpen && payoutDialog.type === 'complete'}
        onOpenChange={(open) =>
          setPayoutDialog({ type: open ? 'complete' : null, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPayout && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Payout Amount</p>
                <p className="text-xl font-bold">
                  ₹{selectedPayout.netPayoutAmount?.toLocaleString('en-IN') || 0}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="transfer-id">Transfer ID *</Label>
              <Input
                id="transfer-id"
                value={payoutForm.transferId}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, transferId: e.target.value })
                }
                placeholder="Enter transfer/transaction ID"
              />
            </div>
            <div>
              <Label htmlFor="transfer-response">Transfer Response (JSON - Optional)</Label>
              <Textarea
                id="transfer-response"
                value={payoutForm.transferResponse}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, transferResponse: e.target.value })
                }
                placeholder='{"success": true, ...}'
                className="font-mono text-xs"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPayoutDialog({ type: null, isOpen: false });
                setSelectedPayout(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompletePayout}
              disabled={completePayout.isPending}
            >
              {completePayout.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Completing...
                </>
              ) : (
                'Complete Payout'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

