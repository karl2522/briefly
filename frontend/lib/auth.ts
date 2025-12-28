'use client';

import { useRouter } from 'next/navigation';
import { apiClient, type AuthResponse } from './api';

export interface AuthError {
  message: string;
  field?: string;
}

export async function handleAuthResponse(
  response: { success: boolean; data?: AuthResponse & { code?: string }; error?: string },
  router: ReturnType<typeof useRouter>,
) {
  console.log('[Auth] handleAuthResponse called:', { success: response.success, hasData: !!response.data, error: response.error });

  if (response.success && response.data) {
    // OAuth 2.0 Authorization Code Flow:
    // If we received an authorization code, exchange it for tokens
    if (response.data.code) {
      console.log('[Auth] Exchanging authorization code for tokens...');

      try {
        const exchangeResponse = await apiClient.exchangeAuthCode(response.data.code);

        if (!exchangeResponse.success) {
          console.error('[Auth] Code exchange failed:', exchangeResponse.error);
          return {
            success: false,
            error: exchangeResponse.error || 'Failed to complete authentication',
          };
        }

        console.log('[Auth] Code exchange successful, tokens set in cookies');
      } catch (error) {
        console.error('[Auth] Code exchange error:', error);
        return {
          success: false,
          error: 'Failed to complete authentication',
        };
      }
    }

    // Tokens are now set in httpOnly cookies (either from direct cookie setting or code exchange)
    // Redirect to dashboard
    console.log('[Auth] Redirecting to dashboard...');
    router.push('/dashboard');
    // Also use window.location as fallback to ensure navigation
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }, 100);
    return { success: true };
  }

  console.error('[Auth] Auth response failed:', response.error);
  return {
    success: false,
    error: response.error || 'An error occurred',
  };
}

export async function logout(router: ReturnType<typeof useRouter>) {
  try {
    // Call backend logout endpoint (invalidates refresh tokens and clears cookies)
    await apiClient.logout();
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API call failed:', error);
  }

  // Tokens are cleared by backend in httpOnly cookies
  // No need to clear localStorage (tokens weren't stored there)

  // Small delay to ensure loading state is visible
  await new Promise(resolve => setTimeout(resolve, 300));

  // Redirect to home page
  router.push('/');

  // Force page reload to clear any cached state
  window.location.href = '/';
}


