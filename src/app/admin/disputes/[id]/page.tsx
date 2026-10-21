'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useDisputeById,
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
import { Spinner } from '@/components/ui/spinner';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUp,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  ShoppingBag,
  Store,
  User,
  Calendar,
  AlertTriangle,
  Paperclip,
  Check,
  Copy,
  Utensils,
  Bike,
  CreditCard,
  Package,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

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

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params?.id as string;

  const { data: response, isLoading, error, refetch } = useDisputeById(disputeId);
  const dispute: Dispute | undefined = response?.data;

  const resolveMutation = useResolveDispute();
  const escalateMutation = useEscalateDispute();
  const closeMutation = useCloseDispute();

  // Modals state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    action: 'no_action' as 'refund_full' | 'refund_partial' | 'store_action' | 'no_action' | 'other',
    amount: '',
    notes: '',
  });
  const [escalateNote, setEscalateNote] = useState('');
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [closeNote, setCloseNote] = useState('');
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute) return;
    try {
      await resolveMutation.mutateAsync({
        id: disputeId,
        data: {
          action: resolveForm.action,
          amount: resolveForm.amount ? Number(resolveForm.amount) : undefined,
          notes: resolveForm.notes,
        },
      });
      setResolveDialogOpen(false);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  const handleEscalate = async () => {
    try {
      await escalateMutation.mutateAsync({
        id: disputeId,
        notes: escalateNote || 'Escalated to management for priority review',
      });
      setIsEscalateOpen(false);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to escalate dispute');
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync({
        id: disputeId,
        notes: closeNote || 'Closed by admin',
      });
      setIsCloseOpen(false);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to close dispute');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-orange-600 mb-3" />
        <p className="text-sm font-semibold text-stone-500">Loading dispute dossier...</p>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-black text-stone-900">Dispute Not Found</h2>
        <p className="text-sm text-stone-500">
          The dispute ticket #{disputeId} could not be retrieved or does not exist.
        </p>
        <Link href="/admin/disputes">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Disputes
          </Button>
        </Link>
      </div>
    );
  }

  // Derived variables
  const customerName = typeof dispute.userId === 'object' ? dispute.userId?.name : 'Customer';
  const customerEmail = typeof dispute.userId === 'object' ? dispute.userId?.email : undefined;
  const customerPhone = typeof dispute.userId === 'object' ? dispute.userId?.phone : undefined;

  const orderObj = typeof dispute.orderId === 'object' ? dispute.orderId : null;
  const orderRawId = orderObj?._id || orderObj?.id || (typeof dispute.orderId === 'string' ? dispute.orderId : '');
  const orderPrice = orderObj?.finalPrice ?? orderObj?.totalAmount ?? null;

  const storeName = typeof dispute.storeId === 'object' ? dispute.storeId?.storeName : 'Tommalu Kitchen';

  const cleanPhone = customerPhone?.replace(/[^\d]/g, '');
  const fullPhone = cleanPhone?.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = customerPhone
    ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(
        `Hello ${customerName || 'Customer'}, this is Tommalu Support regarding your dispute #${disputeId.slice(-6)} on order #${orderRawId.slice(-6)}. We are here to help resolve your issue.`
      )}`
    : '#';

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/disputes"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Disputes Directory
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Main Header Banner */}
      <Card className="border-stone-200/80 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 bg-stone-50/80 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-stone-500 uppercase bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                Ticket #{disputeId.slice(-8)}
              </span>

              {/* Status Badge */}
              <Badge
                className={`text-xs font-bold capitalize ${
                  dispute.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : dispute.status === 'escalated'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : dispute.status === 'under_review'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : dispute.status === 'closed'
                    ? 'bg-stone-200 text-stone-700 border-stone-300'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {dispute.status.replace('_', ' ')}
              </Badge>

              {/* Priority Badge */}
              <Badge
                className={`text-xs font-bold uppercase ${
                  dispute.priority === 'urgent'
                    ? 'bg-red-600 text-white shadow-xs'
                    : dispute.priority === 'high'
                    ? 'bg-orange-500 text-white'
                    : dispute.priority === 'medium'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {dispute.priority} Priority
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {dispute.title}
            </h1>
            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Filed on {formatDate(dispute.createdAt)}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
              <Button
                onClick={() => {
                  setResolveForm({
                    action: 'refund_full',
                    amount: orderPrice ? String(orderPrice) : '',
                    notes: '',
                  });
                  setResolveDialogOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Resolve Dispute
              </Button>
            )}

            {dispute.status !== 'escalated' && dispute.status !== 'closed' && (
              <Button
                variant="outline"
                onClick={() => setIsEscalateOpen(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl"
              >
                <ArrowUp className="w-3.5 h-3.5 mr-1" />
                Escalate
              </Button>
            )}

            {dispute.status !== 'closed' && (
              <Button
                variant="outline"
                onClick={() => setIsCloseOpen(true)}
                className="text-stone-600 hover:bg-stone-100 font-bold text-xs rounded-xl"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Close
              </Button>
            )}
          </div>
        </div>

        {/* 3-Column Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200">
          {/* 1. Customer */}
          <div className="p-5 space-y-3">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Complainant (Customer)
            </span>
            <div>
              <div className="font-bold text-stone-900 text-sm">{customerName}</div>
              {customerEmail && (
                <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-stone-400" />
                  <span>{customerEmail}</span>
                </div>
              )}
            </div>

            {customerPhone ? (
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${customerPhone}`}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors"
                >
                  📞 {customerPhone}
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No phone attached</p>
            )}
          </div>

          {/* 2. Order Reference */}
          <div className="p-5 space-y-3">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              Order Reference
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-stone-900 text-sm">
                  #{orderRawId ? orderRawId.slice(-8) : 'N/A'}
                </span>
                {orderRawId && (
                  <button
                    onClick={() => handleCopy(orderRawId, 'ord-id')}
                    title="Copy full Order ID"
                    className="text-stone-400 hover:text-stone-700"
                  >
                    {copiedKey === 'ord-id' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Status:{' '}
                <span className="font-semibold text-stone-700 capitalize">
                  {orderObj?.status || 'Unknown'}
                </span>
              </p>
            </div>

            {orderPrice !== null && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-black">
                Order Value: ₹{orderPrice}
              </div>
            )}
          </div>

          {/* 3. Kitchen / Store */}
          <div className="p-5 space-y-3">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              Store / Kitchen Partner
            </span>
            <div>
              <div className="font-bold text-stone-900 text-sm">{storeName}</div>
              <p className="text-xs text-stone-500 mt-0.5">
                Issue Category:{' '}
                <span className="font-bold text-stone-700 capitalize">
                  {dispute.type.replace('_', ' ')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Dispute Details & Description */}
      <Card className="border-stone-200/80 shadow-sm rounded-3xl p-6 space-y-4">
        <h3 className="font-black text-stone-900 text-base">Customer Complaint & Evidence</h3>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
          {dispute.description}
        </div>

        {/* Evidence Photos */}
        {dispute.attachments && dispute.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-stone-400" />
              Evidence Attachments ({dispute.attachments.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dispute.attachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-video flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={url}
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    View Photo
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Resolution Details (if resolved) */}
      {dispute.resolution && (
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-base">Resolution Agreement</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400">Action</span>
              <p className="font-bold text-stone-900 capitalize mt-0.5">
                {dispute.resolution.action.replace('_', ' ')}
              </p>
            </div>

            {dispute.resolution.amount !== undefined && (
              <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-stone-400">Refund Amount</span>
                <p className="font-black text-emerald-600 text-sm mt-0.5">
                  ₹{dispute.resolution.amount}
                </p>
              </div>
            )}

            <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400">Resolved Date</span>
              <p className="font-bold text-stone-700 mt-0.5">
                {formatDate(dispute.resolution.resolvedAt)}
              </p>
            </div>
          </div>

          {dispute.resolution.notes && (
            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 text-xs text-stone-800">
              <span className="font-bold text-stone-900 block mb-1">Resolution Notes:</span>
              <p className="text-stone-600">{dispute.resolution.notes}</p>
            </div>
          )}
        </Card>
      )}

      {/* Audit Timeline */}
      <Card className="border-stone-200/80 shadow-sm rounded-3xl p-6 space-y-4">
        <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-stone-500" />
          Audit & Activity Timeline
        </h3>

        {!dispute.timeline || dispute.timeline.length === 0 ? (
          <p className="text-xs text-stone-400 italic">No timeline entries recorded.</p>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
            {dispute.timeline.map((entry, idx) => {
              const actor = typeof entry.performedBy === 'object' ? entry.performedBy?.name : 'Staff';
              return (
                <div key={idx} className="relative flex items-start gap-4 text-xs">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center text-orange-600 shrink-0 shadow-xs z-10">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <div className="flex-1 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-stone-900">{entry.action}</span>
                      <span className="text-[11px] text-stone-400">{formatDate(entry.timestamp)}</span>
                    </div>
                    <p className="text-stone-500 mt-1">
                      By <span className="font-semibold text-stone-700">{actor}</span>
                      {entry.notes ? `: ${entry.notes}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ======================================================================= */}
      {/* RESOLVE DISPUTE MODAL                                                   */}
      {/* ======================================================================= */}
      {resolveDialogOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-stone-900 text-base">Resolve Dispute Ticket</h3>
              </div>
              <button
                onClick={() => setResolveDialogOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolve} className="p-5 space-y-4">
              <div>
                <Label htmlFor="resolve-action" className="text-xs font-bold text-stone-700 mb-1 block">
                  Resolution Decision
                </Label>
                <select
                  id="resolve-action"
                  value={resolveForm.action}
                  onChange={(e) => setResolveForm({ ...resolveForm, action: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                >
                  <option value="refund_full">Full Refund to Customer</option>
                  <option value="refund_partial">Partial Refund to Customer</option>
                  <option value="store_action">Kitchen Partner Action Required</option>
                  <option value="no_action">No Financial Action (Claim Dismissed)</option>
                  <option value="other">Other Settlement</option>
                </select>
              </div>

              {(resolveForm.action === 'refund_full' || resolveForm.action === 'refund_partial') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="refund-amount" className="text-xs font-bold text-stone-700">
                      Refund Amount (₹)
                    </Label>
                    {orderPrice && (
                      <button
                        type="button"
                        onClick={() => setResolveForm({ ...resolveForm, amount: String(orderPrice) })}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                      >
                        Set Full Amount (₹{orderPrice})
                      </button>
                    )}
                  </div>
                  <Input
                    id="refund-amount"
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
                <Label htmlFor="resolve-notes" className="text-xs font-bold text-stone-700 mb-1 block">
                  Official Resolution Notes
                </Label>
                <Textarea
                  id="resolve-notes"
                  required
                  rows={3}
                  placeholder="Explain the settlement reasoning for the customer and audit record..."
                  value={resolveForm.notes}
                  onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Quick Note Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Food quality issue verified. Full refund authorized.',
                    'Delayed delivery compensation credited.',
                    'Order delivered correctly as per kitchen photos. No refund.',
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
                  onClick={() => setResolveDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resolveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {resolveMutation.isPending ? 'Processing...' : 'Confirm Resolution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* ESCALATE MODAL                                                          */}
      {/* ======================================================================= */}
      {isEscalateOpen && (
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
                onClick={() => setIsEscalateOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={escalateMutation.isPending}
                onClick={handleEscalate}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
              >
                {escalateMutation.isPending ? 'Escalating...' : 'Confirm Escalate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* CLOSE MODAL                                                             */}
      {/* ======================================================================= */}
      {isCloseOpen && (
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
                onClick={() => setIsCloseOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={closeMutation.isPending}
                onClick={handleClose}
                className="bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl"
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
