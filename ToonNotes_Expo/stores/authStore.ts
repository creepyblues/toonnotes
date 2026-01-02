/**
 * Auth Store
 *
 * Zustand store for managing authentication state.
 * Handles OAuth sign-in/sign-out and session management.
 */

import { create } from 'zustand';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import {
  signInWithOAuth,
  signOut as authSignOut,
  OAuthProvider,
} from '@/services/authService';

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Initialize auth state
   * - Gets current session
   * - Sets up auth state change listener
   */
  initialize: async () => {
    // Skip if Supabase not configured
    if (!isSupabaseConfigured()) {
      console.warn('[AuthStore] Supabase not configured, skipping auth initialization');
      set({ isInitialized: true, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      console.log('[AuthStore] Initializing auth state');

      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthStore] Error getting initial session:', error);
        set({
          error: error.message,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }

      console.log('[AuthStore] Initial session:', session ? 'exists' : 'none');

      set({
        session,
        user: session?.user ?? null,
        isInitialized: true,
        isLoading: false,
      });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          console.log('[AuthStore] Auth state changed:', event);

          set({
            session,
            user: session?.user ?? null,
          });

          // Handle specific events
          switch (event) {
            case 'SIGNED_IN':
              console.log('[AuthStore] User signed in:', session?.user?.email);
              break;
            case 'SIGNED_OUT':
              console.log('[AuthStore] User signed out');
              break;
            case 'TOKEN_REFRESHED':
              console.log('[AuthStore] Token refreshed');
              break;
            case 'USER_UPDATED':
              console.log('[AuthStore] User updated');
              break;
          }
        }
      );

      // Note: We don't unsubscribe since this is a global store
      // that should persist for the app lifetime
    } catch (error) {
      console.error('[AuthStore] Initialization error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    await signInWithProvider('google', set, get);
  },

  /**
   * Sign in with Apple OAuth
   */
  signInWithApple: async () => {
    await signInWithProvider('apple', set, get);
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('[AuthStore] Signing out');

      await authSignOut();

      set({
        session: null,
        user: null,
        isLoading: false,
      });

      console.log('[AuthStore] Sign out successful');
    } catch (error) {
      console.error('[AuthStore] Sign out error:', error);
      set({
        error: error instanceof Error ? error.message : 'Sign out failed',
        isLoading: false,
      });
    }
  },

  /**
   * Clear any error message
   */
  clearError: () => set({ error: null }),

  /**
   * Set session directly (used for OAuth callback handling)
   */
  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },
}));

/**
 * Helper function to sign in with OAuth provider
 */
async function signInWithProvider(
  provider: OAuthProvider,
  set: (state: Partial<AuthState>) => void,
  get: () => AuthState
) {
  try {
    set({ isLoading: true, error: null });
    console.log(`[AuthStore] Starting ${provider} sign in`);

    await signInWithOAuth(provider);

    // Note: The session will be set by the onAuthStateChange listener
    // after the OAuth flow completes
    set({ isLoading: false });

    console.log(`[AuthStore] ${provider} sign in flow completed`);
  } catch (error) {
    console.error(`[AuthStore] ${provider} sign in error:`, error);

    // Handle user cancellation gracefully
    if (error instanceof Error && error.message === 'Authentication was cancelled') {
      set({ isLoading: false });
      return;
    }

    set({
      error: error instanceof Error ? error.message : `${provider} sign-in failed`,
      isLoading: false,
    });
  }
}
