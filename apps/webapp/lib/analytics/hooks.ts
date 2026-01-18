/**
 * Analytics Hooks for Web
 *
 * React hooks for analytics initialization and tracking.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initFirebaseAnalytics, isAnalyticsReady, setUserId } from './firebase';
import { Analytics } from './events';

/**
 * Initialize Firebase Analytics on mount.
 * Call this once in your root layout or provider.
 */
export function useAnalyticsInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initFirebaseAnalytics().then((analytics) => {
      if (analytics && process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Hook initialized analytics');
      }
    });
  }, []);
}

/**
 * Track page views automatically on route changes.
 * Uses Next.js pathname and search params.
 */
export function usePageViewTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAnalyticsReady()) return;

    // Build page title from pathname
    const segments = pathname.split('/').filter(Boolean);
    const pageTitle = segments.length > 0
      ? segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' - ')
      : 'Home';

    Analytics.pageView(pathname, pageTitle);
  }, [pathname, searchParams]);
}

/**
 * Hook to set user ID for analytics.
 * Call when user auth state changes.
 */
export function useAnalyticsUser(userId: string | null) {
  useEffect(() => {
    setUserId(userId);
  }, [userId]);
}

/**
 * Hook that provides analytics tracking functions.
 * Returns memoized tracking functions for use in components.
 */
export function useAnalytics() {
  const trackNoteCreated = useCallback((noteId: string) => {
    Analytics.noteCreated(noteId);
  }, []);

  const trackNoteOpened = useCallback((noteId: string) => {
    Analytics.noteOpened(noteId);
  }, []);

  const trackNoteEdited = useCallback((noteId: string) => {
    Analytics.noteEdited(noteId);
  }, []);

  const trackNoteDeleted = useCallback((noteId: string) => {
    Analytics.noteDeleted(noteId);
  }, []);

  const trackDesignFlowStarted = useCallback((source: 'toolbar' | 'sidebar' | 'designs_page') => {
    Analytics.designFlowStarted(source);
  }, []);

  const trackDesignGenerated = useCallback((type: string) => {
    Analytics.designGenerated(type);
  }, []);

  const trackBoardViewed = useCallback((boardId: string, hashtag: string) => {
    Analytics.boardViewed(boardId, hashtag);
  }, []);

  const trackFeatureUsed = useCallback((featureName: string) => {
    Analytics.featureUsed(featureName);
  }, []);

  const trackSignUp = useCallback((method: 'google' | 'apple' | 'email') => {
    Analytics.signUp(method);
  }, []);

  const trackLogin = useCallback((method: 'google' | 'apple' | 'email') => {
    Analytics.login(method);
  }, []);

  const trackSignOut = useCallback(() => {
    Analytics.signOut();
  }, []);

  return {
    trackNoteCreated,
    trackNoteOpened,
    trackNoteEdited,
    trackNoteDeleted,
    trackDesignFlowStarted,
    trackDesignGenerated,
    trackBoardViewed,
    trackFeatureUsed,
    trackSignUp,
    trackLogin,
    trackSignOut,
    // Direct access to Analytics object for less common events
    Analytics,
  };
}
