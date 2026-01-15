'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { handleApiError } from '@/lib/axios';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reuse existing login hook
    const login = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const result = await login.mutateAsync({ email, password, rememberMe: false });
            if (result.success && result.user) {
                if (result.user.role !== 'admin') {
                    setError('Access Denied. You do not have admin privileges.');
                    // Ideally trigger logout here if session was set
                    return;
                }
                // Redirect to admin dashboard
                const returnUrl = searchParams?.get('returnUrl');
                router.push(returnUrl || '/admin/homemade-food');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err: any) {
            setError(handleApiError(err));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md p-8 border-orange-100 shadow-lg">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-4">
                        <ShieldCheck className="w-6 h-6 text-orange-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
                    <p className="text-gray-600 mt-2 text-sm">Restricted Area. Authorized Personnel Only.</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-50 text-red-900 border-red-200">
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Admin Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@tommalu.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={login.isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10"
                                disabled={login.isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={login.isPending}
                    >
                        {login.isPending ? (
                            <>
                                <Spinner size="sm" className="mr-2" />
                                Verifying...
                            </>
                        ) : (
                            'Enter Panel'
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
