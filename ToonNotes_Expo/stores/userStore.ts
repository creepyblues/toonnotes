import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AppSettings, NoteColor, Purchase } from '@/types';
import { generateUUID } from '@/utils/uuid';
import {
  saveApiKey,
  getApiKey,
  deleteApiKey,
  maskApiKey,
} from '@/services/secureStorage';
import { debouncedStorage } from './debouncedStorage';
import { CoachMarkId } from '@/constants/onboardingConfig';

// ============================================================================
// Onboarding State Types
// ============================================================================

interface OnboardingState {
  /** Whether user has completed the welcome carousel */
  hasCompletedWelcome: boolean;
  /** IDs of coach marks that have been shown */
  seenCoachMarks: string[];
  /** Version of onboarding config user has seen (for cache invalidation) */
  onboardingVersion: number;
  /** Number of notes user has created (for progressive disclosure) */
  notesCreatedCount: number;
}

const INITIAL_ONBOARDING: OnboardingState = {
  hasCompletedWelcome: false,
  seenCoachMarks: [],
  onboardingVersion: 0,
  notesCreatedCount: 0,
};

interface UserState {
  user: User;
  settings: AppSettings;
  onboarding: OnboardingState;
  // API key is stored in memory only (loaded from SecureStore)
  apiKeyLoaded: boolean;
  apiKeyMasked: string | null;

  // Purchase state
  purchases: Purchase[];
  isProcessingPurchase: boolean;
  isPurchaseSheetOpen: boolean;

  // User actions
  setFreeDesignUsed: () => void;
  addCoins: (amount: number) => void;
  spendCoin: () => boolean; // Returns false if insufficient balance
  canAffordDesign: () => boolean;
  getDesignCost: () => number; // 0 if free design available, 1 otherwise

  // Purchase actions
  addPurchase: (purchase: Purchase) => void;
  setProcessingPurchase: (processing: boolean) => void;
  openPurchaseSheet: () => void;
  closePurchaseSheet: () => void;
  getTotalPurchases: () => number;
  getTotalCoinsEarned: () => number;

  // Settings actions
  toggleDarkMode: () => void;
  setDefaultNoteColor: (color: NoteColor) => void;

  // API Key actions (secure storage)
  setGeminiApiKey: (key: string) => void; // Deprecated - use async version
  loadApiKey: () => Promise<string | null>;
  saveGeminiApiKey: (key: string) => Promise<boolean>;
  clearGeminiApiKey: () => Promise<boolean>;
  hasApiKey: () => boolean;

  // Onboarding actions
  completeWelcome: () => void;
  markCoachMarkSeen: (id: CoachMarkId | string) => void;
  hasSeenCoachMark: (id: CoachMarkId | string) => boolean;
  incrementNotesCreated: () => void;
  resetOnboarding: () => void; // For testing/debugging
  setOnboardingVersion: (version: number) => void;
}

const INITIAL_USER: User = {
  id: generateUUID(),
  freeDesignUsed: false,
  coinBalance: 0, // Production: users start with 0 coins (1 free design available)
  createdAt: Date.now(),
};

const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  defaultNoteColor: NoteColor.White,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      settings: INITIAL_SETTINGS,
      onboarding: INITIAL_ONBOARDING,
      apiKeyLoaded: false,
      apiKeyMasked: null,

      // Purchase state
      purchases: [],
      isProcessingPurchase: false,
      isPurchaseSheetOpen: false,

      setFreeDesignUsed: () => {
        set((state) => ({
          user: { ...state.user, freeDesignUsed: true },
        }));
      },

      addCoins: (amount) => {
        set((state) => ({
          user: { ...state.user, coinBalance: state.user.coinBalance + amount },
        }));
      },

      spendCoin: () => {
        const { user } = get();

        // If free design not used, use it instead of coins
        if (!user.freeDesignUsed) {
          set((state) => ({
            user: { ...state.user, freeDesignUsed: true },
          }));
          return true;
        }

        // Otherwise, spend a coin
        if (user.coinBalance >= 1) {
          set((state) => ({
            user: { ...state.user, coinBalance: state.user.coinBalance - 1 },
          }));
          return true;
        }

        return false;
      },

      canAffordDesign: () => {
        const { user } = get();
        return !user.freeDesignUsed || user.coinBalance >= 1;
      },

      getDesignCost: () => {
        const { user } = get();
        return user.freeDesignUsed ? 1 : 0;
      },

      // Purchase actions
      addPurchase: (purchase) => {
        set((state) => ({
          purchases: [...state.purchases, purchase],
          user: {
            ...state.user,
            coinBalance: state.user.coinBalance + purchase.coinsGranted,
          },
        }));
      },

      setProcessingPurchase: (processing) => {
        set({ isProcessingPurchase: processing });
      },

      openPurchaseSheet: () => {
        set({ isPurchaseSheetOpen: true });
      },

      closePurchaseSheet: () => {
        set({ isPurchaseSheetOpen: false });
      },

      getTotalPurchases: () => {
        return get().purchases.length;
      },

      getTotalCoinsEarned: () => {
        return get().purchases.reduce((sum, p) => sum + p.coinsGranted, 0);
      },

      toggleDarkMode: () => {
        set((state) => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode },
        }));
      },

      setDefaultNoteColor: (color) => {
        set((state) => ({
          settings: { ...state.settings, defaultNoteColor: color },
        }));
      },

      // Deprecated - kept for backward compatibility with tests
      // Use saveGeminiApiKey for production code
      setGeminiApiKey: (key) => {
        const trimmedKey = key.trim();
        set((state) => ({
          settings: { ...state.settings, geminiApiKey: trimmedKey || undefined },
          apiKeyMasked: trimmedKey ? maskApiKey(trimmedKey) : null,
        }));

        // Also save to secure storage (fire and forget for sync compatibility)
        if (trimmedKey) {
          saveApiKey(trimmedKey).catch(console.error);
        } else {
          deleteApiKey().catch(console.error);
        }
      },

      // Load API key from secure storage
      loadApiKey: async () => {
        try {
          const key = await getApiKey();
          set({
            apiKeyLoaded: true,
            apiKeyMasked: key ? maskApiKey(key) : null,
            settings: {
              ...get().settings,
              geminiApiKey: key || undefined,
            },
          });
          return key;
        } catch (error) {
          console.error('Failed to load API key:', error);
          set({ apiKeyLoaded: true });
          return null;
        }
      },

      // Save API key to secure storage
      saveGeminiApiKey: async (key: string) => {
        const trimmedKey = key.trim();
        const success = await saveApiKey(trimmedKey);
        if (success) {
          set((state) => ({
            settings: { ...state.settings, geminiApiKey: trimmedKey || undefined },
            apiKeyMasked: trimmedKey ? maskApiKey(trimmedKey) : null,
          }));
        }
        return success;
      },

      // Clear API key from secure storage
      clearGeminiApiKey: async () => {
        const success = await deleteApiKey();
        if (success) {
          set((state) => ({
            settings: { ...state.settings, geminiApiKey: undefined },
            apiKeyMasked: null,
          }));
        }
        return success;
      },

      // Check if API key is set
      hasApiKey: () => {
        const { settings } = get();
        return !!settings.geminiApiKey;
      },

      // ========================================================================
      // Onboarding Actions
      // ========================================================================

      completeWelcome: () => {
        set((state) => ({
          onboarding: { ...state.onboarding, hasCompletedWelcome: true },
        }));
      },

      markCoachMarkSeen: (id: CoachMarkId | string) => {
        set((state) => {
          // Don't add duplicates
          if (state.onboarding.seenCoachMarks.includes(id)) {
            return state;
          }
          return {
            onboarding: {
              ...state.onboarding,
              seenCoachMarks: [...state.onboarding.seenCoachMarks, id],
            },
          };
        });
      },

      hasSeenCoachMark: (id: CoachMarkId | string) => {
        const { onboarding } = get();
        return onboarding.seenCoachMarks.includes(id);
      },

      incrementNotesCreated: () => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            notesCreatedCount: state.onboarding.notesCreatedCount + 1,
          },
        }));
      },

      resetOnboarding: () => {
        set({ onboarding: INITIAL_ONBOARDING });
      },

      setOnboardingVersion: (version: number) => {
        set((state) => ({
          onboarding: { ...state.onboarding, onboardingVersion: version },
        }));
      },
    }),
    {
      name: 'toonnotes-user',
      storage: createJSONStorage(() => debouncedStorage),
      // Don't persist API key in AsyncStorage - it's stored in SecureStore
      partialize: (state) => ({
        user: state.user,
        purchases: state.purchases,
        onboarding: state.onboarding,
        settings: {
          darkMode: state.settings.darkMode,
          defaultNoteColor: state.settings.defaultNoteColor,
          // Explicitly exclude geminiApiKey from persistence
        },
      }),
    }
  )
);
