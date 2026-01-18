/**
 * Firebase Analytics Configuration for Marketing Site
 *
 * Initializes Firebase and provides analytics instance.
 * Uses same Firebase project as mobile app (toonnotes).
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  Analytics,
  isSupported,
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
} from 'firebase/analytics';

// Firebase config - uses environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'toonnotes',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let analyticsSupported = false;

/**
 * Initialize Firebase app and analytics.
 * Call this once on app load (client-side only).
 */
export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  // Only run on client
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if analytics is supported in this environment
  analyticsSupported = await isSupported();
  if (!analyticsSupported) {
    console.log('[Analytics] Firebase Analytics not supported in this environment');
    return null;
  }

  // Don't reinitialize if already done
  if (analytics) {
    return analytics;
  }

  try {
    // Initialize Firebase app if not already done
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize analytics
    analytics = getAnalytics(app);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Firebase Analytics initialized');
    }

    return analytics;
  } catch (error) {
    console.error('[Analytics] Failed to initialize Firebase:', error);
    return null;
  }
}

/**
 * Get the analytics instance (must call initFirebaseAnalytics first).
 */
export function getAnalyticsInstance(): Analytics | null {
  return analytics;
}

/**
 * Check if analytics is available and initialized.
 */
export function isAnalyticsReady(): boolean {
  return analyticsSupported && analytics !== null;
}

/**
 * Log an analytics event.
 */
export function logEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!analytics) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event (not sent): ${eventName}`, params || '');
    }
    return;
  }

  try {
    firebaseLogEvent(analytics, eventName, params);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${eventName}`, params || '');
    }
  } catch (error) {
    console.error(`[Analytics] Failed to log event ${eventName}:`, error);
  }
}

/**
 * Set the user ID for analytics.
 */
export function setUserId(userId: string | null): void {
  if (!analytics) return;

  try {
    firebaseSetUserId(analytics, userId);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] User ID set: ${userId ? userId.substring(0, 8) + '...' : 'null'}`);
    }
  } catch (error) {
    console.error('[Analytics] Failed to set user ID:', error);
  }
}

/**
 * Set user properties for segmentation.
 */
export function setUserProperties(properties: Record<string, string>): void {
  if (!analytics) return;

  try {
    firebaseSetUserProperties(analytics, properties);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] User properties set:', properties);
    }
  } catch (error) {
    console.error('[Analytics] Failed to set user properties:', error);
  }
}
