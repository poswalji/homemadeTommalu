'use client';

import { useState } from 'react';
import { usePendingStores, useApproveStore, useRejectStore } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminPendingStoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const { data, isLoading, error } = usePendingStores();
  const approveStore = useApproveStore();
  const rejectStore = useRejectStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading pending stores</p>
      </div>
    );
  }

  const stores = data?.data || [];
  const filteredStores = stores.filter((store: any) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const ownerName = typeof store.ownerId === 'object' && store.ownerId !== null 
        ? store.ownerId.name 
        : null;
      return (
        store.storeName?.toLowerCase().includes(searchLower) ||
        store.address?.toLowerCase().includes(searchLower) ||
        (ownerName && ownerName.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleApprove = (storeId: string) => {
    if (confirm('Are you sure you want to approve this store?')) {
      approveStore.mutate(storeId);
    }
  };

  const handleRejectClick = (store: any) => {
    setSelectedStore(store);
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (selectedStore) {
      rejectStore.mutate(
        { id: selectedStore._id || selectedStore.id, data: { reason: rejectReason } },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setSelectedStore(null);
            setRejectReason('');
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Stores</h1>
        <p className="text-gray-600 mt-2">Review and approve stores waiting for verification</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No pending stores found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store: any) => (
              <Card key={store._id || store.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{store.storeName}</h3>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                  <Badge variant="outline">{store.status}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{store.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Owner:</span>
                    <span className="font-medium">
                      {store.ownerId?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{store.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">License:</span>
                    <span className="font-medium">{store.licenseNumber}</span>
                  </div>
                </div>

                {store.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {store.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApprove(store._id || store.id)}
                    disabled={approveStore.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectClick(store)}
                    disabled={rejectStore.isPending}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Store</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this store application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectStore.isPending}
            >
              {rejectStore.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Rejecting...
                </>
              ) : (
                'Reject Store'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

