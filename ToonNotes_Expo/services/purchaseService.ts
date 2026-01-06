import { devLog, devWarn } from '@/utils/devLog';
import { recordError } from '@/services/firebaseAnalytics';

/**
 * Purchase Service - RevenueCat Integration
 *
 * Handles all in-app purchase operations using RevenueCat SDK.
 * Provides a clean abstraction over the native purchase flow.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { PRODUCT_COINS, ENTITLEMENT_ID } from '@/constants/products';

// Dynamic import to prevent crash in Expo Go
let Purchases: typeof import('react-native-purchases').default | null = null;
let LOG_LEVEL: typeof import('react-native-purchases').LOG_LEVEL | null = null;

// Check if we're running in Expo Go (no native modules available)
const isExpoGo = Constants.appOwnership === 'expo';

// Only import RevenueCat if not in Expo Go
if (!isExpoGo) {
  try {
    const revenueCat = require('react-native-purchases');
    Purchases = revenueCat.default;
    LOG_LEVEL = revenueCat.LOG_LEVEL;
  } catch (error) {
    devWarn('RevenueCat not available:', error);
  }
}

// Re-export types for consumers
export type { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
type PurchasesError = import('react-native-purchases').PurchasesError;

// RevenueCat API Keys - Set via environment variables
// These are public API keys (safe to include in client code)
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'appl_YOUR_IOS_API_KEY';
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'goog_YOUR_ANDROID_API_KEY';

export interface PurchaseResult {
  success: boolean;
  coinsGranted: number;
  transactionId?: string;
  productId?: string;
  error?: string;
  userCancelled?: boolean;
}

export interface ProStatus {
  isPro: boolean;
  expiresAt: Date | null;
  willRenew: boolean;
  latestPurchaseDate: Date | null;
  productId: string | null;
}

export interface SubscriptionPurchaseResult {
  success: boolean;
  error?: string;
  userCancelled?: boolean;
}

// Customer info update listener type
type CustomerInfoUpdateListener = (info: import('react-native-purchases').CustomerInfo) => void;

class PurchaseService {
  private initialized = false;
  private customerInfoListeners: CustomerInfoUpdateListener[] = [];

  /**
   * Initialize RevenueCat SDK
   * Call this on app startup
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      devLog('RevenueCat already initialized');
      return;
    }

    // Skip initialization in Expo Go
    if (isExpoGo || !Purchases) {
      devLog('RevenueCat skipped: Running in Expo Go or native module unavailable');
      return;
    }

    try {
      // Set debug log level in development
      if (__DEV__ && LOG_LEVEL) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_IOS_KEY
        : REVENUECAT_ANDROID_KEY;

      // Check if API key is configured
      if (apiKey.includes('YOUR_')) {
        devWarn('RevenueCat API key not configured. Purchases will not work.');
        return;
      }

      await Purchases.configure({
        apiKey,
        appUserID: userId || undefined,
      });

      this.initialized = true;
      devLog('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    }
  }

  /**
   * Check if RevenueCat is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get available coin packages
   */
  async getOfferings(): Promise<import('react-native-purchases').PurchasesOffering | null> {
    if (!this.initialized || !Purchases) {
      devWarn('RevenueCat not initialized');
      return null;
    }

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
      return null;
    }
  }

  /**
   * Purchase a coin package
   */
  async purchasePackage(pkg: import('react-native-purchases').PurchasesPackage): Promise<PurchaseResult> {
    if (!this.initialized || !Purchases) {
      return {
        success: false,
        coinsGranted: 0,
        error: 'Purchase service not initialized',
      };
    }

    try {
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(pkg);

      const coinsGranted = PRODUCT_COINS[productIdentifier] || 0;

      // Get transaction ID from the latest transaction
      const transactions = customerInfo.nonSubscriptionTransactions || [];
      const latestTransaction = transactions[transactions.length - 1];
      const transactionId = latestTransaction?.transactionIdentifier || customerInfo.originalAppUserId;

      return {
        success: true,
        coinsGranted,
        transactionId,
        productId: productIdentifier,
      };
    } catch (error) {
      const purchaseError = error as PurchasesError;

      // Handle user cancellation gracefully
      if (purchaseError.userCancelled) {
        return {
          success: false,
          coinsGranted: 0,
          userCancelled: true,
        };
      }

      console.error('Purchase failed:', purchaseError);
      recordError(new Error(purchaseError.message || 'Purchase failed'), { service: 'purchase', method: 'purchasePackage' });
      return {
        success: false,
        coinsGranted: 0,
        error: purchaseError.message || 'Purchase failed. Please try again.',
      };
    }
  }

  /**
   * Restore previous purchases
   * Note: Consumable purchases cannot be restored (they're already consumed)
   * This is mainly for future subscription support
   */
  async restorePurchases(): Promise<import('react-native-purchases').CustomerInfo | null> {
    if (!this.initialized || !Purchases) {
      devWarn('RevenueCat not initialized');
      return null;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      devLog('Purchases restored:', customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('Restore failed:', error);
      return null;
    }
  }

  /**
   * Get current customer info
   */
  async getCustomerInfo(): Promise<import('react-native-purchases').CustomerInfo | null> {
    if (!this.initialized || !Purchases) {
      return null;
    }

    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  /**
   * Set user ID for attribution
   * Call this after user authentication
   */
  async setUserId(userId: string): Promise<void> {
    if (!this.initialized || !Purchases) return;

    try {
      await Purchases.logIn(userId);
      devLog('User ID set:', userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Log out current user
   * Call this on user sign out
   */
  async logOut(): Promise<void> {
    if (!this.initialized || !Purchases) return;

    try {
      await Purchases.logOut();
      devLog('User logged out from RevenueCat');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  // ==========================================================================
  // Subscription Methods
  // ==========================================================================

  /**
   * Check Pro subscription status from RevenueCat
   * Returns detailed info about the user's Pro entitlement
   */
  async checkProStatus(): Promise<ProStatus> {
    const defaultStatus: ProStatus = {
      isPro: false,
      expiresAt: null,
      willRenew: false,
      latestPurchaseDate: null,
      productId: null,
    };

    if (!this.initialized || !Purchases) {
      return defaultStatus;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      if (!entitlement) {
        return defaultStatus;
      }

      return {
        isPro: true,
        expiresAt: entitlement.expirationDate ? new Date(entitlement.expirationDate) : null,
        willRenew: entitlement.willRenew,
        latestPurchaseDate: entitlement.latestPurchaseDate
          ? new Date(entitlement.latestPurchaseDate)
          : null,
        productId: entitlement.productIdentifier,
      };
    } catch (error) {
      console.error('Failed to check Pro status:', error);
      return defaultStatus;
    }
  }

  /**
   * Get subscription offering (Pro packages)
   * Returns the subscription packages from the current offering
   */
  async getSubscriptionOffering(): Promise<import('react-native-purchases').PurchasesPackage[] | null> {
    if (!this.initialized || !Purchases) {
      devWarn('RevenueCat not initialized');
      return null;
    }

    try {
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) return null;

      // Filter to only subscription packages (not consumables)
      // Subscription packages have 'subscription' in their package type
      const subscriptionPackages = offerings.current.availablePackages.filter((pkg) => {
        // RevenueCat package types: MONTHLY, ANNUAL, WEEKLY, etc. for subscriptions
        // Consumables have CUSTOM or LIFETIME
        return ['MONTHLY', 'ANNUAL', 'WEEKLY', 'SIX_MONTH', 'THREE_MONTH', 'TWO_MONTH'].includes(
          pkg.packageType
        );
      });

      return subscriptionPackages.length > 0 ? subscriptionPackages : null;
    } catch (error) {
      console.error('Failed to get subscription offering:', error);
      return null;
    }
  }

  /**
   * Purchase Pro subscription
   */
  async purchaseProSubscription(
    pkg: import('react-native-purchases').PurchasesPackage
  ): Promise<SubscriptionPurchaseResult> {
    if (!this.initialized || !Purchases) {
      return {
        success: false,
        error: 'Purchase service not initialized',
      };
    }

    try {
      await Purchases.purchasePackage(pkg);

      devLog('Pro subscription purchased successfully');
      return { success: true };
    } catch (error) {
      const purchaseError = error as PurchasesError;

      if (purchaseError.userCancelled) {
        return { success: false, userCancelled: true };
      }

      console.error('Subscription purchase failed:', purchaseError);
      recordError(new Error(purchaseError.message || 'Subscription purchase failed'), {
        service: 'purchase',
        method: 'purchaseProSubscription',
      });

      return {
        success: false,
        error: purchaseError.message || 'Subscription purchase failed. Please try again.',
      };
    }
  }

  /**
   * Add listener for customer info updates
   * Use this to detect subscription renewals and status changes
   */
  addCustomerInfoListener(callback: CustomerInfoUpdateListener): void {
    if (!this.initialized || !Purchases) {
      devWarn('Cannot add listener: RevenueCat not initialized');
      return;
    }

    this.customerInfoListeners.push(callback);

    // If this is the first listener, set up the RevenueCat listener
    if (this.customerInfoListeners.length === 1) {
      Purchases.addCustomerInfoUpdateListener((info) => {
        devLog('Customer info updated:', info.entitlements.active);
        this.customerInfoListeners.forEach((listener) => listener(info));
      });
    }
  }

  /**
   * Remove customer info listener
   */
  removeCustomerInfoListener(callback: CustomerInfoUpdateListener): void {
    const index = this.customerInfoListeners.indexOf(callback);
    if (index > -1) {
      this.customerInfoListeners.splice(index, 1);
    }
  }

  /**
   * Get management URL to manage subscriptions
   * Returns URL to App Store/Play Store subscription management
   */
  async getManagementURL(): Promise<string | null> {
    if (!this.initialized || !Purchases) {
      return null;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.managementURL;
    } catch (error) {
      console.error('Failed to get management URL:', error);
      return null;
    }
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService();
