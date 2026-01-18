/**
 * Analytics Provider for Marketing Site
 *
 * Initializes Firebase Analytics and tracks page views + scroll depth.
 * Must be used within a client component boundary.
 */

'use client';

import { Suspense } from 'react';
import {
  useAnalyticsInit,
  usePageViewTracking,
  useScrollDepthTracking,
} from '@/lib/analytics';

/**
 * Inner component that tracks page views.
 * Wrapped in Suspense because useSearchParams() requires it.
 */
function PageViewTracker() {
  usePageViewTracking();
  useScrollDepthTracking();
  return null;
}

/**
 * Analytics Provider Component
 *
 * Add this to your root layout to:
 * 1. Initialize Firebase Analytics on app load
 * 2. Automatically track page views on route changes
 * 3. Track scroll depth milestones
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics on mount
  useAnalyticsInit();

  return (
    <>
      {/* Page view tracking wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
