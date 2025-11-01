'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyDisputes, useCreateDispute } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, Plus, FileText, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerDisputesPage() {
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    orderId: '',
    type: 'order_issue' as 'order_issue' | 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'other',
    title: '',
    description: '',
    priority: 'medium' as 'urgent' | 'high' | 'medium' | 'low',
  });

  const { data: disputesData, isLoading } = useMyDisputes();
  const createMutation = useCreateDispute();

  const disputes = disputesData?.data || [];

  const handleCreateDispute = async () => {
    try {
      await createMutation.mutateAsync(disputeForm);
      toast.success('Dispute created successfully');
      setDisputeDialogOpen(false);
      setDisputeForm({
        orderId: '',
        type: 'order_issue',
        title: '',
        description: '',
        priority: 'medium',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create dispute');
    }
  };


  const getStatusBadge = (status: string) => {
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
    const colors: Record<string, string> = {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order_issue':
        return <FileText className="w-5 h-5" />;
      case 'delivery_issue':
        return <Clock className="w-5 h-5" />;
      case 'payment_issue':
        return <XCircle className="w-5 h-5" />;
      case 'quality_issue':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Disputes</h1>
          <p className="text-gray-600 mt-2 text-sm">Report and track issues with your orders</p>
        </div>
        <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Dispute
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create a Dispute</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="orderIdDispute">Order ID *</Label>
                <Input
                  id="orderIdDispute"
                  value={disputeForm.orderId}
                  onChange={(e) => setDisputeForm({ ...disputeForm, orderId: e.target.value })}
                  placeholder="Enter order ID"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Dispute Type *</Label>
                <select
                  id="type"
                  value={disputeForm.type}
                  onChange={(e) => setDisputeForm({ ...disputeForm, type: e.target.value as any })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="order_issue">Order Issue</option>
                  <option value="delivery_issue">Delivery Issue</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={disputeForm.title}
                  onChange={(e) => setDisputeForm({ ...disputeForm, title: e.target.value })}
                  placeholder="Brief title for your dispute"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="mt-1"
                  rows={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={disputeForm.priority}
                  onChange={(e) => setDisputeForm({ ...disputeForm, priority: e.target.value as any })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDispute}
                  disabled={createMutation.isPending || !disputeForm.orderId || !disputeForm.title || !disputeForm.description}
                >
                  {createMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Your Disputes ({disputes.length})
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
              {disputes.map((dispute: any) => (
                <div
                  key={dispute.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          {getTypeIcon(dispute.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">{dispute.title}</h3>
                            {getStatusBadge(dispute.status)}
                            {getPriorityBadge(dispute.priority)}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{dispute.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                            <span>Type: {dispute.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>
                              Order: #{dispute.orderId?.slice(-8) || 'N/A'}
                            </span>
                            <span>•</span>
                            <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                          </div>
                          {dispute.resolution && (
                            <div className="mt-2 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <p className="text-xs font-medium text-green-800">Resolution:</p>
                              </div>
                              <p className="text-sm text-green-700">{dispute.resolution}</p>
                            </div>
                          )}
                          {dispute.resolutionNotes && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-blue-800 mb-1">Admin Notes:</p>
                              <p className="text-sm text-blue-700">{dispute.resolutionNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No disputes yet</p>
              <p className="text-xs text-gray-400 mt-1">Create a dispute if you have any issues with your orders</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

