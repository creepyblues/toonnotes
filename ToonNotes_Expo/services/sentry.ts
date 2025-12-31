/**
 * Sentry Error Monitoring Configuration
 *
 * Setup instructions:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new project for ToonNotes (React Native)
 * 3. Get your DSN from Project Settings > Client Keys (DSN)
 * 4. Replace SENTRY_DSN below with your actual DSN
 * 5. Update app.json with your organization name
 *
 * Features:
 * - Automatic error capture
 * - Performance monitoring
 * - Session replay (optional)
 * - Release health tracking
 */

import * as Sentry from '@sentry/react-native';

// TODO: Replace with your actual Sentry DSN
// Get it from: https://sentry.io/settings/[org]/projects/[project]/keys/
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

/**
 * Initialize Sentry error monitoring
 * Call this in app/_layout.tsx before rendering
 */
export function initSentry() {
  // Skip initialization if no DSN is configured
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('Sentry: Skipping initialization (no DSN configured)');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Enable performance monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in production

    // Debug mode for development
    debug: __DEV__,

    // Set environment
    environment: __DEV__ ? 'development' : 'production',

    // Integrate with React error boundaries
    enableAutoSessionTracking: true,

    // Attach screenshots for errors (optional, requires more setup)
    attachScreenshot: false,

    // Configure before send hook to filter/modify events
    beforeSend(event) {
      // Don't send events in development unless explicitly testing
      if (__DEV__ && !process.env.EXPO_PUBLIC_SENTRY_TEST) {
        return null;
      }

      // Filter out non-critical errors if needed
      // Example: filter out network errors that are user-caused
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        // Still log but reduce noise
        event.level = 'warning';
      }

      return event;
    },
  });
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.error('Sentry: Error captured (not sent - no DSN):', error.message);
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message (info, warning, etc.)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
) {
  if (!SENTRY_DSN) {
    console.log(`Sentry: Message captured (not sent - no DSN): [${level}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

// Re-export Sentry for direct access if needed
export { Sentry };
