'use client';

import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExchanging, setIsExchanging] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const code = searchParams.get('code');

    // Handle error from OAuth provider
    if (error) {
      const errorParams = new URLSearchParams();
      errorParams.set('error', error);
      if (message) {
        errorParams.set('message', message);
      }
      router.push(`/sign-in?${errorParams.toString()}`);
      return;
    }

    // OAuth 2.0 Authorization Code Flow:
    // Exchange authorization code for tokens
    if (code && !isExchanging) {
      setIsExchanging(true);

      apiClient.exchangeAuthCode(code)
        .then((response) => {
          if (response.success) {
            // Tokens are now set in httpOnly cookies
            // Redirect to dashboard
            router.push('/dashboard');
          } else {
            // Exchange failed
            router.push(`/sign-in?error=exchange_failed&message=${encodeURIComponent(response.error || 'Failed to complete authentication')}`);
          }
        })
        .catch((err) => {
          console.error('[AuthCallback] Code exchange error:', err);
          router.push('/sign-in?error=exchange_failed&message=An error occurred during authentication');
        });
      return;
    }

    // No code or error, invalid callback
    if (!code) {
      router.push('/sign-in?error=oauth_failed&message=Invalid authentication callback');
    }
  }, [searchParams, router, isExchanging]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Animated Logo Container */}
        <div className="relative mx-auto flex size-24 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/10 blur-xl" />
          <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-xl bg-background shadow-sm border border-border/50">
            <Image
              src="/briefly-logo.png"
              alt="Briefly"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Completing authentication...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we secure your session and prepare your dashboard.
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center">
          <Loader2 className="size-6 animate-spin text-primary/80" />
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
