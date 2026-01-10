/**
 * Authentication Service
 *
 * Handles OAuth authentication flows for Google and Apple sign-in
 * across iOS, Android, and Web platforms.
 */

import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Required for web browser auth session completion
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'apple';

/**
 * Get the appropriate redirect URI based on platform
 *
 * - Web: Uses current origin + /auth/callback
 * - Native: Uses app scheme (toonnotesexpo://auth/callback)
 */
function getRedirectUri(): string {
  if (Platform.OS === 'web') {
    // For web, use the current origin
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return 'http://localhost:8081/auth/callback';
  }

  // For native, use the app scheme
  // Using makeRedirectUri ensures proper formatting for Expo
  return makeRedirectUri({
    scheme: 'toonnotesexpo',
    path: 'auth/callback',
  });
}

/**
 * Sign in with OAuth provider (Google or Apple)
 *
 * @param provider - 'google' or 'apple'
 * @throws Error if OAuth flow fails
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const redirectTo = getRedirectUri();

  console.log(`[Auth] Starting ${provider} OAuth flow`);
  console.log(`[Auth] Redirect URI: ${redirectTo}`);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web', // On native, we handle the browser manually
      queryParams:
        provider === 'google'
          ? {
              access_type: 'offline',
              prompt: 'consent',
            }
          : undefined,
    },
  });

  if (error) {
    console.error(`[Auth] ${provider} OAuth error:`, error);
    throw error;
  }

  if (Platform.OS !== 'web' && data.url) {
    console.log(`[Auth] Opening browser for ${provider} OAuth`);

    // Open OAuth URL in browser for native platforms
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
      showInRecents: true,
      preferEphemeralSession: false, // Use persistent session for better UX
    });

    console.log(`[Auth] Browser result type: ${result.type}`);

    if (result.type === 'success' && result.url) {
      // Extract the URL fragment/hash (contains access_token, refresh_token)
      const url = new URL(result.url);

      // For Supabase, the tokens come in the hash fragment
      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('[Auth] Setting session from OAuth callback');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('[Auth] Error setting session:', sessionError);
            throw sessionError;
          }
        }
      }
    } else if (result.type === 'cancel') {
      console.log('[Auth] User cancelled OAuth flow');
      throw new Error('Authentication was cancelled');
    }
  }
  // For web, the redirect happens automatically and is handled in app/auth/callback.tsx
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  console.log('[Auth] Signing out');
  const { error } = await supabase.auth.signOut();
  if (error) {
    // If session is missing/invalid, force clear local session
    if (error.message?.includes('Auth session missing')) {
      console.log('[Auth] No server session, clearing local session');
      // Use scope: 'local' to clear the cached session without server call
      await supabase.auth.signOut({ scope: 'local' });
      return;
    }
    console.error('[Auth] Sign out error:', error);
    throw error;
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[Auth] Get session error:', error);
    throw error;
  }

  return session;
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('[Auth] Get user error:', error);
    throw error;
  }

  return user;
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    console.error('[Auth] Refresh session error:', error);
    throw error;
  }

  return session;
}

/**
 * Set session from OAuth callback (used on web)
 */
export async function setSessionFromUrl(url: string): Promise<Session | null> {
  const urlObj = new URL(url);

  // Extract tokens from hash fragment
  if (urlObj.hash) {
    const hashParams = new URLSearchParams(urlObj.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('[Auth] Error setting session from URL:', error);
        throw error;
      }

      return data.session;
    }
  }

  return null;
}
