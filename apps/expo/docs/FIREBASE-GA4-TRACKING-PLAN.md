# Firebase & GA4 Tracking Implementation Plan

> **Version:** 1.0
> **Created:** January 2026
> **Status:** Planning
> **Platforms:** iOS, Android, Web App, Marketing Website

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Tracking Strategy](#3-tracking-strategy)
4. [Event Taxonomy](#4-event-taxonomy)
5. [User Properties & Segments](#5-user-properties--segments)
6. [Platform-Specific Implementation](#6-platform-specific-implementation)
7. [Key Funnels & Metrics](#7-key-funnels--metrics)
8. [GA4 Dashboard Configuration](#8-ga4-dashboard-configuration)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Privacy & Compliance](#10-privacy--compliance)
11. [Testing & Validation](#11-testing--validation)

---

## 1. Executive Summary

### Objective

Implement comprehensive behavioral analytics across all ToonNotes platforms to:
- **Understand user behavior** - How users interact with core features
- **Optimize conversion funnels** - Free → Paid, Design generation, Onboarding
- **Measure retention** - DAU/MAU, session frequency, feature stickiness
- **Validate PRD success metrics** - Track against defined targets
- **Enable data-driven decisions** - A/B testing, feature prioritization

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA COLLECTION                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐ │
│  │ iOS App      │   │ Android App  │   │ Web (Webapp + Marketing) │ │
│  │              │   │              │   │                          │ │
│  │ RN Firebase  │   │ RN Firebase  │   │ Firebase JS SDK          │ │
│  │ SDK          │   │ SDK          │   │ (gtag.js)                │ │
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
│  • Custom events (note_created, design_generated, etc.)             │
│  • User properties (subscription_tier, account_age, etc.)           │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   GOOGLE ANALYTICS 4 (GA4)                          │
│  • Unified reporting across all platforms                            │
│  • Custom funnels & explorations                                     │
│  • Cohort analysis & retention                                       │
│  • Predictive metrics (purchase/churn probability)                  │
│  • BigQuery export for advanced analysis                            │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     OPTIONAL INTEGRATIONS                            │
│  • BigQuery (SQL analysis, custom dashboards)                       │
│  • Looker Studio (visual dashboards)                                │
│  • Supabase (quality_events table for detailed AI metrics)          │
└─────────────────────────────────────────────────────────────────────┘
```

### Cost

| Service | Cost | Notes |
|---------|------|-------|
| Firebase Analytics | **Free** | Unlimited events |
| Firebase Crashlytics | **Free** | Unlimited |
| GA4 | **Free** | Standard features |
| BigQuery Export | **Free tier** | 10GB storage, 1TB queries/month |

---

## 2. Current State Assessment

### What's Implemented

| Component | Status | Location |
|-----------|--------|----------|
| Firebase SDK | ✅ Complete | `@react-native-firebase/analytics` |
| Crashlytics | ✅ Complete | `@react-native-firebase/crashlytics` |
| Basic screen tracking | ✅ Complete | `app/_layout.tsx` NavigationTracker |
| User ID tracking | ✅ Complete | Set on auth in `authStore.ts` |
| Error recording | ✅ Complete | `geminiService.ts`, `purchaseService.ts` |
| Analytics helper functions | ✅ Complete | `services/firebaseAnalytics.ts` |
| Quality metrics | ✅ Complete | `services/qualityService.ts` |

### Event Coverage Gaps

| Category | Events Defined | Events Instrumented | Gap |
|----------|----------------|---------------------|-----|
| **Notes** | 5 | 0 | 5 events not called in code |
| **Designs** | 4 | 1 (partial) | Design funnel incomplete |
| **Labels** | 2 | 0 | Not instrumented |
| **Purchases** | 3 | 0 | Not calling Analytics helpers |
| **Auth** | 3 | 0 | Not calling Analytics helpers |
| **Onboarding** | 3 | 0 | Not instrumented |
| **Features** | 1 | 0 | Generic tracker not used |

### Missing Capabilities

1. **User Properties** - Not setting subscription tier, account age, etc.
2. **Content Metrics** - Note length, checklist items, image count
3. **Session Quality** - Time in editor, actions per session
4. **Retention Signals** - Feature usage patterns, engagement depth
5. **Cross-Platform** - Web app and marketing site not tracked
6. **Revenue Attribution** - LTV calculations, cohort revenue

---

## 3. Tracking Strategy

### Event Naming Convention

Follow GA4 recommended naming:
- Use `snake_case` for all event names
- Use `object_action` pattern (e.g., `note_created`, `design_applied`)
- Prefix related events with category (e.g., `shop_`, `editor_`)
- Keep names under 40 characters

### Parameter Naming Convention

- Use `snake_case` for parameter names
- Use consistent parameter names across events
- Include `_id` suffix for identifiers (e.g., `note_id`, `design_id`)
- Include `_count` suffix for counts (e.g., `label_count`)

### Event Categories

| Category | Purpose | Priority |
|----------|---------|----------|
| **Lifecycle** | App open, session, screens | P0 (Critical) |
| **Core Actions** | Notes, designs, labels | P0 (Critical) |
| **Monetization** | Purchases, subscriptions, paywall | P0 (Critical) |
| **Engagement** | Feature usage, content depth | P1 (High) |
| **Quality** | AI generation, errors | P1 (High) |
| **Acquisition** | Onboarding, activation | P1 (High) |
| **Retention** | Streaks, milestones | P2 (Medium) |

---

## 4. Event Taxonomy

### 4.1 Lifecycle Events (Automatic + Enhanced)

These are tracked automatically by Firebase but we enhance with user properties:

| Event | Source | Enhanced Parameters |
|-------|--------|---------------------|
| `first_open` | Auto | - |
| `session_start` | Auto | - |
| `app_update` | Auto | - |
| `screen_view` | Manual | `screen_name`, `screen_class` |

### 4.2 Note Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `note_created` | Create new note | `note_id` | P0 |
| `note_opened` | Open note editor | `note_id`, `has_design`, `label_count` | P0 |
| `note_edited` | Save note changes | `note_id`, `content_length`, `has_checklist`, `image_count` | P1 |
| `note_deleted` | Move to trash | `note_id`, `note_age_days` | P0 |
| `note_archived` | Archive note | `note_id` | P1 |
| `note_restored` | Restore from trash/archive | `note_id`, `restore_source` | P1 |
| `note_pinned` | Pin/unpin note | `note_id`, `is_pinned` | P2 |
| `note_shared` | Share as image | `note_id`, `has_design` | P1 |

### 4.3 Design Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `design_flow_started` | Enter design creation | `source`, `free_remaining`, `coin_balance` | P0 |
| `design_image_selected` | Pick image for design | `image_source` (camera/library) | P1 |
| `design_generation_started` | Start AI generation | `design_type` (normal/lucky), `is_free` | P0 |
| `design_generated` | Generation complete | `design_type`, `quality_score`, `generation_time_ms` | P0 |
| `design_generation_failed` | Generation error | `error_type`, `design_type` | P0 |
| `design_saved` | Save to gallery | `design_id`, `design_type`, `is_first_design` | P0 |
| `design_applied` | Apply to note | `design_id`, `note_id`, `is_first_apply` | P0 |
| `design_removed` | Remove from note | `note_id` | P2 |
| `design_deleted` | Delete from gallery | `design_id` | P2 |

### 4.4 Label Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `label_created` | Create new label | `label_name`, `is_preset`, `source` | P1 |
| `label_added` | Add label to note | `label_name`, `note_id`, `is_preset` | P1 |
| `label_removed` | Remove from note | `label_name`, `note_id` | P2 |
| `label_suggestion_shown` | AI suggests labels | `suggestion_count`, `note_id` | P1 |
| `label_suggestion_accepted` | Accept AI suggestion | `label_name`, `note_id` | P1 |
| `label_suggestion_declined` | Decline AI suggestion | `label_name`, `note_id` | P1 |

### 4.5 Board Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `board_viewed` | Open board detail | `hashtag`, `note_count` | P1 |
| `board_customized` | Change board style | `hashtag`, `style_type` | P2 |

### 4.6 Monetization Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `paywall_shown` | Show paywall/shop | `trigger_source`, `free_remaining`, `coin_balance` | P0 |
| `paywall_dismissed` | Close without purchase | `trigger_source` | P0 |
| `shop_opened` | Open coin shop | `source`, `coin_balance` | P0 |
| `begin_checkout` | Start purchase | `item_id`, `item_name`, `price`, `currency` | P0 |
| `purchase` | Complete purchase | `item_id`, `item_name`, `value`, `currency`, `transaction_id` | P0 |
| `purchase_failed` | Purchase error | `item_id`, `error_code`, `error_message` | P0 |
| `subscription_started` | New Pro subscription | `plan`, `value`, `currency` | P0 |
| `subscription_renewed` | Pro renewal | `plan`, `value`, `currency` | P0 |
| `subscription_cancelled` | Cancel Pro | `plan`, `subscription_age_days` | P0 |
| `coins_spent` | Spend coins | `amount`, `purpose`, `remaining_balance` | P1 |
| `coins_granted` | Receive coins (Pro) | `amount`, `source` | P1 |

### 4.7 Auth Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `sign_up` | First authentication | `method` (google/apple) | P0 |
| `login` | Subsequent auth | `method` | P0 |
| `sign_out` | User signs out | - | P1 |
| `account_deleted` | Delete account | `account_age_days` | P1 |

### 4.8 Onboarding Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `tutorial_begin` | Start welcome carousel | - | P0 |
| `tutorial_complete` | Finish carousel | `slides_viewed` | P0 |
| `tutorial_skipped` | Skip carousel | `slides_viewed` | P0 |
| `coach_mark_shown` | Show coach mark | `coach_mark_id` | P1 |
| `coach_mark_dismissed` | Dismiss coach mark | `coach_mark_id` | P1 |
| `activation_milestone` | Key action completed | `milestone` (first_note, first_design, etc.) | P0 |

### 4.9 Editor Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `editor_mode_changed` | Switch editor mode | `mode` (text/checklist/bullet), `note_id` | P1 |
| `editor_image_added` | Attach image | `note_id`, `image_count` | P1 |
| `editor_design_picker_opened` | Open design picker | `note_id` | P2 |
| `editor_color_changed` | Change note color | `note_id`, `color` | P2 |

### 4.10 Search & Navigation Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `search_performed` | Execute search | `query_length`, `results_count` | P2 |
| `tab_switched` | Change bottom tab | `from_tab`, `to_tab` | P2 |

### 4.11 Quality & Error Events

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `quality_generation` | AI generation complete | `generation_type`, `quality_score`, `fallback_used` | P1 |
| `quality_accepted` | User accepts result | `generation_type`, `quality_score` | P1 |
| `quality_rejected` | User rejects result | `generation_type`, `quality_score` | P1 |
| `quality_retry` | User requests retry | `generation_type`, `retry_count` | P1 |
| `error_occurred` | Non-fatal error | `error_type`, `error_context`, `screen` | P1 |

### 4.12 Marketing Website Events (Web Only)

| Event | Trigger | Parameters | Priority |
|-------|---------|------------|----------|
| `page_view` | Page load | `page_title`, `page_location` | P0 |
| `cta_clicked` | CTA button click | `cta_id`, `cta_text`, `page` | P0 |
| `app_store_clicked` | App store link | `store` (ios/android) | P0 |
| `feature_section_viewed` | Scroll to feature | `feature_name` | P2 |
| `pricing_viewed` | View pricing section | - | P1 |
| `faq_expanded` | Expand FAQ item | `faq_id` | P2 |

---

## 5. User Properties & Segments

### 5.1 User Properties

Set these via `setUserProperty()` for segmentation in GA4:

| Property | Type | Values | Update Trigger |
|----------|------|--------|----------------|
| `subscription_tier` | string | `free`, `pro` | On auth, subscription change |
| `account_age_days` | number | 0-∞ | Daily |
| `total_notes` | number | 0-∞ | On note create/delete |
| `total_designs` | number | 0-∞ | On design save/delete |
| `has_custom_design` | boolean | `true`/`false` | On first design |
| `coin_balance_tier` | string | `zero`, `low`, `medium`, `high` | On balance change |
| `free_designs_remaining` | number | 0-3 | On design use |
| `platform` | string | `ios`, `android`, `web` | On init |
| `auth_method` | string | `google`, `apple`, `anonymous` | On auth |
| `onboarding_complete` | boolean | `true`/`false` | On onboarding finish |
| `last_active_days_ago` | number | 0-∞ | On session start |

### 5.2 Recommended Audiences (GA4)

Create these audiences in GA4 for analysis and targeting:

| Audience | Definition | Use Case |
|----------|------------|----------|
| **Power Users** | 5+ sessions in 7 days | Feature adoption analysis |
| **At-Risk** | No session in 7+ days, was active | Churn prevention |
| **Potential Converters** | Free tier, 2+ designs created | Conversion targeting |
| **Pro Subscribers** | subscription_tier = pro | Retention analysis |
| **Design Enthusiasts** | 5+ designs created | Feature expansion |
| **New Users (7 days)** | account_age_days < 7 | Onboarding optimization |
| **Churned** | No session in 30+ days | Win-back campaigns |
| **High Value** | purchase event in last 30 days | VIP treatment |

---

## 6. Platform-Specific Implementation

### 6.1 iOS & Android (Expo/React Native)

**Current Setup:** `@react-native-firebase/analytics`

**Files to Modify:**

```
apps/expo/
├── services/
│   └── firebaseAnalytics.ts    # Add new events & user properties
├── stores/
│   ├── noteStore.ts            # Instrument note CRUD
│   ├── designStore.ts          # Instrument design operations
│   ├── userStore.ts            # Instrument user properties
│   ├── authStore.ts            # Already has some tracking
│   └── labelStore.ts           # Instrument label operations
├── app/
│   ├── _layout.tsx             # Enhanced screen tracking
│   ├── (tabs)/index.tsx        # Note list interactions
│   ├── note/[id].tsx           # Editor events
│   ├── design/create.tsx       # Design flow events
│   └── (tabs)/settings.tsx     # Shop & settings events
└── components/
    ├── shop/CoinShop.tsx       # Purchase events
    ├── onboarding/             # Onboarding events
    └── notes/NoteCard.tsx      # Note interaction events
```

**Implementation Pattern:**

```typescript
// In noteStore.ts
import { Analytics } from '@/services/firebaseAnalytics';

const useNoteStore = create<NoteStore>((set, get) => ({
  createNote: (note) => {
    // ... existing logic

    // Track event
    Analytics.noteCreated(note.id);

    // Update user property
    setUserProperty('total_notes', String(get().notes.length));
  },
}));
```

### 6.2 Web App (Next.js)

**Setup Required:** Firebase JS SDK with gtag.js

**Installation:**

```bash
cd apps/webapp
pnpm add firebase
```

**Files to Create:**

```
apps/webapp/
├── lib/
│   └── analytics/
│       ├── firebase.ts         # Firebase initialization
│       ├── events.ts           # Event tracking functions
│       └── hooks.ts            # useAnalytics hook
├── app/
│   └── layout.tsx              # Initialize analytics
└── components/
    └── providers/
        └── AnalyticsProvider.tsx
```

**Implementation:**

```typescript
// lib/analytics/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let analytics: ReturnType<typeof getAnalytics> | null = null;

export function initAnalytics() {
  if (typeof window !== 'undefined' && !analytics) {
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
  }
  return analytics;
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

export function setAnalyticsUserId(userId: string | null) {
  if (analytics) {
    setUserId(analytics, userId);
  }
}

export function setAnalyticsUserProperties(properties: Record<string, string>) {
  if (analytics) {
    setUserProperties(analytics, properties);
  }
}
```

**Router Integration (App Router):**

```typescript
// components/providers/AnalyticsProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackEvent } from '@/lib/analytics/firebase';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackEvent('page_view', {
      page_path: pathname,
      page_location: url,
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

### 6.3 Marketing Website

**Option A: Same Firebase Project (Recommended)**

Use the same Firebase project and measurement ID to get unified cross-platform analytics.

**Option B: Google Tag Manager**

If the marketing site is separate (e.g., Webflow, WordPress), use GTM:

1. Create GTM container
2. Add Firebase/GA4 tag with same measurement ID
3. Configure triggers for events

**Marketing Site Events Script:**

```html
<!-- Add to marketing site head -->
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
        page: window.location.pathname,
      });
    });
  });

  // Track app store clicks
  document.querySelectorAll('[data-track-store]').forEach(el => {
    el.addEventListener('click', () => {
      gtag('event', 'app_store_clicked', {
        store: el.dataset.trackStore,
      });
    });
  });
</script>
```

---

## 7. Key Funnels & Metrics

### 7.1 Onboarding Funnel

```
first_open → tutorial_begin → tutorial_complete → note_created → design_flow_started → design_saved
```

**Target Conversion Rates:**
- first_open → tutorial_complete: 70%
- tutorial_complete → note_created (D1): 60%
- note_created → design_flow_started (D7): 40%
- design_flow_started → design_saved: 80%

### 7.2 Design Conversion Funnel

```
design_flow_started → design_image_selected → design_generation_started → design_generated → design_saved → design_applied
```

**Target Conversion Rates:**
- Flow started → Image selected: 90%
- Image selected → Generation started: 85%
- Generation started → Generated (success): 95%
- Generated → Saved: 80%
- Saved → Applied to note: 70%

### 7.3 Purchase Funnel

```
paywall_shown → shop_opened → begin_checkout → purchase
```

**Target Conversion Rates:**
- Paywall shown → Shop opened: 30%
- Shop opened → Begin checkout: 15%
- Begin checkout → Purchase: 70%
- **Overall paywall → purchase: 3%**

### 7.4 Subscription Funnel

```
shop_opened → begin_checkout (subscription) → subscription_started
```

**Target Conversion Rates:**
- Shop opened → Subscription checkout: 10%
- Subscription checkout → Subscription started: 60%

### 7.5 Retention Metrics (from PRD)

| Metric | Target | GA4 Calculation |
|--------|--------|-----------------|
| DAU/MAU | >20% | Active users / 30-day active users |
| Day 1 Retention | 40% | Users returning D1 / D0 users |
| Day 7 Retention | 25% | Users returning D7 / D0 users |
| Day 30 Retention | 15% | Users returning D30 / D0 users |

### 7.6 Engagement Metrics (from PRD)

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| Notes per active user (weekly) | 5+ | `note_created` count by user, 7-day window |
| Designs per paying user | 3+ | `design_saved` count where subscription_tier=pro |
| Label adoption rate | 50% | Notes with labels / Total notes |

### 7.7 Monetization Metrics (from PRD)

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| Free → Paid conversion | 5% | Users with `purchase` / Total users |
| Pro subscription conversion | 3% | Users with `subscription_started` / Total users |
| ARPPU | $5.00 | Total revenue / Paying users |

---

## 8. GA4 Dashboard Configuration

### 8.1 Custom Dimensions (Required Setup)

Create these custom dimensions in GA4 Admin → Custom definitions:

| Dimension | Scope | Parameter Name |
|-----------|-------|----------------|
| Note ID | Event | `note_id` |
| Design ID | Event | `design_id` |
| Design Type | Event | `design_type` |
| Label Name | Event | `label_name` |
| Source | Event | `source` |
| Quality Score | Event | `quality_score` |
| Error Type | Event | `error_type` |
| Subscription Tier | User | `subscription_tier` |
| Account Age | User | `account_age_days` |

### 8.2 Custom Metrics (Required Setup)

| Metric | Scope | Parameter Name | Unit |
|--------|-------|----------------|------|
| Content Length | Event | `content_length` | Standard |
| Generation Time | Event | `generation_time_ms` | Milliseconds |
| Coin Balance | Event | `coin_balance` | Standard |

### 8.3 Recommended Explorations

**Exploration 1: Design Conversion Funnel**
- Technique: Funnel exploration
- Steps: design_flow_started → design_generated → design_saved → design_applied
- Breakdown: subscription_tier

**Exploration 2: Onboarding Drop-off**
- Technique: Funnel exploration
- Steps: first_open → tutorial_complete → note_created → design_flow_started
- Breakdown: platform

**Exploration 3: Feature Adoption by Cohort**
- Technique: Cohort exploration
- Cohort: first_open date
- Return criteria: design_saved event
- Breakdown: Week 1-4

**Exploration 4: Revenue by User Segment**
- Technique: Free form
- Dimensions: subscription_tier, account_age_days
- Metrics: Total revenue, Transactions

### 8.4 Alerts Configuration

Set up the following alerts in GA4:

| Alert | Condition | Threshold |
|-------|-----------|-----------|
| Crash spike | `app_exception` events | >2x daily average |
| Purchase drop | `purchase` events | <50% of 7-day average |
| Onboarding failure | `tutorial_complete` rate | <50% |
| Generation failures | `design_generation_failed` | >10% of generations |

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal:** Complete mobile event instrumentation

- [ ] **1.1** Update `firebaseAnalytics.ts` with all new events
- [ ] **1.2** Add user properties tracking
- [ ] **1.3** Instrument `noteStore.ts` with note events
- [ ] **1.4** Instrument `designStore.ts` with design events
- [ ] **1.5** Instrument `labelStore.ts` with label events
- [ ] **1.6** Update `purchaseService.ts` to use Analytics helpers
- [ ] **1.7** Instrument onboarding flow
- [ ] **1.8** Add editor events to `note/[id].tsx`
- [ ] **1.9** Configure GA4 custom dimensions/metrics
- [ ] **1.10** Test all events in Firebase DebugView

### Phase 2: Web Integration (Week 3)

**Goal:** Add analytics to web app

- [ ] **2.1** Install Firebase JS SDK in webapp
- [ ] **2.2** Create `lib/analytics/` module
- [ ] **2.3** Add AnalyticsProvider to app layout
- [ ] **2.4** Instrument existing web app screens
- [ ] **2.5** Verify cross-platform user ID linking
- [ ] **2.6** Test web events in GA4 Realtime

### Phase 3: Marketing Site (Week 4)

**Goal:** Track marketing site conversions

- [ ] **3.1** Add gtag.js to marketing site
- [ ] **3.2** Configure same measurement ID
- [ ] **3.3** Add CTA click tracking
- [ ] **3.4** Add app store link tracking
- [ ] **3.5** Set up conversion goals in GA4
- [ ] **3.6** Create acquisition reports

### Phase 4: Dashboards & Reporting (Week 5)

**Goal:** Build actionable dashboards

- [ ] **4.1** Create funnel explorations in GA4
- [ ] **4.2** Set up retention cohort reports
- [ ] **4.3** Configure alerts
- [ ] **4.4** Create weekly KPI dashboard
- [ ] **4.5** Document dashboard access and interpretation
- [ ] **4.6** Set up BigQuery export (optional)

### Phase 5: Optimization & Iteration (Ongoing)

**Goal:** Use data to improve product

- [ ] **5.1** Weekly funnel review
- [ ] **5.2** Monthly retention analysis
- [ ] **5.3** A/B test paywall timing
- [ ] **5.4** Optimize onboarding based on drop-off
- [ ] **5.5** Feature prioritization using adoption data

---

## 10. Privacy & Compliance

### 10.1 Data Collected

| Data Type | Collection | Storage | PII? |
|-----------|------------|---------|------|
| User ID | Supabase UUID | Firebase/GA4 | Pseudonymous |
| App Instance ID | Auto (Firebase) | Firebase | No |
| Events & Parameters | Manual | Firebase/GA4 | No |
| User Properties | Manual | Firebase/GA4 | No |
| Crash Reports | Auto | Crashlytics | No |
| IP Address | Auto (anonymized) | GA4 | Anonymized |

### 10.2 iOS App Tracking Transparency (ATT)

**Not required** because:
- Firebase uses App Instance ID, not IDFA
- No cross-app tracking
- No advertising attribution
- No third-party data sharing for ads

### 10.3 GDPR Compliance

Firebase Analytics is GDPR compliant when configured properly:

1. **Data Processing Agreement** - Google DPA covers Firebase
2. **Data Residency** - Configure EU data storage in Firebase settings
3. **User Consent** - Provide opt-out mechanism
4. **Data Deletion** - Use Firebase user deletion API
5. **Privacy Policy** - Document analytics collection

### 10.4 User Opt-Out Implementation

Already implemented in `firebaseAnalytics.ts`:

```typescript
export async function setAnalyticsEnabled(enabled: boolean) {
  await analytics().setAnalyticsCollectionEnabled(enabled);
  await crashlytics().setCrashlyticsCollectionEnabled(enabled);
}
```

**Add to Settings screen:**
- Toggle for "Share usage data"
- Clear explanation of what's collected
- Link to privacy policy

### 10.5 Data Retention

Configure in GA4 Admin → Data Settings → Data Retention:
- Recommended: **14 months** (maximum for free tier)
- User data: Reset on new activity

---

## 11. Testing & Validation

### 11.1 Development Testing

**Firebase DebugView:**

1. Enable debug mode on device:
   ```bash
   # iOS Simulator
   # Add -FIRDebugEnabled to scheme arguments

   # Android
   adb shell setprop debug.firebase.analytics.app com.toonnotes.app
   ```

2. Open Firebase Console → Analytics → DebugView
3. Perform actions in app
4. Verify events appear in real-time

### 11.2 Event Validation Checklist

For each new event, verify:

- [ ] Event name follows naming convention
- [ ] All required parameters are present
- [ ] Parameter values are correct type
- [ ] Event appears in DebugView
- [ ] Event appears in GA4 Realtime (after ~1 hour)
- [ ] User properties update correctly

### 11.3 Automated Testing

Create test helpers for analytics:

```typescript
// __tests__/analytics.test.ts
import { Analytics } from '@/services/firebaseAnalytics';

jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => ({
    logEvent: jest.fn(),
    setUserProperty: jest.fn(),
  }),
}));

describe('Analytics', () => {
  it('tracks note_created with correct params', async () => {
    await Analytics.noteCreated('test-note-id');

    expect(analytics().logEvent).toHaveBeenCalledWith('note_created', {
      note_id: 'test-note-id',
    });
  });
});
```

### 11.4 Production Verification

After release:

1. **Real-time check** - GA4 Realtime shows events from production
2. **Data quality** - No unexpected null values
3. **Volume check** - Event counts match expected user activity
4. **Funnel check** - Conversion rates are realistic
5. **Cross-platform** - Events appear from all platforms

### 11.5 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Events not appearing | Debug mode not enabled | Enable debug mode, check device logs |
| Delayed events | GA4 processing time | Wait 24-48 hours for full processing |
| Missing parameters | Not passed to logEvent | Verify parameter object in code |
| Wrong event name | Typo or wrong constant | Check event name matches exactly |
| Duplicate events | Multiple tracking calls | Check for double instrumentation |
| User properties not updating | Not calling setUserProperty | Verify property update code |

---

## Appendix A: Event Quick Reference

### Mobile (React Native)

```typescript
import { Analytics, setUserProperty } from '@/services/firebaseAnalytics';

// Notes
Analytics.noteCreated(noteId);
Analytics.noteOpened(noteId);
Analytics.noteDeleted(noteId);
Analytics.noteArchived(noteId);

// Designs
Analytics.designFlowStarted(source);
Analytics.designGenerated(type);
Analytics.designApplied(designId, isFirst);

// Purchases
Analytics.purchaseStarted(productId, price);
Analytics.purchaseCompleted(productId, price);
Analytics.purchaseFailed(productId, error);

// Auth
Analytics.signUp(method);
Analytics.login(method);

// Onboarding
Analytics.onboardingStarted();
Analytics.onboardingCompleted();

// User Properties
setUserProperty('subscription_tier', 'pro');
setUserProperty('total_notes', '42');
```

### Web (Next.js)

```typescript
import { trackEvent, setAnalyticsUserProperties } from '@/lib/analytics/firebase';

// Track event
trackEvent('note_created', { note_id: noteId });

// Set user property
setAnalyticsUserProperties({
  subscription_tier: 'pro',
  total_notes: '42',
});
```

### Marketing Site (gtag.js)

```javascript
// Track event
gtag('event', 'cta_clicked', {
  cta_id: 'hero-download',
  cta_text: 'Download Now',
});

// Track conversion
gtag('event', 'app_store_clicked', {
  store: 'ios',
});
```

---

## Appendix B: GA4 Property Configuration

### Required Settings

1. **Data Streams**
   - iOS app (Bundle ID: com.toonnotes.app)
   - Android app (Package: com.toonnotes.app)
   - Web (webapp.toonnotes.com)
   - Marketing site (toonnotes.com)

2. **Data Collection**
   - Enhanced measurement: ON
   - Google signals: ON (for demographics)
   - Ads personalization: OFF (unless using ads)

3. **Data Retention**
   - Event data: 14 months
   - Reset user data on new activity: ON

4. **Attribution**
   - Reporting attribution model: Data-driven
   - Lookback window: 30 days (default)

5. **BigQuery Linking** (Optional)
   - Link to BigQuery project for raw data export
   - Daily export for historical analysis

---

## Appendix C: Success Metrics Summary

| Category | Metric | Target | Event(s) |
|----------|--------|--------|----------|
| **Acquisition** | Tutorial completion | 70% | `tutorial_complete` / `first_open` |
| **Activation** | First note (D1) | 60% | `note_created` on day 0-1 |
| **Activation** | First design (D7) | 40% | `design_saved` on day 0-7 |
| **Engagement** | DAU/MAU | >20% | Active users calculation |
| **Engagement** | Notes per user/week | 5+ | `note_created` count |
| **Retention** | D1 | 40% | Return visits |
| **Retention** | D7 | 25% | Return visits |
| **Retention** | D30 | 15% | Return visits |
| **Revenue** | Free → Paid | 5% | `purchase` users / total |
| **Revenue** | Pro conversion | 3% | `subscription_started` / total |
| **Revenue** | ARPPU | $5.00 | Revenue / paying users |

---

*This plan should be reviewed and updated quarterly as the product evolves and new tracking requirements emerge.*
