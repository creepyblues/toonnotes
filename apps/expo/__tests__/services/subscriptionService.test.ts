/**
 * Subscription Service Unit Tests
 *
 * Tests for the subscription flow including:
 * - Coin grant logic
 * - Race condition prevention (mutex)
 * - Expiration checking
 * - Renewal detection
 * - Double-grant prevention
 */

import { act } from '@testing-library/react-native';

// Mock purchaseService
const mockCheckProStatus = jest.fn();
const mockAddCustomerInfoListener = jest.fn();

jest.mock('@/services/purchaseService', () => ({
  purchaseService: {
    checkProStatus: () => mockCheckProStatus(),
    addCustomerInfoListener: (callback: any) => mockAddCustomerInfoListener(callback),
  },
}));

// Mock supabase
jest.mock('@/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
  isSupabaseConfigured: jest.fn(() => false),
}));

// Mock devLog
jest.mock('@/utils/devLog', () => ({
  devLog: jest.fn(),
  devWarn: jest.fn(),
}));

// Import after mocks
import { subscriptionService } from '@/services/subscriptionService';
import { useUserStore } from '@/stores/userStore';
import { DEFAULT_SUBSCRIPTION } from '@/types';
import { PRO_MONTHLY_COINS } from '@/constants/products';

describe('SubscriptionService', () => {
  // Helper to reset the service's private state
  const resetServiceState = () => {
    // Access private fields via any cast for testing
    (subscriptionService as any).initialized = false;
    (subscriptionService as any).listenerAttached = false;
    (subscriptionService as any).isGrantingCoins = false;
  };

  beforeEach(() => {
    // Reset user store state
    useUserStore.setState({
      user: {
        id: 'test-user',
        freeDesignsUsed: 0,
        coinBalance: 5,
        createdAt: Date.now(),
        subscription: { ...DEFAULT_SUBSCRIPTION },
      },
      settings: {
        darkMode: false,
        defaultNoteColor: 'white',
      },
      onboarding: {
        hasCompletedWelcome: false,
        seenCoachMarks: [],
        onboardingVersion: 0,
        notesCreatedCount: 0,
      },
      purchases: [],
      isProcessingPurchase: false,
      isPurchaseSheetOpen: false,
    });

    // Reset service state
    resetServiceState();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('grantMonthlyCoins (in userStore)', () => {
    it('should grant coins when user has active Pro subscription', () => {
      // Setup: User is Pro with future expiration
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() + 86400000, // 1 day in future
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      const { grantMonthlyCoins } = useUserStore.getState();
      const grantTime = Date.now();

      const result = grantMonthlyCoins(grantTime);

      expect(result).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(10 + PRO_MONTHLY_COINS);
      expect(useUserStore.getState().user.subscription.lastCoinGrantDate).toBe(grantTime);
    });

    it('should NOT grant coins when user is not Pro', () => {
      const { grantMonthlyCoins } = useUserStore.getState();
      const initialBalance = useUserStore.getState().user.coinBalance;

      const result = grantMonthlyCoins();

      expect(result).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance);
    });

    it('should NOT grant coins when Pro subscription is expired', () => {
      // Setup: User was Pro but subscription expired
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: {
            isPro: true, // Flag still set
            plan: 'monthly',
            expiresAt: Date.now() - 86400000, // 1 day ago (expired!)
            lastCoinGrantDate: null,
            willRenew: false,
          },
        },
      });

      const { grantMonthlyCoins } = useUserStore.getState();
      const initialBalance = useUserStore.getState().user.coinBalance;

      const result = grantMonthlyCoins();

      // Should return false because isPro() checks expiration
      expect(result).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance);
    });

    it('should use provided grantDate instead of Date.now()', () => {
      // Setup: User is Pro
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() + 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      const { grantMonthlyCoins } = useUserStore.getState();
      const specificTime = 1700000000000; // Fixed timestamp

      grantMonthlyCoins(specificTime);

      expect(useUserStore.getState().user.subscription.lastCoinGrantDate).toBe(specificTime);
    });
  });

  describe('isPro helper', () => {
    it('should return true for active Pro subscription', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() + 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      const { isPro } = useUserStore.getState();
      expect(isPro()).toBe(true);
    });

    it('should return false for expired Pro subscription', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() - 86400000, // Expired
            lastCoinGrantDate: null,
            willRenew: false,
          },
        },
      });

      const { isPro } = useUserStore.getState();
      expect(isPro()).toBe(false);
    });

    it('should return true when expiresAt is null (lifetime/no expiration)', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: null, // No expiration set
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      const { isPro } = useUserStore.getState();
      expect(isPro()).toBe(true);
    });
  });

  describe('checkAndGrantRenewalCoins', () => {
    it('should grant coins on renewal (new purchase date)', async () => {
      const purchaseTime = Date.now();

      // Setup: User is Pro, no previous grant
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: purchaseTime + 30 * 86400000, // 30 days
            lastCoinGrantDate: null, // Never granted
            willRenew: true,
          },
        },
      });

      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: new Date(purchaseTime + 30 * 86400000),
        willRenew: true,
        latestPurchaseDate: new Date(purchaseTime),
        productId: 'com.toonnotes.pro.monthly',
      });

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      expect(result).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(10 + PRO_MONTHLY_COINS);
      expect(useUserStore.getState().user.subscription.lastCoinGrantDate).toBe(purchaseTime);
    });

    it('should NOT grant coins if already granted for this purchase', async () => {
      const purchaseTime = Date.now();

      // Setup: Already granted coins for this purchase
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 110, // Already got 100 coins
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: purchaseTime + 30 * 86400000,
            lastCoinGrantDate: purchaseTime, // Same as purchase time!
            willRenew: true,
          },
        },
      });

      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: new Date(purchaseTime + 30 * 86400000),
        willRenew: true,
        latestPurchaseDate: new Date(purchaseTime),
        productId: 'com.toonnotes.pro.monthly',
      });

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      expect(result).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(110); // Unchanged
    });

    it('should grant coins on subscription renewal (new billing period)', async () => {
      const firstPurchaseTime = Date.now() - 31 * 86400000; // 31 days ago
      const renewalTime = Date.now();

      // Setup: User got coins last month
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 50,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: renewalTime + 30 * 86400000,
            lastCoinGrantDate: firstPurchaseTime, // Last grant was 31 days ago
            willRenew: true,
          },
        },
      });

      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: new Date(renewalTime + 30 * 86400000),
        willRenew: true,
        latestPurchaseDate: new Date(renewalTime), // New renewal!
        productId: 'com.toonnotes.pro.monthly',
      });

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      expect(result).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(50 + PRO_MONTHLY_COINS);
    });

    it('should use mutex to prevent concurrent coin grants', async () => {
      const purchaseTime = Date.now();

      // Setup: User is Pro
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: purchaseTime + 30 * 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      // Make checkProStatus slow to allow race condition
      mockCheckProStatus.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              isPro: true,
              expiresAt: new Date(purchaseTime + 30 * 86400000),
              willRenew: true,
              latestPurchaseDate: new Date(purchaseTime),
              productId: 'com.toonnotes.pro.monthly',
            });
          }, 50);
        });
      });

      // Call twice concurrently
      const [result1, result2] = await Promise.all([
        subscriptionService.checkAndGrantRenewalCoins(),
        subscriptionService.checkAndGrantRenewalCoins(),
      ]);

      // Only one should succeed due to mutex
      expect([result1, result2]).toContain(true);
      expect([result1, result2]).toContain(false);

      // Should only have granted once
      expect(useUserStore.getState().user.coinBalance).toBe(10 + PRO_MONTHLY_COINS);
    });

    it('should NOT grant coins when RevenueCat says not Pro', async () => {
      // Setup: Local state says Pro
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() + 30 * 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      // RevenueCat says NOT Pro
      mockCheckProStatus.mockResolvedValue({
        isPro: false,
        expiresAt: null,
        willRenew: false,
        latestPurchaseDate: null,
        productId: null,
      });

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      expect(result).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(10); // Unchanged
    });

    it('should NOT grant coins when local state says not Pro', async () => {
      // Local state says NOT Pro
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: { ...DEFAULT_SUBSCRIPTION },
        },
      });

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      expect(result).toBe(false);
      // checkProStatus should NOT have been called (early exit)
      expect(mockCheckProStatus).not.toHaveBeenCalled();
    });

    it('should handle checkProStatus errors gracefully', async () => {
      // Setup: User is Pro
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() + 30 * 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      // RevenueCat throws error
      mockCheckProStatus.mockRejectedValue(new Error('Network error'));

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      expect(result).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(10); // Unchanged
    });
  });

  describe('handleNewSubscription', () => {
    it('should sync status and grant coins using idempotent method', async () => {
      const purchaseTime = Date.now();

      // Initial state: Not Pro
      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: new Date(purchaseTime + 30 * 86400000),
        willRenew: true,
        latestPurchaseDate: new Date(purchaseTime),
        productId: 'com.toonnotes.pro.monthly',
      });

      // After sync, local state is Pro
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 5,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: purchaseTime + 30 * 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      await subscriptionService.handleNewSubscription();

      // Should have granted coins
      expect(useUserStore.getState().user.coinBalance).toBe(5 + PRO_MONTHLY_COINS);
    });

    it('should not double-grant when called with listener firing', async () => {
      const purchaseTime = Date.now();

      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: new Date(purchaseTime + 30 * 86400000),
        willRenew: true,
        latestPurchaseDate: new Date(purchaseTime),
        productId: 'com.toonnotes.pro.monthly',
      });

      // Simulate state being set by sync
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 5,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: purchaseTime + 30 * 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      // Call handleNewSubscription twice (simulating both explicit call and listener)
      await Promise.all([
        subscriptionService.handleNewSubscription(),
        subscriptionService.handleNewSubscription(),
      ]);

      // Should only grant once (mutex protection)
      expect(useUserStore.getState().user.coinBalance).toBe(5 + PRO_MONTHLY_COINS);
    });
  });

  describe('syncSubscriptionStatus', () => {
    it('should set subscription state when RevenueCat says Pro', async () => {
      const purchaseTime = Date.now();
      const expiresAt = purchaseTime + 30 * 86400000;

      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: new Date(expiresAt),
        willRenew: true,
        latestPurchaseDate: new Date(purchaseTime),
        productId: 'com.toonnotes.pro.monthly',
      });

      await subscriptionService.syncSubscriptionStatus();

      const { subscription } = useUserStore.getState().user;
      expect(subscription.isPro).toBe(true);
      expect(subscription.plan).toBe('monthly');
      expect(subscription.expiresAt).toBe(expiresAt);
      expect(subscription.willRenew).toBe(true);
    });

    it('should clear subscription when RevenueCat says not Pro', async () => {
      // Setup: User was Pro
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() - 86400000, // Expired
            lastCoinGrantDate: Date.now() - 30 * 86400000,
            willRenew: false,
          },
        },
      });

      mockCheckProStatus.mockResolvedValue({
        isPro: false,
        expiresAt: null,
        willRenew: false,
        latestPurchaseDate: null,
        productId: null,
      });

      await subscriptionService.syncSubscriptionStatus();

      const { subscription } = useUserStore.getState().user;
      expect(subscription.isPro).toBe(false);
      expect(subscription.plan).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle subscription with null expiresAt', async () => {
      const purchaseTime = Date.now();

      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: null, // No expiration
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: null,
        willRenew: true,
        latestPurchaseDate: new Date(purchaseTime),
        productId: 'com.toonnotes.pro.monthly',
      });

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      expect(result).toBe(true);
    });

    it('should handle latestPurchaseDate being null', async () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: Date.now() + 30 * 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      mockCheckProStatus.mockResolvedValue({
        isPro: true,
        expiresAt: new Date(Date.now() + 30 * 86400000),
        willRenew: true,
        latestPurchaseDate: null, // No purchase date
        productId: 'com.toonnotes.pro.monthly',
      });

      const result = await subscriptionService.checkAndGrantRenewalCoins();

      // Should not grant without purchase date
      expect(result).toBe(false);
    });

    it('should re-read state after async operation to prevent race conditions', async () => {
      const purchaseTime = Date.now();
      let asyncCallCount = 0;

      // Setup slow mock that simulates state change during await
      mockCheckProStatus.mockImplementation(async () => {
        asyncCallCount++;

        // If this is the second call, pretend another call already set lastCoinGrantDate
        if (asyncCallCount === 2) {
          useUserStore.setState({
            user: {
              ...useUserStore.getState().user,
              subscription: {
                ...useUserStore.getState().user.subscription,
                lastCoinGrantDate: purchaseTime,
              },
            },
          });
        }

        return {
          isPro: true,
          expiresAt: new Date(purchaseTime + 30 * 86400000),
          willRenew: true,
          latestPurchaseDate: new Date(purchaseTime),
          productId: 'com.toonnotes.pro.monthly',
        };
      });

      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          coinBalance: 10,
          subscription: {
            isPro: true,
            plan: 'monthly',
            expiresAt: purchaseTime + 30 * 86400000,
            lastCoinGrantDate: null,
            willRenew: true,
          },
        },
      });

      // First call
      const result1 = await subscriptionService.checkAndGrantRenewalCoins();

      // Reset mutex for second test call
      (subscriptionService as any).isGrantingCoins = false;

      // Second call (state was modified during first call's await)
      const result2 = await subscriptionService.checkAndGrantRenewalCoins();

      // First call should succeed
      expect(result1).toBe(true);
      // Second call should see updated state and not grant
      expect(result2).toBe(false);
    });
  });
});

describe('Coin Economy Integration', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: {
        id: 'test-user',
        freeDesignsUsed: 0,
        coinBalance: 5,
        createdAt: Date.now(),
        subscription: { ...DEFAULT_SUBSCRIPTION },
      },
      settings: {
        darkMode: false,
        defaultNoteColor: 'white',
      },
      onboarding: {
        hasCompletedWelcome: false,
        seenCoachMarks: [],
        onboardingVersion: 0,
        notesCreatedCount: 0,
      },
      purchases: [],
      isProcessingPurchase: false,
      isPurchaseSheetOpen: false,
    });
  });

  describe('addCoins', () => {
    it('should add coins to balance', () => {
      const { addCoins } = useUserStore.getState();

      addCoins(50);

      expect(useUserStore.getState().user.coinBalance).toBe(55);
    });

    it('should handle adding 0 coins', () => {
      const { addCoins } = useUserStore.getState();

      addCoins(0);

      expect(useUserStore.getState().user.coinBalance).toBe(5);
    });
  });

  describe('spendCoin', () => {
    it('should use free design first', () => {
      const { spendCoin } = useUserStore.getState();

      const result = spendCoin();

      expect(result).toBe(true);
      expect(useUserStore.getState().user.freeDesignsUsed).toBe(1);
      expect(useUserStore.getState().user.coinBalance).toBe(5); // Unchanged
    });

    it('should spend coin after free designs exhausted', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          freeDesignsUsed: 3, // All free designs used
          coinBalance: 10,
        },
      });

      const { spendCoin } = useUserStore.getState();

      const result = spendCoin();

      expect(result).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(9);
    });

    it('should return false when no coins and no free designs', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          freeDesignsUsed: 3,
          coinBalance: 0,
        },
      });

      const { spendCoin } = useUserStore.getState();

      const result = spendCoin();

      expect(result).toBe(false);
    });
  });

  describe('canAffordDesign', () => {
    it('should return true when free designs available', () => {
      const { canAffordDesign } = useUserStore.getState();

      expect(canAffordDesign()).toBe(true);
    });

    it('should return true when has coins but no free designs', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          freeDesignsUsed: 3,
          coinBalance: 1,
        },
      });

      const { canAffordDesign } = useUserStore.getState();

      expect(canAffordDesign()).toBe(true);
    });

    it('should return false when no coins and no free designs', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          freeDesignsUsed: 3,
          coinBalance: 0,
        },
      });

      const { canAffordDesign } = useUserStore.getState();

      expect(canAffordDesign()).toBe(false);
    });
  });

  describe('getDesignCost', () => {
    it('should return 0 when free designs available', () => {
      const { getDesignCost } = useUserStore.getState();

      expect(getDesignCost()).toBe(0);
    });

    it('should return 1 when no free designs', () => {
      useUserStore.setState({
        user: {
          ...useUserStore.getState().user,
          freeDesignsUsed: 3,
        },
      });

      const { getDesignCost } = useUserStore.getState();

      expect(getDesignCost()).toBe(1);
    });
  });
});
