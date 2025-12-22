'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      // Redirect to sign-in with error and message
      const errorParams = new URLSearchParams();
      errorParams.set('error', error);
      if (message) {
        errorParams.set('message', message);
      }
      router.push(`/sign-in?${errorParams.toString()}`);
      return;
    }

    if (success === 'true') {
      // Tokens are set in httpOnly cookies by backend
      // Just redirect to dashboard
      router.push('/dashboard');
    } else {
      // No success parameter, redirect to sign-in
      router.push('/sign-in?error=oauth_failed&message=Unable to complete OAuth authentication. Please try again.');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Completing authentication...</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while we redirect you.</p>
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


