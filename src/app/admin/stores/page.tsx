'use client';

import { useState } from 'react';
import { useAllStores, useUpdateStoreDeliveryFee, useApproveStore, useRejectStore, useSuspendStore, useReactivateStore } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, CheckCircle, XCircle, AlertTriangle, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import Link from 'next/link';

export default function AdminStoresPage() {
  const [editingStore, setEditingStore] = useState<any>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(30);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    city: '',
  });

  const { data: storesData, isLoading } = useAllStores({
    status: filters.status || undefined,
    category: filters.category || undefined,
    city: filters.city || undefined,
    limit: 100,
  });
  const updateDeliveryFee = useUpdateStoreDeliveryFee();
  const approveStore = useApproveStore();
  const rejectStore = useRejectStore();
  const suspendStore = useSuspendStore();
  const reactivateStore = useReactivateStore();

  const stores = storesData?.data || [];

  const handleEditDeliveryFee = (store: any) => {
    setEditingStore(store);
    setDeliveryFee(store.deliveryFee || 30);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDeliveryFee = async () => {
    if (!editingStore) return;

    try {
      await updateDeliveryFee.mutateAsync({
        id: editingStore._id || editingStore.id,
        data: { deliveryFee },
      });
      toast.success('Delivery charge updated successfully!');
      setIsEditDialogOpen(false);
      setEditingStore(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleApprove = async (storeId: string) => {
    try {
      await approveStore.mutateAsync(storeId);
      toast.success('Store approved successfully!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleReject = async (storeId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await rejectStore.mutateAsync({ id: storeId, data: { reason } });
      toast.success('Store rejected');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleSuspend = async (storeId: string) => {
    if (!confirm('Are you sure you want to suspend this store?')) return;

    try {
      await suspendStore.mutateAsync(storeId);
      toast.success('Store suspended');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleReactivate = async (storeId: string) => {
    if (!confirm('Are you sure you want to reactivate this store?')) return;

    try {
      await reactivateStore.mutateAsync(storeId);
      toast.success('Store reactivated successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      approved: { variant: 'default', label: 'Approved' },
      pendingApproval: { variant: 'secondary', label: 'Pending' },
      submitted: { variant: 'secondary', label: 'Submitted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      suspended: { variant: 'destructive', label: 'Suspended' },
      draft: { variant: 'secondary', label: 'Draft' },
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant as 'default' | 'secondary' | 'success' | 'outline' | null | undefined}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
  
      <main className="flex-1 ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Store Management</h1>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pendingApproval">Pending Approval</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Categories</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Grocery Store">Grocery Store</option>
                <option value="Bakery">Bakery</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Vegetable & Fruits">Vegetable & Fruits</option>
                <option value="Meat & Fish">Meat & Fish</option>
                <option value="Dairy">Dairy</option>
              </select>
            </div>
            <div>
              <Label htmlFor="city-filter">City</Label>
              <Input
                id="city-filter"
                placeholder="Filter by city"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>
          </div>
        </Card>

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
                    <th className="text-left p-4">Store Name</th>
                    <th className="text-left p-4">Owner</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Delivery Fee</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-gray-500">
                        No stores found
                      </td>
                    </tr>
                  ) : (
                    stores.map((store: any) => (
                      <tr key={store._id || store.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <Link 
                            href={`/admin/stores/${store._id || store.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {store.storeName}
                          </Link>
                          <div className="text-sm text-gray-500">{store.address}</div>
                          <div className="text-sm text-gray-400">{store.phone}</div>
                        </td>
                        <td className="p-4">
                          {store.ownerId ? (
                            <div>
                              <div className="font-medium">{store.ownerId.name}</div>
                              <div className="text-sm text-gray-500">{store.ownerId.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{store.category}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">₹{store.deliveryFee || 0}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDeliveryFee(store)}
                              className="h-6 px-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(store.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {store.status === 'pendingApproval' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(store._id || store.id)}
                                  disabled={approveStore.isPending}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(store._id || store.id)}
                                  disabled={rejectStore.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {store.status === 'active' ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleSuspend(store._id || store.id)}
                                disabled={suspendStore.isPending}
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" /> Suspend
                              </Button>
                            ) : store.status === 'suspended' ? (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReactivate(store._id || store.id)}
                                disabled={reactivateStore.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" /> Reactivate
                              </Button>
                            ) : null}
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

        {/* Edit Delivery Fee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Delivery Charge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="store-name">Store</Label>
                <Input
                  id="store-name"
                  value={editingStore?.storeName || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="delivery-fee">Delivery Charge (₹) *</Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">Default: ₹30</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDeliveryFee}
                disabled={updateDeliveryFee.isPending}
              >
                {updateDeliveryFee.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

