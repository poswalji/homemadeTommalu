'use client';

import { useStore, useToggleStoreStatus, useDeleteStore } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
   Store,
   Phone,
   MapPin,
   Clock,
   Package,
   Edit,
   Trash2,
   Menu,
   Power,
   ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function StoreDetailPage() {
   const router = useRouter();
   const params = useParams();
   const id = params?.id as string;
   const { data, isLoading, error } = useStore(id);
   const toggleStatus = useToggleStoreStatus();
   const deleteStore = useDeleteStore();
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);

   const handleDelete = async () => {
      try {
         await deleteStore.mutateAsync(id);
         toast.success('Store deleted successfully');
         router.push('/store-owner/stores');
      } catch (error: any) {
         toast.error(
            error?.response?.data?.error?.message || 'Failed to delete store'
         );
      } finally {
         setShowDeleteDialog(false);
      }
   };

   const handleToggleStatus = async () => {
      try {
         await toggleStatus.mutateAsync(id);
         toast.success(
            `Store is now ${data?.data?.isOpen ? 'closed' : 'open'}`
         );
      } catch (error: any) {
         toast.error(
            error?.response?.data?.error?.message ||
               'Failed to toggle store status'
         );
      }
   };

    if (isLoading) {
       return (
          <div className='flex items-center justify-center h-64'>
             <Spinner size='lg' />
          </div>
       );
    }

    if (error || !data?.data) {
      return (
         <div className='text-center py-8'>
            <p className='text-red-600 mb-4'>Store not found</p>
            <Link href='/store-owner/stores'>
               <Button variant='outline'>
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back to Stores
               </Button>
            </Link>
         </div>
      );
   }

   const store = data.data;

    return (
       <div className='min-h-screen bg-gray-50'>
          <div className='max-w-9xl mx-auto  space-y-6'>
             {/* Header */}
             <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                   <div className='flex items-center gap-4'>
                      <Link href='/store-owner/stores'>
                         <Button variant='ghost' size='sm'>
                            <ArrowLeft className='w-4 h-4 mr-2' />
                            Back
                         </Button>
                      </Link>
                      <div>
                         <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                            {store.storeName}
                         </h1>
                         <p className='text-gray-600 mt-1'>
                            {store.category}
                         </p>
                      </div>
                   </div>
                   <div className='flex gap-3'>
                      <Link href={`/store-owner/stores/${id}/menu`}>
                         <Button>
                            <Menu className='w-4 h-4 mr-2' />
                            Manage Menu
                         </Button>
                      </Link>
                      <Button
                         variant='outline'
                         onClick={handleToggleStatus}
                         disabled={toggleStatus.isPending}>
                         <Power className={`w-4 h-4 mr-2 ${store.isOpen ? 'text-green-600' : 'text-gray-600'}`} />
                         {store.isOpen ? 'Close' : 'Open'} Store
                      </Button>
                   </div>
                </div>
             </div>

             {/* Store Info */}
             <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Main Info */}
                <div className='lg:col-span-2 space-y-6'>
                   <Card className='bg-white border border-gray-200 rounded-lg shadow-sm'>
                      <CardHeader>
                         <CardTitle className='flex items-center gap-2'>
                            <Store className='w-5 h-5' />
                            Store Information
                         </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                         <div className='flex items-start gap-3'>
                            <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                            <div>
                               <p className='text-sm text-gray-600'>Address</p>
                               <p className='font-medium text-gray-900'>{store.address}</p>
                            </div>
                         </div>

                         <div className='flex items-start gap-3'>
                            <Phone className='w-5 h-5 text-gray-400 mt-0.5' />
                            <div>
                               <p className='text-sm text-gray-600'>Phone</p>
                               <p className='font-medium text-gray-900'>{store.phone}</p>
                            </div>
                         </div>

                         {store.description && (
                            <div>
                               <p className='text-sm text-gray-600 mb-1'>Description</p>
                               <p className='text-gray-900'>{store.description}</p>
                            </div>
                         )}

                         <div className='grid grid-cols-2 gap-4'>
                            <div>
                               <p className='text-sm text-gray-600 mb-1'>Status</p>
                               <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                                  {store.status || 'draft'}
                               </Badge>
                            </div>
                            <div>
                               <p className='text-sm text-gray-600 mb-1'>Verification</p>
                               <Badge variant={store.isVerified ? 'default' : 'secondary'}>
                                  {store.isVerified ? 'Verified' : 'Pending'}
                               </Badge>
                            </div>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className='bg-white border border-gray-200 rounded-lg shadow-sm'>
                      <CardHeader>
                         <CardTitle className='flex items-center gap-2'>
                            <Clock className='w-5 h-5' />
                            Operating Hours
                         </CardTitle>
                      </CardHeader>
                      <CardContent>
                         <div className='grid grid-cols-2 gap-4'>
                            <div>
                               <p className='text-sm text-gray-600 mb-1'>Opening Time</p>
                               <p className='font-medium text-gray-900'>{store.openingTime || '09:00'}</p>
                            </div>
                            <div>
                               <p className='text-sm text-gray-600 mb-1'>Closing Time</p>
                               <p className='font-medium text-gray-900'>{store.closingTime || '23:00'}</p>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </div>

                {/* Sidebar */}
                <div className='space-y-6'>
                   <Card className='bg-white border border-gray-200 rounded-lg shadow-sm'>
                      <CardHeader>
                         <CardTitle>Store Stats</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                         <div>
                            <p className='text-sm text-gray-600 mb-1'>Rating</p>
                            <p className='text-2xl font-bold text-gray-900'>{store.rating || 0}</p>
                            <p className='text-xs text-gray-500'>{store?.totalReviews || 0} reviews</p>
                         </div>
                         <div>
                            <p className='text-sm text-gray-600 mb-1'>Delivery Fee</p>
                            <p className='text-xl font-semibold text-gray-900'>₹{store.deliveryFee || 0}</p>
                         </div>
                         <div>
                            <p className='text-sm text-gray-600 mb-1'>Minimum Order</p>
                            <p className='text-xl font-semibold text-gray-900'>₹{store.minOrder || 0}</p>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className='bg-white border border-gray-200 rounded-lg shadow-sm'>
                      <CardHeader>
                         <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                         <Link href={`/store-owner/stores/${id}/menu`} className='block'>
                            <Button variant='outline' className='w-full justify-start'>
                               <Menu className='w-4 h-4 mr-2' />
                               Manage Menu
                            </Button>
                         </Link>
                         <Button variant='outline' className='w-full justify-start' disabled>
                            <Edit className='w-4 h-4 mr-2' />
                            Edit Store
                         </Button>
                         <Button 
                            variant='outline' 
                            className='w-full justify-start text-red-600 hover:text-red-700'
                            onClick={() => setShowDeleteDialog(true)}>
                            <Trash2 className='w-4 h-4 mr-2' />
                            Delete Store
                         </Button>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </div>

         {/* Delete Dialog */}
         <Dialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Delete Store</DialogTitle>
                  <DialogDescription>
                     Are you sure you want to delete this store? This action
                     cannot be undone and will delete all associated menu items.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button
                     variant='outline'
                     onClick={() => setShowDeleteDialog(false)}>
                     Cancel
                  </Button>
                  <Button
                     variant='destructive'
                     onClick={handleDelete}
                     disabled={deleteStore.isPending}>
                     {deleteStore.isPending ? (
                        <>
                           <Spinner
                              size='sm'
                              className='mr-2'
                           />
                           Deleting...
                        </>
                     ) : (
                        'Delete'
                     )}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
