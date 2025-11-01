'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllDisputes, useResolveDispute, useEscalateDispute, useCloseDispute } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, CheckCircle, XCircle,
  ArrowUp, FileText
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DisputesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    action: 'no_action' as 'refund_full' | 'refund_partial' | 'store_action' | 'no_action' | 'other',
    amount: '',
    notes: '',
  });

  const { data: disputesData, isLoading } = useAllDisputes({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    page: 1,
    limit: 50,
  });

  const resolveMutation = useResolveDispute();
  const escalateMutation = useEscalateDispute();
  const closeMutation = useCloseDispute();

  const disputes = disputesData?.data || [];

  const handleResolve = async () => {
    if (!selectedDispute) return;
    
    try {
      await resolveMutation.mutateAsync({
        id: selectedDispute.id,
        data: {
          action: resolveForm.action,
          amount: resolveForm.amount ? Number(resolveForm.amount) : undefined,
          notes: resolveForm.notes,
        },
      });
      toast.success('Dispute resolved successfully');
      setResolveDialogOpen(false);
      setSelectedDispute(null);
      setResolveForm({ action: 'no_action', amount: '', notes: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  const handleEscalate = async (id: string) => {
    try {
      await escalateMutation.mutateAsync({ id, notes: 'Escalated for review' });
      toast.success('Dispute escalated successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to escalate dispute');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeMutation.mutateAsync({ id, notes: 'Closed by admin' });
      toast.success('Dispute closed successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to close dispute');
    }
  };

  const getStatusBadge = (status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<string, any> = {
      open: { variant: 'secondary' as const, color: 'text-orange-600', bg: 'bg-orange-100' },
      under_review: { variant: 'default' as const, color: 'text-blue-600', bg: 'bg-blue-100' },
      escalated: { variant: 'default' as const, color: 'text-red-600', bg: 'bg-red-100' },
      resolved: { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-100' },
      closed: { variant: 'secondary' as const, color: 'text-gray-600', bg: 'bg-gray-100' },
      rejected: { variant: 'secondary' as const, color: 'text-red-600', bg: 'bg-red-100' },
    };
    const config = variants[status] || variants.open;
    return (
      <Badge className={`${config.color} ${config.bg}`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colors: Record<string, any> = {
      urgent: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-gray-600 bg-gray-100',
    };
    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dispute Resolution</h1>
          <p className="text-gray-600 mt-2 text-sm">Manage and resolve customer disputes</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Disputes ({disputes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : disputes.length > 0 ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {disputes.map((dispute: any) => (
                <div
                  key={dispute.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">{dispute.title}</h3>
                            {getStatusBadge(dispute.status)}
                            {getPriorityBadge(dispute.priority)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{dispute.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Type: {dispute.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>
                              Order: <Link href={`/admin/orders/${dispute.orderId}`} className="text-blue-600 hover:underline">
                                #{dispute.orderId.slice(-8)}
                              </Link>
                            </span>
                            <span>•</span>
                            <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {dispute.status === 'open' || dispute.status === 'under_review' ? (
                        <>
                          <Dialog open={resolveDialogOpen && selectedDispute?.id === dispute.id} onOpenChange={(open) => {
                            setResolveDialogOpen(open);
                            if (open) setSelectedDispute(dispute);
                            else setSelectedDispute(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="default">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Resolve
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Resolve Dispute</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label htmlFor="action">Resolution Action</Label>
                                  <select
                                    id="action"
                                    value={resolveForm.action}
                                    onChange={(e) => {
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      setResolveForm({ ...resolveForm, action: e.target.value as any });
                                    }}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                                  >
                                    <option value="no_action">No Action</option>
                                    <option value="refund_full">Full Refund</option>
                                    <option value="refund_partial">Partial Refund</option>
                                    <option value="store_action">Store Action Required</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                {(resolveForm.action === 'refund_partial' || resolveForm.action === 'refund_full') && (
                                  <div>
                                    <Label htmlFor="amount">Refund Amount (₹)</Label>
                                    <Input
                                      id="amount"
                                      type="number"
                                      value={resolveForm.amount}
                                      onChange={(e) => setResolveForm({ ...resolveForm, amount: e.target.value })}
                                      placeholder="0.00"
                                      className="mt-1"
                                    />
                                  </div>
                                )}
                                <div>
                                  <Label htmlFor="notes">Resolution Notes</Label>
                                  <Textarea
                                    id="notes"
                                    value={resolveForm.notes}
                                    onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                                    placeholder="Enter resolution details..."
                                    className="mt-1"
                                    rows={4}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => setResolveDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleResolve}
                                    disabled={resolveMutation.isPending}
                                  >
                                    {resolveMutation.isPending ? 'Resolving...' : 'Resolve Dispute'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEscalate(dispute.id)}
                            disabled={escalateMutation.isPending}
                          >
                            <ArrowUp className="w-4 h-4 mr-2" />
                            Escalate
                          </Button>
                        </>
                      ) : null}
                      {dispute.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClose(dispute.id)}
                          disabled={closeMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Close
                        </Button>
                      )}
                      <Link href={`/admin/disputes/${dispute.id}`}>
                        <Button size="sm" variant="ghost">
                          <FileText className="w-4 h-4 mr-2" />
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
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No disputes found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

