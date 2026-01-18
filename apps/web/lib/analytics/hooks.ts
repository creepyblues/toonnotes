/**
 * Analytics Hooks for Marketing Site
 *
 * React hooks for analytics initialization and tracking.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initFirebaseAnalytics, isAnalyticsReady } from './firebase';
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
 * Hook for tracking app store clicks.
 */
export function useAppStoreTracking() {
  const trackAppStoreClick = useCallback((store: 'ios' | 'android', section: string) => {
    Analytics.appStoreClicked(store, section);
  }, []);

  return { trackAppStoreClick };
}

/**
 * Hook for tracking CTA clicks.
 */
export function useCtaTracking() {
  const trackCtaClick = useCallback((ctaId: string, ctaText: string, section: string) => {
    Analytics.ctaClicked(ctaId, ctaText, section);
  }, []);

  return { trackCtaClick };
}

/**
 * Hook for tracking scroll depth.
 * Tracks 25%, 50%, 75%, 100% scroll milestones.
 */
export function useScrollDepthTracking() {
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      const milestones = [25, 50, 75, 100] as const;
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !trackedDepths.current.has(milestone)) {
          trackedDepths.current.add(milestone);
          Analytics.scrollDepth(milestone);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

/**
 * Hook for tracking time on page.
 * Sends event when component unmounts.
 */
export function useTimeOnPageTracking(pageName: string) {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      if (duration > 2) { // Only track if > 2 seconds
        Analytics.timeOnPage(pageName, duration);
      }
    };
  }, [pageName]);
}

/**
 * Combined analytics hook that provides all tracking functions.
 */
export function useAnalytics() {
  const trackAppStoreClick = useCallback((store: 'ios' | 'android', section: string) => {
    Analytics.appStoreClicked(store, section);
  }, []);

  const trackCtaClick = useCallback((ctaId: string, ctaText: string, section: string) => {
    Analytics.ctaClicked(ctaId, ctaText, section);
  }, []);

  const trackSectionViewed = useCallback((sectionName: string) => {
    Analytics.sectionViewed(sectionName);
  }, []);

  const trackNavLinkClicked = useCallback((linkName: string, destination: string) => {
    Analytics.navLinkClicked(linkName, destination);
  }, []);

  const trackExternalLinkClicked = useCallback((linkType: string, destination: string) => {
    Analytics.externalLinkClicked(linkType, destination);
  }, []);

  return {
    trackAppStoreClick,
    trackCtaClick,
    trackSectionViewed,
    trackNavLinkClicked,
    trackExternalLinkClicked,
    // Direct access for less common events
    Analytics,
  };
}
