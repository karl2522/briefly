'use client';

import { apiClient } from '@/lib/api';
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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Completing authentication...</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while we securely exchange your credentials.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please wait.</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
