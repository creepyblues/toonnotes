/**
 * Firebase Analytics & Crashlytics Service
 *
 * Provides unified interface for:
 * - Event tracking (syncs to GA4)
 * - Screen view tracking
 * - Crash reporting
 * - Non-fatal error recording
 * - User identity management
 *
 * Cost: $0/month (completely free, unlimited usage)
 */

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize Firebase Analytics and Crashlytics.
 * Call this in app/_layout.tsx on app start.
 */
export async function initFirebase() {
  try {
    // Enable analytics collection
    await analytics().setAnalyticsCollectionEnabled(true);

    // Enable crashlytics
    await crashlytics().setCrashlyticsCollectionEnabled(true);

    if (__DEV__) {
      console.log('[Firebase] Initialized successfully');
    }
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
  }
}

// ============================================
// SCREEN TRACKING
// ============================================

/**
 * Track screen views for navigation analytics.
 * Called automatically by NavigationTracker component.
 */
export async function trackScreen(screenName: string, screenClass?: string) {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });

    if (__DEV__) {
      console.log(`[Analytics] Screen: ${screenName}`);
    }
  } catch (error) {
    console.error('[Analytics] Screen tracking failed:', error);
  }
}

// ============================================
// EVENT TRACKING
// ============================================

/**
 * Track custom events.
 * Uses Object_Action naming convention (e.g., note_created, design_applied)
 */
export async function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  try {
    await analytics().logEvent(eventName, params);

    if (__DEV__) {
      console.log(`[Analytics] Event: ${eventName}`, params || '');
    }
  } catch (error) {
    console.error(`[Analytics] Event tracking failed for ${eventName}:`, error);
  }
}

// ============================================
// USER IDENTITY
// ============================================

/**
 * Set user ID for analytics and crash attribution.
 * Call on sign-in with Supabase user ID.
 */
export async function setUserId(userId: string) {
  try {
    await analytics().setUserId(userId);
    await crashlytics().setUserId(userId);

    if (__DEV__) {
      console.log(`[Analytics] User ID set: ${userId.substring(0, 8)}...`);
    }
  } catch (error) {
    console.error('[Analytics] Failed to set user ID:', error);
  }
}

/**
 * Clear user identity on sign-out.
 */
export async function clearUser() {
  try {
    await analytics().setUserId(null);
    // Note: Crashlytics doesn't have a clearUserId method

    if (__DEV__) {
      console.log('[Analytics] User cleared');
    }
  } catch (error) {
    console.error('[Analytics] Failed to clear user:', error);
  }
}

/**
 * Set user properties for segmentation.
 * Examples: subscription_tier, account_type
 */
export async function setUserProperty(name: string, value: string) {
  try {
    await analytics().setUserProperty(name, value);
  } catch (error) {
    console.error(`[Analytics] Failed to set user property ${name}:`, error);
  }
}

// ============================================
// ERROR TRACKING (CRASHLYTICS)
// ============================================

/**
 * Record a non-fatal error to Crashlytics.
 * Use this in catch blocks for important errors.
 */
export function recordError(error: Error, context?: Record<string, string>) {
  try {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        crashlytics().setAttribute(key, value);
      });
    }
    crashlytics().recordError(error);

    if (__DEV__) {
      console.log('[Crashlytics] Error recorded:', error.message, context || '');
    }
  } catch (e) {
    console.error('[Crashlytics] Failed to record error:', e);
  }
}

/**
 * Log a message for crash context.
 * These appear as breadcrumbs in crash reports.
 */
export function log(message: string) {
  try {
    crashlytics().log(message);

    if (__DEV__) {
      console.log(`[Crashlytics] Log: ${message}`);
    }
  } catch (error) {
    console.error('[Crashlytics] Failed to log message:', error);
  }
}

/**
 * Set a custom attribute for crash reports.
 */
export function setAttribute(key: string, value: string) {
  try {
    crashlytics().setAttribute(key, value);
  } catch (error) {
    console.error(`[Crashlytics] Failed to set attribute ${key}:`, error);
  }
}

/**
 * Force a test crash (development only).
 * Use to verify Crashlytics is working.
 */
export function testCrash() {
  if (__DEV__) {
    console.warn('[Crashlytics] Triggering test crash...');
  }
  crashlytics().crash();
}

// ============================================
// ANALYTICS OPT-OUT (for Settings screen)
// ============================================

/**
 * Enable or disable analytics collection.
 * Use this for a privacy toggle in Settings.
 */
export async function setAnalyticsEnabled(enabled: boolean) {
  try {
    await analytics().setAnalyticsCollectionEnabled(enabled);
    await crashlytics().setCrashlyticsCollectionEnabled(enabled);

    if (__DEV__) {
      console.log(`[Analytics] Collection ${enabled ? 'enabled' : 'disabled'}`);
    }
  } catch (error) {
    console.error('[Analytics] Failed to toggle collection:', error);
  }
}

// ============================================
// CONVENIENCE FUNCTIONS (Phase 2)
// ============================================

/**
 * Pre-built analytics functions for common events.
 * Uses Firebase recommended event names where applicable.
 */
export const Analytics = {
  // ---- Notes ----
  noteCreated: (noteId: string) =>
    trackEvent('note_created', { note_id: noteId }),

  noteOpened: (noteId: string) =>
    trackEvent('note_opened', { note_id: noteId }),

  noteDeleted: (noteId: string) =>
    trackEvent('note_deleted', { note_id: noteId }),

  noteArchived: (noteId: string) =>
    trackEvent('note_archived', { note_id: noteId }),

  noteRestored: (noteId: string) =>
    trackEvent('note_restored', { note_id: noteId }),

  // ---- Designs (Aha moment tracking) ----
  designFlowStarted: (source: 'fab' | 'editor' | 'designs_tab') =>
    trackEvent('design_flow_started', { source }),

  designGenerated: (type: string) =>
    trackEvent('design_generated', { design_type: type }),

  designApplied: (designId: string, isFirst: boolean) => {
    trackEvent('design_applied', { design_id: designId });
    if (isFirst) {
      trackEvent('design_first_applied', { design_id: designId });
    }
  },

  // ---- Labels ----
  labelCreated: (labelName: string) =>
    trackEvent('label_created', { label_name: labelName }),

  labelAddedToNote: (labelName: string, noteId: string) =>
    trackEvent('label_added', { label_name: labelName, note_id: noteId }),

  // ---- Purchases ----
  purchaseStarted: (productId: string, price: number) =>
    trackEvent('begin_checkout', {
      item_id: productId,
      value: price,
      currency: 'USD',
    }),

  purchaseCompleted: (productId: string, price: number) =>
    trackEvent('purchase', {
      item_id: productId,
      value: price,
      currency: 'USD',
    }),

  purchaseFailed: (productId: string, error: string) =>
    trackEvent('purchase_failed', { item_id: productId, error }),

  // ---- Auth ----
  signUp: (method: 'google' | 'apple') =>
    trackEvent('sign_up', { method }),

  login: (method: 'google' | 'apple') =>
    trackEvent('login', { method }),

  signOut: () =>
    trackEvent('sign_out'),

  // ---- Onboarding ----
  onboardingStarted: () =>
    trackEvent('tutorial_begin'),

  onboardingCompleted: () =>
    trackEvent('tutorial_complete'),

  onboardingSkipped: () =>
    trackEvent('tutorial_skipped'),

  // ---- Features ----
  featureUsed: (featureName: string) =>
    trackEvent('feature_used', { feature_name: featureName }),
};
