/**
 * Analytics Module for Web
 *
 * Re-exports all analytics functionality.
 */

// Firebase initialization
export {
  initFirebaseAnalytics,
  getAnalyticsInstance,
  isAnalyticsReady,
  logEvent,
  setUserId,
  setUserProperties,
} from './firebase';

// Pre-built analytics functions
export { Analytics, updateUserProperties } from './events';
export type { UserProperties } from './events';

// React hooks
export {
  useAnalyticsInit,
  usePageViewTracking,
  useAnalyticsUser,
  useAnalytics,
} from './hooks';
