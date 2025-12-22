'use client';

import { useRouter } from 'next/navigation';
import { apiClient, type AuthResponse } from './api';

export interface AuthError {
  message: string;
  field?: string;
}

export async function handleAuthResponse(
  response: { success: boolean; data?: AuthResponse; error?: string },
  router: ReturnType<typeof useRouter>,
) {
  if (response.success && response.data) {
    // Tokens are set in httpOnly cookies by backend
    // No need to store them in localStorage
    // Just redirect to dashboard
    router.push('/dashboard');
    return { success: true };
  }

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


