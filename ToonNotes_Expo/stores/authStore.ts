/**
 * Auth Store
 *
 * Zustand store for managing authentication state.
 * Handles OAuth sign-in/sign-out and session management.
 */

import { create } from 'zustand';
import { Session, User, AuthChangeEvent, RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import {
  signInWithOAuth,
  signOut as authSignOut,
  OAuthProvider,
} from '@/services/authService';
import { setUserId, clearUser as clearAnalyticsUser, Analytics } from '@/services/firebaseAnalytics';
import { syncNotes, subscribeToNotes, unsubscribeFromNotes } from '@/services/syncService';
import { useNoteStore } from './noteStore';
import { useUserStore } from './userStore';

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;

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
  realtimeChannel: null,

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

      // If user already has a session, sync notes immediately (Pro only)
      if (session?.user?.id) {
        const { isPro } = useUserStore.getState();

        // Only sync and subscribe if user is Pro
        if (isPro()) {
          console.log('[AuthStore] Existing Pro session found, syncing notes...');
          syncNotes(session.user.id).then((result) => {
            console.log('[AuthStore] Initial sync complete:', result);
          }).catch((error) => {
            console.error('[AuthStore] Sync error:', error);
          });

          // Set up real-time subscription
          const channel = subscribeToNotes(
            session.user.id,
            (note) => {
              const noteStore = useNoteStore.getState();
              const existing = noteStore.notes.find(n => n.id === note.id);
              if (existing) {
                if (note.updatedAt > existing.updatedAt) {
                  noteStore.updateNote(note.id, note);
                }
              } else {
                useNoteStore.setState((state) => ({
                  notes: [note, ...state.notes]
                }));
              }
            },
            (noteId) => {
              useNoteStore.getState().permanentlyDeleteNote(noteId);
            }
          );
          set({ realtimeChannel: channel });
        } else {
          console.log('[AuthStore] User not Pro, skipping cloud sync');
        }
      }

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
              // Set user context for Firebase Analytics/Crashlytics
              if (session?.user?.id) {
                setUserId(session.user.id);
                Analytics.login(session.user.app_metadata?.provider as 'google' | 'apple' || 'google');

                // Only sync and subscribe for Pro users
                const { isPro: checkIsPro } = useUserStore.getState();
                if (checkIsPro()) {
                  // Sync notes from cloud
                  syncNotes(session.user.id).then((result) => {
                    console.log('[AuthStore] Initial sync complete:', result);
                  }).catch((error) => {
                    console.error('[AuthStore] Sync error:', error);
                  });

                  // Set up real-time subscription for note changes
                  const channel = subscribeToNotes(
                    session.user.id,
                    (note) => {
                      // Update local store when cloud changes
                      const noteStore = useNoteStore.getState();
                      const existing = noteStore.notes.find(n => n.id === note.id);
                      if (existing) {
                        // Only update if cloud version is newer (avoid echo from our own uploads)
                        if (note.updatedAt > existing.updatedAt) {
                          noteStore.updateNote(note.id, note);
                        }
                      } else {
                        // New note from cloud - add directly to store
                        useNoteStore.setState((state) => ({
                          notes: [note, ...state.notes]
                        }));
                      }
                    },
                    (noteId) => {
                      // Remove from local when deleted in cloud
                      useNoteStore.getState().permanentlyDeleteNote(noteId);
                    }
                  );
                  set({ realtimeChannel: channel });
                } else {
                  console.log('[AuthStore] User not Pro, skipping cloud sync');
                }
              }
              break;
            case 'SIGNED_OUT':
              console.log('[AuthStore] User signed out');
              // Unsubscribe from real-time notes
              const { realtimeChannel } = get();
              if (realtimeChannel) {
                unsubscribeFromNotes(realtimeChannel);
                set({ realtimeChannel: null });
              }
              // Clear user context from Firebase
              clearAnalyticsUser();
              Analytics.signOut();
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
