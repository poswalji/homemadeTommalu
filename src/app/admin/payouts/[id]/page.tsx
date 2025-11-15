'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePayoutByIdAdmin, useApprovePayout, useCompletePayout } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  DollarSign,
  Calendar,
  Package,
  Store,
  User,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import { useState } from 'react';

export default function PayoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const payoutId = params?.id as string;

  const { data: payoutData, isLoading, error } = usePayoutByIdAdmin(payoutId);
  const payout = payoutData?.data;

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    transferId: '',
    transferResponse: '',
  });

  const approveMutation = useApprovePayout();
  const completeMutation = useCompletePayout();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(payoutId);
      toast.success('Payout approved successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleComplete = async () => {
    if (!completeForm.transferId) {
      toast.error('Please enter transfer ID');
      return;
    }

    try {
      await completeMutation.mutateAsync({
        id: payoutId,
        data: {
          transferId: completeForm.transferId,
          transferResponse: completeForm.transferResponse ? JSON.parse(completeForm.transferResponse) : undefined,
        },
      });
      toast.success('Payout completed successfully');
      setCompleteDialogOpen(false);
      setCompleteForm({ transferId: '', transferResponse: '' });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
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

  if (error || !payout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Payout Not Found</h2>
          <p className="text-gray-600 mb-4">
            The payout you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/admin/payouts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payouts
          </Button>
        </Card>
      </div>
    );
  }

  const storeName = typeof payout.storeId === 'object' ? payout.storeId?.storeName : 'Store';
  const storeIdValue = typeof payout.storeId === 'object' ? payout.storeId?._id : payout.storeId;
  const ownerName = typeof payout.ownerId === 'object' ? payout.ownerId?.name : 'Owner';
  const ownerEmail = typeof payout.ownerId === 'object' ? payout.ownerId?.email : '';

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/payouts')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Payout Details</h1>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(payout.status)}
                <span className="text-sm text-gray-500">
                  ID: {payout.id || payout._id}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {payout.status === 'pending' && (
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
            {payout.status === 'approved' && (
              <Button
                onClick={() => setCompleteDialogOpen(true)}
                disabled={completeMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Amount Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{payout.totalAmount?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Commission</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{payout.commissionDeducted?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Net Payout</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{payout.netPayoutAmount?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Period Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Period Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Period Start</span>
                    <span className="font-medium">
                      {new Date(payout.periodStart).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Period End</span>
                    <span className="font-medium">
                      {new Date(payout.periodEnd).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Orders Count</span>
                    <span className="font-medium flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {payout.orderCount || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Information */}
            {payout.transferId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Transfer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transfer ID</p>
                      <p className="font-medium">{payout.transferId}</p>
                    </div>
                    {payout.transferMethod && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transfer Method</p>
                        <Badge variant="outline">{payout.transferMethod}</Badge>
                      </div>
                    )}
                    {payout.processedAt && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Processed At</p>
                        <p className="font-medium">
                          {new Date(payout.processedAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                    {payout.processedBy && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Processed By</p>
                        <p className="font-medium">
                          {typeof payout.processedBy === 'object'
                            ? payout.processedBy?.name
                            : payout.processedBy}
                        </p>
                      </div>
                    )}
                    {payout.transferResponse && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transfer Response</p>
                        <pre className="p-3 bg-gray-50 rounded-lg text-xs overflow-auto">
                          {JSON.stringify(payout.transferResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {payout.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{payout.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Failure Reason */}
            {payout.failureReason && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <FileText className="w-5 h-5" />
                    Failure Reason
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">{payout.failureReason}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Store Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Store Name</p>
                    <p className="font-medium">{storeName}</p>
                  </div>
                  {storeIdValue && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/stores/${storeIdValue}`)}
                      className="w-full"
                    >
                      View Store Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{ownerName}</p>
                  </div>
                  {ownerEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{ownerEmail}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>Timestamps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-sm">
                      {new Date(payout.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium text-sm">
                      {new Date(payout.updatedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Complete Payout Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Payout Amount</p>
              <p className="text-xl font-bold">
                ₹{payout.netPayoutAmount?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <div>
              <Label htmlFor="transfer-id">Transfer ID *</Label>
              <Input
                id="transfer-id"
                value={completeForm.transferId}
                onChange={(e) =>
                  setCompleteForm({ ...completeForm, transferId: e.target.value })
                }
                placeholder="Enter transfer/transaction ID"
              />
            </div>
            <div>
              <Label htmlFor="transfer-response">Transfer Response (JSON - Optional)</Label>
              <Textarea
                id="transfer-response"
                value={completeForm.transferResponse}
                onChange={(e) =>
                  setCompleteForm({ ...completeForm, transferResponse: e.target.value })
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
                setCompleteDialogOpen(false);
                setCompleteForm({ transferId: '', transferResponse: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
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

