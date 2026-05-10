"use client";

import { useState, useEffect } from "react";
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
  X
} from "lucide-react";

// API Base URL - adjust according to your environment setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type OrderItem = {
  itemName: string;
  quantity: number;
};

type Order = {
  id: string;
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
  specialInstructions?: string;
  source?: string;
  isSubscription?: boolean;
  collectionAmount?: number;
  finalPrice?: number;
};

// Helper function
const getDeliveryToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("deliveryToken");
  }
  return null;
};

export default function DeliveryDashboard() {
  const router = useRouter();
  const [groupedOrders, setGroupedOrders] = useState<Record<string, Order[]>>({});
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState("");
  const [showPwaHint, setShowPwaHint] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<"Pending" | "Delivered">("Pending");
  const [slotFilter, setSlotFilter] = useState<"All" | "lunch" | "dinner">("All");

  useEffect(() => {
    const token = getDeliveryToken();
    if (!token) {
      router.replace("/delivery/login");
      return;
    }

    setIsChecking(false);
    fetchOrders(token);
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  async function fetchOrders(token: string) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders/delivery`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("deliveryToken");
          router.push("/delivery/login");
          return;
        }
        throw new Error(data.message || "Failed to fetch orders");
      }
      
      const fetchedGrouped = data.data || {};
      setGroupedOrders(fetchedGrouped);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (orderId: string) => {
    const token = localStorage.getItem("deliveryToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/delivery/${orderId}/delivered`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Delivered" })
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh orders after successful update
      fetchOrders(token);
    } catch (err) {
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryToken");
    router.push("/delivery/login");
  };

  const allOrders = Object.values(groupedOrders).flat();

  const totalOrders = allOrders.length;
  const totalPending = allOrders.filter(o => ["Pending", "Confirmed", "OutForDelivery"].includes(o.status)).length;
  const totalDelivered = allOrders.filter(o => o.status === "Delivered").length;

  const getGoogleMapsUrl = (address: any) => {
    if (address.locationLink) return address.locationLink;
    const query = `${address.street}, ${address.city}, ${address.pincode}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getGoogleMapsRouteUrl = (areaOrders: Order[]) => {
    // Filter pending orders only for route
    const pendingOrders = areaOrders.filter(o => o.status !== "Delivered");
    if (pendingOrders.length === 0) return "#";
    
    const origin = encodeURIComponent(`${pendingOrders[0].address.street}, ${pendingOrders[0].address.city}`);
    const destination = encodeURIComponent(`${pendingOrders[pendingOrders.length-1].address.street}, ${pendingOrders[pendingOrders.length-1].address.city}`);
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    
    if (pendingOrders.length > 2) {
      const waypoints = pendingOrders.slice(1, -1).map(o => `${o.address.street}, ${o.address.city}`).join('|');
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }
    
    return url;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Partner Dashboard</h1>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* PWA Hint Banner */}
      {showPwaHint && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex justify-between items-center md:hidden">
          <span className="text-xs text-blue-700 font-medium">
            💡 Add to Home Screen for quick access
          </span>
          <button 
            onClick={() => setShowPwaHint(false)}
            className="text-blue-400 hover:text-blue-600 ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900">{totalOrders}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total</span>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-orange-600">{totalPending}</span>
            <span className="text-xs text-orange-600 uppercase tracking-wide mt-1">Pending</span>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-green-600">{totalDelivered}</span>
            <span className="text-xs text-green-600 uppercase tracking-wide mt-1">Done</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Status Filters */}
          <button 
            onClick={() => setStatusFilter("Pending")}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === "Pending" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setStatusFilter("Delivered")}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === "Delivered" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            Delivered
          </button>
          
          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          {/* Slot Filters */}
          <button 
            onClick={() => setSlotFilter("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${slotFilter === "All" ? "bg-orange-100 text-orange-700" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            All
          </button>
          <button 
            onClick={() => setSlotFilter("lunch")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${slotFilter === "lunch" ? "bg-orange-100 text-orange-700" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            <Clock size={14} /> Lunch
          </button>
          <button 
            onClick={() => setSlotFilter("dinner")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${slotFilter === "dinner" ? "bg-orange-100 text-orange-700" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            <Clock size={14} /> Dinner
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {Object.keys(groupedOrders).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any orders assigned to you yet.</p>
          </div>
        ) : (
          Object.entries(groupedOrders).map(([area, areaOrders]) => {
            
            // Apply slot and status filters to the area's orders
            const filteredAreaOrders = areaOrders.filter(order => {
              const statusStr = order.status ? order.status.toLowerCase() : "";
              const matchesStatus = statusFilter === "Pending" 
                ? ["pending", "confirmed", "outfordelivery", "out_for_delivery", "preparing", "ready"].includes(statusStr)
                : statusStr === "delivered";
              const matchesSlot = slotFilter === "All" || (order.timeSlot && order.timeSlot.toLowerCase() === slotFilter.toLowerCase());
              return matchesStatus && matchesSlot;
            });

            // Don't render area section if no orders match the filters
            if (filteredAreaOrders.length === 0) return null;

            return (
              <div key={area} className="space-y-4">
                {/* Area Header */}
                <div className="flex justify-between items-end mb-2 px-1">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center">
                      <MapPin className="h-5 w-5 mr-1.5 text-orange-600" />
                      {area}
                    </h2>
                    <p className="text-sm text-gray-500 ml-6">{filteredAreaOrders.length} Order{filteredAreaOrders.length !== 1 && 's'}</p>
                  </div>
                  <a
                    href={getGoogleMapsRouteUrl(filteredAreaOrders)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-orange-200 text-xs font-semibold rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    Open Route
                  </a>
                </div>

                {/* Area Orders */}
                {filteredAreaOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                    {/* Area Badge indicator on card top edge */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                            order.timeSlot === 'lunch' ? 'bg-orange-100 text-orange-800' : 
                            order.timeSlot === 'dinner' ? 'bg-indigo-100 text-indigo-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.timeSlot ? order.timeSlot.toUpperCase() : "ANY TIME"}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{order.customerName || "Customer"}</h3>
                      
                      <div className="mt-4 space-y-3">
                        <a href={`tel:${order.phone}`} className="flex items-center text-sm text-gray-600 hover:text-orange-600 bg-gray-50 p-2.5 rounded-lg w-full">
                          <Phone className="h-4 w-4 mr-3 text-orange-500 flex-shrink-0" />
                          <span className="font-medium">{order.phone || "No phone provided"}</span>
                        </a>
                        
                        <a href={getGoogleMapsUrl(order.address)} target="_blank" rel="noopener noreferrer" className="flex items-start text-sm text-gray-600 hover:text-orange-600 bg-gray-50 p-2.5 rounded-lg w-full">
                          <MapPin className="h-4 w-4 mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>
                            {order.address.street}, {order.address.city}
                            <br/>
                            <span className="text-gray-400 text-xs mt-1 block">Click to open map</span>
                          </span>
                        </a>

                        <div className="flex items-start text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg w-full">
                          <Utensils className="h-4 w-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                          <div>
                            {order.items.map((item, i) => (
                              <div key={i} className="mb-1">{item.quantity}x {item.itemName}</div>
                            ))}
                          </div>
                        </div>

                        {order.specialInstructions && (
                          <div className="flex items-start text-sm text-gray-600 bg-orange-50/50 border border-orange-100 p-2.5 rounded-lg w-full">
                            <Info className="h-4 w-4 mr-3 mt-0.5 text-orange-500 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-700 block mb-0.5">Special Instructions:</span>
                              <span className="italic">{order.specialInstructions}</span>
                            </div>
                          </div>
                        )}

                        {order.isSubscription && (
                          <div className="flex items-center text-sm font-bold text-green-600 bg-green-50 p-2.5 rounded-lg w-full border border-green-100">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            TIFFIN ✅ - NO CHARGE
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg w-full">
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-3 text-green-600 flex-shrink-0" />
                            <span className="font-bold text-gray-800">
                              {order.isSubscription ? "PAID" : `COLLECT: ₹${order.collectionAmount ?? order.finalPrice ?? 0}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                             {order.source === 'whatsapp_manual' && (
                               <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded uppercase tracking-tighter">WhatsApp</span>
                             )}
                             <span className="font-medium uppercase text-[10px] text-gray-400">
                               {order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : "COD"}
                             </span>
                          </div>
                        </div>
                      </div>

                      {order.status !== "Delivered" && (
                        <div className="mt-5 pt-5 border-t border-gray-100">
                          <button
                            onClick={() => markAsDelivered(order.id)}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Mark as Delivered
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
