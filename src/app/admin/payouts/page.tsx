'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllPayouts, useGeneratePayout, useApprovePayout, useCompletePayout } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, CheckCircle, XCircle, Clock, DollarSign,
  Download, Plus, Filter
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PayoutsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [generateForm, setGenerateForm] = useState({
    storeId: '',
    periodStart: '',
    periodEnd: '',
  });
  const [completeForm, setCompleteForm] = useState({
    transferId: '',
    transferResponse: '',
  });

  const { data: payoutsData, isLoading } = useAllPayouts({
    status: statusFilter || undefined,
    page: 1,
    limit: 50,
  });

  const generateMutation = useGeneratePayout();
  const approveMutation = useApprovePayout();
  const completeMutation = useCompletePayout();

  const payouts = payoutsData?.data || [];

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync(generateForm);
      toast.success('Payout generated successfully');
      setGenerateDialogOpen(false);
      setGenerateForm({ storeId: '', periodStart: '', periodEnd: '' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error((error as any)?.response?.data?.message || 'Failed to generate payout');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success('Payout approved successfully');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error((error as any)?.response?.data?.message || 'Failed to approve payout');
    }
  };

  const handleComplete = async () => {
    if (!selectedPayout) return;
    
    try {
      await completeMutation.mutateAsync({
        id: selectedPayout.id,
        data: {
          transferId: completeForm.transferId,
          transferResponse: completeForm.transferResponse ? JSON.parse(completeForm.transferResponse) : undefined,
        },
      });
      toast.success('Payout completed successfully');
      setCompleteDialogOpen(false);
      setSelectedPayout(null);
      setCompleteForm({ transferId: '', transferResponse: '' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error((error as any)?.response?.data?.message || 'Failed to complete payout');
    }
  };

  const getStatusBadge = (status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<string, any> = {
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
      approved: { color: 'text-blue-600', bg: 'bg-blue-100' },
      processing: { color: 'text-purple-600', bg: 'bg-purple-100' },
      completed: { color: 'text-green-600', bg: 'bg-green-100' },
      failed: { color: 'text-red-600', bg: 'bg-red-100' },
      cancelled: { color: 'text-gray-600', bg: 'bg-gray-100' },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge className={`${config.color} ${config.bg}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPending = payouts.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.netPayoutAmount || 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCompleted = payouts.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + (p.netPayoutAmount || 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payout Management</h1>
          <p className="text-gray-600 mt-2 text-sm">Manage store owner payouts and settlements</p>
        </div>
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Payout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="storeId">Store ID</Label>
                <Input
                  id="storeId"
                  value={generateForm.storeId}
                  onChange={(e) => setGenerateForm({ ...generateForm, storeId: e.target.value })}
                  placeholder="Enter store ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="periodStart">Period Start</Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={generateForm.periodStart}
                  onChange={(e) => setGenerateForm({ ...generateForm, periodStart: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="periodEnd">Period End</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={generateForm.periodEnd}
                  onChange={(e) => setGenerateForm({ ...generateForm, periodEnd: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setGenerateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Payouts</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {payouts.length}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Amount</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{totalPending.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed Amount</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{totalCompleted.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setStatusFilter('')}
                className="w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Payouts ({payouts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : payouts.length > 0 ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {payouts.map((payout: any) => (
                <div
                  key={payout.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">
                              {payout.storeId?.storeName || 'Store'}
                            </h3>
                            {getStatusBadge(payout.status)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 text-sm">
                            <div>
                              <span className="text-gray-500">Amount: </span>
                              <span className="font-semibold">₹{payout.netPayoutAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Commission: </span>
                              <span className="font-semibold">₹{payout.commissionDeducted.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Orders: </span>
                              <span className="font-semibold">{payout.orderCount}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>
                              Period: {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{new Date(payout.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {payout.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(payout.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                      )}
                      {payout.status === 'approved' && (
                        <Dialog open={completeDialogOpen && selectedPayout?.id === payout.id} onOpenChange={(open) => {
                          setCompleteDialogOpen(open);
                          if (open) setSelectedPayout(payout);
                          else setSelectedPayout(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="default">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Complete Payout</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label htmlFor="transferId">Transfer ID</Label>
                                <Input
                                  id="transferId"
                                  value={completeForm.transferId}
                                  onChange={(e) => setCompleteForm({ ...completeForm, transferId: e.target.value })}
                                  placeholder="Enter transfer/transaction ID"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="transferResponse">Transfer Response (JSON)</Label>
                                <Textarea
                                  id="transferResponse"
                                  value={completeForm.transferResponse}
                                  onChange={(e) => setCompleteForm({ ...completeForm, transferResponse: e.target.value })}
                                  placeholder='{"success": true, ...}'
                                  className="mt-1 font-mono text-xs"
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setCompleteDialogOpen(false)}
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
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Link href={`/admin/payouts/${payout.id}`}>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payouts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

