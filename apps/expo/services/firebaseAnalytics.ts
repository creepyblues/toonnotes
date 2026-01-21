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

/**
 * Update multiple user properties at once.
 * Use this to keep GA4 user properties in sync with app state.
 */
export interface UserProperties {
  subscription_tier?: 'free' | 'pro';
  total_notes?: number;
  total_designs?: number;
  has_custom_design?: boolean;
  coin_balance_tier?: 'zero' | 'low' | 'medium' | 'high';
  free_designs_remaining?: number;
  onboarding_complete?: boolean;
}

export async function updateUserProperties(props: UserProperties) {
  try {
    const promises: Promise<void>[] = [];

    if (props.subscription_tier !== undefined) {
      promises.push(analytics().setUserProperty('subscription_tier', props.subscription_tier));
    }
    if (props.total_notes !== undefined) {
      // Bucket into ranges for better segmentation
      const bucket = props.total_notes === 0 ? '0' :
                     props.total_notes <= 5 ? '1-5' :
                     props.total_notes <= 20 ? '6-20' :
                     props.total_notes <= 50 ? '21-50' : '50+';
      promises.push(analytics().setUserProperty('total_notes_bucket', bucket));
    }
    if (props.total_designs !== undefined) {
      const bucket = props.total_designs === 0 ? '0' :
                     props.total_designs <= 3 ? '1-3' :
                     props.total_designs <= 10 ? '4-10' : '10+';
      promises.push(analytics().setUserProperty('total_designs_bucket', bucket));
    }
    if (props.has_custom_design !== undefined) {
      promises.push(analytics().setUserProperty('has_custom_design', props.has_custom_design ? 'true' : 'false'));
    }
    if (props.coin_balance_tier !== undefined) {
      promises.push(analytics().setUserProperty('coin_balance_tier', props.coin_balance_tier));
    }
    if (props.free_designs_remaining !== undefined) {
      promises.push(analytics().setUserProperty('free_designs_remaining', String(props.free_designs_remaining)));
    }
    if (props.onboarding_complete !== undefined) {
      promises.push(analytics().setUserProperty('onboarding_complete', props.onboarding_complete ? 'true' : 'false'));
    }

    await Promise.all(promises);

    if (__DEV__) {
      console.log('[Analytics] User properties updated:', props);
    }
  } catch (error) {
    console.error('[Analytics] Failed to update user properties:', error);
  }
}

/**
 * Helper to calculate coin balance tier from balance amount.
 */
export function getCoinBalanceTier(balance: number): 'zero' | 'low' | 'medium' | 'high' {
  if (balance === 0) return 'zero';
  if (balance <= 5) return 'low';
  if (balance <= 20) return 'medium';
  return 'high';
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
  // ============================================
  // NOTES
  // ============================================
  noteCreated: (noteId: string) =>
    trackEvent('note_created', { note_id: noteId }),

  noteOpened: (noteId: string) =>
    trackEvent('note_opened', { note_id: noteId }),

  noteEdited: (noteId: string) =>
    trackEvent('note_edited', { note_id: noteId }),

  noteDeleted: (noteId: string) =>
    trackEvent('note_deleted', { note_id: noteId }),

  noteArchived: (noteId: string) =>
    trackEvent('note_archived', { note_id: noteId }),

  noteRestored: (noteId: string) =>
    trackEvent('note_restored', { note_id: noteId }),

  notePinned: (noteId: string, isPinned: boolean) =>
    trackEvent('note_pinned', { note_id: noteId, is_pinned: isPinned }),

  noteShared: (noteId: string, shareMethod: 'image' | 'text') =>
    trackEvent('note_shared', { note_id: noteId, share_method: shareMethod }),

  shareBadgeTapped: (noteId: string) =>
    trackEvent('share_badge_tapped', { note_id: noteId }),

  // ============================================
  // DESIGNS (Aha moment tracking)
  // ============================================
  designFlowStarted: (source: 'fab' | 'editor' | 'designs_tab') =>
    trackEvent('design_flow_started', { source }),

  designImageSelected: (source: 'camera' | 'library') =>
    trackEvent('design_image_selected', { source }),

  designGenerationStarted: (designType: string) =>
    trackEvent('design_generation_started', { design_type: designType }),

  designGenerated: (type: string) =>
    trackEvent('design_generated', { design_type: type }),

  designGenerationFailed: (designType: string, error: string) =>
    trackEvent('design_generation_failed', { design_type: designType, error }),

  designApplied: (designId: string, isFirst: boolean) => {
    trackEvent('design_applied', { design_id: designId });
    if (isFirst) {
      trackEvent('design_first_applied', { design_id: designId });
    }
  },

  designSaved: (designId: string) =>
    trackEvent('design_saved', { design_id: designId }),

  designRemoved: (designId: string, noteId: string) =>
    trackEvent('design_removed', { design_id: designId, note_id: noteId }),

  // ============================================
  // LABELS
  // ============================================
  labelCreated: (labelName: string) =>
    trackEvent('label_created', { label_name: labelName }),

  labelAddedToNote: (labelName: string, noteId: string) =>
    trackEvent('label_added', { label_name: labelName, note_id: noteId }),

  labelRemoved: (labelName: string, noteId: string) =>
    trackEvent('label_removed', { label_name: labelName, note_id: noteId }),

  labelSuggestionShown: (suggestedLabel: string, noteId: string) =>
    trackEvent('label_suggestion_shown', { suggested_label: suggestedLabel, note_id: noteId }),

  labelSuggestionAccepted: (suggestedLabel: string, noteId: string) =>
    trackEvent('label_suggestion_accepted', { suggested_label: suggestedLabel, note_id: noteId }),

  labelSuggestionDeclined: (suggestedLabel: string, noteId: string) =>
    trackEvent('label_suggestion_declined', { suggested_label: suggestedLabel, note_id: noteId }),

  // ============================================
  // BOARDS
  // ============================================
  boardViewed: (boardId: string, hashtag: string) =>
    trackEvent('board_viewed', { board_id: boardId, hashtag }),

  boardCustomized: (boardId: string, customizationType: string) =>
    trackEvent('board_customized', { board_id: boardId, customization_type: customizationType }),

  // ============================================
  // PURCHASES & PAYWALL
  // ============================================
  paywallShown: (context: string, freeDesignsRemaining: number, coinBalance: number) =>
    trackEvent('paywall_shown', {
      context,
      free_designs_remaining: freeDesignsRemaining,
      coin_balance: coinBalance,
      paywall_reason: freeDesignsRemaining === 0 ? 'no_free_designs' : 'no_coins',
    }),

  paywallDismissed: () =>
    trackEvent('paywall_dismissed'),

  shopOpened: (source: string) =>
    trackEvent('shop_opened', { source }),

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

  coinsSpent: (amount: number, purpose: string) =>
    trackEvent('coins_spent', { amount, purpose }),

  coinsGranted: (amount: number, source: string) =>
    trackEvent('coins_granted', { amount, source }),

  subscriptionStarted: (tier: 'pro') =>
    trackEvent('subscription_started', { tier }),

  subscriptionCancelled: (tier: 'pro') =>
    trackEvent('subscription_cancelled', { tier }),

  // ============================================
  // AUTH
  // ============================================
  signUp: (method: 'google' | 'apple') =>
    trackEvent('sign_up', { method }),

  login: (method: 'google' | 'apple') =>
    trackEvent('login', { method }),

  signOut: () =>
    trackEvent('sign_out'),

  // ============================================
  // ONBOARDING
  // ============================================
  onboardingStarted: () =>
    trackEvent('tutorial_begin'),

  onboardingCompleted: () =>
    trackEvent('tutorial_complete'),

  onboardingSkipped: () =>
    trackEvent('tutorial_skipped'),

  coachMarkShown: (markId: string) =>
    trackEvent('coach_mark_shown', { mark_id: markId }),

  coachMarkDismissed: (markId: string) =>
    trackEvent('coach_mark_dismissed', { mark_id: markId }),

  activationMilestone: (milestone: string) =>
    trackEvent('activation_milestone', { milestone }),

  // ============================================
  // EDITOR
  // ============================================
  editorModeChanged: (noteId: string, mode: 'text' | 'checklist' | 'bullet') =>
    trackEvent('editor_mode_changed', { note_id: noteId, mode }),

  editorImageAdded: (noteId: string, source: 'camera' | 'library') =>
    trackEvent('editor_image_added', { note_id: noteId, source }),

  editorDesignPickerOpened: (noteId: string) =>
    trackEvent('editor_design_picker_opened', { note_id: noteId }),

  // ============================================
  // FEATURES (Generic)
  // ============================================
  featureUsed: (featureName: string) =>
    trackEvent('feature_used', { feature_name: featureName }),
};
