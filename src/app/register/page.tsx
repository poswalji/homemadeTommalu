'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister, useGoogleLogin } from '@/hooks/api';
import { useGoogleLogin as useGoogleOAuth } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { handleApiError } from '@/lib/axios';
import { getDashboardRoute } from '@/lib/auth-utils';
import type { UserRole } from '@/services/api/auth.api';
import { Eye, EyeOff, Mail, Lock, User, Phone, ShoppingBag } from 'lucide-react';

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
  const googleAuthMutation = useGoogleLogin();

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setError(null);
    try {
      const result = await googleAuthMutation.mutateAsync({ token: tokenResponse.access_token });
      if (result.success && result.user) {
        const userRole = result.user.role;
        const dashboardRoute = getDashboardRoute(userRole);
        router.push(dashboardRoute);
      } else {
        setError('Google signup failed. Please try again.');
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const loginWithGoogle = useGoogleOAuth({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google signup failed'),
  });

  const handleGoogleLogin = () => {
    setError(null);
    loginWithGoogle();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        if (result.verificationToken) {
          router.push(`/verify-email?token=${encodeURIComponent(result.verificationToken)}&email=${encodeURIComponent(formData.email)}`);
        } else {
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
    <div className='min-h-screen grid grid-cols-1 md:grid-cols-2'>
      <div
        className='relative hidden md:block'
        style={{ backgroundImage: "url('/bg3.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className='absolute inset-0 bg-black/30' />
        <div className='absolute inset-0 flex items-end p-8'>
          <div className='text-white max-w-md'>
            <h2 className='text-3xl font-bold'>Welcome to Tommalu</h2>
            <p className='mt-2 opacity-90'>
              Seamless ordering for customers and simple tools for store owners.
            </p>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='w-full max-w-lg'>
          <Card className='w-full p-8 shadow-2xl'>
            <div className='text-center mb-8'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[lab(66%_50.34_52.19)] text-white mb-4'>
                <ShoppingBag className='w-8 h-8' />
              </div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Start Your Journey with Tommalu
              </h1>
              <p className='mt-2 text-gray-600'>
                Sign up to enjoy amazing food and grocery experiences with Tommalu
              </p>
            </div>

            {error && (
              <Alert variant='error' className='mb-6'>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='name'>
                  Full Name
                </Label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
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
                <Label htmlFor='email'>Email Address</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
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
                <Label htmlFor='phone'>
                  Phone Number (Optional)
                </Label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                  <Input
                    id='phone'
                    name='phone'
                    type='tel'
                    placeholder='Enter your phone number'
                    value={formData.phone}
                    onChange={handleChange}
                    required={false}
                    className='pl-10'
                    disabled={register.isPending}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Create a strong password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className='pl-10 pr-10'
                    disabled={register.isPending}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
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
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
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

              <Button type='submit' className='w-full' disabled={register.isPending}>
                {register.isPending ? (
                  <>
                    <Spinner size='sm' className='mr-2' />
                    Creating account...
                  </>
                ) : (
                  <>Create Account</>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={googleAuthMutation.isPending}
                >
                  {googleAuthMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Signing up...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign up with Google
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link href='/login' className='font-medium text-[lab(66%_50.34_52.19)] hover:underline'>
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
