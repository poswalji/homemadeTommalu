'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { handleApiError } from '@/lib/axios';
import { getDashboardRoute } from '@/lib/auth-utils';
import { Eye, EyeOff, Mail, Lock, User, Phone, Store } from 'lucide-react';

export default function PartnerWithTommaluPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useRegister();

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
    if (!formData.phone) {
      setError('Phone number is required for store owners');
      return;
    }

    try {
      const result = await register.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'storeOwner',
        phone: formData.phone,
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div
        className="relative hidden md:block"
        style={{ backgroundImage: "url('/bg2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="text-white max-w-md">
            <h2 className="text-3xl font-bold">Partner with Tommalu</h2>
            <p className="mt-2 opacity-90">Grow your business with online orders, payouts, and analytics.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[lab(66%_50.34_52.19)] text-white mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Store Owner Account</h1>
            <p className="mt-2 text-gray-600">We’ll verify your details and set up your store dashboard.</p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">{error}</Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name / Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="name" name="name" type="text" placeholder="Enter business or your name" value={formData.name} onChange={handleChange} required className="pl-10" disabled={register.isPending} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required className="pl-10" disabled={register.isPending} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Required)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} required className="pl-10" disabled={register.isPending} />
              </div>
              <p className="text-xs text-gray-600 mt-1">Required for store verification and customer communication</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={formData.password} onChange={handleChange} required className="pl-10 pr-10" disabled={register.isPending} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? (<EyeOff className="w-5 h-5" />) : (<Eye className="w-5 h-5" />)}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required className="pl-10" disabled={register.isPending} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? (<><Spinner size="sm" className="mr-2" />Creating account...</>) : ('Create Store Owner Account')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}


