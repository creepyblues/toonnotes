/**
 * Analytics Tracking Utility
 *
 * Lightweight event tracking for conversion metrics.
 * Currently logs to console; structured for future Mixpanel/Amplitude integration.
 */

// Design flow events
export type DesignEvent =
  | 'design_flow_started'
  | 'design_generated'
  | 'free_design_used'
  | 'paid_design_used'
  | 'paywall_shown'
  | 'paywall_dismissed'
  | 'purchase_started'
  | 'purchase_completed'
  | 'purchase_failed';

// Event properties interface
export interface DesignEventProperties {
  // Design flow context
  freeDesignsRemaining?: number;
  coinBalance?: number;
  designCost?: number;

  // Paywall context
  paywallReason?: 'no_free_designs' | 'no_coins';

  // Purchase context
  productId?: string;
  coinsGranted?: number;
  priceString?: string;

  // Error context
  errorMessage?: string;
}

/**
 * Track a design-related event
 *
 * @param event - The event name
 * @param properties - Optional event properties
 */
export function trackDesignEvent(
  event: DesignEvent,
  properties?: DesignEventProperties
): void {
  const timestamp = new Date().toISOString();

  // Console logging for development/debugging
  console.log(`[Analytics] ${timestamp} - ${event}`, properties || {});

  // TODO: Future integration with analytics services
  // Example Mixpanel integration:
  // mixpanel.track(event, { ...properties, timestamp });

  // Example Amplitude integration:
  // amplitude.logEvent(event, { ...properties, timestamp });
}

/**
 * Track when user starts the design creation flow
 */
export function trackDesignFlowStarted(
  freeDesignsRemaining: number,
  coinBalance: number
): void {
  trackDesignEvent('design_flow_started', {
    freeDesignsRemaining,
    coinBalance,
  });
}

/**
 * Track when a design is successfully generated
 */
export function trackDesignGenerated(usedFreeDesign: boolean): void {
  trackDesignEvent(usedFreeDesign ? 'free_design_used' : 'paid_design_used');
  trackDesignEvent('design_generated');
}

/**
 * Track when the paywall is shown
 */
export function trackPaywallShown(
  freeDesignsRemaining: number,
  coinBalance: number
): void {
  trackDesignEvent('paywall_shown', {
    freeDesignsRemaining,
    coinBalance,
    paywallReason: freeDesignsRemaining === 0 ? 'no_free_designs' : 'no_coins',
  });
}

/**
 * Track when user dismisses the paywall
 */
export function trackPaywallDismissed(): void {
  trackDesignEvent('paywall_dismissed');
}

/**
 * Track when user starts a purchase from paywall
 */
export function trackPurchaseStarted(productId: string): void {
  trackDesignEvent('purchase_started', { productId });
}

/**
 * Track successful purchase
 */
export function trackPurchaseCompleted(
  productId: string,
  coinsGranted: number,
  priceString?: string
): void {
  trackDesignEvent('purchase_completed', {
    productId,
    coinsGranted,
    priceString,
  });
}

/**
 * Track failed purchase
 */
export function trackPurchaseFailed(
  productId: string,
  errorMessage: string
): void {
  trackDesignEvent('purchase_failed', {
    productId,
    errorMessage,
  });
}
