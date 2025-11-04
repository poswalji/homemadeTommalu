'use client';

import { useMyStores } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Store } from 'lucide-react';

export default function StoreOwnerStoresPage() {
  const { data, isLoading, error } = useMyStores();

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
        <p className="text-red-600">Error loading stores</p>
      </div>
    );
  }

  const stores = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-9xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Stores</h1>
              <p className="text-gray-600 mt-1">Manage your stores and menu items</p>
            </div>
            <Link href="/store-owner/stores/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Store
              </Button>
            </Link>
          </div>
        </div>

        {stores.length === 0 ? (
          <Card className="p-12 text-center bg-white border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No stores yet</h3>
              <p className="text-gray-600 mb-6">Create your first store to get started</p>
              <Link href="/store-owner/stores/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Store
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card 
                key={store.id} 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{store.storeName}</h3>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                  <Badge variant={store.isOpen ? 'default' : 'secondary'}>
                    {store.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{store.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="outline">{store.verificationStatus || store.status || 'Pending'}</Badge>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link href={`/store-owner/stores/${store.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/store-owner/stores/${store.id}/menu`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Manage Menu
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

