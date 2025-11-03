'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmail, useResendVerificationCode } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { handleApiError } from '@/lib/axios';
import { getDashboardRoute } from '@/lib/auth-utils';
import { Mail, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationToken = searchParams?.get('token');
  const email = searchParams?.get('email');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const verifyEmail = useVerifyEmail();
  const resendCode = useResendVerificationCode();

  useEffect(() => {
    // Redirect if no token
    if (!verificationToken) {
      router.push('/register');
    }
  }, [verificationToken, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    setCode(newCode);
    setError(null);

    // Auto-submit when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError(null);
      
      // Auto-submit if all 6 digits are pasted
      if (newCode.length === 6) {
        handleVerify(newCode.join(''));
      } else {
        // Focus the next empty input
        const nextIndex = newCode.length;
        if (nextIndex < 6) {
          setTimeout(() => {
            const nextInput = document.getElementById(`code-${nextIndex}`);
            nextInput?.focus();
          }, 0);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const codeString = codeToVerify || code.join('');
    
    if (codeString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!verificationToken) {
      setError('Verification token is missing');
      return;
    }

    setError(null);

    try {
      const result = await verifyEmail.mutateAsync({
        code: codeString,
        verificationToken: verificationToken,
      });

      if (result.success) {
        setSuccess(true);
        toast.success('Email verified successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          const userRole = result.user.role;
          const dashboardRoute = getDashboardRoute(userRole);
          router.push(dashboardRoute);
        }, 2000);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('code-0');
        firstInput?.focus();
      }, 0);
    }
  };

  const handleResendCode = async () => {
    if (!verificationToken) {
      setError('Verification token is missing');
      return;
    }

    setError(null);

    try {
      const result = await resendCode.mutateAsync({
        verificationToken: verificationToken,
      });

      if (result.success) {
        toast.success('Verification code has been resent to your email');
        setCountdown(60); // 60 second countdown
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    }
  };

  if (!verificationToken) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          {success ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Email Verified!</h1>
              <p className="text-gray-600 mt-2">Redirecting to your dashboard...</p>
            </>
          ) : (
            <>
              <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
              <p className="text-gray-600 mt-2">
                We&apos;ve sent a 6-digit code to
                <br />
                <span className="font-semibold">{email || 'your email'}</span>
              </p>
            </>
          )}
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success ? (
          <div className="text-center">
            <Spinner size="lg" className="mx-auto" />
          </div>
        ) : (
          <>
            <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="code">Enter Verification Code</Label>
                <div className="flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold focus:ring-2 focus:ring-blue-500"
                      disabled={verifyEmail.isPending}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Code expires in 30 minutes
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verifyEmail.isPending || code.some(digit => !digit)}
              >
                {verifyEmail.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn&apos;t receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={resendCode.isPending || countdown > 0}
                  className="w-full"
                >
                  {resendCode.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href="/register"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Registration
                </Link>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

