'use client';

import { useState, useMemo } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    dispatchApi,
    UnifiedDeliveryItem,
    AreaClusterItem,
    RiderPerformanceItem
} from '@/services/api/dispatch.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Bike, Users, ShoppingBag, CheckCircle2, Clock, MapPin, 
    Phone, PlusCircle, Power, PowerOff, Edit, Search, 
    Sun, Moon, DollarSign, AlertCircle, Check, RefreshCw, 
    ExternalLink, Layers, ArrowRight, X, AlertTriangle, 
    Utensils, Calendar, ShieldCheck, ChevronRight, Sparkles,
    Trash2, ArrowUp, ArrowDown, Navigation, GripVertical
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

    // -------------------------------------------------------------
    // 1. FILTER & SEARCH STATES
    // -------------------------------------------------------------
    const [selectedTab, setSelectedTab] = useState('all_deliveries');
    const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
    const [searchQuery, setSearchQuery] = useState('');
    const [areaFilter, setAreaFilter] = useState('all');
    const [slotFilter, setSlotFilter] = useState('all');
    const [assignedFilter, setAssignedFilter] = useState('all');
    const [riderFilter, setRiderFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // -------------------------------------------------------------
    // 2. SELECTION STATE (BULK OPERATIONS)
    // -------------------------------------------------------------
    const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>([]);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
    const [selectedRiderForBulk, setSelectedRiderForBulk] = useState('');
    const [orderedDeliveries, setOrderedDeliveries] = useState<UnifiedDeliveryItem[]>([]);
    const [reassignWarningData, setReassignWarningData] = useState<{
        count: number;
        riderName: string;
    } | null>(null);

    // -------------------------------------------------------------
    // 3. DIALOG & FORM STATES
    // -------------------------------------------------------------
    // Delivery Boy Modals
    const [isAddBoyModalOpen, setIsAddBoyModalOpen] = useState(false);
    const [isEditBoyModalOpen, setIsEditBoyModalOpen] = useState(false);
    const [editingBoy, setEditingBoy] = useState<DeliveryBoy | null>(null);
    const [boyFormName, setBoyFormName] = useState('');
    const [boyFormPhone, setBoyFormPhone] = useState('');
    const [boyFormPassword, setBoyFormPassword] = useState('');
    const [isBoySubmitting, setIsBoySubmitting] = useState(false);

    // Area Management Modals
    const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
    const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaClusterItem | null>(null);
    const [areaFormName, setAreaFormName] = useState('');
    const [areaFormDisplayName, setAreaFormDisplayName] = useState('');
    const [areaFormLocations, setAreaFormLocations] = useState('');
    const [areaFormPincodes, setAreaFormPincodes] = useState('');
    const [areaFormDescription, setAreaFormDescription] = useState('');
    const [isAreaSubmitting, setIsAreaSubmitting] = useState(false);

    // Single Delivery Detail / Quick Action Modal
    const [viewingDelivery, setViewingDelivery] = useState<UnifiedDeliveryItem | null>(null);
    const [isChangeAreaModalOpen, setIsChangeAreaModalOpen] = useState(false);
    const [targetDeliveryForArea, setTargetDeliveryForArea] = useState<UnifiedDeliveryItem | null>(null);
    const [newAreaValue, setNewAreaValue] = useState('');

    // -------------------------------------------------------------
    // 4. REACT-QUERY API DATA FETCHING
    // -------------------------------------------------------------
    // Unified Dispatch Query
    const { 
        data: dispatchResponse, 
        isLoading: isDispatchLoading, 
        isFetching: isDispatchFetching,
        refetch: refetchDispatch 
    } = useQuery({
        queryKey: ['admin-unified-dispatch', selectedDate, areaFilter, slotFilter, assignedFilter, riderFilter, statusFilter, searchQuery],
        queryFn: () => dispatchApi.getUnifiedDispatch({
            date: selectedDate,
            area: areaFilter,
            slot: slotFilter,
            assigned: assignedFilter,
            riderId: riderFilter,
            status: statusFilter,
            search: searchQuery,
            limit: 200
        }),
        refetchInterval: 30000 // Refresh every 30s for live delivery updates
    });

    // Registered Delivery Boys Query
    const { 
        data: deliveryBoysResponse, 
        isLoading: isBoysLoading, 
        refetch: refetchBoys 
    } = useQuery({
        queryKey: ['admin-delivery-boys'],
        queryFn: async () => {
            const res = await apiClient.get('/delivery-boys');
            return res.data;
        }
    });

    // Area Clusters Query
    const { 
        data: areasResponse, 
        isLoading: isAreasLoading, 
        refetch: refetchAreas 
    } = useQuery({
        queryKey: ['admin-area-clusters'],
        queryFn: () => dispatchApi.getAreas()
    });

    // Rider Performance Query
    const { 
        data: performanceResponse, 
        isLoading: isPerformanceLoading, 
        refetch: refetchPerformance 
    } = useQuery({
        queryKey: ['admin-rider-performance', selectedDate],
        queryFn: () => dispatchApi.getRiderPerformance(selectedDate)
    });

    // -------------------------------------------------------------
    // 5. EXTRACT & MEMOIZE DATA
    // -------------------------------------------------------------
    const rawDeliveries: UnifiedDeliveryItem[] = useMemo(() => {
        const list = [...(dispatchResponse?.data || [])];
        return list.sort((a, b) => {
            const seqA = a.deliverySequence || 0;
            const seqB = b.deliverySequence || 0;
            if (seqA > 0 && seqB > 0) return seqA - seqB;
            if (seqA > 0) return -1;
            if (seqB > 0) return 1;
            return 0;
        });
    }, [dispatchResponse]);

    const stats = useMemo(() => {
        return dispatchResponse?.statistics || {
            totalToday: 0,
            unassignedToday: 0,
            assignedToday: 0,
            outForDeliveryToday: 0,
            deliveredToday: 0,
            failedToday: 0,
            activeRidersCount: 0,
            dailyOrdersCount: 0,
            tiffinDeliveriesCount: 0
        };
    }, [dispatchResponse]);

    const deliveryBoys: DeliveryBoy[] = useMemo(() => {
        return deliveryBoysResponse?.data || [];
    }, [deliveryBoysResponse]);

    const activeRiders = useMemo(() => {
        return deliveryBoys.filter(b => b.isActive !== false);
    }, [deliveryBoys]);

    const areaClusters: AreaClusterItem[] = useMemo(() => {
        return areasResponse?.data || [];
    }, [areasResponse]);

    const riderPerformance: RiderPerformanceItem[] = useMemo(() => {
        return performanceResponse?.data || [];
    }, [performanceResponse]);

    // Separate tab subsets
    const dailyDeliveries = useMemo(() => {
        return rawDeliveries.filter(d => d.deliveryType === 'daily');
    }, [rawDeliveries]);

    const tiffinDeliveries = useMemo(() => {
        return rawDeliveries.filter(d => d.deliveryType === 'tiffin');
    }, [rawDeliveries]);

    // Area-wise grouping for Area Dispatch Tab
    const groupedByArea = useMemo(() => {
        const map = new Map<string, UnifiedDeliveryItem[]>();
        rawDeliveries.forEach(d => {
            const a = d.area || 'Area Not Assigned';
            if (!map.has(a)) map.set(a, []);
            map.get(a)!.push(d);
        });
        return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
    }, [rawDeliveries]);

    // Selected delivery objects
    const selectedDeliveries = useMemo(() => {
        const idSet = new Set(selectedDeliveryIds);
        return rawDeliveries.filter(d => idSet.has(d.id));
    }, [rawDeliveries, selectedDeliveryIds]);

    // Refresh all operations data
    const handleRefreshAll = () => {
        refetchDispatch();
        refetchBoys();
        refetchAreas();
        refetchPerformance();
        toast.success("Dispatch data refreshed!");
    };

    // -------------------------------------------------------------
    // 6. MUTATIONS (BULK ASSIGN, UNASSIGN, TIFFIN GEN)
    // -------------------------------------------------------------
    // Trigger Tiffin Generation
    const generateTiffinsMutation = useMutation({
        mutationFn: (date: string) => dispatchApi.triggerTiffinGeneration(date),
        onSuccess: (data) => {
            toast.success(data.message || "Tiffin deliveries generated for today!");
            refetchDispatch();
            refetchAreas();
        },
        onError: (err) => {
            toast.error(handleApiError(err));
        }
    });

    // Bulk Assign Mutation with Stop Sequence
    const bulkAssignMutation = useMutation({
        mutationFn: ({ boyId, items, confirmReassign }: { boyId: string; items: any[]; confirmReassign?: boolean }) => 
            dispatchApi.bulkAssign({
                deliveryBoyId: boyId,
                deliveries: items.map((d, index) => ({ 
                    id: d.id, 
                    type: d.deliveryType, 
                    sourceModel: d.sourceModel,
                    deliverySequence: (d.deliverySequence !== undefined && d.deliverySequence > 0) ? d.deliverySequence : (index + 1)
                })),
                confirmReassign
            }),
        onSuccess: (data) => {
            if (data.requiresConfirmation) {
                setReassignWarningData({
                    count: data.alreadyAssignedCount,
                    riderName: data.targetRiderName
                });
                return;
            }
            toast.success(data.message || "Deliveries assigned with route sequence successfully!");
            setSelectedDeliveryIds([]);
            setIsBulkAssignModalOpen(false);
            setReassignWarningData(null);
            setSelectedRiderForBulk('');
            refetchDispatch();
            refetchAreas();
            refetchPerformance();
        },
        onError: (err) => {
            toast.error(handleApiError(err));
        }
    });

    // Update Delivery Stop Sequence Mutation (Admin instant sequence edit)
    const updateSequenceMutation = useMutation({
        mutationFn: (sequences: Array<{ id: string; sourceModel: any; deliverySequence: number }>) =>
            dispatchApi.updateDeliverySequence(sequences),
        onSuccess: (data) => {
            toast.success(data.message || "Route stop sequence updated!");
            refetchDispatch();
        },
        onError: (err) => {
            toast.error(handleApiError(err));
        }
    });

    // Helper: Open Bulk Assign Modal with initialized sequence
    const handleOpenBulkAssignModal = (itemsToAssign?: UnifiedDeliveryItem[]) => {
        const items = itemsToAssign || selectedDeliveries;
        if (items.length === 0) return;
        // Sort items by existing sequence if available
        const sorted = [...items].sort((a, b) => {
            const seqA = a.deliverySequence || 0;
            const seqB = b.deliverySequence || 0;
            if (seqA > 0 && seqB > 0) return seqA - seqB;
            if (seqA > 0) return -1;
            if (seqB > 0) return 1;
            return 0;
        });
        const indexed = sorted.map((item, idx) => ({
            ...item,
            deliverySequence: item.deliverySequence && item.deliverySequence > 0 ? item.deliverySequence : (idx + 1)
        }));
        setOrderedDeliveries(indexed);
        setReassignWarningData(null);
        setIsBulkAssignModalOpen(true);
    };

    // Helper: Move stop up or down in sequence
    const handleMoveDelivery = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= orderedDeliveries.length) return;
        const newArr = [...orderedDeliveries];
        const [moved] = newArr.splice(index, 1);
        newArr.splice(targetIndex, 0, moved);
        const reindexed = newArr.map((item, idx) => ({
            ...item,
            deliverySequence: idx + 1
        }));
        setOrderedDeliveries(reindexed);
    };

    // Helper: Update specific stop number manually in bulk assign modal
    const handleSetStopNumber = (index: number, val: number) => {
        const newArr = [...orderedDeliveries];
        newArr[index] = {
            ...newArr[index],
            deliverySequence: Math.max(1, val)
        };
        setOrderedDeliveries(newArr);
    };

    // Helper: Admin directly edits delivery stop sequence inline in any table row
    const handleDirectSequenceChange = (delivery: UnifiedDeliveryItem, newSeq: number) => {
        const currentSeq = delivery.deliverySequence || 0;
        if (newSeq === currentSeq) return;
        updateSequenceMutation.mutate([{
            id: delivery.id,
            sourceModel: delivery.sourceModel,
            deliverySequence: newSeq
        }]);
    };

    // Bulk Unassign Mutation
    const bulkUnassignMutation = useMutation({
        mutationFn: (items: any[]) => 
            dispatchApi.bulkUnassign(items.map(d => ({ id: d.id, type: d.deliveryType, sourceModel: d.sourceModel }))),
        onSuccess: (data) => {
            toast.success(data.message || "Deliveries unassigned!");
            setSelectedDeliveryIds([]);
            refetchDispatch();
            refetchAreas();
        },
        onError: (err) => toast.error(handleApiError(err))
    });

    // Assign Area Mutation
    const assignAreaMutation = useMutation({
        mutationFn: (payload: { id: string; sourceModel: string; area: string }) =>
            dispatchApi.assignArea(payload),
        onSuccess: () => {
            toast.success("Area assigned successfully!");
            setIsChangeAreaModalOpen(false);
            setTargetDeliveryForArea(null);
            refetchDispatch();
            refetchAreas();
        },
        onError: (err) => toast.error(handleApiError(err))
    });

    // -------------------------------------------------------------
    // 7. SELECTION HANDLERS
    // -------------------------------------------------------------
    const toggleSelectDelivery = (id: string) => {
        setSelectedDeliveryIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAllInView = (items: UnifiedDeliveryItem[]) => {
        const itemIds = items.map(i => i.id);
        const allSelected = itemIds.every(id => selectedDeliveryIds.includes(id));
        if (allSelected) {
            setSelectedDeliveryIds(prev => prev.filter(id => !itemIds.includes(id)));
        } else {
            setSelectedDeliveryIds(prev => Array.from(new Set([...prev, ...itemIds])));
        }
    };

    const handleSelectAllInArea = (areaDeliveries: UnifiedDeliveryItem[]) => {
        const ids = areaDeliveries.map(d => d.id);
        const allInAreaSelected = ids.every(id => selectedDeliveryIds.includes(id));
        if (allInAreaSelected) {
            setSelectedDeliveryIds(prev => prev.filter(id => !ids.includes(id)));
        } else {
            setSelectedDeliveryIds(prev => Array.from(new Set([...prev, ...ids])));
        }
    };

    const handleQuickAssignSingle = (delivery: UnifiedDeliveryItem, boyId: string) => {
        bulkAssignMutation.mutate({
            boyId,
            items: [delivery],
            confirmReassign: true
        });
    };

    // -------------------------------------------------------------
    // 8. DELIVERY BOY CRUD HANDLERS
    // -------------------------------------------------------------
    const handleAddBoySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBoySubmitting(true);
        try {
            await apiClient.post('/delivery-boys', {
                name: boyFormName.trim(),
                phone: boyFormPhone.trim(),
                password: boyFormPassword.trim()
            });
            toast.success("Delivery boy added successfully!");
            setIsAddBoyModalOpen(false);
            setBoyFormName('');
            setBoyFormPhone('');
            setBoyFormPassword('');
            refetchBoys();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsBoySubmitting(false);
        }
    };

    const handleEditBoySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBoy) return;
        setIsBoySubmitting(true);
        try {
            const payload: any = { name: boyFormName.trim(), phone: boyFormPhone.trim() };
            if (boyFormPassword.trim()) payload.password = boyFormPassword.trim();
            await apiClient.put(`/delivery-boys/${editingBoy._id}`, payload);
            toast.success("Delivery boy updated successfully!");
            setIsEditBoyModalOpen(false);
            setEditingBoy(null);
            refetchBoys();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsBoySubmitting(false);
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
            refetchBoys();
            refetchDispatch();
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    // -------------------------------------------------------------
    // 9. AREA CLUSTER CRUD HANDLERS
    // -------------------------------------------------------------
    const handleAddAreaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAreaSubmitting(true);
        try {
            await dispatchApi.createArea({
                name: areaFormName.trim(),
                displayName: areaFormDisplayName.trim() || areaFormName.trim(),
                deliveryLocations: areaFormLocations.split(',').map(s => s.trim()).filter(Boolean),
                pincodes: areaFormPincodes.split(',').map(s => s.trim()).filter(Boolean),
                description: areaFormDescription.trim(),
                isActive: true
            });
            toast.success("Area cluster created!");
            setIsAddAreaModalOpen(false);
            setAreaFormName('');
            setAreaFormDisplayName('');
            setAreaFormLocations('');
            setAreaFormPincodes('');
            setAreaFormDescription('');
            refetchAreas();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsAreaSubmitting(false);
        }
    };

    const handleEditAreaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingArea) return;
        setIsAreaSubmitting(true);
        try {
            await dispatchApi.updateArea(editingArea._id, {
                name: areaFormName.trim(),
                displayName: areaFormDisplayName.trim() || areaFormName.trim(),
                deliveryLocations: areaFormLocations.split(',').map(s => s.trim()).filter(Boolean),
                pincodes: areaFormPincodes.split(',').map(s => s.trim()).filter(Boolean),
                description: areaFormDescription.trim()
            });
            toast.success("Area cluster updated!");
            setIsEditAreaModalOpen(false);
            setEditingArea(null);
            refetchAreas();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsAreaSubmitting(false);
        }
    };

    const handleDeleteArea = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete area "${name}"?`)) return;
        try {
            await dispatchApi.deleteArea(id);
            toast.success(`Area "${name}" deleted`);
            refetchAreas();
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    // -------------------------------------------------------------
    // 10. UI BADGE HELPERS
    // -------------------------------------------------------------
    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'scheduled':
            case 'pending':
            case 'new':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
            case 'assigned':
            case 'confirmed':
            case 'accepted':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Assigned</Badge>;
            case 'preparing':
            case 'ready':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Kitchen Ready</Badge>;
            case 'out_for_delivery':
            case 'outfordelivery':
            case 'picked_up':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">On The Road</Badge>;
            case 'delivered':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Delivered</Badge>;
            case 'failed':
            case 'cancelled':
            case 'rejected':
                return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // -------------------------------------------------------------
    // 11. UNIFIED DELIVERIES TABLE COMPONENT (REUSABLE)
    // -------------------------------------------------------------
    const renderDeliveriesTable = (deliveries: UnifiedDeliveryItem[], showAreaColumn = true) => {
        if (isDispatchLoading) {
            return (
                <div className="p-8 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            );
        }

        if (deliveries.length === 0) {
            return (
                <div className="text-center py-16 px-4">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-stone-900">No deliveries found</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        No orders or meal deliveries match the current date and filter criteria.
                    </p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            setSearchQuery('');
                            setAreaFilter('all');
                            setSlotFilter('all');
                            setAssignedFilter('all');
                            setRiderFilter('all');
                            setStatusFilter('all');
                        }}
                        className="mt-4 text-xs font-bold"
                    >
                        Reset All Filters
                    </Button>
                </div>
            );
        }

        const isAllSelected = deliveries.length > 0 && deliveries.every(d => selectedDeliveryIds.includes(d.id));

        return (
            <div className="overflow-x-auto">
                <Table className="text-xs">
                    <TableHeader className="bg-stone-50 border-b border-stone-200">
                        <TableRow>
                            <TableHead className="w-10 text-center">
                                <input 
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={() => handleSelectAllInView(deliveries)}
                                    className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer h-4 w-4"
                                    title="Select all visible"
                                />
                            </TableHead>
                            <TableHead className="font-bold text-stone-900">Order Ref</TableHead>
                            <TableHead className="font-bold text-stone-900">Stop # (क्रम)</TableHead>
                            <TableHead className="font-bold text-stone-900">Delivery Type</TableHead>
                            <TableHead className="font-bold text-stone-900">Customer</TableHead>
                            {showAreaColumn && <TableHead className="font-bold text-stone-900">Area</TableHead>}
                            <TableHead className="font-bold text-stone-900">Address</TableHead>
                            <TableHead className="font-bold text-stone-900">Meal Slot</TableHead>
                            <TableHead className="font-bold text-stone-900">Amount</TableHead>
                            <TableHead className="font-bold text-stone-900">Assigned Rider</TableHead>
                            <TableHead className="font-bold text-stone-900">Status</TableHead>
                            <TableHead className="text-right font-bold text-stone-900">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {deliveries.map((delivery) => {
                            const isSelected = selectedDeliveryIds.includes(delivery.id);
                            const isTiffin = delivery.deliveryType === 'tiffin';

                            return (
                                <TableRow 
                                    key={delivery.id}
                                    className={`hover:bg-stone-50/80 transition-colors ${isSelected ? 'bg-orange-50/50' : ''}`}
                                >
                                    {/* Checkbox */}
                                    <TableCell className="text-center">
                                        <input 
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelectDelivery(delivery.id)}
                                            className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer h-4 w-4"
                                        />
                                    </TableCell>

                                    {/* Order Ref */}
                                    <TableCell className="font-mono font-bold text-stone-900">
                                        {delivery.orderNumber}
                                    </TableCell>

                                    {/* Stop Sequence Numbering (Admin Direct Edit) */}
                                    <TableCell>
                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={999}
                                                    key={`${delivery.id}-${delivery.deliverySequence || 0}`}
                                                    defaultValue={delivery.deliverySequence && delivery.deliverySequence > 0 ? delivery.deliverySequence : ''}
                                                    placeholder="-"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const rawVal = e.target.value.trim();
                                                        const val = rawVal === '' ? 0 : parseInt(rawVal, 10);
                                                        const currentSeq = delivery.deliverySequence || 0;
                                                        if (!isNaN(val) && val >= 0 && val !== currentSeq) {
                                                            handleDirectSequenceChange(delivery, val);
                                                        }
                                                    }}
                                                    className={`w-14 h-8 text-center text-xs font-black font-mono rounded-lg border shadow-2xs transition-all outline-none ${
                                                        delivery.deliverySequence === 1
                                                            ? "bg-emerald-500 text-slate-950 border-emerald-600 font-extrabold ring-2 ring-emerald-300"
                                                            : delivery.deliverySequence && delivery.deliverySequence > 1
                                                            ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                                                            : "bg-white text-stone-700 border-stone-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                                    }`}
                                                    title="डिलीवरी नंबर डालें (1 = पहला ड्रॉप, 2 = दूसरा ड्रॉप... 0 या खाली = ऑटो)"
                                                />
                                            </div>
                                            {delivery.deliverySequence === 1 ? (
                                                <span className="text-[10px] font-black text-emerald-800 uppercase bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 whitespace-nowrap shadow-2xs">
                                                    1st Drop
                                                </span>
                                            ) : delivery.deliverySequence && delivery.deliverySequence > 1 ? (
                                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                                                    Stop #{delivery.deliverySequence}
                                                </span>
                                            ) : null}
                                        </div>
                                    </TableCell>

                                    {/* Delivery Type Badge */}
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                            isTiffin 
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}>
                                            {isTiffin ? '🍱 Tiffin Plan' : '🍲 Daily Food'}
                                        </span>
                                    </TableCell>

                                    {/* Customer */}
                                    <TableCell>
                                        <div className="font-bold text-stone-900 leading-tight">
                                            {delivery.customerName}
                                        </div>
                                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                                            <Phone className="w-3 h-3 text-stone-400" />
                                            {delivery.customerPhone ? (
                                                <a href={`tel:${delivery.customerPhone}`} className="hover:text-orange-600">
                                                    {delivery.customerPhone}
                                                </a>
                                            ) : (
                                                'No phone'
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Area */}
                                    {showAreaColumn && (
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className={`font-semibold ${delivery.area === 'Area Not Assigned' ? 'text-amber-700 italic' : 'text-stone-800'}`}>
                                                    {delivery.area}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setTargetDeliveryForArea(delivery);
                                                        setNewAreaValue(delivery.area !== 'Area Not Assigned' ? delivery.area : '');
                                                        setIsChangeAreaModalOpen(true);
                                                    }}
                                                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                                                    title="Change / Assign Area"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    )}

                                    {/* Address */}
                                    <TableCell className="max-w-[180px]">
                                        <div className="truncate text-stone-700" title={`${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}`}>
                                            {delivery.deliveryAddress.street || 'Address on file'}
                                        </div>
                                        <div className="text-[11px] text-stone-400 truncate">
                                            {delivery.deliveryAddress.city} {delivery.deliveryAddress.pincode && `• ${delivery.deliveryAddress.pincode}`}
                                        </div>
                                    </TableCell>

                                    {/* Meal Slot */}
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                            delivery.timeSlot === 'lunch' ? 'bg-orange-100 text-orange-800' :
                                            delivery.timeSlot === 'dinner' ? 'bg-indigo-100 text-indigo-800' :
                                            'bg-stone-100 text-stone-800'
                                        }`}>
                                            {delivery.timeSlot === 'lunch' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                                            {delivery.timeSlot.toUpperCase()}
                                        </span>
                                    </TableCell>

                                    {/* Amount */}
                                    <TableCell className="font-bold">
                                        {isTiffin ? (
                                            <span className="text-emerald-700 font-semibold text-[11px]">
                                                Prepaid Plan
                                            </span>
                                        ) : (
                                            <span className="text-stone-900">
                                                ₹{delivery.amount}
                                                <span className="text-[10px] text-stone-400 font-normal ml-1">
                                                    ({delivery.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Paid'})
                                                </span>
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Assigned Rider */}
                                    <TableCell>
                                        <Select
                                            value={delivery.assignedTo || 'unassigned'}
                                            onValueChange={(val) => {
                                                if (val === 'unassigned') {
                                                    bulkUnassignMutation.mutate([delivery]);
                                                } else {
                                                    handleQuickAssignSingle(delivery, val);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-8 text-xs font-medium border-stone-200 w-[140px]">
                                                <SelectValue placeholder="Assign Rider">
                                                    {delivery.riderName ? (
                                                        <span className="flex items-center gap-1 truncate text-stone-900 font-bold">
                                                            <Bike className="w-3 h-3 text-orange-600 flex-shrink-0" />
                                                            <span className="truncate">{delivery.riderName}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-700 italic">Unassigned</span>
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned" className="text-stone-500 italic">
                                                    -- Unassigned --
                                                </SelectItem>
                                                {activeRiders.map(rider => (
                                                    <SelectItem key={rider._id} value={rider._id}>
                                                        {rider.name} ({rider.phone.slice(-4)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    {/* Status Badge */}
                                    <TableCell>
                                        {getStatusBadge(delivery.status)}
                                    </TableCell>

                                    {/* Action Button */}
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewingDelivery(delivery)}
                                            className="h-8 text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 cursor-pointer"
                                        >
                                            Details ›
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* ============================================================== */}
            {/* TOP HEADER & GLOBAL ACTIONS                                    */}
            {/* ============================================================== */}
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
                        Unified dispatch management for Daily Food Orders and Active Tiffin Meal Plans with area-wise bulk rider assignment.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefreshAll}
                        className="cursor-pointer border-stone-200 text-stone-700 hover:bg-stone-50"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isDispatchFetching ? 'animate-spin' : ''}`} /> 
                        Refresh
                    </Button>

                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => generateTiffinsMutation.mutate(selectedDate)}
                        disabled={generateTiffinsMutation.isPending}
                        className="cursor-pointer border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold"
                        title="Generate tiffin deliveries for eligible active meal plans"
                    >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        {generateTiffinsMutation.isPending ? "Generating..." : "Generate Today's Tiffins"}
                    </Button>

                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                            const deliveryUrl = `${baseUrl}/delivery/login`;
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(deliveryUrl);
                                toast.success("Rider App link copied to clipboard: " + deliveryUrl);
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
                            setBoyFormName('');
                            setBoyFormPhone('');
                            setBoyFormPassword('');
                            setIsAddBoyModalOpen(true);
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4 mr-1.5" />
                        Add Delivery Boy
                    </Button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* DYNAMIC REAL-TIME OPERATIONAL STATISTICS (6 METRICS)           */}
            {/* ============================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Total Deliveries Today */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                                Total Today
                            </span>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <ShoppingBag className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-stone-900">
                            {isDispatchLoading ? "..." : stats.totalToday}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium mt-1">
                            {stats.dailyOrdersCount} Daily • {stats.tiffinDeliveriesCount} Tiffins
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Unassigned Deliveries */}
                <Card className="border-amber-200 bg-amber-50/30 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                                Unassigned
                            </span>
                            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-amber-800">
                            {isDispatchLoading ? "..." : stats.unassignedToday}
                        </div>
                        <p className="text-[11px] text-amber-600 font-medium mt-1">
                            Awaiting rider assignment
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Assigned Deliveries */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                                Assigned
                            </span>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Check className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-stone-900">
                            {isDispatchLoading ? "..." : stats.assignedToday}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium mt-1">
                            Assigned to fleet
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Out for Delivery */}
                <Card className="border-orange-200 bg-orange-50/30 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
                                On The Road
                            </span>
                            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                                <Bike className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-orange-800">
                            {isDispatchLoading ? "..." : stats.outForDeliveryToday}
                        </div>
                        <p className="text-[11px] text-orange-600 font-medium mt-1">
                            Out for delivery
                        </p>
                    </CardContent>
                </Card>

                {/* 5. Successfully Delivered */}
                <Card className="border-emerald-200 bg-emerald-50/30 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                                Delivered
                            </span>
                            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-800">
                            {isDispatchLoading ? "..." : stats.deliveredToday}
                        </div>
                        <p className="text-[11px] text-emerald-600 font-medium mt-1">
                            Completed today
                        </p>
                    </CardContent>
                </Card>

                {/* 6. Active Delivery Boys */}
                <Card className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                                Active Fleet
                            </span>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Users className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-stone-900">
                            {isBoysLoading ? "..." : activeRiders.length}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium mt-1">
                            {deliveryBoys.length} Total registered riders
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ============================================================== */}
            {/* FILTER BAR & DATE SELECTOR                                     */}
            {/* ============================================================== */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    {/* Search */}
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search customer, phone, order ref..."
                            className="pl-9 h-9 text-xs"
                        />
                    </div>

                    {/* Date Selector */}
                    <div>
                        <Input 
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="h-9 text-xs"
                        />
                    </div>

                    {/* Area Filter */}
                    <div>
                        <Select value={areaFilter} onValueChange={setAreaFilter}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="All Areas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Areas</SelectItem>
                                {areaClusters.map(a => (
                                    <SelectItem key={a._id} value={a.displayName || a.name}>
                                        {a.displayName || a.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="Area Not Assigned">Area Not Assigned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Meal Slot Filter */}
                    <div>
                        <Select value={slotFilter} onValueChange={setSlotFilter}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="All Meal Slots" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Slots</SelectItem>
                                <SelectItem value="lunch">☀️ Lunch</SelectItem>
                                <SelectItem value="dinner">🌙 Dinner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Assignment Filter */}
                    <div>
                        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Assignment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Deliveries</SelectItem>
                                <SelectItem value="unassigned">⚠️ Unassigned Only</SelectItem>
                                <SelectItem value="assigned">✅ Assigned Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Secondary Row: Rider & Status Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-600">Filters:</span>

                        {/* Filter by Rider */}
                        <Select value={riderFilter} onValueChange={setRiderFilter}>
                            <SelectTrigger className="h-8 text-xs w-[160px]">
                                <SelectValue placeholder="Filter by Rider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Riders</SelectItem>
                                {deliveryBoys.map(r => (
                                    <SelectItem key={r._id} value={r._id}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Filter by Delivery Status */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8 text-xs w-[160px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending / Scheduled</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="failed">Failed / Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        {(areaFilter !== 'all' || slotFilter !== 'all' || assignedFilter !== 'all' || riderFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setSearchQuery('');
                                    setAreaFilter('all');
                                    setSlotFilter('all');
                                    setAssignedFilter('all');
                                    setRiderFilter('all');
                                    setStatusFilter('all');
                                }}
                                className="h-8 text-xs text-stone-500 hover:text-stone-900"
                            >
                                <X className="w-3 h-3 mr-1" /> Clear Filters
                            </Button>
                        )}
                    </div>

                    <div className="text-stone-500 font-medium">
                        Showing <strong>{rawDeliveries.length}</strong> matching deliveries for <strong>{selectedDate}</strong>
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* FLOATING / STICKY BULK ACTION BAR                              */}
            {/* ============================================================== */}
            {selectedDeliveryIds.length > 0 && (
                <div className="bg-stone-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-4 z-30 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-orange-600 text-white rounded-xl font-bold text-sm">
                            {selectedDeliveryIds.length}
                        </span>
                        <div>
                            <div className="font-bold text-sm">
                                {selectedDeliveryIds.length} Deliveries Selected
                            </div>
                            <div className="text-xs text-stone-400">
                                {selectedDeliveries.filter(d => d.deliveryType === 'daily').length} Daily Orders • {selectedDeliveries.filter(d => d.deliveryType === 'tiffin').length} Tiffin Plans
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        <Button 
                            size="sm" 
                            onClick={() => handleOpenBulkAssignModal()}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-9 cursor-pointer flex-1 sm:flex-none"
                        >
                            <Bike className="w-4 h-4 mr-1.5" />
                            Assign Route & Sequence to Rider (क्रम से असाइन करें)
                        </Button>

                        <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => bulkUnassignMutation.mutate(selectedDeliveries)}
                            disabled={bulkUnassignMutation.isPending}
                            className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white font-bold text-xs h-9 cursor-pointer flex-1 sm:flex-none"
                        >
                            Unassign Selected
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedDeliveryIds([])}
                            className="text-stone-400 hover:text-white text-xs h-9"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Deselect All
                        </Button>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MAIN NAVIGATION TABS (6 TABS)                                  */}
            {/* ============================================================== */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 mb-4 overflow-x-auto scrollbar-hide">
                    <TabsList className="bg-transparent p-0 gap-1.5 flex-nowrap sm:flex-wrap">
                        {/* 1. All Deliveries */}
                        <TabsTrigger 
                            value="all_deliveries" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-3.5 py-2 font-bold text-xs cursor-pointer whitespace-nowrap"
                        >
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                            All Deliveries
                            <Badge variant="secondary" className="ml-2 bg-stone-200/80 text-stone-800 text-[10px] font-bold">
                                {rawDeliveries.length}
                            </Badge>
                        </TabsTrigger>

                        {/* 2. Daily Food Orders */}
                        <TabsTrigger 
                            value="daily_orders" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-3.5 py-2 font-bold text-xs cursor-pointer whitespace-nowrap"
                        >
                            <Utensils className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                            Daily Food Orders
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-[10px] font-bold">
                                {dailyDeliveries.length}
                            </Badge>
                        </TabsTrigger>

                        {/* 3. Tiffin Deliveries */}
                        <TabsTrigger 
                            value="tiffin_deliveries" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-3.5 py-2 font-bold text-xs cursor-pointer whitespace-nowrap"
                        >
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            Tiffin Deliveries
                            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {tiffinDeliveries.length}
                            </Badge>
                        </TabsTrigger>

                        {/* 4. Area-wise Dispatch */}
                        <TabsTrigger 
                            value="area_dispatch" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-3.5 py-2 font-bold text-xs cursor-pointer whitespace-nowrap"
                        >
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                            Area-wise Dispatch
                            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 text-[10px] font-bold">
                                {groupedByArea.length} Areas
                            </Badge>
                        </TabsTrigger>

                        {/* 5. Delivery Riders Fleet */}
                        <TabsTrigger 
                            value="riders" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-3.5 py-2 font-bold text-xs cursor-pointer whitespace-nowrap"
                        >
                            <Users className="w-3.5 h-3.5 mr-1.5 text-stone-700" />
                            Delivery Riders Fleet
                            <Badge variant="secondary" className="ml-2 bg-stone-200/80 text-stone-800 text-[10px] font-bold">
                                {deliveryBoys.length}
                            </Badge>
                        </TabsTrigger>

                        {/* 6. Area Clusters */}
                        <TabsTrigger 
                            value="clusters" 
                            className="data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm rounded-xl px-3.5 py-2 font-bold text-xs cursor-pointer whitespace-nowrap"
                        >
                            <Layers className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                            Area Clusters
                            <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 text-[10px] font-bold">
                                {areaClusters.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* ============================================================== */}
                {/* TAB 1: ALL DELIVERIES (UNIFIED TABLE)                          */}
                {/* ============================================================== */}
                <TabsContent value="all_deliveries" className="space-y-4 mt-0">
                    <Card className="border-stone-200 shadow-2xs overflow-hidden">
                        <CardHeader className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <div>
                                    <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-orange-600" />
                                        Unified Dispatch Queue (Daily Food + Active Tiffins)
                                    </CardTitle>
                                    <CardDescription className="text-xs text-stone-500">
                                        Both Daily Food Orders and Active Tiffin Deliveries combined into one synchronized dispatch table.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {renderDeliveriesTable(rawDeliveries)}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 2: DAILY FOOD ORDERS                                       */}
                {/* ============================================================== */}
                <TabsContent value="daily_orders" className="space-y-4 mt-0">
                    <Card className="border-stone-200 shadow-2xs overflow-hidden">
                        <CardHeader className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50">
                            <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-blue-600" />
                                Daily Food Orders Only
                            </CardTitle>
                            <CardDescription className="text-xs text-stone-500">
                                One-time meal orders received from the app, website, and WhatsApp.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-0">
                            {renderDeliveriesTable(dailyDeliveries)}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 3: TIFFIN DELIVERIES                                       */}
                {/* ============================================================== */}
                <TabsContent value="tiffin_deliveries" className="space-y-4 mt-0">
                    <Card className="border-stone-200 shadow-2xs overflow-hidden">
                        <CardHeader className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <div>
                                    <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        Active Tiffin & Meal Plan Deliveries
                                    </CardTitle>
                                    <CardDescription className="text-xs text-stone-500">
                                        Automatically generated from active 30-day subscriber meal plans for today's lunch and dinner slots.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {renderDeliveriesTable(tiffinDeliveries)}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 4: AREA-WISE DISPATCH                                      */}
                {/* ============================================================== */}
                <TabsContent value="area_dispatch" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
                        <div>
                            <h3 className="font-bold text-stone-900 text-sm">Area-wise Grouped Dispatch</h3>
                            <p className="text-xs text-stone-500">
                                Select an entire area cluster and assign all orders (Daily + Tiffins) to a delivery boy in one click.
                            </p>
                        </div>
                    </div>

                    {groupedByArea.length === 0 ? (
                        <Card className="p-12 text-center text-stone-400 text-xs">
                            No active deliveries to group by area.
                        </Card>
                    ) : (
                        groupedByArea.map(([areaName, areaDeliveries]) => {
                            const unassignedInArea = areaDeliveries.filter(d => !d.assignedTo).length;
                            const allAreaSelected = areaDeliveries.every(d => selectedDeliveryIds.includes(d.id));

                            return (
                                <Card key={areaName} className="border-stone-200 shadow-2xs overflow-hidden">
                                    <CardHeader className="p-4 bg-stone-50/80 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                                                <MapPin className="w-4 h-4" />
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-stone-900 text-base">{areaName}</h3>
                                                    <Badge className="bg-orange-100 text-orange-800 font-bold text-xs">
                                                        {areaDeliveries.length} Deliveries
                                                    </Badge>
                                                    {unassignedInArea > 0 && (
                                                        <Badge className="bg-amber-100 text-amber-800 font-bold text-xs">
                                                            {unassignedInArea} Unassigned
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-stone-500 mt-0.5">
                                                    {areaDeliveries.filter(d => d.deliveryType === 'daily').length} Daily Orders • {areaDeliveries.filter(d => d.deliveryType === 'tiffin').length} Tiffin Plans
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSelectAllInArea(areaDeliveries)}
                                                className="text-xs font-bold border-stone-300 text-stone-700 h-8 cursor-pointer"
                                            >
                                                {allAreaSelected ? "Deselect Area" : `Select All in ${areaName}`}
                                            </Button>

                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedDeliveryIds(areaDeliveries.map(d => d.id));
                                                    handleOpenBulkAssignModal(areaDeliveries);
                                                }}
                                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-8 cursor-pointer"
                                            >
                                                <Bike className="w-3.5 h-3.5 mr-1" />
                                                Assign Area Stops in Sequence (क्रम से)
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-0">
                                        {renderDeliveriesTable(areaDeliveries, false)}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 5: DELIVERY RIDERS FLEET                                   */}
                {/* ============================================================== */}
                <TabsContent value="riders" className="space-y-6 mt-0">
                    {/* Rider Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {riderPerformance.map((rider) => (
                            <Card key={rider.riderId} className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 border-b border-stone-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                                                <Bike className="w-4 h-4" />
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-stone-900 text-sm">{rider.name}</h4>
                                                <p className="text-xs text-stone-500 font-mono">{rider.phone}</p>
                                            </div>
                                        </div>
                                        <Badge className={rider.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}>
                                            {rider.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 space-y-2 text-xs">
                                    <div className="flex justify-between items-center py-1 border-b border-stone-50">
                                        <span className="text-stone-500">Assigned Today:</span>
                                        <strong className="text-stone-900 text-sm">{rider.performance.totalAssigned}</strong>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-stone-50">
                                        <span className="text-stone-500">Delivered Today:</span>
                                        <strong className="text-emerald-700 font-bold">{rider.performance.delivered}</strong>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-stone-50">
                                        <span className="text-stone-500">Out for Delivery:</span>
                                        <strong className="text-orange-600 font-bold">{rider.performance.outForDelivery}</strong>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-stone-50">
                                        <span className="text-stone-500">Pending / Preparing:</span>
                                        <strong className="text-amber-700 font-bold">{rider.performance.pending}</strong>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-stone-500">Completion Rate:</span>
                                        <strong className="text-stone-900">{rider.performance.completionPercentage}%</strong>
                                    </div>

                                    {/* Area distribution chips */}
                                    {Object.keys(rider.performance.areaBreakdown).length > 0 && (
                                        <div className="pt-2 border-t border-stone-100">
                                            <span className="text-[11px] text-stone-400 block mb-1">Assigned Areas:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(rider.performance.areaBreakdown).map(([area, count]) => (
                                                    <Badge key={area} variant="secondary" className="text-[10px]">
                                                        {area}: {count}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Delivery Boys Fleet Table */}
                    <Card className="border-stone-200 shadow-2xs overflow-hidden">
                        <CardHeader className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-stone-900">
                                    Registered Delivery Riders Fleet
                                </CardTitle>
                                <CardDescription className="text-xs text-stone-500">
                                    Manage rider credentials, active status, and phone numbers.
                                </CardDescription>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => {
                                    setBoyFormName('');
                                    setBoyFormPhone('');
                                    setBoyFormPassword('');
                                    setIsAddBoyModalOpen(true);
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                            >
                                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Rider
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Table className="text-xs">
                                <TableHeader className="bg-stone-50 border-b border-stone-200">
                                    <TableRow>
                                        <TableHead className="font-bold text-stone-900">Rider Name</TableHead>
                                        <TableHead className="font-bold text-stone-900">Phone (Login ID)</TableHead>
                                        <TableHead className="font-bold text-stone-900">Status</TableHead>
                                        <TableHead className="font-bold text-stone-900">Registered On</TableHead>
                                        <TableHead className="text-right font-bold text-stone-900">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deliveryBoys.map(boy => (
                                        <TableRow key={boy._id} className="hover:bg-stone-50/80">
                                            <TableCell className="font-bold text-stone-900">
                                                {boy.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-stone-600">
                                                {boy.phone}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={boy.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}>
                                                    {boy.isActive !== false ? "Active" : "Deactivated"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-stone-500">
                                                {boy.createdAt ? format(new Date(boy.createdAt), 'dd MMM yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingBoy(boy);
                                                        setBoyFormName(boy.name);
                                                        setBoyFormPhone(boy.phone);
                                                        setBoyFormPassword('');
                                                        setIsEditBoyModalOpen(true);
                                                    }}
                                                    className="h-8 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleBoyStatus(boy)}
                                                    className={`h-8 text-xs font-bold ${boy.isActive !== false ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                                                >
                                                    {boy.isActive !== false ? <PowerOff className="w-3.5 h-3.5 mr-1" /> : <Power className="w-3.5 h-3.5 mr-1" />}
                                                    {boy.isActive !== false ? "Deactivate" : "Activate"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 6: AREA CLUSTERS (DYNAMIC CRUD & LIVE STATS)               */}
                {/* ============================================================== */}
                <TabsContent value="clusters" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
                        <div>
                            <h3 className="font-bold text-stone-900 text-sm">Dynamic Area Clusters Management</h3>
                            <p className="text-xs text-stone-500">
                                Define delivery hubs, automatic address keyword mappings, and inspect live area completion stats.
                            </p>
                        </div>
                        <Button 
                            size="sm"
                            onClick={() => {
                                setAreaFormName('');
                                setAreaFormDisplayName('');
                                setAreaFormLocations('');
                                setAreaFormPincodes('');
                                setAreaFormDescription('');
                                setIsAddAreaModalOpen(true);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                        >
                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                            Create New Area
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {areaClusters.map(area => (
                            <Card key={area._id} className="border-stone-200 shadow-2xs hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 border-b border-stone-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                                                <MapPin className="w-4 h-4" />
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-stone-900 text-sm">{area.displayName || area.name}</h4>
                                                <p className="text-[11px] text-stone-500">{area.description || 'Standard Area Cluster'}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-orange-100 text-orange-800 font-bold text-xs">
                                            {area.statistics?.totalDeliveries || 0} Orders Today
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 space-y-3 text-xs">
                                    {/* Stats block */}
                                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 space-y-1">
                                        <div className="flex justify-between font-medium">
                                            <span className="text-stone-600">Pending / Unassigned:</span>
                                            <strong className="text-amber-700">{area.statistics?.unassignedDeliveries || 0}</strong>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span className="text-stone-600">Assigned Deliveries:</span>
                                            <strong className="text-blue-700">{area.statistics?.assignedDeliveries || 0}</strong>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span className="text-stone-600">Successfully Delivered:</span>
                                            <strong className="text-emerald-700">{area.statistics?.deliveredCount || 0}</strong>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span className="text-stone-600">Active Riders in Area:</span>
                                            <strong className="text-stone-900">{area.statistics?.assignedRidersCount || 0} Riders</strong>
                                        </div>
                                    </div>

                                    {/* Keywords / Locations */}
                                    {area.deliveryLocations && area.deliveryLocations.length > 0 && (
                                        <div>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                                                Mapped Locations / Keywords:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {area.deliveryLocations.map((loc, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px]">
                                                        {loc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setAreaFilter(area.displayName || area.name);
                                                setSelectedTab('all_deliveries');
                                            }}
                                            className="flex-1 text-xs font-bold text-orange-600 border-orange-200 hover:bg-orange-50 h-8"
                                        >
                                            View Deliveries ›
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingArea(area);
                                                setAreaFormName(area.name);
                                                setAreaFormDisplayName(area.displayName || area.name);
                                                setAreaFormLocations((area.deliveryLocations || []).join(', '));
                                                setAreaFormPincodes((area.pincodes || []).join(', '));
                                                setAreaFormDescription(area.description || '');
                                                setIsEditAreaModalOpen(true);
                                            }}
                                            className="h-8 text-stone-600 hover:text-stone-900"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteArea(area._id, area.displayName || area.name)}
                                            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* ============================================================== */}
            {/* BULK ASSIGN TO RIDER DIALOG WITH ROUTE SEQUENCING              */}
            {/* ============================================================== */}
            <Dialog open={isBulkAssignModalOpen} onOpenChange={setIsBulkAssignModalOpen}>
                <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <Bike className="w-5 h-5 text-orange-600" />
                            Assign Route Stops to Rider (क्रम से असाइन करें)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Set the exact stop sequence (Stop #1, Stop #2, Stop #3...) for the rider. The delivery boy will deliver in this exact physical order.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-2 text-xs">
                        {/* Delivery Boy Selection Dropdown */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-stone-800">1. Select Active Rider (राइडर चुनें)*</Label>
                            <Select 
                                value={selectedRiderForBulk} 
                                onValueChange={(val) => {
                                    setSelectedRiderForBulk(val);
                                    setReassignWarningData(null);
                                }}
                            >
                                <SelectTrigger className="h-10 text-xs font-medium border-stone-200">
                                    <SelectValue placeholder="Choose a delivery boy..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeRiders.map(rider => (
                                        <SelectItem key={rider._id} value={rider._id}>
                                            {rider.name} • {rider.phone}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {activeRiders.length === 0 && (
                                <p className="text-[11px] text-rose-600">
                                    No active delivery boys available. Please add or activate a delivery boy first.
                                </p>
                            )}
                        </div>

                        {/* Reassignment Warning Alert */}
                        {reassignWarningData && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-xs">Reassignment Confirmation Required</div>
                                    <div className="text-[11px] mt-0.5 leading-relaxed">
                                        {reassignWarningData.count} of the selected deliveries are already assigned to other riders. Click "Confirm & Reassign" below to proceed.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stop Sequence Drag / Reorder List */}
                        <div className="space-y-2 pt-2 border-t border-stone-200">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                                    <Navigation className="w-3.5 h-3.5 text-orange-600" />
                                    <span>2. Delivery Stop Sequence (डिलीवरी क्रम - किसे पहले देना है)</span>
                                </Label>
                                <span className="text-[10px] text-stone-500 font-medium">
                                    {orderedDeliveries.length} Total Stops
                                </span>
                            </div>

                            <p className="text-[11px] text-stone-500 leading-tight">
                                राइडर को इसी क्रम में ड्रॉप्स दिखेंगे। बटन ▲ (ऊपर) या ▼ (नीचे) दबाकर क्रम बदलें:
                            </p>

                            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                                {orderedDeliveries.map((item, idx) => (
                                    <div 
                                        key={item.id}
                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs ${
                                            idx === 0 
                                                ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40" 
                                                : "bg-stone-50 border-stone-200 hover:border-orange-300"
                                        }`}
                                    >
                                        {/* Stop Badge */}
                                        <div className="w-16 flex-shrink-0 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black ${
                                                idx === 0
                                                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                                                    : "bg-orange-100 text-orange-800 border border-orange-200"
                                            }`}>
                                                Stop #{idx + 1}
                                            </span>
                                            {idx === 0 && (
                                                <span className="block text-[9px] text-emerald-800 font-black uppercase mt-0.5">
                                                    पहला ड्रॉप
                                                </span>
                                            )}
                                        </div>

                                        {/* Delivery Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-stone-900 truncate">
                                                    {item.customerName}
                                                </span>
                                                <span className="text-[10px] text-stone-400 font-mono">
                                                    ({item.orderNumber})
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                                    item.deliveryType === 'tiffin' 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {item.deliveryType === 'tiffin' ? '🍱 Tiffin' : '🍲 Order'}
                                                </span>
                                                <span className="text-[10px] text-stone-500 font-mono">
                                                    {item.timeSlot === 'dinner' ? '🌙 Dinner' : '☀️ Lunch'}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-stone-600 truncate mt-0.5">
                                                📍 {item.deliveryAddress?.street}, {item.deliveryAddress?.landmark ? item.deliveryAddress.landmark + ', ' : ''}{item.area}
                                            </div>
                                        </div>

                                        {/* Up & Down Reorder Buttons */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={idx === 0}
                                                onClick={() => handleMoveDelivery(idx, 'up')}
                                                className="h-7 w-7 p-0 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 cursor-pointer disabled:opacity-30"
                                                title="Move Earlier (पहले डिलीवर करें)"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={idx === orderedDeliveries.length - 1}
                                                onClick={() => handleMoveDelivery(idx, 'down')}
                                                className="h-7 w-7 p-0 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 cursor-pointer disabled:opacity-30"
                                                title="Move Later (बाद में डिलीवर करें)"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsBulkAssignModalOpen(false);
                                setReassignWarningData(null);
                            }}
                            className="cursor-pointer text-xs"
                        >
                            Cancel
                        </Button>

                        <Button 
                            onClick={() => {
                                bulkAssignMutation.mutate({
                                    boyId: selectedRiderForBulk,
                                    items: orderedDeliveries,
                                    confirmReassign: !!reassignWarningData
                                });
                            }}
                            disabled={!selectedRiderForBulk || bulkAssignMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer shadow-md"
                        >
                            {bulkAssignMutation.isPending 
                                ? "Assigning..." 
                                : (reassignWarningData ? "Confirm & Reassign" : "Confirm Assignment with Sequence (क्रम से असाइन करें)")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* VIEW DELIVERY DETAILS MODAL                                    */}
            {/* ============================================================== */}
            <Dialog open={!!viewingDelivery} onOpenChange={(open) => !open && setViewingDelivery(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <ShoppingBag className="w-5 h-5 text-orange-600" />
                            Delivery Details: {viewingDelivery?.orderNumber}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            {viewingDelivery?.displayType} • Scheduled for {viewingDelivery?.timeSlot?.toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>

                    {viewingDelivery && (
                        <div className="space-y-3.5 my-2 text-xs">
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Customer Name:</span>
                                    <strong className="text-stone-900">{viewingDelivery.customerName}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Phone:</span>
                                    <strong className="text-stone-900">{viewingDelivery.customerPhone || 'Not provided'}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Area Cluster:</span>
                                    <strong className="text-orange-700">{viewingDelivery.area}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Address:</span>
                                    <span className="text-right text-stone-800 max-w-[240px]">
                                        {viewingDelivery.deliveryAddress.street}, {viewingDelivery.deliveryAddress.city} {viewingDelivery.deliveryAddress.pincode}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="font-bold text-stone-800">Delivery Items:</div>
                                <div className="bg-white border border-stone-200 rounded-lg p-2 space-y-1">
                                    {viewingDelivery.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-stone-700">
                                            <span>{item.quantity}x {item.name}</span>
                                            {item.price ? <span>₹{item.price * item.quantity}</span> : null}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {viewingDelivery.specialInstructions && (
                                <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
                                    <strong>Special Instructions:</strong>
                                    <div className="italic mt-0.5">{viewingDelivery.specialInstructions}</div>
                                </div>
                            )}

                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex justify-between items-center">
                                <div>
                                    <span className="text-stone-500 block">Payment Method:</span>
                                    <strong className="text-stone-900">{viewingDelivery.paymentMethod}</strong>
                                </div>
                                <div className="text-right">
                                    <span className="text-stone-500 block">Today's Amount:</span>
                                    <strong className="text-sm font-bold text-stone-900">
                                        {viewingDelivery.deliveryType === 'tiffin' ? 'Prepaid Plan' : `₹${viewingDelivery.amount}`}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setViewingDelivery(null)}
                            className="text-xs cursor-pointer"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* MANUAL CHANGE AREA MODAL                                       */}
            {/* ============================================================== */}
            <Dialog open={isChangeAreaModalOpen} onOpenChange={setIsChangeAreaModalOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <MapPin className="w-5 h-5 text-orange-600" />
                            Assign / Change Delivery Area
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Reassign this delivery to an area cluster for organized dispatch.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 my-2 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Select Area Cluster*</Label>
                            <Select value={newAreaValue} onValueChange={setNewAreaValue}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Choose an area..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {areaClusters.map(a => (
                                        <SelectItem key={a._id} value={a.displayName || a.name}>
                                            {a.displayName || a.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Or Type Custom Area</Label>
                            <Input 
                                value={newAreaValue}
                                onChange={(e) => setNewAreaValue(e.target.value)}
                                placeholder="e.g. Achrol North"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsChangeAreaModalOpen(false)}
                            className="text-xs cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                if (!targetDeliveryForArea || !newAreaValue.trim()) return;
                                assignAreaMutation.mutate({
                                    id: targetDeliveryForArea.id,
                                    sourceModel: targetDeliveryForArea.sourceModel,
                                    area: newAreaValue.trim()
                                });
                            }}
                            disabled={!newAreaValue.trim() || assignAreaMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
                        >
                            Save Area
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* ADD DELIVERY BOY MODAL                                         */}
            {/* ============================================================== */}
            <Dialog open={isAddBoyModalOpen} onOpenChange={setIsAddBoyModalOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <PlusCircle className="w-5 h-5 text-orange-600" />
                            Add New Delivery Rider
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Register a new delivery rider with credentials to log in to the Rider App.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddBoySubmit} className="space-y-3 mt-2 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Full Name*</Label>
                            <Input 
                                value={boyFormName}
                                onChange={(e) => setBoyFormName(e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                                required
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Phone Number (10 digits)*</Label>
                            <Input 
                                value={boyFormPhone}
                                onChange={(e) => setBoyFormPhone(e.target.value)}
                                placeholder="e.g. 9876543210"
                                required
                                maxLength={10}
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Password*</Label>
                            <Input 
                                type="password"
                                value={boyFormPassword}
                                onChange={(e) => setBoyFormPassword(e.target.value)}
                                placeholder="Secure password for rider login"
                                required
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsAddBoyModalOpen(false)}
                                className="text-xs cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isBoySubmitting}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
                            >
                                {isBoySubmitting ? "Adding..." : "Add Rider"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* EDIT DELIVERY BOY MODAL                                        */}
            {/* ============================================================== */}
            <Dialog open={isEditBoyModalOpen} onOpenChange={setIsEditBoyModalOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <Edit className="w-5 h-5 text-blue-600" />
                            Edit Rider: {editingBoy?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Update rider name, phone number, or reset password.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditBoySubmit} className="space-y-3 mt-2 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Full Name*</Label>
                            <Input 
                                value={boyFormName}
                                onChange={(e) => setBoyFormName(e.target.value)}
                                required
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Phone Number*</Label>
                            <Input 
                                value={boyFormPhone}
                                onChange={(e) => setBoyFormPhone(e.target.value)}
                                required
                                maxLength={10}
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">New Password (leave blank to keep current)</Label>
                            <Input 
                                type="password"
                                value={boyFormPassword}
                                onChange={(e) => setBoyFormPassword(e.target.value)}
                                placeholder="Optional new password"
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsEditBoyModalOpen(false)}
                                className="text-xs cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isBoySubmitting}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
                            >
                                {isBoySubmitting ? "Updating..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* CREATE AREA MODAL                                              */}
            {/* ============================================================== */}
            <Dialog open={isAddAreaModalOpen} onOpenChange={setIsAddAreaModalOpen}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <PlusCircle className="w-5 h-5 text-orange-600" />
                            Create Delivery Area Cluster
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Add a new delivery area. Customer addresses containing the specified keywords will be automatically assigned to this area.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddAreaSubmit} className="space-y-3 mt-2 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Area Name (Unique Identifier)*</Label>
                            <Input 
                                value={areaFormName}
                                onChange={(e) => setAreaFormName(e.target.value)}
                                placeholder="e.g. NIMS, ACHROL, AMITY"
                                required
                                className="h-9 text-xs uppercase"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Display Name</Label>
                            <Input 
                                value={areaFormDisplayName}
                                onChange={(e) => setAreaFormDisplayName(e.target.value)}
                                placeholder="e.g. NIMS Campus"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">
                                Keywords / Landmarks (comma separated)
                            </Label>
                            <Input 
                                value={areaFormLocations}
                                onChange={(e) => setAreaFormLocations(e.target.value)}
                                placeholder="e.g. nims, university, hospital, shobha nagar"
                                className="h-9 text-xs"
                            />
                            <span className="text-[10px] text-stone-400">Used for automatic address matching</span>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Pincodes (comma separated)</Label>
                            <Input 
                                value={areaFormPincodes}
                                onChange={(e) => setAreaFormPincodes(e.target.value)}
                                placeholder="e.g. 303121, 303002"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Description</Label>
                            <Input 
                                value={areaFormDescription}
                                onChange={(e) => setAreaFormDescription(e.target.value)}
                                placeholder="Optional description or operational notes"
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsAddAreaModalOpen(false)}
                                className="text-xs cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isAreaSubmitting}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
                            >
                                {isAreaSubmitting ? "Creating..." : "Create Area"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* EDIT AREA MODAL                                                */}
            {/* ============================================================== */}
            <Dialog open={isEditAreaModalOpen} onOpenChange={setIsEditAreaModalOpen}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <Edit className="w-5 h-5 text-blue-600" />
                            Edit Area: {editingArea?.displayName || editingArea?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Update keywords, pincodes, and operational settings for this area.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditAreaSubmit} className="space-y-3 mt-2 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Area Name*</Label>
                            <Input 
                                value={areaFormName}
                                onChange={(e) => setAreaFormName(e.target.value)}
                                required
                                className="h-9 text-xs uppercase"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Display Name</Label>
                            <Input 
                                value={areaFormDisplayName}
                                onChange={(e) => setAreaFormDisplayName(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">
                                Keywords / Landmarks (comma separated)
                            </Label>
                            <Input 
                                value={areaFormLocations}
                                onChange={(e) => setAreaFormLocations(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Pincodes (comma separated)</Label>
                            <Input 
                                value={areaFormPincodes}
                                onChange={(e) => setAreaFormPincodes(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Description</Label>
                            <Input 
                                value={areaFormDescription}
                                onChange={(e) => setAreaFormDescription(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsEditAreaModalOpen(false)}
                                className="text-xs cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isAreaSubmitting}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
                            >
                                {isAreaSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
