"use client";

import React, { useEffect, useState, useMemo } from "react";
import { subscriptionApi } from "@/services/api/subscription.api";
import { EditSubscriptionPeriodModal } from "@/components/admin/subscription/EditSubscriptionPeriodModal";
import { EditSubscriptionPriceModal } from "@/components/admin/subscription/EditSubscriptionPriceModal";
import { AdminPauseModal } from "@/components/admin/subscription/AdminPauseModal";
import { AddManualSubscriptionModal } from "@/components/admin/subscription/AddManualSubscriptionModal";
import { SubscriptionDetailModal } from "@/components/admin/subscription/SubscriptionDetailModal";
import { EditFullSubscriptionModal } from "@/components/admin/subscription/EditFullSubscriptionModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, differenceInDays } from "date-fns";
import {
  Loader2,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Phone,
  CheckCircle,
  XCircle,
  MapPin,
  Plus,
  MessageCircle,
  Eye,
  Edit,
  Pause,
  Play,
  Utensils,
  Sun,
  Moon,
  Users,
  Layers,
  Clock
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Subscription {
  _id: string;
  customerName: string;
  mobileNumber: string;
  deliveryAddress?: {
    street: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  planName: string;
  planType: string;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
  duration: number;
  quantity?: number;
  rotiPreference?: string;
  adminNotes?: string;
  deliverySequence?: number;
  pausedDaysUsed?: number;
  pauseRequests?: Array<{ _id: string; date: string; status: string; reason: string }>;
}

export function ActiveSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFullEditModalOpen, setIsFullEditModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.getAllActiveSubscriptions();
      setSubscriptions(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      const errorMessage = err.response?.data?.message || err.message || JSON.stringify(err);
      setError(`Failed to fetch subscriptions: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = subscriptions.length;
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const pausedCount = subscriptions.filter(s => s.status === 'paused').length;
    const pendingPauseReqs = subscriptions.reduce((acc, s) => {
      const pending = s.pauseRequests?.filter(pr => pr.status === 'pending').length || 0;
      return acc + pending;
    }, 0);

    const totalRevenue = subscriptions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

    let lunchTiffins = 0;
    let dinnerTiffins = 0;
    subscriptions.forEach(s => {
      if (s.status === 'active') {
        const qty = s.quantity || 1;
        if (s.planType === 'lunch') lunchTiffins += qty;
        else if (s.planType === 'dinner') dinnerTiffins += qty;
        else if (s.planType === 'both') {
          lunchTiffins += qty;
          dinnerTiffins += qty;
        }
      }
    });

    return { totalCount, activeCount, pausedCount, pendingPauseReqs, totalRevenue, lunchTiffins, dinnerTiffins };
  }, [subscriptions]);

  // Modal open handlers
  const handleViewDetail = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsDetailModalOpen(true);
  };

  const handleEditFull = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsFullEditModalOpen(true);
  };

  const handleEditPeriod = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsPeriodModalOpen(true);
  };

  const handleEditPrice = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsPriceModalOpen(true);
  };

  const handleAddPause = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsPauseModalOpen(true);
  };

  // Direct Quick Toggle Pause / Resume
  const handleTogglePause = async (sub: Subscription) => {
    const newStatus = sub.status === 'paused' ? 'active' : 'paused';
    try {
      await subscriptionApi.updateStatus(
        sub._id,
        newStatus,
        `Quick ${newStatus} toggled by admin`
      );
      toast.success(
        newStatus === 'active' ? 'Plan Resumed Successfully!' : 'Plan Paused Successfully!',
        {
          description: `${sub.customerName}'s tiffin deliveries are now ${newStatus === 'active' ? 'ACTIVE' : 'PAUSED'}.`,
        }
      );
      fetchSubscriptions();
    } catch (err: any) {
      toast.error('Failed to change plan status', {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const savePeriod = async (startDate: string, endDate: string) => {
    if (!selectedSubscription) return;
    try {
      await subscriptionApi.updatePeriod(selectedSubscription._id, startDate, endDate);
      toast.success("Subscription validity updated successfully.");
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update period");
    }
  };

  const savePrice = async (newPrice: number) => {
    if (!selectedSubscription) return;
    try {
      await subscriptionApi.updatePrice(selectedSubscription._id, newPrice);
      toast.success("Subscription price updated successfully.");
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update price");
    }
  };

  const savePause = async (date: string, reason: string) => {
    if (!selectedSubscription) return;
    try {
      await subscriptionApi.adminAddPause(selectedSubscription._id, date, reason);
      toast.success("Pause day added and plan extended by 1 day.");
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add pause day");
    }
  };

  const handleApprovePause = async (subId: string, reqId: string) => {
    try {
      await subscriptionApi.approvePauseRequest(subId, reqId);
      toast.success("Pause request approved. Plan extended by 1 day.");
      fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve pause request");
    }
  };

  const handleRejectPause = async (subId: string, reqId: string) => {
    try {
      await subscriptionApi.rejectPauseRequest(subId, reqId);
      toast.success("Pause request rejected");
      fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject pause request");
    }
  };

  // Filter Subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch =
      sub.customerName.toLowerCase().includes(sTerm) ||
      sub.mobileNumber.includes(sTerm) ||
      (sub.deliveryAddress?.street || '').toLowerCase().includes(sTerm) ||
      (sub.planName || '').toLowerCase().includes(sTerm);

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "active") return sub.status === "active";
    if (statusFilter === "paused") return sub.status === "paused";
    if (statusFilter === "needs_attention") {
      return sub.pauseRequests && sub.pauseRequests.some(pr => pr.status === 'pending');
    }
    if (statusFilter === "expiring_soon") {
      const daysLeft = differenceInDays(new Date(sub.endDate), new Date());
      return daysLeft >= 0 && daysLeft <= 7;
    }
    return sub.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats Bar & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Customer Subscriptions Hub
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage recurring meal subscriptions, pause requests, address changes, and delivery schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Button
            onClick={() => setIsManualModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-2 border-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <MessageCircle className="h-4 w-4" />
            + Add WhatsApp Subscriber
          </Button>
          <Button
            onClick={fetchSubscriptions}
            disabled={loading}
            variant="outline"
            className="border-stone-200 text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Operational Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Active Subscribers */}
        <div className="p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Subscribers</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2">
            {metrics.activeCount}
            <span className="text-xs font-semibold text-stone-400 ml-1.5">/ {metrics.totalCount} Total</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            Booked Revenue: <strong>₹{metrics.totalRevenue.toLocaleString()}</strong>
          </p>
        </div>

        {/* Currently Paused */}
        <div className="p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Currently Paused</span>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <Pause className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {metrics.pausedCount}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            No tiffin cooked today for paused plans
          </p>
        </div>

        {/* Today's Tiffins Count */}
        <div className="p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Today's Tiffins</span>
            <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <Utensils className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-500" /> Lunch:
              </span>
              <p className="text-lg font-black text-stone-900">{metrics.lunchTiffins}</p>
            </div>
            <div className="h-6 w-px bg-stone-200" />
            <div>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-500" /> Dinner:
              </span>
              <p className="text-lg font-black text-stone-900">{metrics.dinnerTiffins}</p>
            </div>
          </div>
        </div>

        {/* Pending Pause Requests */}
        <div className={`p-4 rounded-xl border shadow-2xs transition-colors ${
          metrics.pendingPauseReqs > 0
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-white border-stone-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pending Pauses</span>
            <span className={`p-1.5 rounded-lg ${metrics.pendingPauseReqs > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-stone-100 text-stone-500'}`}>
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <p className={`text-2xl font-black mt-2 ${metrics.pendingPauseReqs > 0 ? 'text-amber-700' : 'text-stone-900'}`}>
            {metrics.pendingPauseReqs}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            {metrics.pendingPauseReqs > 0 ? 'Action required from customer app' : 'All pause requests cleared'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* 3. Main Card with Search, Filter Tabs & List */}
      <Card className="border-stone-200 shadow-2xs overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Filters & Search Toolbar */}
          <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by customer name, phone, address, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full bg-white border-stone-200 focus-visible:ring-orange-500 rounded-xl text-xs sm:text-sm h-9"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `All (${subscriptions.length})` },
                { id: 'active', label: `Active (${metrics.activeCount})` },
                { id: 'paused', label: `Paused (${metrics.pausedCount})` },
                { id: 'needs_attention', label: `Needs Action (${metrics.pendingPauseReqs})`, highlight: metrics.pendingPauseReqs > 0 },
                { id: 'expiring_soon', label: 'Expiring in 7d' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : f.highlight
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold'
                      : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table View (Desktop) */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-transparent border-stone-200">
                  <TableHead className="text-xs font-black text-stone-500 uppercase tracking-wider h-11">Customer & Address</TableHead>
                  <TableHead className="text-xs font-black text-stone-500 uppercase tracking-wider h-11">Meal Slot & Diet</TableHead>
                  <TableHead className="text-xs font-black text-stone-500 uppercase tracking-wider h-11">Validity & Remaining</TableHead>
                  <TableHead className="text-xs font-black text-stone-500 uppercase tracking-wider h-11">Status</TableHead>
                  <TableHead className="text-xs font-black text-stone-500 uppercase tracking-wider h-11 text-right">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => {
                  const startDate = new Date(sub.startDate);
                  const endDate = new Date(sub.endDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const totalDuration = sub.duration || Math.max(1, differenceInDays(endDate, startDate) + 1);
                  const daysPassed = Math.max(0, differenceInDays(today, startDate));
                  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
                  const progressPercent = Math.min(100, Math.max(0, Math.round((daysPassed / totalDuration) * 100)));

                  const cleanPhone = (sub.mobileNumber || '').replace(/\D/g, '').slice(-10);
                  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                    `Hello ${sub.customerName}, this is regarding your Tommalu Tiffin Subscription (${sub.planName}).`
                  )}`;

                  const isSubPaused = sub.status === 'paused';
                  const isSubActive = sub.status === 'active';

                  return (
                    <React.Fragment key={sub._id}>
                      <TableRow className="group hover:bg-stone-50/60 transition-colors border-stone-200">
                        {/* Customer Column */}
                        <TableCell className="py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex flex-shrink-0 items-center justify-center text-orange-700 font-black text-base border border-orange-200">
                              {sub.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-stone-900 text-sm">{sub.customerName}</span>
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                              </div>
                              <div className="flex items-center text-xs text-stone-500 mt-0.5">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0 text-stone-400" />
                                +91 {sub.mobileNumber}
                              </div>
                              {sub.deliveryAddress && (
                                <div className="flex items-start text-xs text-stone-500 mt-1 max-w-[240px]">
                                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5 text-stone-400" />
                                  <span className="line-clamp-2" title={`${sub.deliveryAddress.street}, ${sub.deliveryAddress.landmark ? sub.deliveryAddress.landmark + ', ' : ''}${sub.deliveryAddress.city}`}>
                                    {sub.deliveryAddress.street}, {sub.deliveryAddress.landmark && `${sub.deliveryAddress.landmark}, `}{sub.deliveryAddress.city} - {sub.deliveryAddress.pincode}
                                  </span>
                                </div>
                              )}
                              {sub.deliverySequence !== undefined && sub.deliverySequence > 0 && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                                    📍 Stop #{sub.deliverySequence} Priority
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Plan & Food Column */}
                        <TableCell className="py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-stone-900 text-sm">{sub.planName}</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                sub.planType === 'both' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                sub.planType === 'dinner' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {sub.planType === 'both' ? 'Lunch + Dinner' : sub.planType}
                              </Badge>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ₹{sub.price}
                              </span>
                              {sub.quantity && sub.quantity > 1 && (
                                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                                  {sub.quantity}x Tiffins
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-500 mt-0.5">
                              Roti: <strong>{sub.rotiPreference || 'Standard'}</strong>
                            </span>
                          </div>
                        </TableCell>

                        {/* Duration & Progress Column */}
                        <TableCell className="py-4 align-top">
                          <div className="flex flex-col gap-1 w-48">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-stone-900">{sub.duration} Days Plan</span>
                              <span className="font-extrabold text-orange-600">{daysRemaining}d left</span>
                            </div>

                            {/* Mini progress bar */}
                            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${isSubPaused ? 'bg-amber-500' : 'bg-emerald-600'}`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>

                            <div className="text-[11px] text-stone-500 flex justify-between pt-0.5">
                              <span>{format(startDate, "dd MMM")}</span>
                              <span>→</span>
                              <span>{format(endDate, "dd MMM yyyy")}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status Column */}
                        <TableCell className="py-4 align-top">
                          <div className="flex flex-col items-start gap-1.5">
                            <Badge className={`text-xs font-bold border-0 px-2.5 py-1 ${
                              isSubActive ? 'bg-emerald-100 text-emerald-800' :
                              isSubPaused ? 'bg-amber-100 text-amber-800 animate-pulse' :
                              sub.status === 'expired' ? 'bg-rose-100 text-rose-800' :
                              'bg-stone-100 text-stone-700'
                            }`}>
                              {sub.status.toUpperCase()}
                            </Badge>

                            {sub.pausedDaysUsed ? (
                              <span className="text-[10px] text-stone-400">
                                {sub.pausedDaysUsed} pause day(s) used
                              </span>
                            ) : null}

                            {sub.pauseRequests && sub.pauseRequests.some(pr => pr.status === 'pending') && (
                              <div className="flex items-center text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                                Pause Req Pending!
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell className="py-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Full Details Button */}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(sub)}
                              className="h-8 px-2.5 text-xs font-bold border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer flex items-center gap-1"
                              title="View full details and pause history"
                            >
                              <Eye className="h-3.5 w-3.5 text-stone-500" />
                              View
                            </Button>

                            {/* Edit Button */}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditFull(sub)}
                              className="h-8 px-2.5 text-xs font-bold border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer flex items-center gap-1"
                              title="Edit all subscription details"
                            >
                              <Edit className="h-3.5 w-3.5 text-blue-600" />
                              Edit
                            </Button>

                            {/* Direct Pause / Resume Toggle */}
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleTogglePause(sub)}
                              className={`h-8 px-2.5 text-xs font-bold text-white shadow-2xs cursor-pointer flex items-center gap-1 ${
                                isSubPaused
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'bg-amber-600 hover:bg-amber-700'
                              }`}
                              title={isSubPaused ? 'Resume Tiffins' : 'Pause Tiffins'}
                            >
                              {isSubPaused ? (
                                <>
                                  <Play className="h-3.5 w-3.5" /> Resume
                                </>
                              ) : (
                                <>
                                  <Pause className="h-3.5 w-3.5" /> Pause
                                </>
                              )}
                            </Button>

                            {/* More Options Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg cursor-pointer"
                                >
                                  <MoreVertical className="h-4 w-4 text-stone-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel className="text-xs text-stone-500 uppercase">
                                  Advanced Controls
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAddPause(sub)} className="cursor-pointer text-stone-700 font-medium">
                                  <Calendar className="mr-2 h-4 w-4 text-rose-500" /> Add 1-Day Pause
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPeriod(sub)} className="cursor-pointer text-stone-700 font-medium">
                                  <Clock className="mr-2 h-4 w-4 text-orange-500" /> Extend Validity
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPrice(sub)} className="cursor-pointer text-stone-700 font-medium">
                                  <DollarSign className="mr-2 h-4 w-4 text-emerald-500" /> Update Price
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Pending Pause Requests Banner for this row */}
                      {sub.pauseRequests && sub.pauseRequests.some(pr => pr.status === 'pending') && (
                        <TableRow className="bg-amber-50/60 border-t-0 hover:bg-amber-50/70">
                          <TableCell colSpan={5} className="py-3 px-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-amber-200">
                              <div className="flex items-center gap-3">
                                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                  <AlertCircle className="w-4 h-4" />
                                </span>
                                <div>
                                  <p className="font-extrabold text-stone-900 text-xs">
                                    Customer requested Pause on {sub.pauseRequests.filter(pr => pr.status === 'pending').map(pr => format(new Date(pr.date), 'dd MMMM yyyy')).join(', ')}
                                  </p>
                                  <p className="text-[11px] text-stone-500">
                                    Reason: {sub.pauseRequests.find(pr => pr.status === 'pending')?.reason || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {sub.pauseRequests.filter(pr => pr.status === 'pending').map(pr => (
                                  <React.Fragment key={pr._id}>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprovePause(sub._id, pr._id)}
                                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve & Extend +1 Day
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectPause(sub._id, pr._id)}
                                      className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 font-bold"
                                    >
                                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                    </Button>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredSubscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-stone-400">
                        <Search className="h-8 w-8 mb-2 text-stone-300" />
                        <p className="text-base font-bold text-stone-800">No subscriptions found</p>
                        <p className="text-xs text-stone-500 mt-0.5">Try adjusting your filters or search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Card View (Mobile & Tablet) */}
          <div className="lg:hidden flex flex-col gap-3.5 p-4 bg-stone-50/50">
            {filteredSubscriptions.map((sub) => {
              const startDate = new Date(sub.startDate);
              const endDate = new Date(sub.endDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const totalDuration = sub.duration || Math.max(1, differenceInDays(endDate, startDate) + 1);
              const daysRemaining = Math.max(0, differenceInDays(endDate, today));
              const isSubPaused = sub.status === 'paused';
              const isSubActive = sub.status === 'active';

              const cleanPhone = (sub.mobileNumber || '').replace(/\D/g, '').slice(-10);
              const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                `Hello ${sub.customerName}, this is regarding your Tommalu Tiffin Subscription (${sub.planName}).`
              )}`;

              return (
                <div key={sub._id} className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className="p-4 border-b border-stone-100 flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-2xl bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-700 font-black text-base border border-orange-200">
                        {sub.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-sm truncate">{sub.customerName}</span>
                          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-emerald-600">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 font-mono">
                          +91 {sub.mobileNumber}
                        </div>
                      </div>
                    </div>

                    <Badge className={`text-xs font-bold border-0 px-2.5 py-1 ${
                      isSubActive ? 'bg-emerald-100 text-emerald-800' :
                      isSubPaused ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      sub.status === 'expired' ? 'bg-rose-100 text-rose-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {sub.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-800">{sub.planName}</span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ₹{sub.price}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-400 text-[10px] block">Slot & Diet:</span>
                        <strong className="text-stone-800 uppercase text-[11px]">{sub.planType} • {sub.rotiPreference || '4 Roti'}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Remaining Days:</span>
                        <strong className="text-orange-600 font-extrabold text-[11px]">{daysRemaining} Days Left</strong>
                      </div>
                    </div>

                    {sub.deliveryAddress && (
                      <div className="flex items-start text-xs text-stone-500">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-stone-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {sub.deliveryAddress.street}, {sub.deliveryAddress.city}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetail(sub)}
                      className="text-xs font-bold border-stone-200 flex-1"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View Full
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditFull(sub)}
                      className="text-xs font-bold border-stone-200 flex-1"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1 text-blue-600" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTogglePause(sub)}
                      className={`text-xs font-bold text-white flex-1 ${
                        isSubPaused
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {isSubPaused ? 'Resume' : 'Pause'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Connected Modals */}
      {/* 360-degree Detail Modal */}
      <SubscriptionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        subscription={selectedSubscription}
        onRefresh={fetchSubscriptions}
        onEdit={(sub) => {
          setSelectedSubscription(sub);
          setIsFullEditModalOpen(true);
        }}
        onAddPause={(sub) => {
          setSelectedSubscription(sub);
          setIsPauseModalOpen(true);
        }}
      />

      {/* Full Edit Modal */}
      <EditFullSubscriptionModal
        isOpen={isFullEditModalOpen}
        onClose={() => setIsFullEditModalOpen(false)}
        subscription={selectedSubscription}
        onSuccess={fetchSubscriptions}
      />

      {/* Add Manual Subscription Modal */}
      <AddManualSubscriptionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={fetchSubscriptions}
      />

      {/* Legacy Admin Pause Day Modal */}
      <AdminPauseModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        onSave={savePause}
      />

      {/* Period Modal */}
      {selectedSubscription && (
        <>
          <EditSubscriptionPeriodModal
            isOpen={isPeriodModalOpen}
            onClose={() => setIsPeriodModalOpen(false)}
            onSave={savePeriod}
            currentStartDate={selectedSubscription.startDate}
            currentEndDate={selectedSubscription.endDate}
          />
          <EditSubscriptionPriceModal
            isOpen={isPriceModalOpen}
            onClose={() => setIsPriceModalOpen(false)}
            onSave={savePrice}
            currentPrice={selectedSubscription.price}
          />
        </>
      )}
    </div>
  );
}
