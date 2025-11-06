'use client';

import { useState } from 'react';
import { useAllPromotions, useCreatePromotion, useUpdatePromotion, useTogglePromotion, useDeletePromotion } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Ticket, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import type { CreatePromotionData } from '@/services/api/promotions.api';

export default function CouponsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<CreatePromotionData>>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    discountValue: 0,
    maxDiscount: undefined,
    minOrderAmount: 0,
    applicableTo: 'all',
    maxUses: undefined,
    maxUsesPerUser: 1,
    validUntil: '',
  });

  const { data: promotionsData, isLoading } = useAllPromotions({ page: 1, limit: 100 });
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const togglePromotion = useTogglePromotion();
  const deletePromotion = useDeletePromotion();

  const promotions = promotionsData?.data || [];

  const handleCreate = async () => {
    try {
      if (!formData.code || !formData.name || !formData.validUntil) {
        toast.error('Please fill all required fields');
        return;
      }

      await createPromotion.mutateAsync({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        type: formData.type as any,
        discountValue: formData.discountValue || 0,
        maxDiscount: formData.maxDiscount,
        minOrderAmount: formData.minOrderAmount || 0,
        applicableTo: formData.applicableTo,
        maxUses: formData.maxUses,
        maxUsesPerUser: formData.maxUsesPerUser || 1,
        validUntil: formData.validUntil,
      });

      toast.success('Coupon created successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      discountValue: promotion.discountValue,
      maxDiscount: promotion.maxDiscount,
      minOrderAmount: promotion.minOrderAmount,
      applicableTo: promotion.applicableTo,
      maxUses: promotion.maxUses,
      maxUsesPerUser: promotion.maxUsesPerUser,
      validUntil: new Date(promotion.validUntil).toISOString().split('T')[0],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPromotion) return;

    try {
      await updatePromotion.mutateAsync({
        id: editingPromotion._id || editingPromotion.id,
        data: formData,
      });

      toast.success('Coupon updated successfully!');
      setIsEditDialogOpen(false);
      resetForm();
      setEditingPromotion(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await togglePromotion.mutateAsync(id);
      toast.success('Coupon status updated');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await deletePromotion.mutateAsync(id);
      toast.success('Coupon deleted successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      discountValue: 0,
      maxDiscount: undefined,
      minOrderAmount: 0,
      applicableTo: 'all',
      maxUses: undefined,
      maxUsesPerUser: 1,
      validUntil: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Code</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Discount</th>
                    <th className="text-left p-4">Usage</th>
                    <th className="text-left p-4">Valid Until</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-gray-500">
                        No coupons found. Create your first coupon!
                      </td>
                    </tr>
                  ) : (
                    promotions.map((promotion: any) => (
                      <tr key={promotion._id || promotion.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <Badge variant="outline" className="font-mono">
                            {promotion.code}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">{promotion.name}</td>
                        <td className="p-4">
                          <Badge variant="secondary">
                            {promotion.type === 'percentage' ? '%' : promotion.type === 'fixed' ? '₹' : promotion.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {promotion.type === 'percentage' ? (
                            <span>{promotion.discountValue}%</span>
                          ) : promotion.type === 'fixed' ? (
                            <span>₹{promotion.discountValue}</span>
                          ) : (
                            <span className="capitalize">{promotion.type.replace('_', ' ')}</span>
                          )}
                          {promotion.maxDiscount && (
                            <span className="text-xs text-gray-500 ml-1">
                              (max ₹{promotion.maxDiscount})
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {promotion.usedCount || 0} / {promotion.maxUses || '∞'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={isExpired(promotion.validUntil) ? 'text-red-600' : ''}>
                              {formatDate(promotion.validUntil)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={promotion.isActive && !isExpired(promotion.validUntil) ? 'default' : 'secondary'}
                          >
                            {promotion.isActive && !isExpired(promotion.validUntil) ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggle(promotion._id || promotion.id)}
                              disabled={togglePromotion.isPending}
                            >
                              {promotion.isActive ? (
                                <ToggleRight className="w-4 h-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(promotion)}
                              disabled={promotion.usedCount > 0}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(promotion._id || promotion.id)}
                              disabled={deletePromotion.isPending || promotion.usedCount > 0}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
            </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Coupon Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME10"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Coupon Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Welcome Discount"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Coupon description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Discount Type *</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_delivery">Free Delivery</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="discountValue">Discount Value *</Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      placeholder={formData.type === 'percentage' ? '10' : '100'}
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxDiscount">Max Discount (Optional)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="200"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      value={formData.maxUses || ''}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                    <Input
                      id="maxUsesPerUser"
                      type="number"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerUser: Number(e.target.value) })}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={createPromotion.isPending}>
                    {createPromotion.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Coupon'
                    )}
                  </Button>
                </DialogFooter>
              </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
            </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-code">Coupon Code</Label>
                    <Input
                      id="edit-code"
                      value={formData.code}
                      disabled
                      className="font-mono bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Coupon Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">Discount Type *</Label>
                    <select
                      id="edit-type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_delivery">Free Delivery</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-discountValue">Discount Value *</Label>
                    <Input
                      id="edit-discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-maxDiscount">Max Discount (Optional)</Label>
                    <Input
                      id="edit-maxDiscount"
                      type="number"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-minOrderAmount">Minimum Order Amount</Label>
                    <Input
                      id="edit-minOrderAmount"
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-maxUses">Max Uses (Optional)</Label>
                    <Input
                      id="edit-maxUses"
                      type="number"
                      value={formData.maxUses || ''}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : undefined })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-maxUsesPerUser">Max Uses Per User</Label>
                    <Input
                      id="edit-maxUsesPerUser"
                      type="number"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerUser: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-validUntil">Valid Until *</Label>
                  <Input
                    id="edit-validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={updatePromotion.isPending}>
                    {updatePromotion.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Coupon'
                    )}
                  </Button>
                </DialogFooter>
              </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

