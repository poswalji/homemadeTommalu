"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Phone, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  LogOut, 
  IndianRupee,
  Utensils,
  Info,
  X,
  Navigation,
  RefreshCw,
  AlertTriangle,
  Bike,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Receipt,
  FileSpreadsheet
} from "lucide-react";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type OrderItem = {
  itemName: string;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber?: string;
  deliveryType?: 'daily' | 'tiffin';
  customerName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    pincode: string;
    label?: string;
    locationLink?: string;
  };
  items: OrderItem[];
  timeSlot: string;
  paymentMethod: string;
  status: string;
  area?: string;
  createdAt: string;
  deliveredAt?: string;
  specialInstructions?: string;
  source?: string;
  isSubscription?: boolean;
  collectionAmount?: number;
  finalPrice?: number;
  failureReason?: string;
  stopNumber?: number;
  stopLabel?: string;
  routePriority?: string;
  deliverySequence?: number;
};

type RiderProfile = {
  id?: string;
  name?: string;
  phone?: string;
  isActive?: boolean;
};

type ShiftFinancials = {
  cashCollected: number;
  cashPending: number;
  codDeliveredCount: number;
  codPendingCount: number;
  totalTiffins: number;
  totalDailyOrders: number;
};

export default function DeliveryDashboard() {
  const router = useRouter();
  const [groupedOrders, setGroupedOrders] = useState<Record<string, Order[]>>({});
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [financials, setFinancials] = useState<ShiftFinancials | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  
  // Navigation & Filter state
  const [statusTab, setStatusTab] = useState<"active" | "delivered" | "failed">("active");
  const [slotFilter, setSlotFilter] = useState<"All" | "lunch" | "dinner">("All");
  const [showHisaabModal, setShowHisaabModal] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Failure modal state
  const [failureModalOrder, setFailureModalOrder] = useState<Order | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("deliveryToken");
    if (!token) {
      router.replace("/delivery/login");
      return;
    }

    try {
      const storedUser = localStorage.getItem("deliveryUser");
      if (storedUser) {
        setRider(JSON.parse(storedUser));
      }
    } catch (e) {
      // ignore
    }

    setIsChecking(false);
    fetchOrders(token);
  }, [router]);

  async function fetchOrders(token: string, isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/orders/delivery`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("deliveryToken");
          localStorage.removeItem("deliveryUser");
          router.replace("/delivery/login");
          return;
        }
        throw new Error(data.message || "Failed to fetch orders");
      }

      setGroupedOrders(data.data || {});

      if (data.rider) {
        setRider(data.rider);
        localStorage.setItem("deliveryUser", JSON.stringify(data.rider));
      }

      if (data.financials) {
        setFinancials(data.financials);
      }
    } catch (err: any) {
      setError(err.message || "Could not load delivery orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = () => {
    const token = localStorage.getItem("deliveryToken");
    if (token) fetchOrders(token, true);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the Rider App?")) {
      localStorage.removeItem("deliveryToken");
      localStorage.removeItem("deliveryUser");
      router.replace("/delivery/login?logout=true");
    }
  };

  // Status transitions
  const updateDeliveryStatus = async (orderId: string, targetStatus: string, reason?: string) => {
    const token = localStorage.getItem("deliveryToken");
    if (!token) {
      router.replace("/delivery/login");
      return;
    }

    try {
      setActionLoadingId(orderId);
      const res = await fetch(`${API_BASE_URL}/orders/delivery/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          failureReason: reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setStatusMessage(`Status updated successfully!`);
      setTimeout(() => setStatusMessage(""), 3500);

      // Close modal if open
      setFailureModalOrder(null);
      setFailureReason("");
      setCustomReason("");

      // Refresh list
      await fetchOrders(token, true);
    } catch (err: any) {
      alert(err.message || "Could not update status. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkDelivered = (order: Order) => {
    const isCOD = order.paymentMethod === 'cash_on_delivery';
    const amount = order.collectionAmount ?? order.finalPrice ?? 0;
    
    if (isCOD && amount > 0) {
      const confirmed = window.confirm(
        `💵 CASH COLLECTION CONFIRMATION:\n\nDid you collect ₹${amount} in cash from ${order.customerName || 'the customer'}?\n\nPress OK only after receiving the exact cash.`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        `Confirm delivery handover to ${order.customerName || 'customer'}?`
      );
      if (!confirmed) return;
    }

    updateDeliveryStatus(order.id, "Delivered");
  };

  const handleStartDelivery = (orderId: string) => {
    updateDeliveryStatus(orderId, "out_for_delivery");
  };

  const submitFailure = () => {
    if (!failureModalOrder) return;
    const finalReason = failureReason === "Other" ? customReason : failureReason;
    if (!finalReason.trim()) {
      alert("Please select or enter the issue reason");
      return;
    }
    updateDeliveryStatus(failureModalOrder.id, "failed", finalReason.trim());
  };

  // Flattened order list for calculations
  const allOrders = useMemo(() => {
    return Object.values(groupedOrders).flat();
  }, [groupedOrders]);

  // Real-time financial calculations
  const calculatedFinancials = useMemo(() => {
    let cashCollected = 0;
    let cashPending = 0;
    let codDelivered = 0;
    let codPending = 0;
    let tiffins = 0;
    let daily = 0;

    allOrders.forEach((o) => {
      const isTiffin = o.deliveryType === "tiffin" || o.isSubscription;
      if (isTiffin) tiffins++;
      else daily++;

      const isCOD = o.paymentMethod === "cash_on_delivery";
      const st = (o.status || "").toLowerCase();
      const isDelivered = st === "delivered";
      const isFailedOrCancelled = st === "failed" || st === "cancelled" || st === "rejected";
      const amt = Number(o.collectionAmount ?? o.finalPrice ?? 0);

      if (isCOD) {
        if (isDelivered) {
          cashCollected += amt;
          codDelivered++;
        } else if (!isFailedOrCancelled) {
          cashPending += amt;
          codPending++;
        }
      }
    });

    return {
      cashCollected: financials?.cashCollected ?? cashCollected,
      cashPending: financials?.cashPending ?? cashPending,
      codDeliveredCount: financials?.codDeliveredCount ?? codDelivered,
      codPendingCount: financials?.codPendingCount ?? codPending,
      totalTiffins: financials?.totalTiffins ?? tiffins,
      totalDailyOrders: financials?.totalDailyOrders ?? daily,
    };
  }, [allOrders, financials]);

  const activeOrdersCount = allOrders.filter((o) => {
    const st = (o.status || "").toLowerCase();
    return ["pending", "confirmed", "outfordelivery", "out_for_delivery", "assigned", "accepted", "preparing", "ready"].includes(st);
  }).length;

  const deliveredOrdersCount = allOrders.filter(
    (o) => (o.status || "").toLowerCase() === "delivered"
  ).length;

  const failedOrdersCount = allOrders.filter(
    (o) => (o.status || "").toLowerCase() === "failed"
  ).length;

  // COD Delivered Orders List for Cash Handover Statement
  const codDeliveredOrders = allOrders.filter((o) => {
    return o.paymentMethod === "cash_on_delivery" && (o.status || "").toLowerCase() === "delivered";
  });

  const getGoogleMapsUrl = (address: any) => {
    if (address?.locationLink) return address.locationLink;
    const query = `${address?.street || ""}, ${address?.city || ""}, ${address?.pincode || ""}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getGoogleMapsRouteUrl = (areaOrders: Order[]) => {
    const pendingOrders = areaOrders.filter(
      (o) => (o.status || "").toLowerCase() !== "delivered" && (o.status || "").toLowerCase() !== "failed"
    );
    if (pendingOrders.length === 0) return "#";

    const origin = encodeURIComponent(`${pendingOrders[0].address?.street || ""}, ${pendingOrders[0].address?.city || ""}`);
    const destination = encodeURIComponent(
      `${pendingOrders[pendingOrders.length - 1].address?.street || ""}, ${pendingOrders[pendingOrders.length - 1].address?.city || ""}`
    );

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

    if (pendingOrders.length > 2) {
      const waypoints = pendingOrders
        .slice(1, -1)
        .map((o) => `${o.address?.street || ""}, ${o.address?.city || ""}`)
        .join("|");
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }

    return url;
  };

  if (isChecking || (loading && !refreshing && allOrders.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-sm font-semibold text-slate-300">Loading your delivery shift...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-28">
      {/* 1. TOP RIDER APP BAR */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Bike size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight">
                  {rider?.name || "Rider Partner"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ON DUTY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {rider?.phone ? `+91 ${rider.phone}` : "Tommalu Unified Fleet"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh deliveries"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              <RefreshCw size={17} className={refreshing ? "animate-spin text-orange-400" : ""} />
            </button>
            <button
              onClick={handleLogout}
              title="Log out / Switch account"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check size={16} className="text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-3">
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. CASH IN HAND & SHIFT METRICS BAR (KITNA CASH MILA) */}
      <section className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header title */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Today's Shift Hisaab & Financials
              </span>
              <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>Rider Cash Summary</span>
              </h2>
            </div>
            <button
              onClick={() => setShowHisaabModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Receipt size={14} />
              <span>Cash Breakdown ({codDeliveredOrders.length})</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {/* CASH IN HAND - TO DEPOSIT */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                  💵 Cash in Hand
                </span>
                <div className="text-2xl font-black text-emerald-300 flex items-center">
                  <span>₹{calculatedFinancials.cashCollected.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-200/80">
                <span>{calculatedFinancials.codDeliveredCount} COD Orders Paid</span>
              </div>
            </div>

            {/* PENDING CASH TO COLLECT */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  ⏳ Yet to Collect
                </span>
                <div className="text-2xl font-black text-amber-300 flex items-center">
                  <span>₹{calculatedFinancials.cashPending.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-amber-500/20 text-[10px] text-amber-200/80">
                <span>{calculatedFinancials.codPendingCount} Pending COD Orders</span>
              </div>
            </div>

            {/* PREPAID TIFFINS (₹0 CASH) */}
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                  🍱 Prepaid Tiffins
                </span>
                <div className="text-2xl font-black text-blue-300">
                  {calculatedFinancials.totalTiffins}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-500/20 text-[10px] text-blue-200/80">
                <span>₹0 Cash (Online Paid)</span>
              </div>
            </div>

            {/* TOTAL SHIFT ORDERS */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  📦 Shift Progress
                </span>
                <div className="text-2xl font-black text-white">
                  {deliveredOrdersCount} <span className="text-sm font-normal text-slate-400">/ {allOrders.length}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${allOrders.length > 0 ? (deliveredOrdersCount / allOrders.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TABS & FILTERS */}
      <section className="max-w-4xl mx-auto px-4 mt-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Status Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-sm">
            <button
              onClick={() => setStatusTab("active")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusTab === "active"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Active</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusTab === "active" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                {activeOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setStatusTab("delivered")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusTab === "delivered"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Delivered</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusTab === "delivered" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                {deliveredOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setStatusTab("failed")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusTab === "failed"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Issues</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusTab === "failed" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                {failedOrdersCount}
              </span>
            </button>
          </div>

          {/* Time Slot Filters */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setSlotFilter("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                slotFilter === "All"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Slots
            </button>
            <button
              onClick={() => setSlotFilter("lunch")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                slotFilter === "lunch"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>☀️ Lunch</span>
            </button>
            <button
              onClick={() => setSlotFilter("dinner")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                slotFilter === "dinner"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🌙 Dinner</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. ORDERS LIST ACCORDING TO AREA & FILTERS */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {allOrders.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-4">
              <Package size={30} />
            </div>
            <h3 className="text-lg font-bold text-white">No Deliveries Assigned</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              You do not have any active or scheduled deliveries assigned for today's shift yet.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
            >
              <RefreshCw size={14} />
              <span>Check for New Assignments</span>
            </button>
          </div>
        ) : (
          Object.entries(groupedOrders)
            .sort(([, ordersA], [, ordersB]) => {
              const minA = Math.min(...ordersA.map(o => (o.stopNumber ?? (o.deliverySequence || 9999))));
              const minB = Math.min(...ordersB.map(o => (o.stopNumber ?? (o.deliverySequence || 9999))));
              return minA - minB;
            })
            .map(([area, areaOrders]) => {
              // Filter and sort area orders based on status tab and slot filter
              const filteredAreaOrders = areaOrders
                .filter((order) => {
                  const st = (order.status || "").toLowerCase();

                  let matchesTab = false;
                  if (statusTab === "active") {
                    matchesTab = ["pending", "confirmed", "outfordelivery", "out_for_delivery", "assigned", "accepted", "preparing", "ready"].includes(st);
                  } else if (statusTab === "delivered") {
                    matchesTab = st === "delivered";
                  } else if (statusTab === "failed") {
                    matchesTab = st === "failed" || st === "cancelled" || st === "rejected";
                  }

                  const matchesSlot =
                    slotFilter === "All" ||
                    (order.timeSlot && order.timeSlot.toLowerCase() === slotFilter.toLowerCase());

                  return matchesTab && matchesSlot;
                })
                .sort((a, b) => {
                  const numA = a.stopNumber ?? (a.deliverySequence || 9999);
                  const numB = b.stopNumber ?? (b.deliverySequence || 9999);
                  return numA - numB;
                });

              if (filteredAreaOrders.length === 0) return null;

            return (
              <div key={area} className="space-y-3">
                {/* Area Cluster Banner */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">
                        {area}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {filteredAreaOrders.length} {filteredAreaOrders.length === 1 ? "Stop" : "Stops"} • Highway / Waypoint Route Order
                      </span>
                    </div>
                  </div>

                  {statusTab === "active" && (
                    <a
                      href={getGoogleMapsRouteUrl(filteredAreaOrders)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-bold transition-all shadow-sm"
                    >
                      <Navigation size={13} className="text-orange-400 fill-current" />
                      <span>Turn-by-Turn Route</span>
                    </a>
                  )}
                </div>

                {/* Orders in Area */}
                {filteredAreaOrders.map((order) => {
                  const isTiffin = order.deliveryType === "tiffin" || order.isSubscription;
                  const isCOD = order.paymentMethod === "cash_on_delivery";
                  const cashAmount = order.collectionAmount ?? order.finalPrice ?? 0;
                  const st = (order.status || "").toLowerCase();
                  const isDelivered = st === "delivered";
                  const isFailed = st === "failed" || st === "cancelled";
                  const isOutForDelivery = st === "outfordelivery" || st === "out_for_delivery";

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:border-slate-700 transition-all"
                    >
                      {/* Top strip indicating delivery type */}
                      <div
                        className={`h-1.5 w-full ${
                          isDelivered
                            ? "bg-emerald-500"
                            : isFailed
                            ? "bg-rose-500"
                            : isTiffin
                            ? "bg-emerald-400"
                            : "bg-blue-500"
                        }`}
                      />

                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Order Header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* ON-THE-WAY ROUTE STOP BADGE */}
                            {order.stopNumber !== undefined && (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm ${
                                  order.stopNumber === 1
                                    ? "bg-emerald-500 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                                    : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                }`}
                              >
                                <Navigation size={12} className={order.stopNumber === 1 ? "text-slate-950 fill-current" : "text-orange-400"} />
                                <span>{order.stopLabel || `Stop #${order.stopNumber}`}</span>
                                {order.stopNumber === 1 && (
                                  <span className="text-[10px] bg-slate-950 text-emerald-300 px-1 py-0.2 rounded font-black ml-0.5">
                                    पहला ड्रॉप
                                  </span>
                                )}
                              </span>
                            )}

                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                              {order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`}
                            </span>

                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                                isTiffin
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {isTiffin ? "🍱 TIFFIN PLAN" : "🍲 DAILY FOOD"}
                            </span>

                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                order.timeSlot === "dinner"
                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {order.timeSlot ? (order.timeSlot === "dinner" ? "🌙 DINNER" : "☀️ LUNCH") : "LUNCH"}
                            </span>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isDelivered
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isFailed
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : isOutForDelivery
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {order.status || "Assigned"}
                          </span>
                        </div>

                        {/* Customer & Address Card */}
                        <div>
                          <h4 className="text-lg font-black text-white">
                            {order.customerName || "Customer"}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-start gap-1.5">
                            <MapPin size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                            <span>
                              {order.address?.street}, {order.address?.city}
                              {order.address?.pincode ? ` - ${order.address.pincode}` : ""}
                            </span>
                          </p>
                        </div>

                        {/* HIGH-VISIBILITY CASH INSTRUCTION BOX (RIDER APP CORE) */}
                        {isCOD ? (
                          isDelivered ? (
                            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                  <CheckCircle size={20} />
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                                    Cash Collected
                                  </span>
                                  <span className="text-base font-black text-emerald-200">
                                    ₹{cashAmount} (In your hand)
                                  </span>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                                Shift Deposit
                              </span>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-amber-950/70 border-2 border-amber-500/60 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                                    <IndianRupee size={22} className="stroke-[2.5]" />
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                                      💰 CASH ON DELIVERY - COLLECT CASH:
                                    </span>
                                    <span className="text-xl font-black text-amber-200">
                                      ₹{cashAmount}
                                    </span>
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase">
                                  Collect Now
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-300/90 font-semibold mt-2 pl-1">
                                ⚠️ Collect exact ₹{cashAmount} cash from customer before handing over food!
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="p-3 bg-blue-950/50 border border-blue-500/40 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                                <ShieldCheck size={20} />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-blue-400 block">
                                  {isTiffin ? "Prepaid Tiffin Subscription" : "Online Paid Order"}
                                </span>
                                <span className="text-sm font-black text-blue-200">
                                  DO NOT COLLECT CASH (₹0)
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">
                              PAID ONLINE
                            </span>
                          </div>
                        )}

                        {/* Customer Quick Action Buttons (Call + Navigation) */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <a
                            href={`tel:${order.phone}`}
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-all"
                          >
                            <Phone size={15} />
                            <span>Call {order.phone || "Customer"}</span>
                          </a>

                          <a
                            href={getGoogleMapsUrl(order.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition-all"
                          >
                            <Navigation size={15} />
                            <span>Navigate {order.stopNumber ? `(Stop #${order.stopNumber})` : 'in Maps'}</span>
                          </a>
                        </div>

                        {/* Items Checklist */}
                        <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                            <Utensils size={13} className="text-orange-400" />
                            <span>Package Items:</span>
                          </div>
                          <div className="text-xs text-slate-300 pl-5 space-y-0.5">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((it, idx) => (
                                <div key={idx} className="font-medium">
                                  <span className="font-bold text-orange-400">{it.quantity}x</span>{" "}
                                  {it.itemName}
                                </div>
                              ))
                            ) : (
                              <div className="italic text-slate-500">Standard meal package</div>
                            )}
                          </div>

                          {order.specialInstructions && (
                            <div className="mt-2 pt-2 border-t border-slate-800 flex items-start gap-1.5 text-xs text-amber-300">
                              <Info size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                              <span className="italic">Note: {order.specialInstructions}</span>
                            </div>
                          )}
                        </div>

                        {/* Delivery Workflow Action Buttons */}
                        {!isDelivered && !isFailed && (
                          <div className="pt-2 border-t border-slate-800 space-y-2">
                            {/* If assigned/pending, option to start delivery */}
                            {!isOutForDelivery && (
                              <button
                                onClick={() => handleStartDelivery(order.id)}
                                disabled={actionLoadingId === order.id}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-50"
                              >
                                <Bike size={18} />
                                <span>Pick Up & Start Delivery</span>
                              </button>
                            )}

                            {/* Mark Delivered button */}
                            <button
                              onClick={() => handleMarkDelivered(order)}
                              disabled={actionLoadingId === order.id}
                              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle size={20} />
                              <span>
                                {isCOD ? `Collect ₹${cashAmount} & Mark Delivered` : "Confirm Handover & Mark Delivered"}
                              </span>
                            </button>

                            {/* Report failure */}
                            <button
                              onClick={() => setFailureModalOrder(order)}
                              disabled={actionLoadingId === order.id}
                              className="w-full py-2 text-center text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            >
                              ⚠️ Report Issue / Could Not Deliver
                            </button>
                          </div>
                        )}

                        {/* Delivered timestamp */}
                        {isDelivered && (
                          <div className="pt-2 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                            <CheckCircle size={15} />
                            <span>Delivered successfully</span>
                          </div>
                        )}

                        {/* Failed reason display */}
                        {isFailed && (
                          <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                            <span className="font-bold">Issue Reported: </span>
                            <span>{order.failureReason || "Could not deliver package"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </main>

      {/* 5. CASH HANDOVER / SHIFT BREAKDOWN MODAL */}
      {showHisaabModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  End of Shift Settlement
                </span>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Receipt size={18} className="text-emerald-400" />
                  <span>Cash Handover Hisaab</span>
                </h3>
              </div>
              <button
                onClick={() => setShowHisaabModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Total Highlight */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-slate-900 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                    Total Cash in Hand to Deposit:
                  </span>
                  <div className="text-3xl font-black text-white mt-0.5">
                    ₹{calculatedFinancials.cashCollected.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Orders:</span>
                  <span className="text-base font-bold text-slate-200">
                    {codDeliveredOrders.length} COD Paid
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-2">
                Hand over this exact amount to the Tommalu dispatch manager or cashier.
              </p>
            </div>

            {/* Orders List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {codDeliveredOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No COD orders delivered yet in this shift.
                </div>
              ) : (
                codDeliveredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-300">
                          {ord.orderNumber || `#${ord.id.slice(-6).toUpperCase()}`}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {ord.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {ord.address?.street}, {ord.address?.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400">
                        ₹{ord.collectionAmount ?? ord.finalPrice ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500 block">COD Paid</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <button
                onClick={() => setShowHisaabModal(false)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Done / Close Hisaab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REPORT DELIVERY ISSUE MODAL */}
      {failureModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold text-white">Report Delivery Issue</h3>
              </div>
              <button
                onClick={() => setFailureModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Order: <span className="text-white font-bold">{failureModalOrder.orderNumber}</span> (
              {failureModalOrder.customerName})
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Select Reason:</label>
              {[
                "Customer not reachable / Phone switched off",
                "Incorrect / Incomplete delivery address",
                "Customer refused to accept / Cancelled at door",
                "Door locked / Nobody at premises",
                "Severe weather / Road blocked",
                "Other",
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFailureReason(r)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    failureReason === r
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {r}
                </button>
              ))}

              {failureReason === "Other" && (
                <textarea
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 mt-2"
                  placeholder="Type specific issue reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFailureModalOrder(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFailure}
                disabled={!failureReason || (failureReason === "Other" && !customReason.trim())}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Submit Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
