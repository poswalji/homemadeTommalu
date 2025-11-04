'use client';

import { useUsers } from '@/hooks/api';
import { useSuspendUser, useReactivateUser } from '@/hooks/api';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AdminUsersPage() {
   const [searchTerm, setSearchTerm] = useState('');
   const { data, isLoading, error } = useUsers({ limit: 10 });
   const suspendUser = useSuspendUser();
   const reactivateUser = useReactivateUser();

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
            <p className='text-red-600'>Error loading users</p>
         </div>
      );
   }

   const filteredUsers =
      data?.data?.filter(
         (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

   return (
      <div className='space-y-4 md:space-y-6'>
         <div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
               Users Management
            </h1>
            <p className='text-sm md:text-base text-gray-600 mt-2'>
               Manage all users in the system
            </p>
         </div>

         <Card className='p-4 md:p-6'>
            <div className='mb-4'>
               <Input
                  placeholder='Search users by name or email...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full max-w-md'
               />
            </div>

            <div className='overflow-x-auto -mx-4 md:mx-0'>
               <div className='inline-block min-w-full align-middle'>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Name</TableHead>
                           <TableHead>Email</TableHead>
                           <TableHead>Role</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {filteredUsers.length === 0 ? (
                           <TableRow>
                              <TableCell
                                 colSpan={5}
                                 className='text-center py-8 text-gray-500'>
                                 No users found
                              </TableCell>
                           </TableRow>
                        ) : (
                           filteredUsers.map((user) => (
                              <TableRow key={user.id}>
                                 <TableCell className='font-medium'>
                                    {user.name}
                                 </TableCell>
                                 <TableCell>{user.email}</TableCell>
                                 <TableCell>
                                    <span className='px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800'>
                                       {user.role}
                                    </span>
                                 </TableCell>
                                 <TableCell>
                                    <span
                                       className={`px-2 py-1 text-xs rounded-full ${
                                          user.status === 'active'
                                             ? 'bg-green-100 text-green-800'
                                             : 'bg-red-100 text-red-800'
                                       }`}>
                                       {user.status || 'active'}
                                    </span>
                                 </TableCell>
                                 <TableCell>
                                    {user.status === 'active' ? (
                                       <Button
                                          variant='destructive'
                                          size='sm'
                                          onClick={() =>
                                             suspendUser.mutate(user.id)
                                          }
                                          disabled={
                                             suspendUser.isPending ||
                                             user.role === 'admin'
                                          }>
                                          {suspendUser.isPending ? (
                                             <>
                                                <Spinner
                                                   size='sm'
                                                   className='mr-2'
                                                />
                                                Suspending...
                                             </>
                                          ) : (
                                             'Suspend'
                                          )}
                                       </Button>
                                    ) : (
                                       <Button
                                          variant='outline'
                                          size='sm'
                                          onClick={() =>
                                             reactivateUser.mutate(user.id)
                                          }
                                          disabled={reactivateUser.isPending}>
                                          {reactivateUser.isPending ? (
                                             <>
                                                <Spinner
                                                   size='sm'
                                                   className='mr-2'
                                                />
                                                Reactivating...
                                             </>
                                          ) : (
                                             'Reactivate'
                                          )}
                                       </Button>
                                    )}
                                 </TableCell>
                              </TableRow>
                           ))
                        )}
                     </TableBody>
                  </Table>
               </div>
            </div>
         </Card>
      </div>
   );
}
