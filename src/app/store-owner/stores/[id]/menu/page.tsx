'use client';

import { useState } from 'react';
import {
   useStoreOwnerMenu,
   useCreateMenuItem,
   useUpdateMenuItem,
   useDeleteMenuItem,
   useToggleMenuItemAvailability,
   useStore,
} from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
   Plus,
   Edit,
   Trash2,
   ArrowLeft,
   Package,
   Save,
   ToggleLeft,
   ToggleRight,
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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { useParams } from 'next/navigation';

const MENU_CATEGORIES = [
   'Veg Main Course',
   'Non-Veg Main Course',
   'Starters & Snacks',
   'Breads & Rice',
   'Drinks & Beverages',
   'Dairy & Eggs',
   'Groceries & Essentials',
   'Fruits & Vegetables',
   'Sweets & Desserts',
   'Fast Food',
   'Bakery Items',
   'Grains & Pulses',
   'Meat & Seafood',
   'Other',
];

const STORE_CATEGORY_MAPPING: Record<string, string[]> = {
   Restaurant: [
      'Veg Main Course',
      'Non-Veg Main Course',
      'Starters & Snacks',
      'Breads & Rice',
      'Drinks & Beverages',
      'Sweets & Desserts',
      'Fast Food',
      'Other',
   ],
   'Homemade Food': [
      'Veg Main Course',
      'Non-Veg Main Course',
      'Starters & Snacks',
      'Breads & Rice',
      'Drinks & Beverages',
      'Sweets & Desserts',
      'Fast Food',
      'Other',
   ],
   'Grocery Store': [
      'Groceries & Essentials',
      'Dairy & Eggs',
      'Fruits & Vegetables',
      'Grains & Pulses',
      'Bakery Items',
      'Other',
   ],
   Bakery: ['Bakery Items', 'Sweets & Desserts', 'Drinks & Beverages', 'Other'],
   Pharmacy: ['Other'],
   Dairy: ['Dairy & Eggs', 'Sweets & Desserts', 'Other'],
   Other: MENU_CATEGORIES,
};

const FOOD_TYPES = ['veg', 'non-veg', 'egg', 'vegan'];

export default function MenuManagementPage() {
   const params = useParams();
   const id = params?.id as string;
   const { data, isLoading } = useStoreOwnerMenu(id);
   const { data: storeData } = useStore(id);
   const createMenuItem = useCreateMenuItem();
   const updateMenuItem = useUpdateMenuItem();
   const deleteMenuItem = useDeleteMenuItem();
   const toggleAvailability = useToggleMenuItemAvailability();

   const storeCategory = storeData?.data?.category || 'Other';
   const availableCategories =
      STORE_CATEGORY_MAPPING[storeCategory] || MENU_CATEGORIES;

   const [showForm, setShowForm] = useState(false);
   const [editingItem, setEditingItem] = useState<any>(null);
   const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(
      null
   );

   const [formData, setFormData] = useState({
      name: '',
      price: '',
      category: '',
      description: '',
      foodType: 'veg',
      available: true,
      stockQuantity: '',
      image: null as File | null,
   });

   const menuItems = data?.data || [];

   const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
      }
   };

   const resetForm = () => {
      setFormData({
         name: '',
         price: '',
         category: '',
         description: '',
         foodType: 'veg',
         available: true,
         stockQuantity: '',
         image: null,
      });
      setEditingItem(null);
      setShowForm(false);
   };

   const handleEdit = (item: any) => {
      setEditingItem(item);
      setFormData({
         name: item.name || '',
         price: item.price?.toString() || '',
         category: item.category || '',
         description: item.description || '',
         foodType: item.foodType || 'veg',
         available: item.isAvailable !== false,
         stockQuantity: item.stockQuantity?.toString() || '',
         image: null,
      });
      setShowForm(true);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name || !formData.price || !formData.category) {
         toast.error('Please fill in all required fields');
         return;
      }

      try {
         const menuItemData: any = {
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            description: formData.description,
            foodType: formData.foodType,
            available: formData.available,
            stockQuantity: formData.stockQuantity
               ? parseInt(formData.stockQuantity)
               : undefined,
            image: formData.image || undefined,
         };

         // Add foodType if provided
         if (formData.foodType) {
            menuItemData.foodType = formData.foodType;
         }

         if (editingItem) {
            await updateMenuItem.mutateAsync({
               menuItemId: editingItem.id,
               data: menuItemData,
            });
            toast.success('Menu item updated successfully');
         } else {
            await createMenuItem.mutateAsync({
               storeId: id,
               data: menuItemData,
            });
            toast.success('Menu item created successfully');
         }
         resetForm();
      } catch (error: any) {
         toast.error(
            error?.response?.data?.error?.message || 'Failed to save menu item'
         );
      }
   };

   const handleDelete = async (itemId: string) => {
      try {
         await deleteMenuItem.mutateAsync(itemId);
         toast.success('Menu item deleted successfully');
         setShowDeleteDialog(null);
      } catch (error: any) {
         toast.error(
            error?.response?.data?.error?.message ||
            'Failed to delete menu item'
         );
      }
   };

   const handleToggleAvailability = async (itemId: string) => {
      try {
         await toggleAvailability.mutateAsync(itemId);
      } catch (error: any) {
         toast.error(
            error?.response?.data?.error?.message ||
            'Failed to toggle availability'
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

   return (
      <div className='min-h-screen bg-gray-50'>
         <div className='max-w-9xl mx-auto  space-y-6'>
            {/* Header */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
               <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <div className='flex items-center gap-4'>
                     <Link href={`/store-owner/stores/${id}`}>
                        <Button
                           variant='ghost'
                           size='sm'>
                           <ArrowLeft className='w-4 h-4 mr-2' />
                           Back
                        </Button>
                     </Link>
                     <div className='flex-1'>
                        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                           Menu Management
                        </h1>
                        <p className='text-gray-600 mt-1 text-sm'>
                           Manage your store menu items and offerings
                        </p>
                     </div>
                  </div>
                  <Button
                     onClick={() => setShowForm(true)}>
                     <Plus className='w-4 h-4 mr-2' />
                     Add Menu Item
                  </Button>
               </div>
            </div>

            {/* Menu Items Grid */}
            {menuItems.length === 0 ? (
               <Card className='p-12 text-center bg-white border-2 border-dashed border-gray-300 rounded-lg'>
                  <div className='flex flex-col items-center'>
                     <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                        <Package className='w-8 h-8 text-gray-400' />
                     </div>
                     <h3 className='text-xl font-semibold text-gray-900 mb-2'>No menu items yet</h3>
                     <p className='text-gray-600 mb-6 max-w-md'>
                        Add your first menu item to get started
                     </p>
                     <Button
                        onClick={() => setShowForm(true)}>
                        <Plus className='w-4 h-4 mr-2' />
                        Add Menu Item
                     </Button>
                  </div>
               </Card>
            ) : (
               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {menuItems.map((item: any) => (
                     <Card
                        key={item.id}
                        className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'>
                        <div className='flex items-start justify-between mb-4'>
                           <div className='flex-1 pr-2'>
                              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                 {item.name}
                              </h3>
                              <p className='text-2xl font-bold text-gray-900 mb-2'>
                                 ₹{item.price}
                              </p>
                              {item.description && (
                                 <p className='text-sm text-gray-600 line-clamp-2'>
                                    {item.description}
                                 </p>
                              )}
                           </div>
                           <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleToggleAvailability(item.id)}
                              disabled={toggleAvailability.isPending}>
                              {item.isAvailable ? (
                                 <ToggleRight className='w-5 h-5 text-green-600' />
                              ) : (
                                 <ToggleLeft className='w-5 h-5 text-gray-400' />
                              )}
                           </Button>
                        </div>

                        <div className='flex items-center gap-2 mb-4 flex-wrap'>
                           <Badge variant='outline'>{item.category}</Badge>
                           <Badge variant={item.foodType === 'veg' ? 'default' : 'secondary'}>
                              {item.foodType}
                           </Badge>
                           {!item.isAvailable && (
                              <Badge variant='secondary'>Unavailable</Badge>
                           )}
                        </div>

                        <div className='flex gap-2 pt-4 border-t border-gray-100'>
                           <Button
                              variant='outline'
                              size='sm'
                              className='flex-1'
                              onClick={() => handleEdit(item)}>
                              <Edit className='w-4 h-4 mr-2' />
                              Edit
                           </Button>
                           <Button
                              variant='outline'
                              size='sm'
                              className='text-red-600 hover:text-red-700'
                              onClick={() => setShowDeleteDialog(item.id)}>
                              <Trash2 className='w-4 h-4' />
                           </Button>
                        </div>
                     </Card>
                  ))}
               </div>
            )}

            {/* Add/Edit Form Dialog */}
            {showForm && (
               <Dialog
                  open={showForm}
                  onOpenChange={setShowForm}>
                  <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                     <DialogHeader>
                        <DialogTitle>
                           {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                        </DialogTitle>
                        <DialogDescription>
                           {editingItem
                              ? 'Update the menu item details'
                              : 'Add a new item to your menu'}
                        </DialogDescription>
                     </DialogHeader>

                     <form
                        onSubmit={handleSubmit}
                        className='space-y-4'>
                        <div>
                           <Label htmlFor='name'>Name *</Label>
                           <Input
                              id='name'
                              name='name'
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder='Item name'
                              required
                              className='mt-1'
                           />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                           <div>
                              <Label htmlFor='price'>Price (₹) *</Label>
                              <Input
                                 id='price'
                                 name='price'
                                 type='number'
                                 step='0.01'
                                 min='0'
                                 value={formData.price}
                                 onChange={handleInputChange}
                                 placeholder='0.00'
                                 required
                                 className='mt-1'
                              />
                           </div>
                           <div>
                              <Label htmlFor='category'>Category *</Label>
                              <Select
                                 value={formData.category}
                                 onValueChange={(value) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       category: value,
                                    }))
                                 }>
                                 <SelectTrigger className='mt-1'>
                                    <SelectValue placeholder='Select category' />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {availableCategories.map((cat) => (
                                       <SelectItem
                                          key={cat}
                                          value={cat}>
                                          {cat}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        <div>
                           <Label htmlFor='description'>Description</Label>
                           <Textarea
                              id='description'
                              name='description'
                              value={formData.description}
                              onChange={handleInputChange}
                              placeholder='Item description'
                              rows={3}
                              className='mt-1'
                           />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                           <div>
                              <Label htmlFor='foodType'>Food Type</Label>
                              <Select
                                 value={formData.foodType}
                                 onValueChange={(value) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       foodType: value,
                                    }))
                                 }>
                                 <SelectTrigger className='mt-1'>
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {FOOD_TYPES.map((type) => (
                                       <SelectItem
                                          key={type}
                                          value={type}>
                                          {type}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div>
                              <Label htmlFor='stockQuantity'>Stock Quantity</Label>
                              <Input
                                 id='stockQuantity'
                                 name='stockQuantity'
                                 type='number'
                                 min='0'
                                 value={formData.stockQuantity}
                                 onChange={handleInputChange}
                                 placeholder='Optional'
                                 className='mt-1'
                              />
                           </div>
                        </div>

                        <div>
                           <Label htmlFor='image'>Image</Label>
                           <Input
                              id='image'
                              name='image'
                              type='file'
                              accept='image/*'
                              onChange={handleFileChange}
                              className='mt-1'
                           />
                           {formData.image && (
                              <p className='text-sm text-gray-600 mt-1'>
                                 {formData.image.name}
                              </p>
                           )}
                        </div>

                        <DialogFooter>
                           <Button
                              type='button'
                              variant='outline'
                              onClick={resetForm}>
                              Cancel
                           </Button>
                           <Button
                              type='submit'
                              disabled={
                                 createMenuItem.isPending ||
                                 updateMenuItem.isPending
                              }>
                              {createMenuItem.isPending ||
                                 updateMenuItem.isPending ? (
                                 <>
                                    <Spinner
                                       size='sm'
                                       className='mr-2'
                                    />
                                    Saving...
                                 </>
                              ) : (
                                 <>
                                    <Save className='w-4 h-4 mr-2' />
                                    {editingItem ? 'Update' : 'Create'}
                                 </>
                              )}
                           </Button>
                        </DialogFooter>
                     </form>
                  </DialogContent>
               </Dialog>
            )}

            {/* Delete Dialog */}
            <Dialog
               open={!!showDeleteDialog}
               onOpenChange={() => setShowDeleteDialog(null)}>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>Delete Menu Item</DialogTitle>
                     <DialogDescription>
                        Are you sure you want to delete this menu item? This action
                        cannot be undone.
                     </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                     <Button
                        variant='outline'
                        onClick={() => setShowDeleteDialog(null)}>
                        Cancel
                     </Button>
                     <Button
                        variant='destructive'
                        onClick={() =>
                           showDeleteDialog && handleDelete(showDeleteDialog)
                        }
                        disabled={deleteMenuItem.isPending}>
                        {deleteMenuItem.isPending ? (
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
      </div>
   );
}
