'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { handleApiError } from '@/lib/axios';
import { getDashboardRoute } from '@/lib/auth-utils';
import type { UserRole } from '@/services/api/auth.api';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

export default function RegisterPage() {
   const router = useRouter();
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'customer' as UserRole,
   });
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const register = useRegister();

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validation
      if (formData.password !== formData.confirmPassword) {
         setError('Passwords do not match');
         return;
      }

      if (formData.password.length < 6) {
         setError('Password must be at least 6 characters');
         return;
      }

      try {
         const result = await register.mutateAsync({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phone: formData.phone || undefined,
         });

         if (result.success) {
            // If verification token exists, redirect to verification page
            if (result.verificationToken) {
               router.push(`/verify-email?token=${encodeURIComponent(result.verificationToken)}&email=${encodeURIComponent(formData.email)}`);
            } else {
               // If email is already verified, redirect to dashboard
               const userRole = result.user.role;
               const dashboardRoute = getDashboardRoute(userRole);
               router.push(dashboardRoute);
            }
         }
      } catch (err) {
         setError(handleApiError(err));
      }
   };

   return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
         <Card className='w-full max-w-md p-8'>
            <div className='text-center mb-8'>
               <h1 className='text-3xl font-bold text-gray-900'>
                  Create Account
               </h1>
               <p className='text-gray-600 mt-2'>Sign up to get started</p>
            </div>

            {error && (
               <Alert
                  variant='error'
                  className='mb-6'>
                  {error}
               </Alert>
            )}

            <form
               onSubmit={handleSubmit}
               className='space-y-5'>
               <div className='space-y-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <div className='relative'>
                     <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                     <Input
                        id='name'
                        name='name'
                        type='text'
                        placeholder='Enter your full name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className='pl-10'
                        disabled={register.isPending}
                     />
                  </div>
               </div>

               <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <div className='relative'>
                     <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                     <Input
                        id='email'
                        name='email'
                        type='email'
                        placeholder='Enter your email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className='pl-10'
                        disabled={register.isPending}
                     />
                  </div>
               </div>

               <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone (Optional)</Label>
                  <div className='relative'>
                     <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                     <Input
                        id='phone'
                        name='phone'
                        type='tel'
                        placeholder='Enter your phone number'
                        value={formData.phone}
                        onChange={handleChange}
                        className='pl-10'
                        disabled={register.isPending}
                     />
                  </div>
               </div>

               <div className='space-y-2'>
                  <Label htmlFor='role'>Account Type</Label>
                  <select
                     id='role'
                     name='role'
                     value={formData.role}
                     onChange={handleChange}
                     disabled={register.isPending}
                     className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                     <option value='customer'>Customer</option>
                     <option value='storeOwner'>Store Owner</option>
                     <option value='admin'>Admin</option>
                  </select>
               </div>

               <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <div className='relative'>
                     <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                     <Input
                        id='password'
                        name='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Create a password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className='pl-10 pr-10'
                        disabled={register.isPending}
                     />
                     <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                        {showPassword ? (
                           <EyeOff className='w-5 h-5' />
                        ) : (
                           <Eye className='w-5 h-5' />
                        )}
                     </button>
                  </div>
               </div>

               <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm Password</Label>
                  <div className='relative'>
                     <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                     <Input
                        id='confirmPassword'
                        name='confirmPassword'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Confirm your password'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className='pl-10'
                        disabled={register.isPending}
                     />
                  </div>
               </div>

               <Button
                  type='submit'
                  className='w-full'
                  disabled={register.isPending}>
                  {register.isPending ? (
                     <>
                        <Spinner
                           size='sm'
                           className='mr-2'
                        />
                        Creating account...
                     </>
                  ) : (
                     'Create Account'
                  )}
               </Button>
            </form>

            <div className='mt-6 text-center'>
               <p className='text-sm text-gray-600'>
                  Already have an account?{' '}
                  <Link
                     href='/login'
                     className='font-medium text-[lab(66%_50.34_52.19)] hover:underline'>
                     Sign in
                  </Link>
               </p>
            </div>
         </Card>
      </div>
   );
}
