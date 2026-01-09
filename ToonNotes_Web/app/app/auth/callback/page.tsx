'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * OAuth Callback Handler
 *
 * Handles the OAuth callback from Supabase Auth.
 * Tokens are returned in the URL hash fragment (not query params).
 *
 * Flow:
 * 1. Provider redirects to /app/auth/callback#access_token=...&refresh_token=...
 * 2. This page extracts tokens from hash
 * 3. Sets session in Supabase client
 * 4. Redirects to /app
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Check if we have a hash fragment with tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      // Also check for error in hash
      const errorDescription = hashParams.get('error_description');
      if (errorDescription) {
        setError(decodeURIComponent(errorDescription));
        return;
      }

      if (accessToken && refreshToken) {
        // Set the session from the tokens in the hash
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        // Successfully authenticated, redirect to app
        router.push('/app');
        return;
      }

      // If no tokens in hash, try to get existing session
      // (in case user navigated here directly)
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push('/app');
        return;
      }

      // No session and no tokens, redirect to login
      setError('No authentication data found. Please try signing in again.');
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-warm-900 mb-2">Authentication Error</h2>
          <p className="text-warm-600 mb-6">{error}</p>
          <a
            href="/app/auth/login"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-warm-900 mb-2">Signing you in...</h2>
        <p className="text-warm-600">Please wait while we complete authentication.</p>
      </div>
    </div>
  );
}
