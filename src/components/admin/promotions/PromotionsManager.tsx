"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Tag, Trash2, Power, PowerOff, Loader2, Search, Percent, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { promotionsApi, CreatePromotionData, Promotion } from "@/services/api/promotions.api";

export function PromotionsManager() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState<CreatePromotionData>({
        code: "",
        name: "",
        description: "",
        type: "percentage",
        discountValue: 10,
        minOrderAmount: 0,
        maxUses: undefined,
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-promotions'],
        queryFn: () => promotionsApi.getAllPromotions()
    });

    const createMutation = useMutation({
        mutationFn: promotionsApi.createPromotion,
        onSuccess: () => {
            toast.success("Coupon created successfully!");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
            setIsCreateOpen(false);
            // Reset form
            setFormData({
                code: "",
                name: "",
                description: "",
                type: "percentage",
                discountValue: 10,
                minOrderAmount: 0,
                maxUses: undefined,
                validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
            });
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Failed to create coupon";
            toast.error(errorMsg);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: promotionsApi.togglePromotion,
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        }
    });

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
        if (!formData.code || !formData.name || !formData.discountValue || !formData.validUntil) {
            toast.error("Please fill all required fields");
            return;
        }
        createMutation.mutate(formData);
    };

    const promotions = data?.data || [];
    const filteredPromotions = promotions.filter(p => 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Offers & Coupons</h2>
                    <p className="text-muted-foreground">Create and manage discount codes for your customers.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" /> Create Coupon
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <Input 
                            placeholder="Search by code or name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm h-9"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead>Code & Name</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Min. Order</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Validity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPromotions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                No coupons found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPromotions.map((promo) => (
                                            <TableRow key={promo._id || promo.id}>
                                                <TableCell>
                                                    <div className="font-bold text-orange-600 tracking-wider bg-orange-50 inline-block px-2 py-0.5 rounded border border-orange-100">
                                                        {promo.code}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">{promo.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold text-gray-900">
                                                        {promo.type === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`} OFF
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {promo.type === 'percentage' && promo.maxDiscount ? `Up to ₹${promo.maxDiscount}` : promo.type}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-gray-900">₹{promo.minOrderAmount}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-medium">{promo.usedCount}</span>
                                                        <span className="text-gray-400">/</span>
                                                        <span className="text-gray-500">{promo.maxUses || '∞'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {format(new Date(promo.validUntil), "MMM dd, yyyy")}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(promo.validUntil) < new Date() ? "Expired" : "Active"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={promo.isActive ? "default" : "secondary"} className={promo.isActive ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" : "bg-gray-100 text-gray-700 border-0"}>
                                                        {promo.isActive ? 'Active' : 'Disabled'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-8 w-8"
                                                            onClick={() => toggleMutation.mutate(promo._id || promo.id)}
                                                            title={promo.isActive ? "Disable Coupon" : "Enable Coupon"}
                                                        >
                                                            {promo.isActive ? <PowerOff className="w-4 h-4 text-orange-500" /> : <Power className="w-4 h-4 text-green-500" />}
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 border-gray-200"
                                                            onClick={() => {
                                                                if(window.confirm('Are you sure you want to delete this coupon?')) {
                                                                    deleteMutation.mutate(promo._id || promo.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Coupon</DialogTitle>
                        <DialogDescription>
                            Generate a new discount code for your customers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Coupon Code*</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <Input 
                                        placeholder="e.g. WELCOME10" 
                                        className="pl-9 uppercase font-bold"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '')})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Campaign Name*</Label>
                                <Input 
                                    placeholder="e.g. New User Offer" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
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
                            <div className="space-y-2">
                                <Label>Discount Value*</Label>
                                <div className="relative">
                                    {formData.type === 'percentage' ? (
                                        <Percent className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    ) : (
                                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    )}
                                    <Input 
                                        type="number"
                                        min="1"
                                        className="pl-9"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Order Amount (₹)</Label>
                                <Input 
                                    type="number"
                                    min="0"
                                    placeholder="0 for no minimum"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Usage Limit</Label>
                                <Input 
                                    type="number"
                                    min="1"
                                    placeholder="Leave empty for unlimited"
                                    value={formData.maxUses || ''}
                                    onChange={(e) => setFormData({...formData, maxUses: e.target.value ? Number(e.target.value) : undefined})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Valid Until*</Label>
                            <Input 
                                type="date"
                                value={formData.validUntil}
                                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700" disabled={createMutation.isPending}>
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Coupon"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
