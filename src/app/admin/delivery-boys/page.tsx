'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient, { handleApiError } from '@/lib/axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { 
    useAdminHomemadeFoodOrders, 
    useUpdateHomemadeFoodOrderStatus 
} from '@/hooks/api';
import { useQueryClient } from '@tanstack/react-query';
import { 
    Bike, Users, ShoppingBag, CheckCircle2, Clock, MapPin, 
    Phone, PlusCircle, Power, PowerOff, Edit, Search, 
    Sun, Moon, DollarSign, AlertCircle, Check, RefreshCw, 
    Share2, ExternalLink, ArrowRight, PackageCheck, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DeliveryBoy {
    _id: string;
    name: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
}

export default function DeliveryManagementPage() {
    const queryClient = useQueryClient();

    // 1. Delivery boys state
    const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
    const [isBoysLoading, setIsBoysLoading] = useState(true);
    const [boysError, setBoysError] = useState<string | null>(null);

    // 2. Real Orders from backend
    const { 
        data: ordersData, 
        isLoading: isOrdersLoading, 
        refetch: refetchOrders 
    } = useAdminHomemadeFoodOrders({ limit: 100 });

    const updateOrderStatus = useUpdateHomemadeFoodOrderStatus();

    // Modals & Form states for Delivery Boys
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBoy, setEditingBoy] = useState<DeliveryBoy | null>(null);

    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Live order filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [slotFilter, setSlotFilter] = useState('all');
    const [riderFilter, setRiderFilter] = useState('all');

    // Fetch delivery boys
    const fetchDeliveryBoys = async () => {
        setIsBoysLoading(true);
        setBoysError(null);
        try {
            const response = await apiClient.get('/delivery-boys');
            setDeliveryBoys(response.data.data || []);
        } catch (err) {
            setBoysError(handleApiError(err));
        } finally {
            setIsBoysLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveryBoys();
    }, []);

    const resetBoyForm = () => {
        setFormName('');
        setFormPhone('');
        setFormPassword('');
        setEditingBoy(null);
    };

    const handleAddBoySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/delivery-boys', { 
                name: formName.trim(), 
                phone: formPhone.trim(), 
                password: formPassword.trim() 
            });
            toast.success("Delivery boy added successfully!");
            setIsAddModalOpen(false);
            resetBoyForm();
            fetchDeliveryBoys();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditBoyClick = (boy: DeliveryBoy) => {
        setEditingBoy(boy);
        setFormName(boy.name);
        setFormPhone(boy.phone);
        setFormPassword('');
        setIsEditModalOpen(true);
    };

    const handleEditBoySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBoy) return;
        setIsSubmitting(true);
        try {
            const payload: any = { name: formName.trim(), phone: formPhone.trim() };
            if (formPassword.trim()) payload.password = formPassword.trim();
            
            await apiClient.put(`/delivery-boys/${editingBoy._id}`, payload);
            toast.success("Delivery boy updated successfully!");
            setIsEditModalOpen(false);
            resetBoyForm();
            fetchDeliveryBoys();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleBoyStatus = async (boy: DeliveryBoy) => {
        try {
            if (boy.isActive !== false) {
                await apiClient.delete(`/delivery-boys/${boy._id}`);
                toast.success(`${boy.name} deactivated`);
            } else {
                await apiClient.put(`/delivery-boys/${boy._id}`, { isActive: true });
                toast.success(`${boy.name} activated`);
            }
            fetchDeliveryBoys();
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    // Orders parsing & live metrics
    const allOrders = useMemo(() => {
        return ordersData?.data || [];
    }, [ordersData]);

    const activeDeliveryBoys = useMemo(() => {
        return deliveryBoys.filter(b => b.isActive !== false);
    }, [deliveryBoys]);

    // Fast rider map: id -> boy
    const riderMap = useMemo(() => {
        const map = new Map<string, DeliveryBoy>();
        deliveryBoys.forEach(b => map.set(b._id, b));
        return map;
    }, [deliveryBoys]);

    // Live order stats
    const outForDeliveryCount = allOrders.filter((o: any) => 
        ['out_for_delivery', 'outfordelivery'].includes((o.status || '').toLowerCase())
    ).length;

    const readyForDispatchCount = allOrders.filter((o: any) => 
        ['accepted', 'confirmed', 'preparing', 'ready'].includes((o.status || '').toLowerCase())
    ).length;

    const deliveredCount = allOrders.filter((o: any) => 
        (o.status || '').toLowerCase() === 'delivered'
    ).length;

    const codCollectedTotal = allOrders.reduce((sum: number, o: any) => {
        if ((o.status || '').toLowerCase() === 'delivered' && o.paymentMethod === 'cash_on_delivery') {
            return sum + (Number(o.totalAmount || o.amount) || 0);
        }
        return sum;
    }, 0);

    // Filtered orders list
    const filteredOrders = useMemo(() => {
        return allOrders.filter((order: any) => {
            const customerName = (order.customer?.name || order.name || '').toLowerCase();
            const phone = (order.customer?.phone || order.phone || '');
            const area = (order.deliveryAddress?.area || order.area || '').toLowerCase();
            const orderNum = (order.orderNumber || '').toLowerCase();
            const q = searchQuery.toLowerCase();

            const matchesSearch = !q || customerName.includes(q) || phone.includes(q) || area.includes(q) || orderNum.includes(q);

            const status = (order.status || '').toLowerCase();
            const matchesStatus = statusFilter === 'all' ? true :
                statusFilter === 'pending_dispatch' ? ['accepted', 'confirmed', 'preparing', 'ready'].includes(status) :
                statusFilter === 'out_for_delivery' ? ['out_for_delivery', 'outfordelivery'].includes(status) :
                statusFilter === 'delivered' ? status === 'delivered' :
                statusFilter === 'new' ? ['new', 'pending'].includes(status) : true;

            const slot = (order.mealType || order.slot || '').toLowerCase();
            const matchesSlot = slotFilter === 'all' ? true : slot === slotFilter.toLowerCase();

            const assignedBoyId = order.assignedTo || order.deliveryBoy || '';
            const matchesRider = riderFilter === 'all' ? true :
                riderFilter === 'unassigned' ? !assignedBoyId :
                assignedBoyId === riderFilter;

            return matchesSearch && matchesStatus && matchesSlot && matchesRider;
        });
    }, [allOrders, searchQuery, statusFilter, slotFilter, riderFilter]);

    // Area clusters calculation
    const areaClusters = useMemo(() => {
        const map: Record<string, { totalOrders: number; plates: number; pending: number; out: number; delivered: number }> = {};
        allOrders.forEach((o: any) => {
            const area = (o.deliveryAddress?.area || o.area || o.deliveryAddress?.city || 'Jaipur').trim();
            if (!map[area]) {
                map[area] = { totalOrders: 0, plates: 0, pending: 0, out: 0, delivered: 0 };
            }
            map[area].totalOrders += 1;
            map[area].plates += (Number(o.plates || o.quantity) || 1);
            const st = (o.status || '').toLowerCase();
            if (['new', 'pending', 'accepted', 'preparing', 'ready'].includes(st)) map[area].pending += 1;
            else if (['out_for_delivery', 'outfordelivery'].includes(st)) map[area].out += 1;
            else if (st === 'delivered') map[area].delivered += 1;
        });
        return Object.entries(map).sort((a, b) => b[1].totalOrders - a[1].totalOrders);
    }, [allOrders]);

    // Handle Quick Rider Assignment
    const handleAssignRider = (orderId: string, boyId: string, currentStatus: string) => {
        const newStatus = (currentStatus || '').toLowerCase() === 'preparing' || (currentStatus || '').toLowerCase() === 'accepted'
            ? 'out_for_delivery' 
            : currentStatus;

        updateOrderStatus.mutate({
            id: orderId,
            data: { 
                status: newStatus as any, 
                assignedTo: boyId === 'unassign' ? null : boyId,
                adminNotes: boyId === 'unassign' ? 'Unassigned rider' : `Assigned rider ID ${boyId}`
            }
        }, {
            onSuccess: () => {
                toast.success("Rider assigned & dispatched!");
                refetchOrders();
            },
            onError: () => toast.error("Failed to assign rider")
        });
    };

    // Quick status updater (e.g. Mark Delivered)
    const handleQuickStatusUpdate = (orderId: string, newStatus: string) => {
        updateOrderStatus.mutate({
            id: orderId,
            data: { status: newStatus as any }
        }, {
            onSuccess: () => {
                toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
                refetchOrders();
            },
            onError: () => toast.error("Failed to update status")
        });
    };

    const getStatusBadge = (status: string) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'NEW':
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">New Order</Badge>;
            case 'ACCEPTED':
            case 'CONFIRMED':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>;
            case 'PREPARING':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Kitchen Ready</Badge>;
            case 'OUT_FOR_DELIVERY':
            case 'OUTFORDELIVERY':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">On The Road</Badge>;
            case 'DELIVERED':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Delivered</Badge>;
            case 'CANCELLED':
            case 'REJECTED':
                return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header & Global Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                            <Bike className="w-5 h-5" />
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                            Delivery & Fleet Operations
                        </h1>
                    </div>
                    <p className="text-stone-500 text-xs sm:text-sm">
                        Live order dispatching, rider assignment, area clusters, and delivery fleet management.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            fetchDeliveryBoys();
                            refetchOrders();
                            toast.success("Delivery data refreshed");
                        }}
                        className="cursor-pointer border-stone-200 text-stone-700 hover:bg-stone-50"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
                    </Button>

                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                            const deliveryUrl = `${baseUrl}/delivery/login`;
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(deliveryUrl);
                                toast.success("Delivery App link copied: " + deliveryUrl);
                            }
                        }}
                        className="cursor-pointer border-orange-200 text-orange-700 hover:bg-orange-50 font-bold"
                        title="Copy Driver App URL"
                    >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                        Rider App Link
                    </Button>

                    <Button 
                        size="sm" 
                        onClick={() => {
                            resetBoyForm();
                            setIsAddModalOpen(true);
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4 mr-1.5" />
                        Add Delivery Boy
                    </Button>
                </div>
            </div>

            {/* Dynamic Real-time Operational KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Active Fleet */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Active Fleet (Riders)
                            </span>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Users className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-stone-900">
                            {isBoysLoading ? "..." : activeDeliveryBoys.length}
                        </div>
                        <p className="text-xs text-stone-500 font-medium mt-1">
                            {deliveryBoys.length} Total registered riders
                        </p>
                    </CardContent>
                </Card>

                {/* 2. On the Road */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Out for Delivery Now
                            </span>
                            <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                <Bike className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-orange-600">
                            {isOrdersLoading ? "..." : outForDeliveryCount}
                        </div>
                        <p className="text-xs text-orange-700 font-medium mt-1">
                            Active dispatches on the road
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Ready for Dispatch */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Ready for Dispatch
                            </span>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Clock className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-purple-950">
                            {isOrdersLoading ? "..." : readyForDispatchCount}
                        </div>
                        <p className="text-xs text-stone-500 font-medium mt-1">
                            Cooked & waiting for rider pickup
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Delivered Today */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                Delivered Today
                            </span>
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <PackageCheck className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                            {isOrdersLoading ? "..." : deliveredCount}
                        </div>
                        <p className="text-xs text-stone-500 font-medium mt-1">
                            COD collected: <strong>₹{codCollectedTotal.toLocaleString('en-IN')}</strong>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs Container */}
            <Tabs defaultValue="dispatches" className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-100/80 p-2 rounded-2xl border border-stone-200/80 mb-4">
                    <TabsList className="bg-transparent p-0 gap-1.5 flex-wrap">
                        <TabsTrigger 
                            value="dispatches" 
                            className="data-[state=active]:bg-white data-[state=active]:text-orange-950 data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                            <Bike className="w-4 h-4 mr-1.5 text-orange-600" />
                            Live Dispatches & Orders ({filteredOrders.length})
                        </TabsTrigger>

                        <TabsTrigger 
                            value="riders" 
                            className="data-[state=active]:bg-white data-[state=active]:text-blue-950 data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                            <Users className="w-4 h-4 mr-1.5 text-blue-600" />
                            Delivery Riders Fleet ({deliveryBoys.length})
                        </TabsTrigger>

                        <TabsTrigger 
                            value="clusters" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                            <Layers className="w-4 h-4 mr-1.5 text-stone-700" />
                            Area Clusters ({areaClusters.length})
                        </TabsTrigger>
                    </TabsList>

                    <div className="text-xs text-stone-500 font-medium px-2">
                        Live Data Connected
                    </div>
                </div>

                {/* ============================================================== */}
                {/* TAB 1: LIVE DISPATCHES & ORDER ASSIGNMENTS                     */}
                {/* ============================================================== */}
                <TabsContent value="dispatches" className="space-y-4 mt-0">
                    <Card className="border-stone-200 shadow-2xs">
                        <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                                {/* Search */}
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    <Input 
                                        placeholder="Search customer, phone, area, order #..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 text-xs sm:text-sm h-9 border-stone-200"
                                    />
                                </div>

                                {/* Multi Filters */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-36 h-9 text-xs border-stone-200 bg-white">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending_dispatch">Ready in Kitchen</SelectItem>
                                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="new">New / Pending</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Slot Filter */}
                                    <Select value={slotFilter} onValueChange={setSlotFilter}>
                                        <SelectTrigger className="w-32 h-9 text-xs border-stone-200 bg-white">
                                            <SelectValue placeholder="Slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Slots</SelectItem>
                                            <SelectItem value="lunch">☀️ Lunch</SelectItem>
                                            <SelectItem value="dinner">🌙 Dinner</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Rider Filter */}
                                    <Select value={riderFilter} onValueChange={setRiderFilter}>
                                        <SelectTrigger className="w-40 h-9 text-xs border-stone-200 bg-white">
                                            <SelectValue placeholder="Rider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Riders</SelectItem>
                                            <SelectItem value="unassigned">⚠️ Unassigned</SelectItem>
                                            {activeDeliveryBoys.map(boy => (
                                                <SelectItem key={boy._id} value={boy._id}>
                                                    🛵 {boy.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="px-4 sm:px-5 pb-5">
                            {isOrdersLoading ? (
                                <div className="py-12 text-center text-stone-400">
                                    <Bike className="w-8 h-8 animate-bounce mx-auto mb-2 text-orange-500" />
                                    <p className="text-xs">Loading live dispatch orders...</p>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-12 text-stone-400">
                                    <Bike className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                                    <p className="font-bold text-stone-700">No orders matching criteria</p>
                                    <p className="text-xs text-stone-400 mt-1">Try resetting filters or search terms.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredOrders.map((order: any) => {
                                        const orderId = order.id || order._id;
                                        const customerName = order.customer?.name || order.name || 'Customer';
                                        const customerPhone = order.customer?.phone || order.phone || '';
                                        const address = order.deliveryAddress?.street || order.deliveryAddress?.area || order.area || 'Jaipur';
                                        const areaName = order.deliveryAddress?.area || order.area || 'Local Area';
                                        const slot = order.mealType || order.slot || 'Meal';
                                        const isLunch = slot.toLowerCase() === 'lunch';
                                        const plates = Number(order.plates || order.quantity) || 1;
                                        const amount = Number(order.totalAmount || order.amount) || 0;
                                        const isCod = order.paymentMethod === 'cash_on_delivery';
                                        const statusStr = (order.status || '').toLowerCase();
                                        const assignedBoyId = order.assignedTo || order.deliveryBoy;
                                        const assignedBoy = assignedBoyId ? riderMap.get(assignedBoyId) : null;

                                        return (
                                            <div 
                                                key={orderId}
                                                className="p-4 rounded-xl border border-stone-200/90 bg-white hover:border-orange-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs"
                                            >
                                                {/* Left Column: Customer & Delivery Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="font-bold text-stone-900 text-sm">
                                                            {customerName}
                                                        </span>
                                                        {customerPhone && (
                                                            <div className="flex items-center gap-1">
                                                                <a 
                                                                    href={`tel:${customerPhone}`}
                                                                    className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded"
                                                                >
                                                                    <Phone className="w-3 h-3" /> {customerPhone}
                                                                </a>
                                                                <a 
                                                                    href={`https://wa.me/91${customerPhone}?text=${encodeURIComponent(`Hello ${customerName}, your Tommalu food delivery is on the way!`)}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                                                    title="Message Customer on WhatsApp"
                                                                >
                                                                    <Share2 className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        )}
                                                        <Badge variant="outline" className={`text-[10px] font-bold ${
                                                            isLunch 
                                                                ? 'border-amber-200 text-amber-800 bg-amber-50' 
                                                                : 'border-indigo-200 text-indigo-800 bg-indigo-50'
                                                        }`}>
                                                            {isLunch ? '☀️ Lunch' : '🌙 Dinner'}
                                                        </Badge>
                                                        {getStatusBadge(order.status)}
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                                                        <span className="font-extrabold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">
                                                            {plates} {plates > 1 ? 'Plates' : 'Plate'}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="text-stone-700 font-semibold truncate max-w-xs">
                                                            {order.items?.map((it: any) => typeof it === 'string' ? it : it.name).join(', ') || 'Homemade Thali'}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="text-stone-500 font-medium flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                                                            <strong className="text-stone-800">{areaName}:</strong> {address}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Center Column: Rider Assignment */}
                                                <div className="w-full lg:w-64 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                                                        Assigned Rider
                                                    </span>
                                                    <Select 
                                                        value={assignedBoyId || 'unassigned'} 
                                                        onValueChange={(val) => handleAssignRider(orderId, val, order.status)}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs bg-white border-stone-200 font-medium">
                                                            <SelectValue placeholder="Assign Delivery Boy" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned">⚠️ Unassigned</SelectItem>
                                                            {activeDeliveryBoys.map(boy => (
                                                                <SelectItem key={boy._id} value={boy._id}>
                                                                    🛵 {boy.name} ({boy.phone})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {assignedBoy && (
                                                        <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                                                            <span>Phone: {assignedBoy.phone}</span>
                                                            <a 
                                                                href={`https://wa.me/91${assignedBoy.phone}?text=${encodeURIComponent(`🚚 New Delivery Assigned:\nCustomer: ${customerName}\nPhone: ${customerPhone}\nAddress: ${address}\nPlates: ${plates}\nCollect: ${isCod ? `₹${amount}` : 'PAID (No cash)'}`)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                                                            >
                                                                Send on WhatsApp
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Column: Collection & Quick Action Buttons */}
                                                <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                                                    <div className="text-left lg:text-right">
                                                        <div className="text-base font-black text-stone-900">
                                                            ₹{amount.toLocaleString('en-IN')}
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                                            isCod 
                                                                ? 'bg-amber-100 text-amber-900' 
                                                                : 'bg-emerald-50 text-emerald-700'
                                                        }`}>
                                                            {isCod ? 'Collect Cash (COD)' : 'Paid Online'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {/* If not out for delivery yet, one click Dispatch */}
                                                        {['accepted', 'confirmed', 'preparing', 'ready'].includes(statusStr) && (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-8 cursor-pointer shadow-2xs"
                                                                onClick={() => handleQuickStatusUpdate(orderId, 'out_for_delivery')}
                                                                disabled={updateOrderStatus.isPending}
                                                            >
                                                                <Bike className="w-3.5 h-3.5 mr-1" /> Dispatch
                                                            </Button>
                                                        )}

                                                        {/* If out for delivery, mark delivered */}
                                                        {['out_for_delivery', 'outfordelivery'].includes(statusStr) && (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer shadow-2xs"
                                                                onClick={() => handleQuickStatusUpdate(orderId, 'delivered')}
                                                                disabled={updateOrderStatus.isPending}
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Delivered
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 2: DELIVERY RIDERS FLEET MANAGEMENT                        */}
                {/* ============================================================== */}
                <TabsContent value="riders" className="space-y-4 mt-0">
                    <Card className="border-stone-200 shadow-2xs">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    Active Delivery Personnel ({deliveryBoys.length})
                                </CardTitle>
                                <CardDescription className="text-xs text-stone-500">
                                    Manage rider credentials, status, and send WhatsApp login invitations.
                                </CardDescription>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => {
                                    resetBoyForm();
                                    setIsAddModalOpen(true);
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
                            >
                                <PlusCircle className="w-4 h-4 mr-1.5" />
                                Add Rider
                            </Button>
                        </CardHeader>

                        <CardContent>
                            {isBoysLoading ? (
                                <div className="py-8 text-center text-stone-400">
                                    <Bike className="w-8 h-8 animate-spin mx-auto mb-2 text-stone-300" />
                                    <span className="text-xs">Loading delivery boys...</span>
                                </div>
                            ) : deliveryBoys.length === 0 ? (
                                <div className="text-center py-10 text-stone-400 text-xs">
                                    No delivery riders registered. Click "Add Rider" above to register your first delivery boy!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {deliveryBoys.map((boy) => {
                                        const assignedOrders = allOrders.filter((o: any) => 
                                            (o.assignedTo === boy._id || o.deliveryBoy === boy._id) &&
                                            ['out_for_delivery', 'outfordelivery'].includes((o.status || '').toLowerCase())
                                        );
                                        const deliveredOrdersCount = allOrders.filter((o: any) => 
                                            (o.assignedTo === boy._id || o.deliveryBoy === boy._id) &&
                                            (o.status || '').toLowerCase() === 'delivered'
                                        ).length;

                                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                                        const loginUrl = `${baseUrl}/delivery/login`;
                                        const whatsappMsg = `🚚 *Tommalu Delivery Portal Login*\n\nHello *${boy.name}*,\nLogin to your rider dashboard to see assigned deliveries:\n🔗 ${loginUrl}\n📱 Registered Mobile: ${boy.phone}\n\nPlease bookmark this on your phone screen!`;

                                        return (
                                            <div 
                                                key={boy._id}
                                                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-orange-300 transition-all shadow-2xs flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                                {boy.name.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-stone-900 text-sm leading-tight">{boy.name}</h4>
                                                                <a href={`tel:${boy.phone}`} className="text-xs text-stone-500 hover:text-orange-600 flex items-center gap-1">
                                                                    <Phone className="w-3 h-3 text-stone-400" /> {boy.phone}
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <Badge 
                                                            className={boy.isActive !== false 
                                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold" 
                                                                : "bg-stone-100 text-stone-600 border-stone-200"
                                                            }
                                                        >
                                                            {boy.isActive !== false ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 my-3 text-center">
                                                        <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                                                            <span className="text-[10px] font-bold text-stone-400 block uppercase">On Road Now</span>
                                                            <span className="text-base font-black text-orange-600">{assignedOrders.length}</span>
                                                        </div>
                                                        <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                                                            <span className="text-[10px] font-bold text-stone-400 block uppercase">Delivered</span>
                                                            <span className="text-base font-black text-emerald-700">{deliveredOrdersCount}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
                                                    <a 
                                                        href={`https://wa.me/91${boy.phone}?text=${encodeURIComponent(whatsappMsg)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                        title="Send Rider App Credentials & Link"
                                                    >
                                                        <Share2 className="w-3.5 h-3.5" />
                                                        Share App
                                                    </a>

                                                    <div className="flex items-center gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-stone-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                                            onClick={() => handleEditBoyClick(boy)}
                                                            title="Edit Details"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Button>

                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className={`h-8 w-8 cursor-pointer ${
                                                                boy.isActive !== false 
                                                                    ? "text-stone-400 hover:text-rose-600 hover:bg-rose-50" 
                                                                    : "text-emerald-600 hover:bg-emerald-50"
                                                            }`}
                                                            onClick={() => handleToggleBoyStatus(boy)}
                                                            title={boy.isActive !== false ? "Deactivate Rider" : "Activate Rider"}
                                                        >
                                                            {boy.isActive !== false ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 3: AREA CLUSTERS & BATCHING                                */}
                {/* ============================================================== */}
                <TabsContent value="clusters" className="space-y-4 mt-0">
                    <Card className="border-stone-200 shadow-2xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-orange-600" />
                                Area Clusters & Delivery Batching
                            </CardTitle>
                            <CardDescription className="text-xs text-stone-500">
                                Grouped by customer delivery addresses to easily assign batch deliveries to individual riders.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {areaClusters.length === 0 ? (
                                <div className="text-center py-8 text-stone-400 text-xs">
                                    No active delivery orders to cluster.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {areaClusters.map(([areaName, stats]) => (
                                        <div 
                                            key={areaName}
                                            className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white hover:border-orange-300 transition-all shadow-2xs"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                                                        <MapPin className="w-4 h-4" />
                                                    </span>
                                                    <h4 className="font-bold text-stone-900 text-sm">{areaName}</h4>
                                                </div>
                                                <Badge className="bg-orange-100 text-orange-800 font-bold text-xs">
                                                    {stats.totalOrders} Orders
                                                </Badge>
                                            </div>

                                            <div className="space-y-1 text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/60 my-2">
                                                <div className="flex justify-between font-medium">
                                                    <span>Total Plates in Area:</span>
                                                    <strong className="text-stone-900">{stats.plates} Plates</strong>
                                                </div>
                                                <div className="flex justify-between font-medium">
                                                    <span>Pending Dispatch:</span>
                                                    <strong className="text-amber-700">{stats.pending}</strong>
                                                </div>
                                                <div className="flex justify-between font-medium">
                                                    <span>On The Road:</span>
                                                    <strong className="text-orange-700">{stats.out}</strong>
                                                </div>
                                                <div className="flex justify-between font-medium">
                                                    <span>Delivered:</span>
                                                    <strong className="text-emerald-700">{stats.delivered}</strong>
                                                </div>
                                            </div>

                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    setSearchQuery(areaName);
                                                    const dispatchesTab = document.querySelector('[value="dispatches"]') as HTMLElement;
                                                    if (dispatchesTab) dispatchesTab.click();
                                                }}
                                                className="w-full text-xs font-bold text-orange-600 border-orange-200 hover:bg-orange-50 cursor-pointer h-8"
                                            >
                                                Filter Orders for {areaName} ›
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ============================================================== */}
            {/* ADD DELIVERY BOY MODAL                                         */}
            {/* ============================================================== */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <PlusCircle className="w-5 h-5 text-orange-600" />
                            Add New Delivery Rider
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Register a new delivery boy with login credentials.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddBoySubmit} className="space-y-3.5 mt-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Full Name*</Label>
                            <Input 
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="e.g. Ramesh Kumar"
                                required
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Phone Number (10 digits)*</Label>
                            <Input 
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                placeholder="e.g. 9876543210"
                                required
                                maxLength={10}
                                className="h-9 text-xs"
                            />
                            <span className="text-[10px] text-stone-400">Used as Rider Login ID</span>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Password*</Label>
                            <Input 
                                type="password"
                                value={formPassword}
                                onChange={(e) => setFormPassword(e.target.value)}
                                placeholder="Enter secure password"
                                required
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => setIsAddModalOpen(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Adding..." : "Add Rider"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* EDIT DELIVERY BOY MODAL                                        */}
            {/* ============================================================== */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <Edit className="w-5 h-5 text-blue-600" />
                            Edit Delivery Rider: {editingBoy?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Update rider name, phone, or set a new password.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditBoySubmit} className="space-y-3.5 mt-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Full Name*</Label>
                            <Input 
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Rider Full Name"
                                required
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Phone Number*</Label>
                            <Input 
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                placeholder="10-digit number"
                                required
                                maxLength={10}
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">New Password (Optional)</Label>
                            <Input 
                                type="password"
                                value={formPassword}
                                onChange={(e) => setFormPassword(e.target.value)}
                                placeholder="Leave blank to keep existing password"
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => setIsEditModalOpen(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
