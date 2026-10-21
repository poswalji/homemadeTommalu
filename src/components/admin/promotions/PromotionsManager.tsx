"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
    Plus, Tag, Trash2, Power, PowerOff, Loader2, Search, 
    Percent, Hash, Pencil, Calendar, AlertCircle, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { promotionsApi, CreatePromotionData, Promotion } from "@/services/api/promotions.api";

// Helper to safely format any date into HTML5 YYYY-MM-DD string
function formatDateForInput(d: string | Date | undefined): string {
    if (!d) return "";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
    } catch {
        return "";
    }
}

export function PromotionsManager() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Create Form State
    const [formData, setFormData] = useState<CreatePromotionData>({
        code: "",
        name: "",
        description: "",
        type: "percentage",
        discountValue: 10,
        maxDiscount: undefined,
        minOrderAmount: 0,
        maxUses: undefined,
        maxUsesPerUser: 1,
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });

    // Edit Form State
    const [editFormData, setEditFormData] = useState({
        id: "",
        code: "",
        name: "",
        description: "",
        type: "percentage" as 'percentage' | 'fixed' | 'free_delivery' | 'buy_one_get_one',
        discountValue: 10,
        maxDiscount: undefined as number | undefined,
        minOrderAmount: 0,
        maxUses: undefined as number | undefined,
        maxUsesPerUser: 1,
        validUntil: "",
        isActive: true
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-promotions'],
        queryFn: () => promotionsApi.getAllPromotions()
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: promotionsApi.createPromotion,
        onSuccess: () => {
            toast.success("Coupon created successfully!");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
            setIsCreateOpen(false);
            setFormData({
                code: "",
                name: "",
                description: "",
                type: "percentage",
                discountValue: 10,
                maxDiscount: undefined,
                minOrderAmount: 0,
                maxUses: undefined,
                maxUsesPerUser: 1,
                validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
            });
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Failed to create coupon";
            toast.error(errorMsg);
        }
    });

    // Edit Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePromotionData> }) => 
            promotionsApi.updatePromotion(id, data),
        onSuccess: () => {
            toast.success("Coupon updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
            setIsEditOpen(false);
            setEditingPromo(null);
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Failed to update coupon";
            toast.error(errorMsg);
        }
    });

    // Toggle Mutation
    const toggleMutation = useMutation({
        mutationFn: promotionsApi.togglePromotion,
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Failed to update status";
            toast.error(errorMsg);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: promotionsApi.deletePromotion,
        onSuccess: () => {
            toast.success("Coupon deleted");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Failed to delete coupon";
            toast.error(errorMsg);
        }
    });

    const handleCreate = () => {
        if (!formData.code.trim() || !formData.name.trim() || !formData.discountValue || !formData.validUntil) {
            toast.error("Please fill all required fields");
            return;
        }
        createMutation.mutate({
            ...formData,
            code: formData.code.toUpperCase().replace(/\s+/g, ''),
            name: formData.name.trim(),
            description: formData.description?.trim()
        });
    };

    const handleOpenEdit = (promo: Promotion) => {
        setEditingPromo(promo);
        setEditFormData({
            id: promo._id || promo.id,
            code: promo.code || "",
            name: promo.name || "",
            description: promo.description || "",
            type: promo.type || "percentage",
            discountValue: promo.discountValue ?? 10,
            maxDiscount: promo.maxDiscount ?? undefined,
            minOrderAmount: promo.minOrderAmount ?? 0,
            maxUses: promo.maxUses ? promo.maxUses : undefined,
            maxUsesPerUser: promo.maxUsesPerUser ?? 1,
            validUntil: formatDateForInput(promo.validUntil),
            isActive: promo.isActive !== false
        });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!editFormData.id) return;
        if (!editFormData.code.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }
        if (!editFormData.name.trim()) {
            toast.error("Please enter a campaign name");
            return;
        }
        if (editFormData.discountValue <= 0) {
            toast.error("Discount value must be greater than 0");
            return;
        }
        if (!editFormData.validUntil) {
            toast.error("Please specify a valid expiry date");
            return;
        }

        updateMutation.mutate({
            id: editFormData.id,
            data: {
                code: editFormData.code.toUpperCase().replace(/\s+/g, ''),
                name: editFormData.name.trim(),
                description: editFormData.description?.trim(),
                type: editFormData.type,
                discountValue: editFormData.discountValue,
                maxDiscount: editFormData.type === 'percentage' && editFormData.maxDiscount ? Number(editFormData.maxDiscount) : undefined,
                minOrderAmount: Number(editFormData.minOrderAmount) || 0,
                maxUses: editFormData.maxUses ? Number(editFormData.maxUses) : undefined,
                maxUsesPerUser: Number(editFormData.maxUsesPerUser) || 1,
                validUntil: editFormData.validUntil,
                isActive: editFormData.isActive
            }
        });
    };

    const promotions = data?.data || [];
    const filteredPromotions = promotions.filter(p => 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-stone-900">Offers & Coupons</h2>
                    <p className="text-stone-500 text-sm">Create, edit, and manage discount codes for your customers.</p>
                </div>
                <Button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Coupon
                </Button>
            </div>

            <Card className="border-stone-200 shadow-xs">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-stone-400" />
                        <Input 
                            placeholder="Search by code or campaign name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm h-9 border-stone-200"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                            <span className="text-xs">Loading coupons...</span>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-stone-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-stone-50/70">
                                    <TableRow>
                                        <TableHead className="font-bold text-stone-700">Code & Name</TableHead>
                                        <TableHead className="font-bold text-stone-700">Discount</TableHead>
                                        <TableHead className="font-bold text-stone-700">Min. Order</TableHead>
                                        <TableHead className="font-bold text-stone-700">Usage Limit</TableHead>
                                        <TableHead className="font-bold text-stone-700">Validity</TableHead>
                                        <TableHead className="font-bold text-stone-700">Status</TableHead>
                                        <TableHead className="text-right font-bold text-stone-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPromotions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10 text-stone-400 text-sm">
                                                No coupons found. Click "Create Coupon" to add one!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPromotions.map((promo) => {
                                            const isExpired = new Date(promo.validUntil) < new Date();
                                            return (
                                                <TableRow key={promo._id || promo.id} className="hover:bg-stone-50/60 transition-colors">
                                                    <TableCell>
                                                        <div className="font-bold text-orange-600 tracking-wider bg-orange-50 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-orange-200 text-xs">
                                                            <Tag className="w-3 h-3 text-orange-500" />
                                                            {promo.code}
                                                        </div>
                                                        <div className="text-xs font-semibold text-stone-800 mt-1">{promo.name}</div>
                                                        {promo.description && (
                                                            <div className="text-[11px] text-stone-400 truncate max-w-xs">{promo.description}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold text-stone-900">
                                                            {promo.type === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`} OFF
                                                        </div>
                                                        <div className="text-[11px] text-stone-500">
                                                            {promo.type === 'percentage' && promo.maxDiscount 
                                                                ? `Up to ₹${promo.maxDiscount}` 
                                                                : promo.type === 'percentage' ? 'No cap' : 'Flat discount'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm font-semibold text-stone-800">
                                                            {promo.minOrderAmount > 0 ? `₹${promo.minOrderAmount}` : 'No minimum'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <span className="font-bold text-stone-900">{promo.usedCount}</span>
                                                            <span className="text-stone-400">/</span>
                                                            <span className="text-stone-600">{promo.maxUses || '∞'}</span>
                                                        </div>
                                                        <div className="text-[10px] text-stone-400">
                                                            {promo.maxUsesPerUser ? `${promo.maxUsesPerUser}x per user` : '1x per user'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs font-medium text-stone-800">
                                                            {format(new Date(promo.validUntil), "MMM dd, yyyy")}
                                                        </div>
                                                        <div className="text-[11px] mt-0.5">
                                                            {isExpired ? (
                                                                <span className="text-rose-600 font-bold">Expired</span>
                                                            ) : (
                                                                <span className="text-emerald-600 font-semibold">Active Period</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant={promo.isActive && !isExpired ? "default" : "secondary"} 
                                                            className={promo.isActive && !isExpired 
                                                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0 font-bold" 
                                                                : "bg-stone-100 text-stone-600 border-0"
                                                            }
                                                        >
                                                            {promo.isActive ? 'Active' : 'Disabled'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-1.5">
                                                            {/* Edit Button */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600 border-stone-200 cursor-pointer text-stone-700"
                                                                onClick={() => handleOpenEdit(promo)}
                                                                title="Edit Coupon"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>

                                                            {/* Toggle Power Button */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className={`h-8 w-8 border-stone-200 cursor-pointer ${
                                                                    promo.isActive 
                                                                        ? "hover:bg-amber-50 text-amber-600" 
                                                                        : "hover:bg-emerald-50 text-emerald-600"
                                                                }`}
                                                                onClick={() => toggleMutation.mutate(promo._id || promo.id)}
                                                                title={promo.isActive ? "Disable Coupon" : "Enable Coupon"}
                                                                disabled={toggleMutation.isPending}
                                                            >
                                                                {promo.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                            </Button>

                                                            {/* Delete Button */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 border-stone-200 cursor-pointer text-stone-500"
                                                                onClick={() => {
                                                                    if (window.confirm(`Are you sure you want to delete coupon ${promo.code}?`)) {
                                                                        deleteMutation.mutate(promo._id || promo.id);
                                                                    }
                                                                }}
                                                                title="Delete Coupon"
                                                                disabled={deleteMutation.isPending}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ============================================================== */}
            {/* EDIT COUPON DIALOG                                             */}
            {/* ============================================================== */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[540px] max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black text-stone-900">
                            <span className="p-2 bg-orange-100 rounded-xl text-orange-600">
                                <Pencil className="w-4 h-4" />
                            </span>
                            Edit Coupon: <span className="font-mono text-orange-600">{editFormData.code || 'COUPON'}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Update coupon code, discount percentage, order restrictions, and validity.
                        </DialogDescription>
                    </DialogHeader>

                    {editingPromo && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-amber-700" />
                                <span>Used <strong className="font-bold">{editingPromo.usedCount}</strong> times so far</span>
                            </div>
                            <Badge 
                                variant={editFormData.isActive ? "default" : "secondary"} 
                                className={editFormData.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}
                            >
                                {editFormData.isActive ? 'Active' : 'Disabled'}
                            </Badge>
                        </div>
                    )}

                    <div className="grid gap-3.5 py-1">
                        {/* Row 1: Code & Campaign Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Coupon Code*</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    <Input 
                                        placeholder="e.g. WELCOME10" 
                                        className="pl-9 uppercase font-bold text-stone-900 tracking-wider"
                                        value={editFormData.code}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData, 
                                            code: e.target.value.toUpperCase().replace(/\s+/g, '')
                                        })}
                                    />
                                </div>
                                <span className="text-[10px] text-stone-400">Uppercase letters & numbers only</span>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Campaign Name*</Label>
                                <Input 
                                    placeholder="e.g. New User Offer" 
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                />
                                <span className="text-[10px] text-stone-400">Internal & customer display title</span>
                            </div>
                        </div>

                        {/* Row 2: Discount Type & Discount Value */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Discount Type</Label>
                                <Select 
                                    value={editFormData.type} 
                                    onValueChange={(v: any) => setEditFormData({...editFormData, type: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">
                                    Discount Value* {editFormData.type === 'percentage' ? '(%)' : '(₹)'}
                                </Label>
                                <div className="relative">
                                    {editFormData.type === 'percentage' ? (
                                        <Percent className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    ) : (
                                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    )}
                                    <Input 
                                        type="number"
                                        min="1"
                                        className="pl-9 font-bold"
                                        value={editFormData.discountValue || ''}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData, 
                                            discountValue: e.target.value === '' ? 0 : Number(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Max Discount (for %) & Min Order Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {editFormData.type === 'percentage' ? (
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-stone-700">Max Discount Limit (₹)</Label>
                                    <Input 
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 100 (optional)"
                                        value={editFormData.maxDiscount ?? ''}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData, 
                                            maxDiscount: e.target.value === '' ? undefined : Number(e.target.value)
                                        })}
                                    />
                                    <span className="text-[10px] text-stone-400">Leave empty for no limit cap</span>
                                </div>
                            ) : (
                                <div className="space-y-1 opacity-50">
                                    <Label className="text-xs font-bold text-stone-500">Max Discount Limit</Label>
                                    <Input disabled placeholder="N/A for fixed amount" />
                                    <span className="text-[10px] text-stone-400">Only for percentage discounts</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Min Order Amount (₹)</Label>
                                <Input 
                                    type="number"
                                    min="0"
                                    placeholder="0 for no minimum"
                                    value={editFormData.minOrderAmount ?? ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData, 
                                        minOrderAmount: e.target.value === '' ? 0 : Number(e.target.value)
                                    })}
                                />
                                <span className="text-[10px] text-stone-400">0 means no minimum required</span>
                            </div>
                        </div>

                        {/* Row 4: Total Usage Limit & Per User Limit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Total Usage Limit</Label>
                                <Input 
                                    type="number"
                                    min="1"
                                    placeholder="Leave empty for unlimited"
                                    value={editFormData.maxUses ?? ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData, 
                                        maxUses: e.target.value === '' ? undefined : Number(e.target.value)
                                    })}
                                />
                                <span className="text-[10px] text-stone-400">Total redemptions across all users</span>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Max Uses Per Customer</Label>
                                <Input 
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 1"
                                    value={editFormData.maxUsesPerUser || 1}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData, 
                                        maxUsesPerUser: e.target.value === '' ? 1 : Math.max(1, Number(e.target.value))
                                    })}
                                />
                                <span className="text-[10px] text-stone-400">Times 1 customer can use this</span>
                            </div>
                        </div>

                        {/* Row 5: Validity Date & Active Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Valid Until (Expiry Date)*</Label>
                                <Input 
                                    type="date"
                                    value={editFormData.validUntil}
                                    onChange={(e) => setEditFormData({...editFormData, validUntil: e.target.value})}
                                />
                                <span className="text-[10px] text-stone-400">Expires at 11:59 PM on this date</span>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Coupon Status</Label>
                                <Select 
                                    value={editFormData.isActive ? "active" : "disabled"} 
                                    onValueChange={(v) => setEditFormData({...editFormData, isActive: v === "active"})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active (Customers can use)</SelectItem>
                                        <SelectItem value="disabled">Disabled (Cannot be used)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 6: Description */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Description / Terms (Optional)</Label>
                            <Textarea 
                                placeholder="e.g. Applicable only on lunch & dinner thalis. Valid for this week."
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                rows={2}
                                className="resize-none text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditOpen(false)}
                            disabled={updateMutation.isPending}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleUpdate} 
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer" 
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ============================================================== */}
            {/* CREATE COUPON DIALOG                                           */}
            {/* ============================================================== */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[540px] max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black text-stone-900">
                            <span className="p-2 bg-orange-100 rounded-xl text-orange-600">
                                <Plus className="w-4 h-4" />
                            </span>
                            Create New Coupon
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            Generate a new discount code for your customers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3.5 py-1">
                        {/* Row 1: Code & Campaign Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Coupon Code*</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    <Input 
                                        placeholder="e.g. WELCOME10" 
                                        className="pl-9 uppercase font-bold text-stone-900 tracking-wider"
                                        value={formData.code}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            code: e.target.value.toUpperCase().replace(/\s+/g, '')
                                        })}
                                    />
                                </div>
                                <span className="text-[10px] text-stone-400">Uppercase letters & numbers only</span>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Campaign Name*</Label>
                                <Input 
                                    placeholder="e.g. New User Offer" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                                <span className="text-[10px] text-stone-400">Visible title for promotion</span>
                            </div>
                        </div>

                        {/* Row 2: Discount Type & Discount Value */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Discount Type</Label>
                                <Select 
                                    value={formData.type} 
                                    onValueChange={(v: any) => setFormData({...formData, type: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">
                                    Discount Value* {formData.type === 'percentage' ? '(%)' : '(₹)'}
                                </Label>
                                <div className="relative">
                                    {formData.type === 'percentage' ? (
                                        <Percent className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    ) : (
                                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                                    )}
                                    <Input 
                                        type="number"
                                        min="1"
                                        className="pl-9 font-bold"
                                        value={formData.discountValue || ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            discountValue: e.target.value === '' ? 0 : Number(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Max Discount & Min Order Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {formData.type === 'percentage' ? (
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-stone-700">Max Discount Limit (₹)</Label>
                                    <Input 
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 100 (optional)"
                                        value={formData.maxDiscount ?? ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            maxDiscount: e.target.value === '' ? undefined : Number(e.target.value)
                                        })}
                                    />
                                    <span className="text-[10px] text-stone-400">Leave empty for no upper cap</span>
                                </div>
                            ) : (
                                <div className="space-y-1 opacity-50">
                                    <Label className="text-xs font-bold text-stone-500">Max Discount Limit</Label>
                                    <Input disabled placeholder="N/A for fixed amount" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Min Order Amount (₹)</Label>
                                <Input 
                                    type="number"
                                    min="0"
                                    placeholder="0 for no minimum"
                                    value={formData.minOrderAmount ?? ''}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        minOrderAmount: e.target.value === '' ? 0 : Number(e.target.value)
                                    })}
                                />
                                <span className="text-[10px] text-stone-400">0 means applicable to all orders</span>
                            </div>
                        </div>

                        {/* Row 4: Total Usage Limit & Per User Limit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Total Usage Limit</Label>
                                <Input 
                                    type="number"
                                    min="1"
                                    placeholder="Leave empty for unlimited"
                                    value={formData.maxUses ?? ''}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        maxUses: e.target.value === '' ? undefined : Number(e.target.value)
                                    })}
                                />
                                <span className="text-[10px] text-stone-400">Total redemptions across all users</span>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-stone-700">Max Uses Per Customer</Label>
                                <Input 
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 1"
                                    value={formData.maxUsesPerUser || 1}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        maxUsesPerUser: e.target.value === '' ? 1 : Math.max(1, Number(e.target.value))
                                    })}
                                />
                                <span className="text-[10px] text-stone-400">Times 1 customer can use this</span>
                            </div>
                        </div>

                        {/* Row 5: Validity Date */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Valid Until (Expiry Date)*</Label>
                            <Input 
                                type="date"
                                value={formData.validUntil}
                                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                            />
                            <span className="text-[10px] text-stone-400">Expires at 11:59 PM on this date</span>
                        </div>

                        {/* Row 6: Description */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-stone-700">Description / Terms (Optional)</Label>
                            <Textarea 
                                placeholder="e.g. Applicable only on homemade thalis. Valid till end of the month."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={2}
                                className="resize-none text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsCreateOpen(false)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreate} 
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer" 
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Coupon"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
