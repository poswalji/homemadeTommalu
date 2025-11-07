'use client';

import { useState } from 'react';
import {
   useStoreOwnerOrders,
   useStoreOwnerUpdateOrderStatus,
} from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import {
   Package,
   Search,
   Eye,
   CheckCircle,
   XCircle,
   Truck,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSocket } from '@/context/socket-context';
import Image from 'next/image';

export default function StoreOwnerOrdersPage() {
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('');
   const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
   const [statusUpdate, setStatusUpdate] = useState({
      status: '',
      rejectionReason: '',
      cancellationReason: '',
   });
   const [isDialogOpen, setIsDialogOpen] = useState(false);

   const { data, isLoading, error } = useStoreOwnerOrders();
   const updateStatus = useStoreOwnerUpdateOrderStatus();
   const { stopNotificationSound } = useSocket();

   const handleStatusUpdate = async () => {
      if (!selectedOrder || !statusUpdate.status) {
         toast.error('Please select a status');
         return;
      }

      try {
         await updateStatus.mutateAsync({
            orderId: selectedOrder,
            data: {
               status: statusUpdate.status as any,
               ...(statusUpdate.status === 'Rejected' &&
               statusUpdate.rejectionReason
                  ? { rejectionReason: statusUpdate.rejectionReason }
                  : {}),
               ...(statusUpdate.status === 'Cancelled' &&
               statusUpdate.cancellationReason
                  ? { cancellationReason: statusUpdate.cancellationReason }
                  : {}),
            },
         });
         if (selectedOrder && statusUpdate.status !== 'Pending') {
            stopNotificationSound(selectedOrder);
         }
         toast.success(`Order status updated to ${statusUpdate.status}`);
         setIsDialogOpen(false);
         setSelectedOrder(null);
         setStatusUpdate({
            status: '',
            rejectionReason: '',
            cancellationReason: '',
         });
      } catch (error: any) {
         toast.error(
            error?.response?.data?.message || 'Failed to update order status'
         );
      }
   };

   const openStatusDialog = (orderId: string, currentStatus: string) => {
      setSelectedOrder(orderId);
      setStatusUpdate({
         status: currentStatus,
         rejectionReason: '',
         cancellationReason: '',
      });
      setIsDialogOpen(true);
   };

   if (isLoading) {
      return (
         <div className='flex items-center justify-center h-64'>
            <Spinner size='lg' />
         </div>
      );
   }

   if (error) {
      return (
         <div className='text-center py-8'>
            <p className='text-red-600'>Error loading orders</p>
         </div>
      );
   }

   const orders = data?.data || [];
   const filteredOrders = orders.filter((order: any) => {
      if (searchTerm) {
         const searchLower = searchTerm.toLowerCase();
         return (
            order.id?.toLowerCase().includes(searchLower) ||
            order.customerName?.toLowerCase().includes(searchLower) ||
            order.storeName?.toLowerCase().includes(searchLower)
         );
      }
      if (statusFilter) {
         return order.status === statusFilter;
      }
      return true;
   });

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'Delivered':
            return 'bg-green-100 text-green-800';
         case 'Pending':
            return 'bg-yellow-100 text-yellow-800';
         case 'Confirmed':
            return 'bg-blue-100 text-blue-800';
         case 'OutForDelivery':
            return 'bg-purple-100 text-purple-800';
         case 'Cancelled':
         case 'Rejected':
            return 'bg-red-100 text-red-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'Delivered':
            return <CheckCircle className='w-4 h-4' />;
         case 'OutForDelivery':
            return <Truck className='w-4 h-4' />;
         case 'Rejected':
         case 'Cancelled':
            return <XCircle className='w-4 h-4' />;
         default:
            return <Package className='w-4 h-4' />;
      }
   };

   return (
      <div className='space-y-6'>
         <div>
            <h1 className='text-3xl font-bold text-gray-900'>
               Orders Management
            </h1>
            <p className='text-gray-600 mt-2'>
               View and manage orders for your stores
            </p>
         </div>

         <Card className='p-6'>
            <div className='flex gap-4 mb-6 flex-wrap'>
               <div className='flex-1 min-w-[200px] relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                  <Input
                     placeholder='Search orders...'
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className='pl-10'
                  />
               </div>
               <Select
                  value={statusFilter}
                  onValueChange={(e) => {
                     if (e === 'All') {
                        setStatusFilter('');
                        return;
                     }
                     setStatusFilter(e);
                  }}>
                  <SelectTrigger className='w-[180px]'>
                     <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value='All'>All Statuses</SelectItem>
                     <SelectItem value='Pending'>Pending</SelectItem>
                     <SelectItem value='Confirmed'>Confirmed</SelectItem>
                     <SelectItem value='Rejected'>Rejected</SelectItem>
                  </SelectContent>
               </Select>
            </div>

            {filteredOrders.length === 0 ? (
               <div className='text-center py-12'>
                  <Package className='w-16 h-16 mx-auto text-gray-400 mb-4' />
                  <h3 className='text-xl font-semibold mb-2'>
                     No orders found
                  </h3>
                  <p className='text-gray-600'>
                     Orders from your stores will appear here
                  </p>
               </div>
            ) : (
               <div className='space-y-4'>
                  {filteredOrders.map((order: any) => (
                     <Card
                        key={order.id}
                        className='p-6 hover:shadow-lg transition-shadow'>
                        <div className='flex items-start justify-between mb-4'>
                           <div>
                              <div className='flex items-center gap-3 mb-2'>
                                 <h3 className='text-lg font-semibold'>
                                    Order #{order.id?.slice(0, 8)}
                                 </h3>
                                 <Badge
                                    className={getStatusColor(order.status)}>
                                    <span className='flex items-center gap-1'>
                                       {getStatusIcon(order.status)}
                                       {order.status}
                                    </span>
                                 </Badge>
                              </div>
                              <p className='text-sm text-gray-600'>
                                 Customer: {order.customerName || 'N/A'}
                              </p>
                              <p className='text-sm text-gray-600'>
                                 Store: {order.storeName || 'N/A'}
                              </p>
                           </div>
                           <div className='text-right'>
                              <p className='text-2xl font-bold'>
                                 ₹{order.finalPrice}
                              </p>
                              <p className='text-sm text-gray-600'>
                                 {order.items?.length || 0} items
                              </p>
                           </div>
                        </div>
                        <div className='overflow-x-auto mb-4'>
                           <table className='min-w-full rounded-md border border-gray-200 bg-gray-50'>
                              <thead>
                                 <tr>
                                    <th className='px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b'>
                                       Item
                                    </th>
                                    <th className='px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b'>
                                       Qty
                                    </th>
                                    <th className='px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b'>
                                       Price
                                    </th>
                                    <th className='px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b'>
                                       Total
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {order.items?.map((item: any) => (
                                    <tr
                                       key={item.id}
                                       className='odd:bg-white even:bg-gray-50'>
                                       <td className='px-3 py-2 text-sm text-gray-800'>
                                          {item.itemName}
                                       </td>
                                       <td className='px-3 py-2 text-sm text-gray-800'>
                                          {item.quantity}
                                       </td>
                                       <td className='px-3 py-2 text-sm text-gray-800'>
                                          ₹{item.itemPrice}
                                       </td>
                                       <td className='px-3 py-2 text-sm text-gray-800'>
                                          ₹
                                          {Number(item.itemPrice) *
                                             Number(item.quantity)}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                           <div>
                              <p className='text-sm font-medium mb-1'>
                                 Order Date
                              </p>
                              <p className='text-sm text-gray-600'>
                                 {new Date(order.createdAt).toLocaleDateString(
                                    'en-IN',
                                    {
                                       year: 'numeric',
                                       month: 'long',
                                       day: 'numeric',
                                       hour: '2-digit',
                                       minute: '2-digit',
                                    }
                                 )}
                              </p>
                           </div>
                           {order.deliveryAddress && (
                              <div>
                                 <p className='text-sm font-medium mb-1'>
                                    Delivery Address
                                 </p>
                                 <p className='text-sm text-gray-600'>
                                    {order.deliveryAddress.street},{' '}
                                    {order.deliveryAddress.city}
                                    {order.deliveryAddress.pincode &&
                                       ` - ${order.deliveryAddress.pincode}`}
                                 </p>
                              </div>
                           )}
                        </div>

                        {order.rejectionReason && (
                           <div className='mb-4 p-3 bg-red-50 rounded-lg'>
                              <p className='text-sm font-medium text-red-800 mb-1'>
                                 Rejection Reason:
                              </p>
                              <p className='text-sm text-red-700'>
                                 {order.rejectionReason}
                              </p>
                           </div>
                        )}

                        {order.cancellationReason && (
                           <div className='mb-4 p-3 bg-orange-50 rounded-lg'>
                              <p className='text-sm font-medium text-orange-800 mb-1'>
                                 Cancellation Reason:
                              </p>
                              <p className='text-sm text-orange-700'>
                                 {order.cancellationReason}
                              </p>
                           </div>
                        )}

                        <div className='flex gap-2'>
                           <Link
                              href={`/store-owner/orders/${order.id}`}
                              className='flex-1'>
                              <Button
                                 variant='outline'
                                 className='w-full'>
                                 <Eye className='w-4 h-4 mr-2' />
                                 View Details
                              </Button>
                           </Link>
                           {['Pending', 'Confirmed'].includes(order.status) && (
                              <Dialog
                                 open={
                                    isDialogOpen && selectedOrder === order.id
                                 }
                                 onOpenChange={(open) => {
                                    setIsDialogOpen(open);
                                    if (!open) {
                                       setSelectedOrder(null);
                                       setStatusUpdate({
                                          status: '',
                                          rejectionReason: '',
                                          cancellationReason: '',
                                       });
                                    }
                                 }}>
                                 <DialogTrigger asChild>
                                    <Button
                                       variant='default'
                                       className='flex-1'
                                       onClick={() =>
                                          openStatusDialog(
                                             order.id,
                                             order.status
                                          )
                                       }>
                                       Update Status
                                    </Button>
                                 </DialogTrigger>
                                 <DialogContent>
                                    <DialogHeader>
                                       <DialogTitle>
                                          Update Order Status
                                       </DialogTitle>
                                       <DialogDescription>
                                          Update the status for Order #
                                          {order.id?.slice(0, 8)}
                                       </DialogDescription>
                                    </DialogHeader>
                                    <div className='space-y-4 py-4'>
                                       <div>
                                          <Label htmlFor='status'>Status</Label>
                                          <Select
                                             value={statusUpdate.status || ''}
                                             onValueChange={(value) =>
                                                setStatusUpdate({
                                                   ...statusUpdate,
                                                   status: value,
                                                })
                                             }>
                                             <SelectTrigger>
                                                <SelectValue placeholder='Select status' />
                                             </SelectTrigger>
                                             <SelectContent>
                                                <SelectItem value='Pending'>
                                                   Pending
                                                </SelectItem>
                                                <SelectItem value='Confirmed'>
                                                   Confirmed
                                                </SelectItem>
                                                <SelectItem value='OutForDelivery'>
                                                   Out for Delivery
                                                </SelectItem>
                                                <SelectItem value='Delivered'>
                                                   Delivered
                                                </SelectItem>
                                                <SelectItem value='Rejected'>
                                                   Rejected
                                                </SelectItem>
                                                <SelectItem value='Cancelled'>
                                                   Cancelled
                                                </SelectItem>
                                             </SelectContent>
                                          </Select>
                                       </div>
                                       {statusUpdate.status === 'Rejected' && (
                                          <div>
                                             <Label htmlFor='rejectionReason'>
                                                Rejection Reason
                                             </Label>
                                             <Textarea
                                                id='rejectionReason'
                                                placeholder='Enter reason for rejection...'
                                                value={
                                                   statusUpdate.rejectionReason
                                                }
                                                onChange={(e) =>
                                                   setStatusUpdate({
                                                      ...statusUpdate,
                                                      rejectionReason:
                                                         e.target.value,
                                                   })
                                                }
                                             />
                                          </div>
                                       )}
                                       {statusUpdate.status === 'Cancelled' && (
                                          <div>
                                             <Label htmlFor='cancellationReason'>
                                                Cancellation Reason
                                             </Label>
                                             <Textarea
                                                id='cancellationReason'
                                                placeholder='Enter reason for cancellation...'
                                                value={
                                                   statusUpdate.cancellationReason
                                                }
                                                onChange={(e) =>
                                                   setStatusUpdate({
                                                      ...statusUpdate,
                                                      cancellationReason:
                                                         e.target.value,
                                                   })
                                                }
                                             />
                                          </div>
                                       )}
                                    </div>
                                    <DialogFooter>
                                       <Button
                                          variant='outline'
                                          onClick={() => {
                                             setIsDialogOpen(false);
                                             setSelectedOrder(null);
                                          }}>
                                          Cancel
                                       </Button>
                                       <Button
                                          onClick={handleStatusUpdate}
                                          disabled={updateStatus.isPending}>
                                          {updateStatus.isPending ? (
                                             <>
                                                <Spinner
                                                   size='sm'
                                                   className='mr-2'
                                                />
                                                Updating...
                                             </>
                                          ) : (
                                             'Update Status'
                                          )}
                                       </Button>
                                    </DialogFooter>
                                 </DialogContent>
                              </Dialog>
                           )}
                        </div>
                     </Card>
                  ))}
               </div>
            )}
         </Card>
      </div>
   );
}
