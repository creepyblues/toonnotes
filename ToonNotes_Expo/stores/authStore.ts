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
import {
  syncNotes,
  subscribeToNotes,
  unsubscribeFromNotes,
  syncDesigns,
  subscribeToDesigns,
  syncBoards,
  subscribeToBoards,
  syncLabels,
  subscribeToLabels,
} from '@/services/syncService';
import { useNoteStore } from './noteStore';
import { useUserStore } from './userStore';
import { useDesignStore } from './designStore';
import { useBoardStore } from './boardStore';
import { useLabelStore } from './labelStore';
import { NoteDesign, Board, Label } from '@/types';

interface RealtimeChannels {
  notes: RealtimeChannel | null;
  designs: RealtimeChannel | null;
  boards: RealtimeChannel | null;
  labels: RealtimeChannel | null;
}

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  realtimeChannels: RealtimeChannels;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setSession: (session: Session | null) => void;
}

// Helper to set up all real-time subscriptions
const setupRealtimeSubscriptions = (userId: string): RealtimeChannels => {
  // Notes subscription
  const notesChannel = subscribeToNotes(
    userId,
    (note) => {
      const noteStore = useNoteStore.getState();
      const existing = noteStore.notes.find((n) => n.id === note.id);
      if (existing) {
        if (note.updatedAt > existing.updatedAt) {
          noteStore.updateNote(note.id, note);
        }
      } else {
        useNoteStore.setState((state) => ({
          notes: [note, ...state.notes],
        }));
      }
    },
    (noteId) => {
      useNoteStore.getState().permanentlyDeleteNote(noteId);
    }
  );

  // Designs subscription
  const designsChannel = subscribeToDesigns(
    userId,
    (design: NoteDesign) => {
      const designStore = useDesignStore.getState();
      const existing = designStore.designs.find((d) => d.id === design.id);
      if (existing) {
        if (design.createdAt > existing.createdAt) {
          designStore.updateDesign(design.id, design);
        }
      } else {
        useDesignStore.setState((state) => ({
          designs: [design, ...state.designs],
        }));
      }
    },
    (designId: string) => {
      useDesignStore.setState((state) => ({
        designs: state.designs.filter((d) => d.id !== designId),
      }));
    }
  );

  // Boards subscription
  const boardsChannel = subscribeToBoards(
    userId,
    (board: Board) => {
      const boardStore = useBoardStore.getState();
      const existing = boardStore.boards.find((b) => b.id === board.id);
      if (existing) {
        if (board.updatedAt > existing.updatedAt) {
          useBoardStore.setState((state) => ({
            boards: state.boards.map((b) => (b.id === board.id ? board : b)),
          }));
        }
      } else {
        useBoardStore.setState((state) => ({
          boards: [...state.boards, board],
        }));
      }
    },
    (boardId: string) => {
      useBoardStore.setState((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
      }));
    }
  );

  // Labels subscription
  const labelsChannel = subscribeToLabels(
    userId,
    (label: Label) => {
      const labelStore = useLabelStore.getState();
      const existing = labelStore.labels.find((l) => l.id === label.id);
      if (existing) {
        const existingTime = existing.lastUsedAt || existing.createdAt;
        const incomingTime = label.lastUsedAt || label.createdAt;
        if (incomingTime > existingTime) {
          labelStore.updateLabel(label.id, label);
        }
      } else {
        useLabelStore.setState((state) => ({
          labels: [label, ...state.labels],
        }));
      }
    },
    (labelId: string) => {
      useLabelStore.setState((state) => ({
        labels: state.labels.filter((l) => l.id !== labelId),
      }));
    }
  );

  return {
    notes: notesChannel,
    designs: designsChannel,
    boards: boardsChannel,
    labels: labelsChannel,
  };
};

// Helper to perform full sync for Pro users
const performFullSync = async (userId: string): Promise<void> => {
  console.log('[AuthStore] Starting full sync for all data types...');

  const results = await Promise.all([
    syncNotes(userId),
    syncDesigns(userId),
    syncBoards(userId),
    syncLabels(userId),
  ]);

  console.log('[AuthStore] Full sync complete:', {
    notes: results[0],
    designs: results[1],
    boards: results[2],
    labels: results[3],
  });
};

// Helper to clean up realtime subscriptions
const cleanupRealtimeSubscriptions = async (channels: RealtimeChannels): Promise<void> => {
  const cleanupPromises: Promise<void>[] = [];

  if (channels.notes) {
    cleanupPromises.push(unsubscribeFromNotes(channels.notes));
  }
  if (channels.designs) {
    cleanupPromises.push(unsubscribeFromNotes(channels.designs));
  }
  if (channels.boards) {
    cleanupPromises.push(unsubscribeFromNotes(channels.boards));
  }
  if (channels.labels) {
    cleanupPromises.push(unsubscribeFromNotes(channels.labels));
  }

  await Promise.all(cleanupPromises);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  realtimeChannels: {
    notes: null,
    designs: null,
    boards: null,
    labels: null,
  },

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

      // If user already has a session, sync all data immediately (Pro only)
      if (session?.user?.id) {
        const { isPro } = useUserStore.getState();

        // Only sync and subscribe if user is Pro
        if (isPro()) {
          console.log('[AuthStore] Existing Pro session found, syncing all data...');

          // Perform full sync
          performFullSync(session.user.id).catch((error) => {
            console.error('[AuthStore] Sync error:', error);
          });

          // Set up real-time subscriptions for all data types
          const channels = setupRealtimeSubscriptions(session.user.id);
          set({ realtimeChannels: channels });
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
                  // Perform full sync for all data types
                  performFullSync(session.user.id).catch((error) => {
                    console.error('[AuthStore] Sync error:', error);
                  });

                  // Set up real-time subscriptions for all data types
                  const channels = setupRealtimeSubscriptions(session.user.id);
                  set({ realtimeChannels: channels });
                } else {
                  console.log('[AuthStore] User not Pro, skipping cloud sync');
                }
              }
              break;
            case 'SIGNED_OUT':
              console.log('[AuthStore] User signed out');
              // Unsubscribe from all real-time channels
              const { realtimeChannels } = get();
              cleanupRealtimeSubscriptions(realtimeChannels);
              set({
                realtimeChannels: {
                  notes: null,
                  designs: null,
                  boards: null,
                  labels: null,
                },
              });
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
