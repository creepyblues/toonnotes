/**
 * Subscription Service
 *
 * Manages Pro subscription state, renewal detection, and monthly coin grants.
 * Acts as the single source of truth for subscription status in the app.
 *
 * Key responsibilities:
 * - Initialize and sync subscription status from RevenueCat on app launch
 * - Detect subscription renewals and grant monthly coins
 * - Listen for real-time subscription status changes
 * - Sync subscription state to Supabase for Pro users
 */

import { purchaseService, ProStatus, CustomerInfo } from './purchaseService';
import { useUserStore } from '@/stores/userStore';
import { supabase, isSupabaseConfigured } from './supabase';
import { PRO_MONTHLY_COINS, ENTITLEMENT_ID } from '@/constants/products';
import { devLog, devWarn } from '@/utils/devLog';

class SubscriptionService {
  private listenerAttached = false;
  private initialized = false;
  private isGrantingCoins = false; // Mutex to prevent concurrent coin grants

  /**
   * Initialize subscription service on app launch.
   * - Checks RevenueCat for current subscription status
   * - Detects if a renewal occurred since last app open
   * - Grants coins if renewal detected
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      devLog('[Subscription] Already initialized');
      return;
    }

    devLog('[Subscription] Initializing...');

    // Sync subscription status from RevenueCat
    await this.syncSubscriptionStatus();

    // Check for renewal and grant coins if needed
    await this.checkAndGrantRenewalCoins();

    this.initialized = true;
    devLog('[Subscription] Initialized');
  }

  /**
   * Sync subscription status from RevenueCat to local store.
   * Call this on app launch, app foreground, and after purchases.
   */
  async syncSubscriptionStatus(): Promise<void> {
    const proStatus = await purchaseService.checkProStatus();
    const { setSubscription, clearSubscription } = useUserStore.getState();

    if (proStatus.isPro) {
      setSubscription({
        isPro: true,
        plan: 'monthly', // Currently only monthly plan supported
        expiresAt: proStatus.expiresAt?.getTime() || null,
        willRenew: proStatus.willRenew,
        // Don't update lastCoinGrantDate here - that's managed by grantMonthlyCoins
      });

      devLog('[Subscription] Status synced: Pro active', {
        expiresAt: proStatus.expiresAt,
        willRenew: proStatus.willRenew,
      });
    } else {
      // User is not Pro - check if they were previously
      const { user } = useUserStore.getState();
      if (user.subscription.isPro) {
        devLog('[Subscription] Pro subscription expired or cancelled');
        clearSubscription();
      }
    }
  }

  /**
   * Detect subscription renewal and grant 100 monthly coins.
   * Uses latestPurchaseDate from RevenueCat vs lastCoinGrantDate in store.
   *
   * This method is idempotent: calling it multiple times with the same
   * RevenueCat state will only grant coins once.
   *
   * @returns true if coins were granted (renewal detected)
   */
  async checkAndGrantRenewalCoins(): Promise<boolean> {
    // Mutex: prevent concurrent calls from granting coins twice
    if (this.isGrantingCoins) {
      devLog('[Subscription] Coin grant already in progress, skipping');
      return false;
    }

    try {
      this.isGrantingCoins = true;

      const { user, grantMonthlyCoins } = useUserStore.getState();

      // Only check for Pro users (check flag first for quick exit)
      if (!user.subscription.isPro) {
        return false;
      }

      const proStatus = await purchaseService.checkProStatus();

      if (!proStatus.isPro || !proStatus.latestPurchaseDate) {
        devLog('[Subscription] RevenueCat says not Pro or no purchase date');
        return false;
      }

      const latestPurchaseTime = proStatus.latestPurchaseDate.getTime();

      // Re-read state after async operation to get the most current value
      // This prevents race conditions where another call updated lastCoinGrantDate
      const currentState = useUserStore.getState();
      const lastGrantTime = currentState.user.subscription.lastCoinGrantDate || 0;

      // If latest purchase is newer than last grant, this is a new billing period
      if (latestPurchaseTime > lastGrantTime) {
        devLog('[Subscription] Renewal detected, granting monthly coins', {
          latestPurchase: proStatus.latestPurchaseDate,
          lastGrant: lastGrantTime ? new Date(lastGrantTime) : 'never',
          coins: PRO_MONTHLY_COINS,
        });

        // Grant the monthly coins - use latestPurchaseTime as the grant date
        // to prevent re-granting when CustomerInfo listener fires multiple times
        const success = grantMonthlyCoins(latestPurchaseTime);

        if (success) {
          devLog('[Subscription] Coins granted successfully');
        } else {
          devWarn('[Subscription] grantMonthlyCoins returned false');
        }

        return success;
      }

      devLog('[Subscription] No renewal detected', {
        latestPurchase: latestPurchaseTime,
        lastGrant: lastGrantTime,
      });
      return false;
    } catch (error) {
      console.error('[Subscription] Error in checkAndGrantRenewalCoins:', error);
      return false;
    } finally {
      this.isGrantingCoins = false;
    }
  }

  /**
   * Sync subscription state to Supabase.
   * Call this after subscription changes for Pro users.
   */
  async syncToCloud(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      devWarn('[Subscription] Supabase not configured, skipping cloud sync');
      return;
    }

    const { user } = useUserStore.getState();

    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: userId,
          is_pro: user.subscription.isPro,
          subscription_plan: user.subscription.plan,
          subscription_expires_at: user.subscription.expiresAt
            ? new Date(user.subscription.expiresAt).toISOString()
            : null,
          subscription_last_coin_grant_date: user.subscription.lastCoinGrantDate
            ? new Date(user.subscription.lastCoinGrantDate).toISOString()
            : null,
          subscription_will_renew: user.subscription.willRenew,
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error('[Subscription] Cloud sync failed:', error);
      } else {
        devLog('[Subscription] Synced to cloud');
      }
    } catch (error) {
      console.error('[Subscription] Cloud sync error:', error);
    }
  }

  /**
   * Set up listener for real-time subscription status changes.
   * Handles subscription purchase, renewal, cancellation, and expiration.
   */
  setupSubscriptionListener(): void {
    if (this.listenerAttached) {
      devLog('[Subscription] Listener already attached');
      return;
    }

    purchaseService.addCustomerInfoListener(async (customerInfo: CustomerInfo) => {
      devLog('[Subscription] Customer info updated');

      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      if (entitlement) {
        // User has active Pro entitlement
        const { setSubscription } = useUserStore.getState();

        setSubscription({
          isPro: true,
          plan: 'monthly',
          expiresAt: entitlement.expirationDate
            ? new Date(entitlement.expirationDate).getTime()
            : null,
          willRenew: entitlement.willRenew,
        });

        // Check if this is a renewal and grant coins
        await this.checkAndGrantRenewalCoins();

        devLog('[Subscription] Updated: Pro active');
      } else {
        // No active entitlement - subscription expired or cancelled
        const { user, clearSubscription } = useUserStore.getState();

        if (user.subscription.isPro) {
          devLog('[Subscription] Pro expired or cancelled');
          clearSubscription();
        }
      }
    });

    this.listenerAttached = true;
    devLog('[Subscription] Listener attached');
  }

  /**
   * Handle new subscription purchase.
   * Call this immediately after a successful subscription purchase.
   *
   * Uses checkAndGrantRenewalCoins() for idempotent coin granting.
   * Safe to call multiple times - coins will only be granted once per billing period.
   */
  async handleNewSubscription(): Promise<void> {
    devLog('[Subscription] Handling new subscription purchase');

    // Sync the latest status from RevenueCat
    await this.syncSubscriptionStatus();

    // Use the idempotent coin grant method
    // This ensures coins are only granted once even if:
    // 1. This method is called multiple times
    // 2. The CustomerInfo listener fires concurrently
    const coinsGranted = await this.checkAndGrantRenewalCoins();

    devLog('[Subscription] New subscription setup complete', {
      coinsGranted,
    });
  }

  /**
   * Check if user can sync (has active Pro subscription)
   */
  canSync(): boolean {
    const { isPro } = useUserStore.getState();
    return isPro();
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
