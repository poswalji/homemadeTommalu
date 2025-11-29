'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateStore } from '@/hooks/api';
import { StoreCategory } from '@/services/api/public.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Store, Save } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { toast } from 'sonner';

const STORE_CATEGORIES = [
   'Restaurant',
   'Grocery Store',
   'Bakery',
   'Pharmacy',
   'Homemade Food',
   'Dairy',
   'Other',
];

export default function CreateStorePage() {
   const router = useRouter();
   const createStore = useCreateStore();

   const [formData, setFormData] = useState({
      storeName: '',
      address: '',
      phone: '',

      category: 'Restaurant' as string,
      description: '',
      openingTime: '09:00',
      closingTime: '23:00',
   });

   const [errors, setErrors] = useState<Record<string, string>>({});

   const handleChange = (
      e: React.ChangeEvent<
         HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
      // Clear error when user starts typing
      if (errors[name]) {
         setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
         });
      }
   };
   const handleSelectChange = (name: string, value: string) => {
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
      // Clear error when user starts typing
      if (errors[name]) {
         setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
         });
      }
   };
   const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.storeName.trim()) {
         newErrors.storeName = 'Store name is required';
      }
      if (!formData.address.trim()) {
         newErrors.address = 'Address is required';
      }
      if (!formData.phone.trim()) {
         newErrors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
         newErrors.phone = 'Please enter a valid 10-digit phone number';
      }

      if (!formData.category) {
         newErrors.category = 'Category is required';
      }
      if (!formData.openingTime) {
         newErrors.openingTime = 'Opening time is required';
      }
      if (!formData.closingTime) {
         newErrors.closingTime = 'Closing time is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         toast.error('Please fix the errors in the form');
         return;
      }

      try {
         const storeData = {
            ...formData,
         };

         const response = await createStore.mutateAsync({
            ...storeData,
            category: storeData.category as StoreCategory,
         });
         toast.success(
            'Store created successfully! Now add menu items to your store.'
         );
         // Redirect to menu management page
         const storeId = response?.data?.id || response?.data?._id;
         if (storeId) {
            router.push(`/store-owner/stores/${storeId}/menu`);
         } else {
            router.push('/store-owner/stores');
         }
      } catch (error: any) {
         toast.error(
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            'Failed to create store'
         );
      }
   };

   return (
      <div className='min-h-screen bg-gray-50'>
         <div className='max-w-4xl mx-auto  space-y-6'>
            {/* Header */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
               <div className='flex flex-col gap-4'>
                  <Link href='/store-owner/stores'>
                     <Button
                        variant='ghost'
                        size='sm'
                        className='w-fit'>
                        <ArrowLeft className='w-4 h-4 mr-2' />
                        Back to Stores
                     </Button>
                  </Link>
                  <div>
                     <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                        Create New Store
                     </h1>
                     <p className='text-gray-600 mt-1'>
                        Fill in the details to create your store
                     </p>
                  </div>
               </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
               <Card className='bg-white border border-gray-200 rounded-lg shadow-sm'>
                  <CardHeader>
                     <CardTitle className='flex items-center gap-2'>
                        <Store className='w-5 h-5' />
                        Store Information
                     </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                     {/* Store Name */}
                     <div>
                        <Label htmlFor='storeName'>Store Name *</Label>
                        <Input
                           id='storeName'
                           name='storeName'
                           value={formData.storeName}
                           onChange={handleChange}
                           placeholder='Enter store name'
                           className='mt-1'
                           required
                        />
                        {errors.storeName && (
                           <p className='text-red-500 text-sm mt-1'>
                              {errors.storeName}
                           </p>
                        )}
                     </div>

                     {/* Address */}
                     <div>
                        <Label htmlFor='address'>Address *</Label>
                        <Textarea
                           id='address'
                           name='address'
                           value={formData.address}
                           onChange={handleChange}
                           placeholder='Enter complete address'
                           className='mt-1'
                           rows={3}
                           required
                        />
                        {errors.address && (
                           <p className='text-red-500 text-sm mt-1'>
                              {errors.address}
                           </p>
                        )}
                     </div>

                     {/* Phone */}
                     <div className='grid grid-cols-2 gap-4'>
                        <div>
                           <Label htmlFor='phone'>Phone Number *</Label>
                           <Input
                              id='phone'
                              name='phone'
                              type='tel'
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder='Enter 10-digit phone number'
                              className='mt-1'
                              required
                           />
                           {errors.phone && (
                              <p className='text-red-500 text-sm mt-1'>
                                 {errors.phone}
                              </p>
                           )}
                        </div>

                        {/* Category */}
                        <div>
                           <Label htmlFor='category'>Category *</Label>
                           <select
                              id='category'
                              name='category'
                              value={formData.category}
                              onChange={handleChange}
                              className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                              required>
                              {STORE_CATEGORIES.map((cat) => (
                                 <option
                                    key={cat}
                                    value={cat}>
                                    {cat}
                                 </option>
                              ))}
                           </select>
                           {errors.category && (
                              <p className='text-red-500 text-sm mt-1'>
                                 {errors.category}
                              </p>
                           )}
                        </div>
                     </div>
                     <div>
                        <Label htmlFor='description'>
                           Description (Optional)
                        </Label>
                        <Textarea
                           id='description'
                           name='description'
                           value={formData.description}
                           onChange={handleChange}
                           placeholder='Describe your store...'
                           className='mt-1'
                           rows={4}
                        />
                     </div>

                     <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                           <Label htmlFor='openingTime'>Opening Time *</Label>
                           <Input
                              id='openingTime'
                              name='openingTime'
                              type='time'
                              value={formData.openingTime}
                              onChange={handleChange}
                              className='mt-1'
                              required
                           />
                           {errors.openingTime && (
                              <p className='text-red-500 text-sm mt-1'>
                                 {errors.openingTime}
                              </p>
                           )}
                        </div>
                        <div>
                           <Label htmlFor='closingTime'>Closing Time *</Label>
                           <Input
                              id='closingTime'
                              name='closingTime'
                              type='time'
                              value={formData.closingTime}
                              onChange={handleChange}
                              className='mt-1'
                              required
                           />
                           {errors.closingTime && (
                              <p className='text-red-500 text-sm mt-1'>
                                 {errors.closingTime}
                              </p>
                           )}
                        </div>
                     </div>

                     {/* Submit Buttons */}
                     <div className='flex gap-4 pt-4'>
                        <Link
                           href='/store-owner/stores'
                           className='flex-1'>
                           <Button
                              type='button'
                              variant='outline'
                              className='w-full'>
                              Cancel
                           </Button>
                        </Link>
                        <Button
                           type='submit'
                           className='flex-1'
                           disabled={createStore.isPending}>
                           {createStore.isPending ? (
                              <>
                                 <Spinner
                                    size='sm'
                                    className='mr-2'
                                 />
                                 Creating...
                              </>
                           ) : (
                              <>
                                 <Save className='w-4 h-4 mr-2' />
                                 Create Store
                              </>
                           )}
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </form>
         </div>
      </div>
   );
}
