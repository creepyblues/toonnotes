/**
 * Analytics Events for Marketing Site
 *
 * Focused on conversion tracking: page views, CTA clicks, app store clicks.
 */

import { logEvent } from './firebase';

/**
 * Pre-built analytics functions for marketing events.
 */
export const Analytics = {
  // ============================================
  // PAGE VIEWS
  // ============================================
  pageView: (pageName: string, pageTitle?: string) =>
    logEvent('page_view', {
      page_title: pageTitle || pageName,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    }),

  // ============================================
  // CTA CLICKS
  // ============================================
  /**
   * Track CTA button clicks throughout the marketing site.
   */
  ctaClicked: (ctaId: string, ctaText: string, section: string) =>
    logEvent('cta_clicked', {
      cta_id: ctaId,
      cta_text: ctaText,
      section,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    }),

  // ============================================
  // APP STORE CLICKS
  // ============================================
  /**
   * Track clicks on App Store / Play Store download buttons.
   */
  appStoreClicked: (store: 'ios' | 'android', section: string) =>
    logEvent('app_store_clicked', {
      store,
      section,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    }),

  // ============================================
  // SECTION VIEWS (Scroll Tracking)
  // ============================================
  /**
   * Track when user scrolls to a feature section.
   */
  sectionViewed: (sectionName: string) =>
    logEvent('section_viewed', {
      section_name: sectionName,
    }),

  // ============================================
  // SHARED NOTES
  // ============================================
  /**
   * Track shared note views.
   */
  sharedNoteViewed: (shareToken: string, hasDesign: boolean) =>
    logEvent('shared_note_viewed', {
      share_token: shareToken.substring(0, 8), // Truncate for privacy
      has_design: hasDesign,
    }),

  // ============================================
  // NAVIGATION
  // ============================================
  /**
   * Track navigation link clicks.
   */
  navLinkClicked: (linkName: string, destination: string) =>
    logEvent('nav_link_clicked', {
      link_name: linkName,
      destination,
    }),

  // ============================================
  // EXTERNAL LINKS
  // ============================================
  /**
   * Track clicks on external links (contact, social, etc.).
   */
  externalLinkClicked: (linkType: string, destination: string) =>
    logEvent('external_link_clicked', {
      link_type: linkType,
      destination,
    }),

  // ============================================
  // ENGAGEMENT
  // ============================================
  /**
   * Track time spent on page (call on unmount with duration).
   */
  timeOnPage: (pageName: string, durationSeconds: number) =>
    logEvent('time_on_page', {
      page_name: pageName,
      duration_seconds: durationSeconds,
    }),

  /**
   * Track scroll depth milestones (25%, 50%, 75%, 100%).
   */
  scrollDepth: (depth: 25 | 50 | 75 | 100) =>
    logEvent('scroll_depth', {
      depth_percent: depth,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    }),
};
