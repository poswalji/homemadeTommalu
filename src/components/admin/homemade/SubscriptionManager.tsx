import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminSubscriptionPlans, useCreateSubscriptionPlan, useUpdateSubscriptionPlan, useDeleteSubscriptionPlan } from '@/hooks/api/use-homemade-food';

export function SubscriptionManager() {
    const { data: plansData, isLoading, refetch } = useAdminSubscriptionPlans();
    const createPlan = useCreateSubscriptionPlan();
    const updatePlan = useUpdateSubscriptionPlan();
    const deletePlan = useDeleteSubscriptionPlan();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        planType: 'lunch',
        price: 0,
        isActive: true,
        startDate: '',
        endDate: '',
        description: ''
    });

    const handleOpen = (plan?: any) => {
        if (plan) {
            setEditingId(plan._id);
            setForm({
                title: plan.title,
                planType: plan.planType,
                price: plan.price,
                isActive: plan.isActive,
                startDate: plan.startDate ? format(new Date(plan.startDate), 'yyyy-MM-dd') : '',
                endDate: plan.endDate ? format(new Date(plan.endDate), 'yyyy-MM-dd') : '',
                description: plan.features?.join(', ') || ''
            });
        } else {
            setEditingId(null);
            setForm({
                title: '',
                planType: 'lunch',
                price: 0,
                isActive: true,
                startDate: '',
                endDate: '',
                description: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...form,
                planType: form.planType as 'lunch' | 'dinner' | 'both',
                features: form.description.split(',').map(s => s.trim()).filter(Boolean)
            };

            if (editingId) {
                await updatePlan.mutateAsync({ id: editingId, data: payload });
                toast.success('Plan updated');
            } else {
                await createPlan.mutateAsync(payload);
                toast.success('Plan created');
            }
            setIsDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save plan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the plan model.')) return;
        try {
            await deletePlan.mutateAsync(id);
            toast.success('Plan deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Subscription Models</h2>
                <Button onClick={() => handleOpen()} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> New Plan
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plansData?.data?.map((plan: any) => (
                        <Card key={plan._id} className="relative overflow-hidden group hover:shadow-lg transition-all border-orange-100">
                            <div className={`absolute top-0 right-0 p-2 ${plan.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                {plan.isActive ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                                        <CardDescription className="capitalize">{plan.planType} Plan</CardDescription>
                                    </div>
                                    <Badge variant={plan.isActive ? 'default' : 'secondary'} className={plan.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-2xl font-bold text-orange-600">₹{plan.price}</div>

                                    <div className="space-y-1 text-sm text-gray-500">
                                        {plan.startDate && (
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>Starts: {format(new Date(plan.startDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                        )}
                                        {plan.endDate && (
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>Ends: {format(new Date(plan.endDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpen(plan)}>
                                            <Edit className="w-3 h-3 mr-2" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(plan._id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={form.planType} onValueChange={(val) => setForm({ ...form, planType: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lunch">Lunch</SelectItem>
                                        <SelectItem value="dinner">Dinner</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (₹)</label>
                                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Internal Title</label>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. January Special Lunch" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium">Active Status</label>
                            <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Features (Comma separated)</label>
                            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Free Delivery, Extra Roti" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-orange-600 text-white">Save Plan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
