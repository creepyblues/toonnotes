import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AppSettings, NoteColor, Purchase, Subscription, DEFAULT_SUBSCRIPTION } from '@/types';
import { PRO_MONTHLY_COINS } from '@/constants/products';
import { generateUUID } from '@/utils/uuid';
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

  // Purchase state
  purchases: Purchase[];
  isProcessingPurchase: boolean;
  isPurchaseSheetOpen: boolean;

  // User actions
  addCoins: (amount: number) => void;
  spendCoin: () => boolean; // Returns false if insufficient balance
  canAffordDesign: () => boolean;
  getDesignCost: () => number; // 0 if free design available, 1 otherwise
  getFreeDesignsRemaining: () => number; // Returns remaining free designs (0-3)

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

  // Onboarding actions
  completeWelcome: () => void;
  markCoachMarkSeen: (id: CoachMarkId | string) => void;
  hasSeenCoachMark: (id: CoachMarkId | string) => boolean;
  incrementNotesCreated: () => void;
  resetOnboarding: () => void; // For testing/debugging
  setOnboardingVersion: (version: number) => void;

  // Subscription actions
  setSubscription: (subscription: Partial<Subscription>) => void;
  isPro: () => boolean;
  grantMonthlyCoins: () => boolean; // Returns true if coins were granted
  clearSubscription: () => void;
}

// Free design quota constant (exported for UI)
export const FREE_DESIGN_QUOTA = 3;

const INITIAL_USER: User = {
  id: generateUUID(),
  freeDesignsUsed: 0, // Production: users start with 0 used, 3 free designs available
  coinBalance: 5, // New users start with 5 coins
  createdAt: Date.now(),
  subscription: DEFAULT_SUBSCRIPTION,
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

      // Purchase state
      purchases: [],
      isProcessingPurchase: false,
      isPurchaseSheetOpen: false,

      addCoins: (amount) => {
        set((state) => ({
          user: { ...state.user, coinBalance: state.user.coinBalance + amount },
        }));
      },

      spendCoin: () => {
        const { user } = get();

        // If free designs remaining, use one instead of coins
        if (user.freeDesignsUsed < FREE_DESIGN_QUOTA) {
          set((state) => ({
            user: { ...state.user, freeDesignsUsed: state.user.freeDesignsUsed + 1 },
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
        return user.freeDesignsUsed < FREE_DESIGN_QUOTA || user.coinBalance >= 1;
      },

      getDesignCost: () => {
        const { user } = get();
        return user.freeDesignsUsed < FREE_DESIGN_QUOTA ? 0 : 1;
      },

      getFreeDesignsRemaining: () => {
        const { user } = get();
        return Math.max(0, FREE_DESIGN_QUOTA - user.freeDesignsUsed);
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

      // ========================================================================
      // Subscription Actions
      // ========================================================================

      setSubscription: (subscription: Partial<Subscription>) => {
        set((state) => ({
          user: {
            ...state.user,
            subscription: {
              ...state.user.subscription,
              ...subscription,
            },
          },
        }));
      },

      isPro: () => {
        const { user } = get();
        if (!user.subscription.isPro) return false;

        // Check if subscription is still valid (not expired)
        if (user.subscription.expiresAt) {
          return user.subscription.expiresAt > Date.now();
        }

        return user.subscription.isPro;
      },

      grantMonthlyCoins: () => {
        const { user, addCoins, setSubscription } = get();

        // Only grant if user is Pro
        if (!user.subscription.isPro) return false;

        // Grant the monthly coins
        addCoins(PRO_MONTHLY_COINS);

        // Update last grant date
        setSubscription({
          lastCoinGrantDate: Date.now(),
        });

        return true;
      },

      clearSubscription: () => {
        set((state) => ({
          user: {
            ...state.user,
            subscription: DEFAULT_SUBSCRIPTION,
          },
        }));
      },
    }),
    {
      name: 'toonnotes-user',
      storage: createJSONStorage(() => debouncedStorage),
      partialize: (state) => ({
        user: state.user,
        purchases: state.purchases,
        onboarding: state.onboarding,
        settings: state.settings,
      }),
      // Migration: Handle schema changes for existing users
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          const user = state.user as User & { freeDesignUsed?: boolean };

          // Migration 1: Convert old freeDesignUsed boolean to new freeDesignsUsed number
          if (typeof user.freeDesignUsed === 'boolean') {
            user.freeDesignsUsed = user.freeDesignUsed ? 1 : 0;
            delete user.freeDesignUsed;
          }
          // Ensure freeDesignsUsed exists (for very old users)
          if (typeof user.freeDesignsUsed !== 'number') {
            user.freeDesignsUsed = 0;
          }

          // Migration 2: Add subscription field for users who don't have it
          if (!user.subscription) {
            user.subscription = DEFAULT_SUBSCRIPTION;
          }
        }
      },
    }
  )
);
