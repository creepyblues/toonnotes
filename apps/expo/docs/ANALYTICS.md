# Analytics Implementation Guide

> **Status:** Phase 1-2 Complete ✅ | Phase 3-4 Pending
> **Last Updated:** January 2025
> **Cost:** $0/month (Firebase Analytics is free)
> **Platforms:** iOS, Android, Web App, Marketing Website (planned)

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Status](#implementation-status)
3. [Architecture](#architecture)
4. [Event Taxonomy](#event-taxonomy)
5. [User Properties](#user-properties)
6. [Platform Implementation](#platform-implementation)
7. [Key Funnels & Metrics](#key-funnels--metrics)
8. [Privacy & Compliance](#privacy--compliance)
9. [Testing & Validation](#testing--validation)
10. [Remaining Work](#remaining-work)

---

## Overview

### Objective

Comprehensive behavioral analytics across all ToonNotes platforms to:
- **Understand user behavior** - How users interact with core features
- **Optimize conversion funnels** - Free → Paid, Design generation, Onboarding
- **Measure retention** - DAU/MAU, session frequency, feature stickiness
- **Validate PRD success metrics** - Track against defined targets
- **Enable data-driven decisions** - A/B testing, feature prioritization

### Why Firebase?

| Consideration | Firebase | Alternative (Sentry) |
|---------------|----------|---------------------|
| Cost | **Free unlimited** | Free tier: 5K errors/month |
| Analytics | Full GA4 integration | Breadcrumbs only |
| Crash Reporting | Crashlytics (free) | Included |
| ATT Required? | No (uses app instance ID) | No |
| Cross-Platform | iOS, Android, Web unified | Per-platform |

---

## Implementation Status

### ✅ Phase 1: Mobile Event Instrumentation (COMPLETE)

| Task | Status | Details |
|------|--------|---------|
| 1.0 Remove legacy analytics | ✅ | Deleted `utils/analytics.ts`, migrated callers |
| 1.1 Add convenience functions | ✅ | ~30 new events in `firebaseAnalytics.ts` |
| 1.2 Add user properties helper | ✅ | `updateUserProperties()`, `getCoinBalanceTier()` |
| 1.3 Instrument stores | ✅ | noteStore, designStore, userStore |
| 1.4 Instrument components | ✅ | design/create, note/[id], WelcomeCarousel, LabelSuggestionSheet, board/[hashtag], UpgradeModal |

**Files Modified:**
- `services/firebaseAnalytics.ts` - Added ~30 convenience functions
- `stores/noteStore.ts` - Note CRUD events
- `stores/designStore.ts` - Design save/delete events
- `stores/userStore.ts` - User property updates, coins, subscription
- `app/design/create.tsx` - Design flow events
- `app/note/[id].tsx` - Note opened, shared
- `app/board/[hashtag].tsx` - Board viewed
- `components/onboarding/WelcomeCarousel.tsx` - Onboarding events
- `components/labels/LabelSuggestionSheet.tsx` - Label suggestion events
- `components/shop/UpgradeModal.tsx` - Purchase events

### ✅ Phase 2: Web App Integration (COMPLETE)

| Task | Status | Details |
|------|--------|---------|
| 2.1 Install Firebase SDK | ✅ | `pnpm add firebase` in webapp |
| 2.2 Create analytics module | ✅ | `lib/analytics/` with firebase.ts, events.ts, hooks.ts |
| 2.3 Add Analytics Provider | ✅ | Auto page view tracking in layout.tsx |

**Files Created:**
- `apps/webapp/lib/analytics/firebase.ts` - Firebase initialization
- `apps/webapp/lib/analytics/events.ts` - Event tracking (mirrors mobile)
- `apps/webapp/lib/analytics/hooks.ts` - useAnalytics, usePageViewTracking
- `apps/webapp/lib/analytics/index.ts` - Re-exports
- `apps/webapp/components/providers/AnalyticsProvider.tsx` - Page view tracking

### ⏳ Phase 3: Marketing Site (NOT STARTED)

| Task | Status |
|------|--------|
| 3.1 Add gtag.js | ⏳ Pending |
| 3.2 Configure same measurement ID | ⏳ Pending |
| 3.3 CTA click tracking | ⏳ Pending |
| 3.4 App store link tracking | ⏳ Pending |

### ⏳ Phase 4: GA4 Configuration (NOT STARTED)

| Task | Status |
|------|--------|
| 4.1 Create custom dimensions | ⏳ Pending |
| 4.2 Build funnel explorations | ⏳ Pending |
| 4.3 Set up retention reports | ⏳ Pending |
| 4.4 Configure alerts | ⏳ Pending |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA COLLECTION                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐ │
│  │ iOS App      │   │ Android App  │   │ Web (Webapp + Marketing) │ │
│  │              │   │              │   │                          │ │
│  │ RN Firebase  │   │ RN Firebase  │   │ Firebase JS SDK          │ │
│  │ SDK          │   │ SDK          │   │                          │ │
│  └──────┬───────┘   └──────┬───────┘   └────────────┬─────────────┘ │
│         │                  │                        │               │
└─────────┼──────────────────┼────────────────────────┼───────────────┘
          │                  │                        │
          └──────────────────┼────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FIREBASE ANALYTICS                              │
│  • Real-time event collection                                        │
│  • Automatic events (first_open, session_start, etc.)               │
│  • Custom events (~45 tracked)                                       │
│  • User properties (8 properties)                                    │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   GOOGLE ANALYTICS 4 (GA4)                          │
│  • Unified reporting across all platforms                            │
│  • Custom funnels & explorations                                     │
│  • Cohort analysis & retention                                       │
│  • Predictive metrics (purchase/churn probability)                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Event Taxonomy

### Naming Convention

- Use `snake_case` for all event names
- Use `object_action` pattern (e.g., `note_created`, `design_applied`)
- Keep names under 40 characters
- Use consistent parameter names with `_id`, `_count` suffixes

### Event Categories (~45 Events Total)

#### Note Events (8 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `note_created` | Create new note | `note_id` | ✅ |
| `note_opened` | Open note editor | `note_id` | ✅ |
| `note_edited` | Save note changes | `note_id` | ✅ |
| `note_deleted` | Move to trash | `note_id` | ✅ |
| `note_archived` | Archive note | `note_id` | ✅ |
| `note_restored` | Restore from trash/archive | `note_id` | ✅ |
| `note_pinned` | Pin/unpin note | `note_id`, `is_pinned` | ✅ |
| `note_shared` | Share note | `note_id`, `share_method` | ✅ |

#### Design Events (9 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `design_flow_started` | Enter design creation | `source` | ✅ |
| `design_image_selected` | Pick image for design | `image_source` | ✅ |
| `design_generation_started` | Start AI generation | `design_type`, `is_free` | ✅ |
| `design_generated` | Generation complete | `design_type` | ✅ |
| `design_generation_failed` | Generation error | `error_type` | ✅ |
| `design_saved` | Save to gallery | `design_id` | ✅ |
| `design_applied` | Apply to note | `design_id`, `note_id` | ✅ |
| `design_removed` | Remove from note | `design_id`, `note_id` | ✅ |
| `design_deleted` | Delete from gallery | `design_id` | ✅ |

#### Label Events (6 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `label_created` | Create new label | `label_name` | ✅ |
| `label_added` | Add label to note | `label_name`, `note_id` | ✅ |
| `label_removed` | Remove from note | `label_name`, `note_id` | ✅ |
| `label_suggestion_shown` | AI suggests labels | `label_name`, `note_id` | ✅ |
| `label_suggestion_accepted` | Accept AI suggestion | `label_name`, `note_id` | ✅ |
| `label_suggestion_declined` | Decline AI suggestion | `label_name`, `note_id` | ✅ |

#### Board Events (2 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `board_viewed` | Open board detail | `board_id`, `hashtag` | ✅ |
| `board_customized` | Change board style | `board_id`, `customization_type` | ✅ |

#### Monetization Events (10 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `paywall_shown` | Show paywall/shop | `source`, `free_remaining`, `coin_balance` | ✅ |
| `paywall_dismissed` | Close without purchase | `source` | ✅ |
| `shop_opened` | Open coin shop | `source` | ✅ |
| `begin_checkout` | Start purchase | `product_id`, `price` | ✅ |
| `purchase` | Complete purchase | `product_id`, `price`, `transaction_id` | ✅ |
| `purchase_failed` | Purchase error | `product_id`, `error` | ✅ |
| `coins_spent` | Spend coins | `amount`, `purpose`, `remaining_balance` | ✅ |
| `coins_granted` | Receive coins (Pro) | `amount`, `source` | ✅ |
| `subscription_started` | New Pro subscription | `plan` | ✅ |
| `subscription_cancelled` | Cancel Pro | `plan` | ✅ |

#### Auth Events (3 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `sign_up` | First authentication | `method` | ✅ |
| `login` | Subsequent auth | `method` | ✅ |
| `sign_out` | User signs out | - | ✅ |

#### Onboarding Events (5 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `onboarding_started` | Start welcome carousel | - | ✅ |
| `onboarding_completed` | Finish onboarding | - | ✅ |
| `onboarding_skipped` | Skip carousel | - | ✅ |
| `coach_mark_shown` | Show coach mark | `coach_mark_id` | ✅ |
| `coach_mark_dismissed` | Dismiss coach mark | `coach_mark_id` | ✅ |

#### Editor Events (3 events) ✅

| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `editor_mode_changed` | Switch editor mode | `note_id`, `mode` | ✅ |
| `editor_image_added` | Attach image | `note_id` | ✅ |
| `editor_design_picker_opened` | Open design picker | `note_id` | ✅ |

---

## User Properties

Set via `updateUserProperties()` for GA4 segmentation:

| Property | Type | Values | Update Trigger | Status |
|----------|------|--------|----------------|--------|
| `subscription_tier` | string | `free`, `pro` | On subscription change | ✅ |
| `total_notes_bucket` | string | `0`, `1-5`, `6-20`, `21-50`, `50+` | On note create/delete | ✅ |
| `total_designs_bucket` | string | `0`, `1-3`, `4-10`, `10+` | On design save/delete | ✅ |
| `has_custom_design` | boolean | `true`/`false` | On first design | ✅ |
| `coin_balance_tier` | string | `zero`, `low`, `medium`, `high` | On balance change | ✅ |
| `free_designs_remaining` | number | 0-3 | On design use | ✅ |
| `onboarding_complete` | boolean | `true`/`false` | On onboarding finish | ✅ |
| `platform` | string | `ios`, `android`, `web` | On init | ✅ |

---

## Platform Implementation

### Mobile (React Native/Expo)

**Package:** `@react-native-firebase/analytics`

**Main File:** `services/firebaseAnalytics.ts`

```typescript
import { Analytics, updateUserProperties, getCoinBalanceTier } from '@/services/firebaseAnalytics';

// Track events
Analytics.noteCreated(noteId);
Analytics.designFlowStarted('editor');
Analytics.purchaseCompleted(productId, price, transactionId);

// Update user properties
updateUserProperties({
  subscription_tier: 'pro',
  total_notes: 42,
  coin_balance_tier: getCoinBalanceTier(100),
});
```

### Web App (Next.js)

**Package:** `firebase`

**Module:** `lib/analytics/`

```typescript
import { Analytics, updateUserProperties } from '@/lib/analytics';
import { useAnalytics, useAnalyticsInit, usePageViewTracking } from '@/lib/analytics';

// In components
const { trackNoteCreated, trackFeatureUsed } = useAnalytics();
trackNoteCreated(noteId);

// Page views are automatic via AnalyticsProvider
```

**Environment Variables (webapp/.env.local):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=toonnotes
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

---

## Key Funnels & Metrics

### Onboarding Funnel

```
first_open → onboarding_started → onboarding_completed → note_created → design_flow_started
```

**Targets:**
- first_open → onboarding_completed: 70%
- onboarding_completed → note_created (D1): 60%
- note_created → design_flow_started (D7): 40%

### Design Conversion Funnel

```
design_flow_started → design_image_selected → design_generation_started → design_generated → design_saved → design_applied
```

**Targets:**
- Flow started → Generated (success): 85%
- Generated → Saved: 80%
- Saved → Applied: 70%

### Purchase Funnel

```
paywall_shown → shop_opened → begin_checkout → purchase
```

**Targets:**
- Paywall → Shop opened: 30%
- Shop → Begin checkout: 15%
- Begin checkout → Purchase: 70%
- **Overall conversion: 3%**

### Retention Metrics (from PRD)

| Metric | Target | Tracking |
|--------|--------|----------|
| DAU/MAU | >20% | GA4 active users |
| Day 1 Retention | 40% | Cohort analysis |
| Day 7 Retention | 25% | Cohort analysis |
| Day 30 Retention | 15% | Cohort analysis |

---

## Privacy & Compliance

### Data Collected

| Data | Source | PII? |
|------|--------|------|
| User ID | Supabase UUID | Pseudonymous |
| App Instance ID | Firebase | No |
| Events & Parameters | User actions | No |
| Crash Reports | Stack traces | No |

### iOS App Tracking Transparency (ATT)

**Not required** because:
- Firebase uses App Instance ID, not IDFA
- No cross-app tracking
- No advertising attribution

### GDPR Compliance

Firebase Analytics is GDPR compliant:
- User ID is pseudonymous (Supabase UUID)
- No PII in event parameters
- Data processing in EU available
- User opt-out available via `setAnalyticsEnabled(false)`

---

## Testing & Validation

### Enable Debug Mode

```bash
# iOS Simulator - Add to Xcode scheme arguments
-FIRDebugEnabled

# Android
adb shell setprop debug.firebase.analytics.app com.toonnotes.app
```

### Verification Steps

1. **Firebase Console** → Analytics → DebugView (real-time)
2. **GA4** → Reports → Realtime (after ~1 hour)
3. Test all funnels manually and verify events appear

### Test Checklist

- [ ] Events appear in DebugView immediately
- [ ] Parameters have correct values
- [ ] User properties update on changes
- [ ] Cross-platform user ID links correctly
- [ ] Web page views track on navigation

---

## Remaining Work

### Phase 3: Marketing Site

Add gtag.js with same GA4 measurement ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');

  // Track CTA clicks
  document.querySelectorAll('[data-track-cta]').forEach(el => {
    el.addEventListener('click', () => {
      gtag('event', 'cta_clicked', {
        cta_id: el.dataset.trackCta,
        cta_text: el.textContent,
      });
    });
  });
</script>
```

### Phase 4: GA4 Configuration

**Custom Dimensions to Create:**
- Event-scoped: `note_id`, `design_id`, `label_name`, `source`, `error_type`
- User-scoped: `subscription_tier`, `account_age_days`

**Funnel Explorations to Build:**
1. Design Conversion Funnel
2. Onboarding Drop-off
3. Purchase Conversion

**Alerts to Configure:**
- Crash spike (>2x daily average)
- Purchase drop (<50% of 7-day average)
- Generation failure rate (>10%)

---

## Changelog

| Date | Change |
|------|--------|
| Jan 2025 | Phase 1-2 complete - Full mobile + web analytics implementation |
| Jan 2, 2026 | Phase 1 (Firebase setup) complete |
| Jan 2026 | Initial documentation created |

---

*This document consolidates FIREBASE-GA4-TRACKING-PLAN.md and ANALYTICS-IMPLEMENTATION.md. Review quarterly as the product evolves.*
