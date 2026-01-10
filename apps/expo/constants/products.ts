/**
 * RevenueCat Product Configuration
 *
 * Defines coin packages and subscriptions available for purchase.
 * Product IDs must match those configured in RevenueCat dashboard.
 */

// Coin package product IDs
export const PRODUCT_IDS = {
  STARTER: 'com.toonnotes.coins.starter',
  POPULAR: 'com.toonnotes.coins.popular',
  BEST_VALUE: 'com.toonnotes.coins.bestvalue',
} as const;

// Subscription product IDs
export const SUBSCRIPTION_IDS = {
  PRO_MONTHLY: 'com.toonnotes.pro.monthly',
} as const;

export type SubscriptionId = typeof SUBSCRIPTION_IDS[keyof typeof SUBSCRIPTION_IDS];

// RevenueCat entitlement identifier (configured in RevenueCat dashboard)
export const ENTITLEMENT_ID = 'pro';

// Monthly coin grant amount for Pro subscribers
export const PRO_MONTHLY_COINS = 100;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

export interface ProductConfig {
  name: string;
  coins: number;
  bonusCoins: number;
  totalCoins: number;
  isBestValue: boolean;
  isMostPopular: boolean;
}

export const PRODUCT_CONFIG: Record<ProductId, ProductConfig> = {
  [PRODUCT_IDS.STARTER]: {
    name: 'Starter Pack',
    coins: 3,
    bonusCoins: 0,
    totalCoins: 3,
    isBestValue: false,
    isMostPopular: false,
  },
  [PRODUCT_IDS.POPULAR]: {
    name: 'Popular Pack',
    coins: 10,
    bonusCoins: 2,
    totalCoins: 12,
    isBestValue: false,
    isMostPopular: true,
  },
  [PRODUCT_IDS.BEST_VALUE]: {
    name: 'Best Value',
    coins: 25,
    bonusCoins: 7,
    totalCoins: 32,
    isBestValue: true,
    isMostPopular: false,
  },
};

// Map product IDs to total coins granted
export const PRODUCT_COINS: Record<string, number> = {
  [PRODUCT_IDS.STARTER]: 3,
  [PRODUCT_IDS.POPULAR]: 12,
  [PRODUCT_IDS.BEST_VALUE]: 32,
};

// Get config for a product ID
export function getProductConfig(productId: string): ProductConfig | undefined {
  return PRODUCT_CONFIG[productId as ProductId];
}

// Get total coins for a product ID
export function getCoinsForProduct(productId: string): number {
  return PRODUCT_COINS[productId] || 0;
}
