# Analytics Implementation Guide

> **Status:** Phase 1 Complete ✅
> **Last Updated:** January 2, 2026
> **Cost:** $0/month (completely free)

## Overview

ToonNotes uses **Firebase Analytics + Crashlytics** for user behavior tracking and error monitoring. Both services are completely free with unlimited usage and sync to **Google Analytics 4 (GA4)** for reporting.

### Why Firebase?

| Consideration | Firebase | Sentry (Alternative) |
|---------------|----------|---------------------|
| Cost | Free unlimited | Free tier: 5K errors/month |
| Analytics | Full GA4 integration | Breadcrumbs only |
| Crash Reporting | Crashlytics (free) | Included |
| ATT Required? | No (uses app instance ID) | No |
| Dashboard | Firebase Console + GA4 | Sentry.io |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ToonNotes App                        │
├─────────────────────────────────────────────────────────┤
│  services/firebaseAnalytics.ts                          │
│  ├── initFirebase()         - Initialize on app start   │
│  ├── trackScreen()          - Screen view tracking      │
│  ├── trackEvent()           - Custom event tracking     │
│  ├── setUserId()            - User identity             │
│  ├── recordError()          - Non-fatal errors          │
│  └── log()                  - Crash context breadcrumbs │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Firebase                             │
├──────────────────────┬──────────────────────────────────┤
│  Firebase Analytics  │  Firebase Crashlytics            │
│  - Screen views      │  - Crash reports                 │
│  - Custom events     │  - Non-fatal errors              │
│  - User properties   │  - Breadcrumb logs               │
└──────────────────────┴──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              Google Analytics 4 (GA4)                   │
│  - Funnels & Retention                                  │
│  - Custom Reports                                       │
│  - Real-time Dashboard                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Firebase Setup & Crashlytics

**Goal:** Get crash reporting and basic analytics working.

**Status:** [x] Complete ✅

#### Checklist

- [x] **1.1** Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
  - Project name: "ToonNotes"
  - Enable Google Analytics during setup

- [x] **1.2** Add iOS app to Firebase
  - Bundle ID: `com.toonnotes.app`
  - Download `GoogleService-Info.plist`
  - Save to project root

- [x] **1.3** Add Android app to Firebase
  - Package name: `com.toonnotes.app`
  - Download `google-services.json`
  - Save to project root

- [x] **1.4** Install dependencies
  ```bash
  npx expo install @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics expo-build-properties
  ```

- [x] **1.5** Configure `app.json` (see Configuration section below)

- [x] **1.6** Create `services/firebaseAnalytics.ts` (see Code section below)

- [x] **1.7** Initialize Firebase in `app/_layout.tsx`

- [x] **1.8** Integrate Crashlytics in `components/ErrorBoundary.tsx`

- [x] **1.9** Add error recording to critical services:
  - [x] `services/geminiService.ts`
  - [x] `services/purchaseService.ts`
  - [ ] `services/authService.ts` (optional - auth errors already logged)
  - [ ] `app/design/create.tsx` (optional - errors caught by geminiService)

- [x] **1.10** Set user context in `stores/authStore.ts`

- [x] **1.11** Rebuild native apps
  ```bash
  npx expo prebuild --clean
  npx expo run:ios
  npx expo run:android
  ```

- [ ] **1.12** Test: Trigger crash → verify in Firebase Console

---

### Phase 2: Analytics Events & Screen Tracking

**Goal:** Track user behavior with custom events.

**Status:** [ ] Not Started

#### Checklist

- [ ] **2.1** Add screen tracking with Expo Router in `app/_layout.tsx`

- [ ] **2.2** Add Analytics convenience functions to `services/firebaseAnalytics.ts`

- [ ] **2.3** Instrument key user flows:
  - [ ] `stores/noteStore.ts` - Note CRUD events
  - [ ] `app/(tabs)/index.tsx` - Note open events
  - [ ] `app/design/create.tsx` - Design flow events
  - [ ] `services/purchaseService.ts` - Purchase events
  - [ ] `stores/authStore.ts` - Auth events
  - [ ] `stores/userStore.ts` - Onboarding events

- [ ] **2.4** Add "Aha moment" tracking (first design applied)
  - Add `hasAppliedFirstDesign` to userStore
  - Track `design_first_applied` event

- [ ] **2.5** Test: Complete user flows → verify events in GA4 Realtime

---

### Phase 3: GA4 Dashboard & Funnels

**Goal:** Configure GA4 for actionable insights.

**Status:** [ ] Not Started

#### Checklist

- [ ] **3.1** Access GA4 at [analytics.google.com](https://analytics.google.com/)

- [ ] **3.2** Create funnels in Explore:
  - [ ] Design Conversion: `design_flow_started` → `design_generated` → `design_applied`
  - [ ] Onboarding: `first_open` → `tutorial_complete` → `note_created`
  - [ ] Purchase: `begin_checkout` → `purchase`

- [ ] **3.3** Set up custom reports:
  - [ ] Daily/Weekly Active Users
  - [ ] Feature adoption rates
  - [ ] Retention by first action

- [ ] **3.4** Configure alerts (optional):
  - [ ] Crash rate spike
  - [ ] Purchase completion drop

---

## Configuration

### app.json Changes

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      "@react-native-firebase/app",
      ["expo-image-picker", { ... }],
      "expo-secure-store",
      "expo-web-browser"
    ],
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      // ... existing iOS config
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      // ... existing Android config
    }
  }
}
```

### Required Files

| File | Location | Source |
|------|----------|--------|
| `GoogleService-Info.plist` | Project root | Firebase Console → iOS app |
| `google-services.json` | Project root | Firebase Console → Android app |

---

## Code Reference

### services/firebaseAnalytics.ts

```typescript
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

// ============================================
// INITIALIZATION
// ============================================

export async function initFirebase() {
  await analytics().setAnalyticsCollectionEnabled(true);
  await crashlytics().setCrashlyticsCollectionEnabled(true);

  if (__DEV__) {
    console.log('Firebase initialized');
  }
}

// ============================================
// SCREEN TRACKING
// ============================================

export async function trackScreen(screenName: string, screenClass?: string) {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
}

// ============================================
// EVENT TRACKING
// ============================================

export async function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  await analytics().logEvent(eventName, params);

  if (__DEV__) {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

// ============================================
// USER IDENTITY
// ============================================

export async function setUserId(userId: string) {
  await analytics().setUserId(userId);
  await crashlytics().setUserId(userId);
}

export async function clearUser() {
  await analytics().setUserId(null);
}

export async function setUserProperty(name: string, value: string) {
  await analytics().setUserProperty(name, value);
}

// ============================================
// ERROR TRACKING
// ============================================

export function recordError(error: Error, context?: Record<string, string>) {
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      crashlytics().setAttribute(key, value);
    });
  }
  crashlytics().recordError(error);
}

export function log(message: string) {
  crashlytics().log(message);
}

export function testCrash() {
  crashlytics().crash();
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const Analytics = {
  // Notes
  noteCreated: (noteId: string) =>
    trackEvent('note_created', { note_id: noteId }),

  noteOpened: (noteId: string) =>
    trackEvent('note_opened', { note_id: noteId }),

  noteDeleted: (noteId: string) =>
    trackEvent('note_deleted', { note_id: noteId }),

  noteArchived: (noteId: string) =>
    trackEvent('note_archived', { note_id: noteId }),

  // Designs
  designFlowStarted: (source: 'fab' | 'editor') =>
    trackEvent('design_flow_started', { source }),

  designGenerated: (type: string) =>
    trackEvent('design_generated', { design_type: type }),

  designApplied: (designId: string, isFirst: boolean) => {
    trackEvent('design_applied', { design_id: designId });
    if (isFirst) {
      trackEvent('design_first_applied', { design_id: designId });
    }
  },

  // Purchases
  purchaseStarted: (productId: string, price: number) =>
    trackEvent('begin_checkout', {
      item_id: productId,
      value: price,
      currency: 'USD',
    }),

  purchaseCompleted: (productId: string, price: number) =>
    trackEvent('purchase', {
      item_id: productId,
      value: price,
      currency: 'USD',
    }),

  purchaseFailed: (productId: string, error: string) =>
    trackEvent('purchase_failed', { item_id: productId, error }),

  // Auth
  signUp: (method: 'google' | 'apple') =>
    trackEvent('sign_up', { method }),

  login: (method: 'google' | 'apple') =>
    trackEvent('login', { method }),

  // Onboarding
  onboardingCompleted: () =>
    trackEvent('tutorial_complete'),
};
```

### Screen Tracking Component (app/_layout.tsx)

```typescript
import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { trackScreen } from '@/services/firebaseAnalytics';

function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const screenName = pathname === '/'
      ? 'Home'
      : pathname.replace(/^\//, '').replace(/\//g, '_');

    trackScreen(screenName);
  }, [pathname]);

  return null;
}
```

### Error Recording Pattern

```typescript
import { recordError, log } from '@/services/firebaseAnalytics';

async function riskyOperation() {
  try {
    log('Starting risky operation');
    // ... operation code
  } catch (error) {
    recordError(error as Error, {
      service: 'serviceName',
      method: 'methodName',
    });
    throw error; // or handle gracefully
  }
}
```

---

## Events Reference

### Core Events (15 events)

| Event Name | Firebase Equivalent | Trigger | Properties |
|------------|---------------------|---------|------------|
| `note_created` | - | Create note | `note_id` |
| `note_opened` | `select_content` | Open editor | `note_id` |
| `note_deleted` | - | Move to trash | `note_id` |
| `note_archived` | - | Archive note | `note_id` |
| `design_flow_started` | - | Enter design screen | `source` |
| `design_generated` | - | AI generates design | `design_type` |
| `design_applied` | - | Apply to note | `design_id` |
| `design_first_applied` | - | First ever design | `design_id` |
| `label_added` | - | Add label | `label_name`, `note_id` |
| `begin_checkout` | `begin_checkout` | Start purchase | `item_id`, `value`, `currency` |
| `purchase` | `purchase` | Complete purchase | `item_id`, `value`, `currency` |
| `purchase_failed` | - | Failed purchase | `item_id`, `error` |
| `sign_up` | `sign_up` | First auth | `method` |
| `login` | `login` | Subsequent auth | `method` |
| `tutorial_complete` | `tutorial_complete` | Finish onboarding | - |

### Automatic Events (Firebase)

These are tracked automatically by Firebase:
- `first_open` - First app launch
- `session_start` - New session begins
- `screen_view` - Screen navigation (with our tracking)
- `app_update` - App version update
- `app_remove` - App uninstalled (Android only)

---

## Privacy & Compliance

### Data Collected

| Data | Source | Purpose | PII? |
|------|--------|---------|------|
| User ID | Supabase auth | Cross-session identity | Pseudonymous |
| App Instance ID | Firebase | Device tracking | No |
| Events | User actions | Product insights | No |
| Crashes | Stack traces | Debugging | No |

### iOS App Tracking Transparency (ATT)

**Not required** for Firebase Analytics because:
- Firebase uses App Instance ID, not IDFA
- No cross-app tracking
- No advertising attribution

### GDPR Compliance

Firebase Analytics is GDPR compliant when configured properly:
- User ID is pseudonymous (Supabase UUID)
- No PII in event parameters
- Data processing in EU available (configure in Firebase settings)

### User Opt-Out (Optional)

```typescript
// Add to Settings screen
async function setAnalyticsEnabled(enabled: boolean) {
  await analytics().setAnalyticsCollectionEnabled(enabled);
  await crashlytics().setCrashlyticsCollectionEnabled(enabled);
}
```

---

## Testing

### Development Testing

1. **Enable Debug Mode:**
   ```bash
   # iOS Simulator
   adb shell setprop debug.firebase.analytics.app com.toonnotes.app

   # Or use Firebase DebugView in Console
   ```

2. **View Real-time Events:**
   - Firebase Console → Analytics → DebugView
   - GA4 → Reports → Realtime

### Test Crash

```typescript
import { testCrash } from '@/services/firebaseAnalytics';

// In development only
if (__DEV__) {
  testCrash(); // Force crash to test Crashlytics
}
```

### Verification Checklist

- [ ] Events appear in Firebase Analytics → Realtime
- [ ] Crashes appear in Firebase Crashlytics
- [ ] User ID attached after sign-in
- [ ] Screen views tracked on navigation
- [ ] Events have correct parameters

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| No events in console | Check `setAnalyticsCollectionEnabled(true)` |
| Crashes not appearing | Wait 5-10 minutes, force close app |
| Build fails | Run `npx expo prebuild --clean` |
| Expo Go doesn't work | Use development build with `expo-dev-client` |

### Debug Logging

```typescript
// Enable verbose logging
if (__DEV__) {
  analytics().setAnalyticsCollectionEnabled(true);
  // Events will log to console via trackEvent
}
```

---

## References

- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase - Analytics](https://rnfirebase.io/analytics/usage)
- [React Native Firebase - Crashlytics](https://rnfirebase.io/crashlytics/usage)
- [Firebase Analytics with Expo Router](https://tinybytelabs.com/blog/integrate-firebase-analytics-to-expo-router)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Firebase Console](https://console.firebase.google.com/)
- [GA4 Dashboard](https://analytics.google.com/)

---

## Changelog

| Date | Change |
|------|--------|
| Jan 2, 2026 | Phase 1 complete - Firebase setup, Crashlytics, error recording |
| Jan 2026 | Initial documentation created |
