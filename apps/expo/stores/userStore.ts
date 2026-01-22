import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AppSettings, NoteColor, Purchase, Subscription, DEFAULT_SUBSCRIPTION, AgentId } from '@/types';
import { PRO_MONTHLY_COINS } from '@/constants/products';
import { generateUUID } from '@/utils/uuid';
import { debouncedStorage } from './debouncedStorage';
import { CoachMarkId } from '@/constants/onboardingConfig';
import { Analytics, updateUserProperties, getCoinBalanceTier } from '@/services/firebaseAnalytics';

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

/** Agent Onboarding State - Interactive agent introduction flow */
interface AgentOnboardingState {
  /** Whether user has started the agent onboarding flow */
  hasStartedAgentOnboarding: boolean;
  /** Whether user has completed the agent onboarding flow */
  hasCompletedAgentOnboarding: boolean;
  /** Agent IDs that user has experienced/met */
  experiencedAgents: AgentId[];
  /** First agent chosen by user (for analytics) */
  firstAgentChosen: AgentId | null;
  /** Timestamp when onboarding started */
  onboardingStartedAt: number | null;
  /** Timestamp when onboarding completed */
  onboardingCompletedAt: number | null;
  /** Whether user skipped after meeting some agents */
  skippedAfterAgent: boolean;
  /** Agent IDs whose intro sheets have been seen (for first-time mode assignment) */
  seenAgentIntros: AgentId[];
}

const INITIAL_ONBOARDING: OnboardingState = {
  hasCompletedWelcome: false,
  seenCoachMarks: [],
  onboardingVersion: 0,
  notesCreatedCount: 0,
};

const INITIAL_AGENT_ONBOARDING: AgentOnboardingState = {
  hasStartedAgentOnboarding: false,
  hasCompletedAgentOnboarding: false,
  experiencedAgents: [],
  firstAgentChosen: null,
  onboardingStartedAt: null,
  onboardingCompletedAt: null,
  skippedAfterAgent: false,
  seenAgentIntros: [],
};

interface UserState {
  user: User;
  settings: AppSettings;
  onboarding: OnboardingState;
  agentOnboarding: AgentOnboardingState;

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

  // Agent Onboarding actions
  startAgentOnboarding: () => void;
  completeAgentOnboarding: () => void;
  recordAgentExperienced: (agentId: AgentId) => void;
  setFirstAgentChosen: (agentId: AgentId) => void;
  resetAgentOnboarding: () => void;
  skipAgentOnboarding: () => void;

  // Agent Intro actions (first-time mode assignment)
  markAgentIntroSeen: (agentId: AgentId) => void;
  hasSeenAgentIntro: (agentId: AgentId) => boolean;

  // Subscription actions
  setSubscription: (subscription: Partial<Subscription>) => void;
  isPro: () => boolean;
  grantMonthlyCoins: (grantDate?: number) => boolean; // Returns true if coins were granted
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
      agentOnboarding: INITIAL_AGENT_ONBOARDING,

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

          // Track free design usage
          Analytics.coinsSpent(0, 'design_free');
          const newRemaining = FREE_DESIGN_QUOTA - user.freeDesignsUsed - 1;
          updateUserProperties({ free_designs_remaining: newRemaining });

          return true;
        }

        // Otherwise, spend a coin
        if (user.coinBalance >= 1) {
          const newBalance = user.coinBalance - 1;
          set((state) => ({
            user: { ...state.user, coinBalance: newBalance },
          }));

          // Track coin spending
          Analytics.coinsSpent(1, 'design_paid');
          updateUserProperties({ coin_balance_tier: getCoinBalanceTier(newBalance) });

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
        const newBalance = get().user.coinBalance + purchase.coinsGranted;
        set((state) => ({
          purchases: [...state.purchases, purchase],
          user: {
            ...state.user,
            coinBalance: newBalance,
          },
        }));

        // Track coins granted from purchase
        Analytics.coinsGranted(purchase.coinsGranted, 'purchase');
        updateUserProperties({ coin_balance_tier: getCoinBalanceTier(newBalance) });
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

        // Track onboarding completion
        Analytics.onboardingCompleted();
        updateUserProperties({ onboarding_complete: true });
      },

      markCoachMarkSeen: (id: CoachMarkId | string) => {
        const { onboarding } = get();
        // Don't add duplicates or track if already seen
        if (onboarding.seenCoachMarks.includes(id)) {
          return;
        }

        set((state) => ({
          onboarding: {
            ...state.onboarding,
            seenCoachMarks: [...state.onboarding.seenCoachMarks, id],
          },
        }));

        // Track coach mark dismissal
        Analytics.coachMarkDismissed(id);
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
      // Agent Onboarding Actions
      // ========================================================================

      startAgentOnboarding: () => {
        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            hasStartedAgentOnboarding: true,
            onboardingStartedAt: Date.now(),
          },
        }));
        Analytics.agentOnboardingStarted();
      },

      completeAgentOnboarding: () => {
        const { agentOnboarding } = get();
        const totalTimeSeconds = agentOnboarding.onboardingStartedAt
          ? Math.round((Date.now() - agentOnboarding.onboardingStartedAt) / 1000)
          : 0;

        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            hasCompletedAgentOnboarding: true,
            onboardingCompletedAt: Date.now(),
          },
        }));

        Analytics.agentOnboardingCompleted(agentOnboarding.experiencedAgents, totalTimeSeconds);
      },

      recordAgentExperienced: (agentId: AgentId) => {
        const { agentOnboarding } = get();
        if (agentOnboarding.experiencedAgents.includes(agentId)) return;

        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            experiencedAgents: [...state.agentOnboarding.experiencedAgents, agentId],
          },
        }));

        Analytics.agentOnboardingAgentCompleted(agentId);
      },

      setFirstAgentChosen: (agentId: AgentId) => {
        const { agentOnboarding } = get();
        if (agentOnboarding.firstAgentChosen) return; // Already set

        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            firstAgentChosen: agentId,
          },
        }));

        Analytics.agentOnboardingAgentChosen(agentId, true);
      },

      resetAgentOnboarding: () => {
        set({ agentOnboarding: INITIAL_AGENT_ONBOARDING });
        Analytics.agentOnboardingReRunFromSettings();
      },

      skipAgentOnboarding: () => {
        const { agentOnboarding } = get();

        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            hasCompletedAgentOnboarding: true,
            skippedAfterAgent: true,
            onboardingCompletedAt: Date.now(),
          },
        }));

        Analytics.agentOnboardingSkipped(agentOnboarding.experiencedAgents.length);
      },

      // ========================================================================
      // Agent Intro Actions (first-time mode assignment)
      // ========================================================================

      markAgentIntroSeen: (agentId: AgentId) => {
        const { agentOnboarding } = get();
        // Don't add duplicates
        if (agentOnboarding.seenAgentIntros.includes(agentId)) {
          return;
        }

        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            seenAgentIntros: [...state.agentOnboarding.seenAgentIntros, agentId],
          },
        }));

        // Track analytics
        Analytics.agentIntroSeen(agentId);
      },

      hasSeenAgentIntro: (agentId: AgentId) => {
        const { agentOnboarding } = get();
        return agentOnboarding.seenAgentIntros.includes(agentId);
      },

      // ========================================================================
      // Subscription Actions
      // ========================================================================

      setSubscription: (subscription: Partial<Subscription>) => {
        const wasPro = get().user.subscription.isPro;

        set((state) => ({
          user: {
            ...state.user,
            subscription: {
              ...state.user.subscription,
              ...subscription,
            },
          },
        }));

        // Track subscription changes
        const newIsPro = subscription.isPro ?? get().user.subscription.isPro;
        if (!wasPro && newIsPro) {
          // User just became Pro
          Analytics.subscriptionStarted('pro');
          updateUserProperties({ subscription_tier: 'pro' });
        } else if (wasPro && !newIsPro) {
          // User lost Pro status
          Analytics.subscriptionCancelled('pro');
          updateUserProperties({ subscription_tier: 'free' });
        }
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

      grantMonthlyCoins: (grantDate?: number) => {
        const { user, addCoins, setSubscription, isPro } = get();

        // Only grant if user has an active (non-expired) Pro subscription
        // Using isPro() which checks both the flag AND expiration date
        if (!isPro()) return false;

        // Grant the monthly coins
        addCoins(PRO_MONTHLY_COINS);

        // Track monthly coin grant
        Analytics.coinsGranted(PRO_MONTHLY_COINS, 'pro_monthly');

        // Update last grant date - use provided grantDate (from RevenueCat purchase time)
        // to prevent re-granting on subsequent checks when timestamps differ
        setSubscription({
          lastCoinGrantDate: grantDate ?? Date.now(),
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
        agentOnboarding: state.agentOnboarding,
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
