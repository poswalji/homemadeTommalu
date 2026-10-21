'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useAllDisputes,
  useResolveDispute,
  useEscalateDispute,
  useCloseDispute,
} from '@/hooks/api';
import type { Dispute } from '@/services/api/disputes.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUp,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Utensils,
  Bike,
  CreditCard,
  Package,
  HelpCircle,
  Check,
  Copy,
  Calendar,
  ShoppingBag,
  Store,
  Paperclip,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  X,
  User,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

function formatDate(dateString?: string | Date) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

export default function DisputesPage() {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Modals state
  const [selectedDisputeForDetails, setSelectedDisputeForDetails] = useState<Dispute | null>(null);
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null);
  const [resolveForm, setResolveForm] = useState({
    action: 'refund_full' as 'refund_full' | 'refund_partial' | 'store_action' | 'no_action' | 'other',
    amount: '',
    notes: '',
  });

  const [escalatingDispute, setEscalatingDispute] = useState<Dispute | null>(null);
  const [escalateNote, setEscalateNote] = useState('');

  const [closingDispute, setClosingDispute] = useState<Dispute | null>(null);
  const [closeNote, setCloseNote] = useState('');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    data: disputesData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAllDisputes({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    type: typeFilter || undefined,
    page: 1,
    limit: 100,
  });

  const resolveMutation = useResolveDispute();
  const escalateMutation = useEscalateDispute();
  const closeMutation = useCloseDispute();

  const disputes: Dispute[] = disputesData?.data || [];

  // Clientside search filter
  const filteredDisputes = useMemo(() => {
    if (!searchTerm.trim()) return disputes;
    const q = searchTerm.toLowerCase().trim();
    return disputes.filter((d) => {
      const title = (d.title || '').toLowerCase();
      const desc = (d.description || '').toLowerCase();
      const id = (d.id || d._id || '').toLowerCase();
      const type = (d.type || '').toLowerCase();

      let custName = '';
      let custPhone = '';
      if (typeof d.userId === 'object' && d.userId) {
        custName = (d.userId.name || '').toLowerCase();
        custPhone = (d.userId.phone || '').toLowerCase();
      }

      let orderId = '';
      if (typeof d.orderId === 'object' && d.orderId) {
        orderId = (d.orderId._id || d.orderId.id || '').toLowerCase();
      } else if (typeof d.orderId === 'string') {
        orderId = d.orderId.toLowerCase();
      }

      return (
        title.includes(q) ||
        desc.includes(q) ||
        id.includes(q) ||
        type.includes(q) ||
        custName.includes(q) ||
        custPhone.includes(q) ||
        orderId.includes(q)
      );
    });
  }, [disputes, searchTerm]);

  // Operational KPI stats
  const stats = useMemo(() => {
    const openCount = disputes.filter((d) => d.status === 'open' || d.status === 'under_review').length;
    const escalatedCount = disputes.filter((d) => d.status === 'escalated').length;
    const resolvedCount = disputes.filter((d) => d.status === 'resolved').length;
    const closedCount = disputes.filter((d) => d.status === 'closed').length;

    let totalRefunds = 0;
    disputes.forEach((d) => {
      if (d.resolution && d.resolution.amount) {
        totalRefunds += Number(d.resolution.amount) || 0;
      }
    });

    return {
      total: disputes.length,
      open: openCount,
      escalated: escalatedCount,
      resolved: resolvedCount,
      closed: closedCount,
      totalRefunds,
    };
  }, [disputes]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenResolve = (dispute: Dispute) => {
    setResolvingDispute(dispute);
    let orderPrice = '';
    if (typeof dispute.orderId === 'object' && dispute.orderId) {
      const p = dispute.orderId.finalPrice ?? dispute.orderId.totalAmount;
      if (p !== undefined) orderPrice = String(p);
    }
    setResolveForm({
      action: 'refund_full',
      amount: orderPrice,
      notes: '',
    });
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingDispute) return;
    const id = resolvingDispute.id || resolvingDispute._id || '';

    try {
      await resolveMutation.mutateAsync({
        id,
        data: {
          action: resolveForm.action,
          amount: resolveForm.amount ? Number(resolveForm.amount) : undefined,
          notes: resolveForm.notes,
        },
      });
      toast.success('Dispute resolved successfully!');
      setResolvingDispute(null);
      if (selectedDisputeForDetails && (selectedDisputeForDetails.id === id || selectedDisputeForDetails._id === id)) {
        setSelectedDisputeForDetails(null);
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  const handleConfirmEscalate = async () => {
    if (!escalatingDispute) return;
    const id = escalatingDispute.id || escalatingDispute._id || '';

    try {
      await escalateMutation.mutateAsync({
        id,
        notes: escalateNote || 'Escalated for immediate senior management review',
      });
      toast.success('Dispute escalated to SuperAdmin');
      setEscalatingDispute(null);
      setEscalateNote('');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to escalate dispute');
    }
  };

  const handleConfirmClose = async () => {
    if (!closingDispute) return;
    const id = closingDispute.id || closingDispute._id || '';

    try {
      await closeMutation.mutateAsync({
        id,
        notes: closeNote || 'Closed by admin',
      });
      toast.success('Dispute ticket closed');
      setClosingDispute(null);
      setCloseNote('');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to close dispute');
    }
  };

  // Helper icons for issue types
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'quality_issue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Utensils className="w-3 h-3" />
            Food Quality
          </span>
        );
      case 'delivery_issue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Bike className="w-3 h-3" />
            Delivery Delayed / Missed
          </span>
        );
      case 'payment_issue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" />
            Payment / Billing
          </span>
        );
      case 'order_issue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Package className="w-3 h-3" />
            Order Discrepancy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
            <HelpCircle className="w-3 h-3" />
            {type ? type.replace('_', ' ') : 'General'}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-red-600 text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-orange-500 text-white">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-stone-100 text-stone-600 border border-stone-200">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <ArrowUp className="w-3.5 h-3.5 text-red-600" />
            Escalated
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Under Review
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
            <XCircle className="w-3.5 h-3.5 text-stone-400" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Open
          </span>
        );
    }
  };

  const getWhatsAppLink = (phone?: string, name?: string, disputeTitle?: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Hello ${name || 'Customer'}, this is Tommalu Customer Support regarding your dispute ticket regarding "${disputeTitle || 'your order'}". How can we best help resolve this for you?`
    );
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Dispute Resolution
            </h1>
            <Badge variant="outline" className="text-xs font-bold text-stone-600 bg-white">
              {stats.total} Total Disputes
            </Badge>
          </div>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Resolve customer grievances, review kitchen quality claims, and authorize refunds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl border-stone-200 hover:bg-stone-50 font-bold text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Tickets
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Needs Action */}
        <Card
          className={`border-stone-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer ${
            statusFilter === 'open' ? 'ring-2 ring-amber-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'open' ? '' : 'open')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Needs Attention
              </span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {isLoading ? '...' : stats.open}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">
              Open or Under Review
            </p>
          </CardContent>
        </Card>

        {/* 2. Escalated */}
        <Card
          className={`border-stone-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer ${
            stats.escalated > 0 ? 'bg-red-50/40 border-red-200' : ''
          } ${statusFilter === 'escalated' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'escalated' ? '' : 'escalated')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Escalated
              </span>
              <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                <ArrowUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600">
              {isLoading ? '...' : stats.escalated}
            </div>
            <p className="text-xs text-red-700 font-medium mt-1">
              Urgent management tickets
            </p>
          </CardContent>
        </Card>

        {/* 3. Resolved */}
        <Card
          className={`border-stone-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer ${
            statusFilter === 'resolved' ? 'ring-2 ring-emerald-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'resolved' ? '' : 'resolved')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Resolved
              </span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {isLoading ? '...' : stats.resolved}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        {/* 4. Total Refunds */}
        <Card className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total Refunded
              </span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              ₹{isLoading ? '...' : stats.totalRefunds}
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Authorized refund payouts
            </p>
          </CardContent>
        </Card>

        {/* 5. Closed */}
        <Card
          className={`border-stone-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer ${
            statusFilter === 'closed' ? 'ring-2 ring-stone-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'closed' ? '' : 'closed')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Closed
              </span>
              <span className="p-2 bg-stone-100 text-stone-600 rounded-xl">
                <XCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-700">
              {isLoading ? '...' : stats.closed}
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Settled or dismissed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Container */}
      <Card className="border-stone-200/80 shadow-sm rounded-2xl overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50 space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search ticket title, customer, phone, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 rounded-xl bg-white border-stone-200 text-sm focus:ring-2 focus:ring-orange-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-stone-900 border-none outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700">
                <span>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent font-bold text-stone-900 border-none outline-none cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700">
                <span>Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent font-bold text-stone-900 border-none outline-none cursor-pointer"
                >
                  <option value="">All Issue Types</option>
                  <option value="quality_issue">Food Quality</option>
                  <option value="delivery_issue">Delivery Problem</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="order_issue">Order Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {(statusFilter || priorityFilter || typeFilter || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setTypeFilter('');
                    setSearchTerm('');
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold rounded-xl"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Disputes Feed List */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-base font-bold text-stone-900">Failed to load disputes</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {(error as any)?.message || 'An error occurred while fetching dispute records.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4 rounded-xl text-xs font-bold"
              >
                Try Again
              </Button>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-stone-400">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-stone-900">No disputes found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                No customer complaints match your current search or filter criteria. All clear!
              </p>
              {(statusFilter || priorityFilter || typeFilter || searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setTypeFilter('');
                    setSearchTerm('');
                  }}
                  className="mt-4 rounded-xl text-xs font-bold"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDisputes.map((dispute) => {
                const disputeId = dispute.id || dispute._id || '';
                const customerName =
                  typeof dispute.userId === 'object' ? dispute.userId?.name : 'Customer';
                const customerEmail =
                  typeof dispute.userId === 'object' ? dispute.userId?.email : '';
                const customerPhone =
                  typeof dispute.userId === 'object' ? dispute.userId?.phone : '';

                const orderObj = typeof dispute.orderId === 'object' ? dispute.orderId : null;
                const orderRawId =
                  orderObj?._id ||
                  orderObj?.id ||
                  (typeof dispute.orderId === 'string' ? dispute.orderId : '');
                const orderPrice = orderObj?.finalPrice ?? orderObj?.totalAmount ?? null;

                const storeName =
                  typeof dispute.storeId === 'object' ? dispute.storeId?.storeName : 'Tommalu Kitchen';

                const isResolved = dispute.status === 'resolved';
                const isClosed = dispute.status === 'closed';

                return (
                  <div
                    key={disputeId}
                    className="p-5 border border-stone-200/90 rounded-2xl hover:border-orange-300 hover:shadow-md transition-all bg-white space-y-3.5"
                  >
                    {/* Top Row: Title, Badges, Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-stone-400">
                            #{disputeId.slice(-6)}
                          </span>
                          {getStatusBadge(dispute.status)}
                          {getPriorityBadge(dispute.priority)}
                          {getTypeBadge(dispute.type)}
                        </div>

                        <h3
                          onClick={() => setSelectedDisputeForDetails(dispute)}
                          className="font-black text-stone-900 text-base sm:text-lg hover:text-orange-600 transition-colors cursor-pointer"
                        >
                          {dispute.title}
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {dispute.description}
                        </p>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center sm:flex-col lg:flex-row gap-2 shrink-0">
                        {/* 1. Inspect Modal */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDisputeForDetails(dispute)}
                          className="rounded-xl text-xs font-bold border-stone-200 hover:bg-stone-50"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 text-stone-500" />
                          View Dossier
                        </Button>

                        {/* 2. Resolve Action */}
                        {!isResolved && !isClosed && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenResolve(dispute)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Resolve
                          </Button>
                        )}

                        {/* 3. Escalate */}
                        {dispute.status !== 'escalated' && !isClosed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEscalatingDispute(dispute);
                              setEscalateNote('');
                            }}
                            className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl"
                          >
                            <ArrowUp className="w-3.5 h-3.5 mr-1" />
                            Escalate
                          </Button>
                        )}

                        {/* 4. Close */}
                        {!isClosed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setClosingDispute(dispute);
                              setCloseNote('');
                            }}
                            className="text-stone-500 hover:bg-stone-100 text-xs font-bold rounded-xl"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {/* 5. Direct Link */}
                        <Link href={`/admin/disputes/${disputeId}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Open dedicated page"
                            className="text-stone-400 hover:text-stone-800 rounded-xl p-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      {/* Customer Info & Direct Contacts */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>{customerName}</span>
                        </div>

                        {customerPhone && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${customerPhone}`}
                              className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold transition-colors"
                            >
                              📞 Call
                            </a>
                            <a
                              href={getWhatsAppLink(customerPhone, customerName, dispute.title)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-colors flex items-center gap-1"
                            >
                              <MessageCircle className="w-2.5 h-2.5" />
                              WhatsApp
                            </a>
                          </div>
                        )}

                        <span className="text-stone-300">•</span>

                        {/* Order Link */}
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-stone-500">Order:</span>
                          <span className="font-mono font-bold text-stone-900">
                            #{orderRawId ? orderRawId.slice(-6) : 'N/A'}
                          </span>
                          {orderPrice !== null && (
                            <span className="font-black text-orange-600 ml-1">
                              (₹{orderPrice})
                            </span>
                          )}
                        </div>

                        <span className="text-stone-300">•</span>

                        {/* Kitchen / Store */}
                        <div className="flex items-center gap-1 text-stone-500">
                          <Store className="w-3.5 h-3.5 text-stone-400" />
                          <span>{storeName}</span>
                        </div>
                      </div>

                      {/* Date & Resolution Indicator */}
                      <div className="flex items-center gap-2 text-stone-400">
                        {isResolved && dispute.resolution?.amount ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                            Refunded ₹{dispute.resolution.amount}
                          </span>
                        ) : null}

                        <span className="text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(dispute.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: DISPUTE DOSSIER / DETAILS MODAL                                  */}
      {/* ========================================================================= */}
      {selectedDisputeForDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                    #{selectedDisputeForDetails.id?.slice(-8) || selectedDisputeForDetails._id?.slice(-8)}
                  </span>
                  {getStatusBadge(selectedDisputeForDetails.status)}
                  {getPriorityBadge(selectedDisputeForDetails.priority)}
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  {selectedDisputeForDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDisputeForDetails(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Complainant & Order Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                  <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block">
                    Customer Information
                  </span>
                  <div className="font-black text-stone-900 text-sm">
                    {typeof selectedDisputeForDetails.userId === 'object'
                      ? selectedDisputeForDetails.userId?.name
                      : 'Customer'}
                  </div>
                  {typeof selectedDisputeForDetails.userId === 'object' &&
                    selectedDisputeForDetails.userId?.email && (
                      <p className="text-stone-500">{selectedDisputeForDetails.userId.email}</p>
                    )}
                  {typeof selectedDisputeForDetails.userId === 'object' &&
                    selectedDisputeForDetails.userId?.phone && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${selectedDisputeForDetails.userId.phone}`}
                          className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-800 hover:bg-stone-100"
                        >
                          📞 Call
                        </a>
                        <a
                          href={getWhatsAppLink(
                            selectedDisputeForDetails.userId.phone,
                            selectedDisputeForDetails.userId.name,
                            selectedDisputeForDetails.title
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </a>
                      </div>
                    )}
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                  <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block">
                    Order Reference
                  </span>
                  <div className="font-mono font-bold text-stone-900 text-sm">
                    #{typeof selectedDisputeForDetails.orderId === 'object'
                      ? selectedDisputeForDetails.orderId?._id?.slice(-8) || selectedDisputeForDetails.orderId?.id?.slice(-8)
                      : String(selectedDisputeForDetails.orderId).slice(-8)}
                  </div>
                  {typeof selectedDisputeForDetails.orderId === 'object' && (
                    <p className="text-stone-600">
                      Amount:{' '}
                      <span className="font-black text-orange-600">
                        ₹{selectedDisputeForDetails.orderId.finalPrice ?? selectedDisputeForDetails.orderId.totalAmount ?? 'N/A'}
                      </span>
                    </p>
                  )}
                  <p className="text-stone-500">
                    Store:{' '}
                    <span className="font-bold text-stone-800">
                      {typeof selectedDisputeForDetails.storeId === 'object'
                        ? selectedDisputeForDetails.storeId?.storeName
                        : 'Tommalu Kitchen'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Complaint Statement
                </span>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {selectedDisputeForDetails.description}
                </div>
              </div>

              {/* Evidence Attachments */}
              {selectedDisputeForDetails.attachments && selectedDisputeForDetails.attachments.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                    Evidence Photos ({selectedDisputeForDetails.attachments.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedDisputeForDetails.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl overflow-hidden border border-stone-200 aspect-video block bg-stone-100 hover:opacity-90"
                      >
                        <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Info (if exists) */}
              {selectedDisputeForDetails.resolution && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resolution Summary</span>
                  </div>
                  <p className="text-stone-700">
                    Action:{' '}
                    <span className="font-black capitalize">
                      {selectedDisputeForDetails.resolution.action.replace('_', ' ')}
                    </span>
                    {selectedDisputeForDetails.resolution.amount && (
                      <span className="ml-2 font-black text-emerald-700">
                        (₹{selectedDisputeForDetails.resolution.amount})
                      </span>
                    )}
                  </p>
                  {selectedDisputeForDetails.resolution.notes && (
                    <p className="text-stone-600 text-[11px] bg-white p-2.5 rounded-xl border border-emerald-100">
                      {selectedDisputeForDetails.resolution.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Timeline */}
              {selectedDisputeForDetails.timeline && selectedDisputeForDetails.timeline.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                    Activity & Audit Timeline
                  </span>
                  <div className="space-y-2">
                    {selectedDisputeForDetails.timeline.map((entry, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-start justify-between"
                      >
                        <div>
                          <span className="font-bold text-stone-800">{entry.action}</span>
                          {entry.notes && <p className="text-stone-500 text-[11px] mt-0.5">{entry.notes}</p>}
                        </div>
                        <span className="text-[10px] text-stone-400 shrink-0">{formatDate(entry.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <Link href={`/admin/disputes/${selectedDisputeForDetails.id || selectedDisputeForDetails._id}`}>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-stone-600">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Open Full Page
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                {selectedDisputeForDetails.status !== 'resolved' && selectedDisputeForDetails.status !== 'closed' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const d = selectedDisputeForDetails;
                      setSelectedDisputeForDetails(null);
                      handleOpenResolve(d);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                  >
                    Resolve Dispute
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDisputeForDetails(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESOLVE DISPUTE MODAL                                            */}
      {/* ========================================================================= */}
      {resolvingDispute && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-stone-900 text-base">Resolve Dispute</h3>
              </div>
              <button
                onClick={() => setResolvingDispute(null)}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-5 space-y-4">
              <div>
                <Label htmlFor="resolve-action-main" className="text-xs font-bold text-stone-700 mb-1 block">
                  Settlement Decision *
                </Label>
                <select
                  id="resolve-action-main"
                  value={resolveForm.action}
                  onChange={(e) => setResolveForm({ ...resolveForm, action: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                >
                  <option value="refund_full">Full Refund to Customer</option>
                  <option value="refund_partial">Partial Refund to Customer</option>
                  <option value="store_action">Kitchen Partner Action Required</option>
                  <option value="no_action">No Financial Adjustment (Claim Dismissed)</option>
                  <option value="other">Other Settlement</option>
                </select>
              </div>

              {(resolveForm.action === 'refund_full' || resolveForm.action === 'refund_partial') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="refund-amt-main" className="text-xs font-bold text-stone-700">
                      Refund Amount (₹) *
                    </Label>
                    {typeof resolvingDispute.orderId === 'object' && resolvingDispute.orderId && (
                      <button
                        type="button"
                        onClick={() => {
                          const p = (resolvingDispute.orderId as any).finalPrice ?? (resolvingDispute.orderId as any).totalAmount;
                          if (p) setResolveForm({ ...resolveForm, amount: String(p) });
                        }}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                      >
                        Set Full Amount (₹{(resolvingDispute.orderId as any).finalPrice ?? (resolvingDispute.orderId as any).totalAmount ?? 0})
                      </button>
                    )}
                  </div>
                  <Input
                    id="refund-amt-main"
                    type="number"
                    required
                    placeholder="Enter amount in ₹"
                    value={resolveForm.amount}
                    onChange={(e) => setResolveForm({ ...resolveForm, amount: e.target.value })}
                    className="rounded-xl font-bold"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="resolve-notes-main" className="text-xs font-bold text-stone-700 mb-1 block">
                  Official Resolution Notes *
                </Label>
                <Textarea
                  id="resolve-notes-main"
                  required
                  rows={3}
                  placeholder="Explain the settlement decision for customer communication & audit..."
                  value={resolveForm.notes}
                  onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              {/* Preset buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Food quality issue acknowledged. Full refund authorized.',
                    'Delivery delayed significantly. Partial refund compensation credited.',
                    'Order inspected and delivered accurately as per records. No refund applicable.',
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setResolveForm({ ...resolveForm, notes: preset })}
                      className="px-2 py-0.8 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px] font-medium text-stone-600 transition-colors"
                    >
                      {preset.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResolvingDispute(null)}
                  className="rounded-xl font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resolveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  {resolveMutation.isPending ? 'Resolving...' : 'Confirm Resolution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ESCALATE MODAL                                                   */}
      {/* ========================================================================= */}
      {escalatingDispute && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-stone-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-600">
              <ArrowUp className="w-5 h-5" />
              <h3 className="font-black text-stone-900 text-base">Escalate to SuperAdmin</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Escalating marks this ticket as urgent for high-level management arbitration.
            </p>
            <div>
              <Label className="text-xs font-bold text-stone-700 mb-1 block">Escalation Reason</Label>
              <Input
                placeholder="Reason for escalation..."
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEscalatingDispute(null)}
                className="rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={escalateMutation.isPending}
                onClick={handleConfirmEscalate}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                {escalateMutation.isPending ? 'Escalating...' : 'Confirm Escalate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CLOSE MODAL                                                      */}
      {/* ========================================================================= */}
      {closingDispute && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-stone-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-stone-700">
              <XCircle className="w-5 h-5" />
              <h3 className="font-black text-stone-900 text-base">Close Dispute Ticket</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to close this dispute without further action?
            </p>
            <div>
              <Label className="text-xs font-bold text-stone-700 mb-1 block">Closing Note (Optional)</Label>
              <Input
                placeholder="e.g. Issue resolved externally or abandoned"
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClosingDispute(null)}
                className="rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={closeMutation.isPending}
                onClick={handleConfirmClose}
                className="bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl text-xs"
              >
                {closeMutation.isPending ? 'Closing...' : 'Close Ticket'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
