'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Utensils,
  Sun,
  Moon,
  Clock,
  MessageCircle,
  Pause,
  Play,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionApi } from '@/services/api/subscription.api';

interface SubscriptionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
  onRefresh: () => void;
  onEdit: (sub: any) => void;
  onAddPause: (sub: any) => void;
}

export function SubscriptionDetailModal({
  isOpen,
  onClose,
  subscription,
  onRefresh,
  onEdit,
  onAddPause,
}: SubscriptionDetailModalProps) {
  const [loadingAction, setLoadingAction] = useState(false);

  if (!subscription) return null;

  const startDate = new Date(subscription.startDate);
  const endDate = new Date(subscription.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDuration = subscription.duration || Math.max(1, differenceInDays(endDate, startDate) + 1);
  const daysPassed = Math.max(0, differenceInDays(today, startDate));
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysPassed / totalDuration) * 100)));

  const cleanPhone = (subscription.mobileNumber || '').replace(/\D/g, '').slice(-10);
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hello ${subscription.customerName}, this is regarding your Tommalu Tiffin Subscription (${subscription.planName}).`
  )}`;

  const isPaused = subscription.status === 'paused';
  const isActive = subscription.status === 'active';

  // Toggle Pause / Resume
  const handleToggleStatus = async () => {
    const newStatus = isPaused ? 'active' : 'paused';
    try {
      setLoadingAction(true);
      await subscriptionApi.updateStatus(
        subscription._id,
        newStatus,
        `Status changed to ${newStatus} by admin`
      );
      toast.success(
        isPaused ? 'Subscription Resumed!' : 'Subscription Paused!',
        {
          description: isPaused
            ? 'Tiffin deliveries will resume for this customer.'
            : 'Tiffin deliveries are paused until resumed.',
        }
      );
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to update status', {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleApprovePause = async (reqId: string) => {
    try {
      setLoadingAction(true);
      await subscriptionApi.approvePauseRequest(subscription._id, reqId);
      toast.success('Pause request approved. Plan extended by 1 day.');
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to approve pause request');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejectPause = async (reqId: string) => {
    try {
      setLoadingAction(true);
      await subscriptionApi.rejectPauseRequest(subscription._id, reqId);
      toast.success('Pause request rejected');
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to reject pause request');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-stone-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xl font-black">
                {subscription.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                  {subscription.customerName}
                  <Badge
                    className={`font-bold border-0 text-xs px-2 py-0.5 ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : isPaused
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-stone-600 text-white'
                    }`}
                  >
                    {subscription.status.toUpperCase()}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-stone-400 text-xs mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-emerald-400" />
                    +91 {subscription.mobileNumber}
                  </span>
                  <span>•</span>
                  <span>ID: {subscription._id.slice(-6).toUpperCase()}</span>
                </DialogDescription>
              </div>
            </div>

            {/* Quick WhatsApp & Call Action */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. Plan Overview Card */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Subscribed Plan</span>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2 mt-0.5">
                  <Utensils className="h-4 w-4 text-orange-600" />
                  {subscription.planName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs font-bold px-2.5 py-1 ${
                  subscription.planType === 'both' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  subscription.planType === 'dinner' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                  'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {subscription.planType === 'both' ? 'Lunch + Dinner' : subscription.planType?.toUpperCase()}
                </Badge>
                <span className="font-black text-emerald-700 text-base bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  ₹{subscription.price}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200/70 text-xs">
              <div>
                <span className="text-stone-400">Tiffin Quantity:</span>
                <p className="font-bold text-stone-800">{subscription.quantity || 1} Tiffin / day</p>
              </div>
              <div>
                <span className="text-stone-400">Roti Preference:</span>
                <p className="font-bold text-stone-800">{subscription.rotiPreference || 'Standard (4 Roti)'}</p>
              </div>
              <div>
                <span className="text-stone-400">Plan Duration:</span>
                <p className="font-bold text-stone-800">{totalDuration} Days</p>
              </div>
              <div>
                <span className="text-stone-400">Days Remaining:</span>
                <p className="font-extrabold text-orange-600">{daysRemaining} Days Left</p>
              </div>
            </div>

            {/* Validity Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                <span>Start: <strong>{format(startDate, 'dd MMM yyyy')}</strong></span>
                <span>Day {daysPassed} of {totalDuration}</span>
                <span>End: <strong>{format(endDate, 'dd MMM yyyy')}</strong></span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isPaused ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  Delivery Address
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Navigation className="h-3 w-3 text-amber-600" />
                  {subscription.deliverySequence && subscription.deliverySequence > 0
                    ? `Stop #${subscription.deliverySequence}`
                    : 'Auto Highway Waypoint'}
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-900 leading-snug">
                {subscription.deliveryAddress?.street}
              </p>
              {subscription.deliveryAddress?.landmark && (
                <p className="text-xs text-stone-600">
                  <span className="font-bold">Landmark:</span> {subscription.deliveryAddress.landmark}
                </p>
              )}
              <p className="text-xs text-stone-500">
                {subscription.deliveryAddress?.city} - {subscription.deliveryAddress?.pincode}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-blue-600" />
                Special Instructions / Notes
              </span>
              <p className="text-xs text-stone-700 italic bg-stone-50 p-2.5 rounded-lg border border-stone-100 min-h-[50px]">
                {subscription.adminNotes || 'No special instructions recorded.'}
              </p>
            </div>
          </div>

          {/* 3. Pause Management & History */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Pause className="h-3.5 w-3.5 text-amber-600" />
                  Pause Management & History (टिफ़िन पॉज़ रिकॉर्ड)
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Paused days used: <strong>{subscription.pausedDaysUsed || 0}</strong> • Status: {isPaused ? <span className="text-amber-600 font-bold">Currently Paused</span> : <span className="text-emerald-600 font-bold">Active Service</span>}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onAddPause(subscription)}
                  className="text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50 cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  + Add 1-Day Pause
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={loadingAction}
                  onClick={handleToggleStatus}
                  className={`text-xs font-bold shadow-xs cursor-pointer ${
                    isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {loadingAction ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : isPaused ? (
                    <Play className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Pause className="h-3.5 w-3.5 mr-1" />
                  )}
                  {isPaused ? 'Resume Plan (चालू करें)' : 'Pause Plan (रोकें)'}
                </Button>
              </div>
            </div>

            {/* Pause Requests List */}
            {(!subscription.pauseRequests || subscription.pauseRequests.length === 0) ? (
              <div className="text-center py-5 text-stone-400 text-xs">
                कोई पॉज़ या छुट्टी का रिकॉर्ड नहीं है (No pause requests filed yet).
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                {subscription.pauseRequests.map((pr: any, i: number) => (
                  <div
                    key={pr._id || i}
                    className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">
                          {format(new Date(pr.date), 'dd MMMM yyyy (EEEE)')}
                        </span>
                        <Badge
                          className={`text-[10px] uppercase font-bold border-0 px-2 py-0.5 ${
                            pr.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pr.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {pr.status}
                        </Badge>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Reason: {pr.reason || 'Customer requested pause'}
                      </p>
                    </div>

                    {pr.status === 'pending' && (
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button
                          size="sm"
                          disabled={loadingAction}
                          onClick={() => handleApprovePause(pr._id)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingAction}
                          onClick={() => handleRejectPause(pr._id)}
                          className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-stone-50 border-t border-stone-200 sticky bottom-0 z-10 flex flex-row items-center justify-between sm:justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs border-stone-300 text-stone-700"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => {
              onClose();
              onEdit(subscription);
            }}
            className="bg-stone-900 hover:bg-black text-white font-bold text-xs px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Full Details (पूरा विवरण बदलें)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
