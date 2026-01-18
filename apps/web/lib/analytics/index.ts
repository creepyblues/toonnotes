/**
 * Analytics Module for Marketing Site
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
export { Analytics } from './events';

// React hooks
export {
  useAnalyticsInit,
  usePageViewTracking,
  useAppStoreTracking,
  useCtaTracking,
  useScrollDepthTracking,
  useTimeOnPageTracking,
  useAnalytics,
} from './hooks';
