/**
 * Purchase Service - RevenueCat Integration
 *
 * Handles all in-app purchase operations using RevenueCat SDK.
 * Provides a clean abstraction over the native purchase flow.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { PRODUCT_COINS } from '@/constants/products';

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
    console.warn('RevenueCat not available:', error);
  }
}

// Re-export types for consumers
export type { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
type PurchasesError = import('react-native-purchases').PurchasesError;

// RevenueCat API Keys - Replace with your keys from RevenueCat dashboard
// These are public API keys (safe to include in client code)
const REVENUECAT_IOS_KEY = 'appl_YOUR_IOS_API_KEY';
const REVENUECAT_ANDROID_KEY = 'goog_YOUR_ANDROID_API_KEY';

export interface PurchaseResult {
  success: boolean;
  coinsGranted: number;
  transactionId?: string;
  productId?: string;
  error?: string;
  userCancelled?: boolean;
}

class PurchaseService {
  private initialized = false;

  /**
   * Initialize RevenueCat SDK
   * Call this on app startup
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      console.log('RevenueCat already initialized');
      return;
    }

    // Skip initialization in Expo Go
    if (isExpoGo || !Purchases) {
      console.log('RevenueCat skipped: Running in Expo Go or native module unavailable');
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
        console.warn('RevenueCat API key not configured. Purchases will not work.');
        return;
      }

      await Purchases.configure({
        apiKey,
        appUserID: userId || undefined,
      });

      this.initialized = true;
      console.log('RevenueCat initialized successfully');
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
      console.warn('RevenueCat not initialized');
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
      console.warn('RevenueCat not initialized');
      return null;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('Purchases restored:', customerInfo);
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
      console.log('User ID set:', userId);
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
      console.log('User logged out from RevenueCat');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService();
