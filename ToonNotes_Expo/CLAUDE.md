# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

ToonNotes is a mobile note-taking app for webtoon/anime fans built with Expo (React Native). The app features AI-powered custom note designs, cloud sync, OAuth authentication, and premium subscription tiers.

**Project Root**: `/Users/sungholee/code/toonnotes/ToonNotes_Expo`

## Documentation

- **PRD.md** - Product Requirements Document with full feature specifications
- **toonnotes-handoff.md** - Developer handoff documentation
- **toonnotes-design-preview.html** - Visual design preview (open in browser)
- **docs/** - Additional documentation (quality reports, architecture decisions)

## Development Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in browser
npx tsc --noEmit     # Type check without emitting
```

## Tech Stack

- **Framework**: Expo SDK 54 with Expo Router v6
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State**: Zustand with AsyncStorage persistence (debounced writes)
- **Icons**: Phosphor Icons (React Native)
- **Validation**: Zod (API response validation)
- **Error Monitoring**: Sentry (configured, needs DSN)
- **Authentication**: Supabase Auth (Google/Apple OAuth)
- **Database**: Supabase (PostgreSQL) for cloud sync
- **Analytics**: Firebase Analytics
- **Secure Storage**: expo-secure-store (via Supabase adapter)
- **AI**: Google Gemini API (via Vercel edge functions)
- **Payments**: In-app purchases (iOS/Android native)

## Project Structure

```
ToonNotes_Expo/
├── api/                      # Vercel Edge Functions (10 endpoints)
│   ├── generate-theme.ts           # AI note design from image
│   ├── generate-lucky-theme.ts     # Randomized chaotic design
│   ├── extract-colors.ts           # Color palette extraction
│   ├── generate-board-design.ts    # Board/hashtag backgrounds
│   ├── generate-character-mascot.ts # AI sticker generation
│   ├── generate-label-design.ts    # Label-specific designs
│   ├── generate-typography-poster.ts # Typography art
│   ├── analyze-note-content.ts     # NLP for label suggestions
│   ├── onboarding-config.ts        # Remote config for onboarding
│   └── remove-background.ts        # Background removal (unified)
├── app/                      # Expo Router pages
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab navigator
│   │   ├── index.tsx         # Notes list
│   │   ├── boards.tsx        # Boards/hashtag view
│   │   ├── designs.tsx       # My Designs
│   │   └── settings.tsx      # Settings
│   ├── auth/                 # Authentication flow
│   │   ├── index.tsx         # OAuth sign-in screen
│   │   ├── callback.tsx      # OAuth callback handler
│   │   └── _layout.tsx       # Auth stack layout
│   ├── note/
│   │   └── [id].tsx          # Note editor modal
│   ├── board/
│   │   ├── [hashtag].tsx     # Board detail
│   │   └── design/create.tsx # Board design creation
│   ├── design/
│   │   └── create.tsx        # Design creation flow
│   ├── archive.tsx           # Archived notes
│   ├── trash.tsx             # Deleted notes
│   ├── +not-found.tsx        # 404 page
│   └── _layout.tsx           # Root layout (providers, error boundary)
├── components/               # Reusable UI components (41 files)
│   ├── notes/
│   │   └── NoteCard.tsx      # Memoized note card with accessibility
│   ├── boards/
│   │   ├── BoardCard.tsx     # Board preview card
│   │   ├── BoardCardPreview.tsx
│   │   ├── BoardAccentLayer.tsx
│   │   ├── StickyNote.tsx
│   │   ├── StickyNotesRow.tsx
│   │   └── NotePreview.tsx
│   ├── editor/
│   │   ├── ChecklistEditor.tsx  # Google Keep style checklist
│   │   ├── BulletEditor.tsx     # Bullet list editor
│   │   ├── CheckboxOverlay.tsx
│   │   ├── HashtagAutocomplete.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── EditorContent.tsx
│   │   └── index.ts
│   ├── designs/
│   │   └── DesignCard.tsx    # Design gallery card
│   ├── shop/                 # In-app purchase UI
│   │   ├── CoinShop.tsx
│   │   ├── ProSubscriptionCard.tsx
│   │   └── UpgradeModal.tsx
│   ├── labels/               # Label suggestion UI
│   │   ├── LabelSuggestionSheet.tsx
│   │   └── LabelSuggestionToast.tsx
│   ├── onboarding/           # Onboarding system
│   │   ├── CoachMarksProvider.tsx
│   │   ├── CoachMarkTooltip.tsx
│   │   └── WelcomeCarousel.tsx
│   ├── settings/
│   │   └── LogoPreview.tsx
│   ├── ErrorBoundary.tsx     # Global error fallback UI
│   ├── Themed.tsx            # Theme-aware Text/View components
│   ├── AccentLayer.tsx       # Design accent layer
│   ├── BackgroundLayer.tsx   # Design background layer
│   ├── ThemePicker.tsx       # Theme selection
│   └── useColorScheme.ts     # Dark mode hook
├── src/
│   ├── theme/                # Design token system (single source of truth)
│   │   ├── tokens/
│   │   │   ├── colors.ts     # iOS HIG colors (light/dark)
│   │   │   ├── typography.ts # Font styles
│   │   │   ├── spacing.ts    # Spacing scale
│   │   │   ├── effects.ts    # Shadows, radii
│   │   │   └── index.ts
│   │   ├── useTheme.ts       # Theme hook
│   │   └── index.ts          # Re-exports
│   └── components/           # Base UI components
│       ├── buttons/          # Button, IconButton
│       ├── inputs/           # TextInput wrapper
│       ├── sheets/           # BottomSheet
│       ├── tags/             # TagPill
│       └── Icon.tsx
├── stores/                   # Zustand state management
│   ├── noteStore.ts          # Note CRUD with debounced persistence + cloud sync
│   ├── userStore.ts          # User, economy & settings
│   ├── designStore.ts        # Saved designs + cloud sync
│   ├── boardStore.ts         # Board/hashtag management + cloud sync
│   ├── labelStore.ts         # Label entities + cloud sync
│   ├── authStore.ts          # Authentication state + sync orchestration
│   ├── boardDesignStore.ts   # Board-specific design state
│   ├── labelSuggestionStore.ts # AI label suggestion queue
│   ├── debouncedStorage.ts   # Batched AsyncStorage writes
│   └── index.ts              # Export all stores
├── services/                 # External services (14 files)
│   ├── geminiService.ts      # Gemini AI (calls Vercel edge functions)
│   ├── designEngine.ts       # Design composition engine
│   ├── authService.ts        # OAuth authentication (Google/Apple)
│   ├── supabase.ts           # Supabase client configuration
│   ├── syncService.ts        # Cloud sync (Pro feature)
│   ├── migrationService.ts   # Local-to-cloud data migration
│   ├── subscriptionService.ts # Premium/Pro tier management
│   ├── purchaseService.ts    # In-app purchase handling
│   ├── firebaseAnalytics.ts  # Analytics tracking
│   ├── labelingEngine.ts     # AI-powered label suggestions
│   ├── onboardingService.ts  # Onboarding flow management
│   ├── shareService.ts       # Share as image functionality
│   ├── sentry.ts             # Error monitoring configuration
│   └── index.ts              # Service exports
├── utils/
│   ├── validation/
│   │   └── apiResponse.ts    # Zod schemas for API responses
│   ├── validation.ts         # Input sanitization
│   ├── uuid.ts               # UUID generation
│   ├── analytics.ts          # Analytics helpers
│   ├── devLog.ts             # Development logging
│   ├── labelNormalization.ts # Label text normalization
│   └── shadows.ts            # Shadow style utilities
├── types/
│   └── index.ts              # TypeScript interfaces (600+ lines)
├── constants/
│   ├── themes.ts             # Pre-made design themes
│   ├── patterns.ts           # Background patterns
│   ├── boardPresets.ts       # Board styling presets (20 category-based)
│   ├── labelPresets.ts       # Label/note styling presets (30 presets)
│   ├── fonts.ts              # Font definitions
│   ├── products.ts           # In-app purchase product definitions
│   └── onboardingConfig.ts   # Onboarding flow configuration
├── tailwind.config.js        # Tailwind theme (iOS HIG colors)
├── global.css                # Tailwind imports
└── metro.config.js           # Metro + NativeWind
```

## API Routes (Vercel Edge Functions)

All AI features are powered by Vercel edge functions that call Google Gemini API:

| Endpoint | Purpose | Input |
|----------|---------|-------|
| `/api/generate-theme` | Generate note design from image | imageData, mimeType |
| `/api/generate-lucky-theme` | Chaotic random design variant | imageData, mimeType |
| `/api/extract-colors` | Extract harmonizing colors | imageData, baseColors |
| `/api/generate-board-design` | Board/hashtag backgrounds | boardName, category |
| `/api/generate-character-mascot` | AI character sticker | analysis, noteContent, style |
| `/api/generate-label-design` | Label-specific design | labelName, category |
| `/api/generate-typography-poster` | Typography art poster | analysis, noteContent, style |
| `/api/analyze-note-content` | NLP analysis for labels | noteTitle, noteContent |
| `/api/onboarding-config` | Remote onboarding config | (none) |
| `/api/remove-background` | Background removal (unified) | imageData, type |

**Note**: The app calls these via `services/geminiService.ts`. The base URL is `https://toonnotes-api.vercel.app`.

## Architecture Patterns

### Authentication Flow

```typescript
// OAuth with Supabase (Google/Apple)
import { useAuthStore } from '@/stores';
import { signInWithGoogle, signInWithApple, signOut } from '@/services/authService';

const { user, session, isAuthenticated } = useAuthStore();

// Sign in triggers OAuth flow, callback handled in app/auth/callback.tsx
await signInWithGoogle();
```

### Cloud Sync (Pro Feature)

Full bidirectional sync for all user data types:

| Data Type | Sync Function | Real-time |
|-----------|---------------|-----------|
| Notes | `syncNotes()` | Yes |
| Designs | `syncDesigns()` | Yes |
| Boards | `syncBoards()` | Yes |
| Labels | `syncLabels()` | Yes |

```typescript
// Sync service handles bidirectional sync for all data types
import {
  syncNotes,
  syncDesigns,
  syncBoards,
  syncLabels,
  subscribeToNotes,
  subscribeToDesigns,
  subscribeToBoards,
  subscribeToLabels,
} from '@/services/syncService';

// Migration moves local data to Supabase (first sign-in)
import { migrateLocalDataToCloud } from '@/services/migrationService';
await migrateLocalDataToCloud(userId);

// Full sync pulls/pushes all data types
await Promise.all([
  syncNotes(userId),
  syncDesigns(userId),
  syncBoards(userId),
  syncLabels(userId),
]);
```

**Sync triggers:**
- On sign-in (full sync)
- After every local change (fire-and-forget upload)
- Real-time subscription for changes from other devices

### Theme System (Single Source of Truth)

```typescript
// Use the theme hook for all colors
import { useTheme } from '@/src/theme';

const { colors, semantic, tagColors, isDark } = useTheme();

// For Tailwind classes, use system-* prefixed colors
<View className="bg-system-bgPrimary" />
<Text className="text-system-textPrimary" />
```

**DO NOT** use `constants/Colors.ts` (deleted) - all colors come from `src/theme/`.

### Color Scheme Architecture

The app uses a layered color system with distinct purposes:

```
┌─────────────────────────────────┐
│  BOARD (Rich/Visible Color)    │  ← Container backdrop
│  ┌───────────────────────────┐ │
│  │  NOTE (Light Pastel)      │ │  ← Paper-like cards
│  │  └── TEXT (Dark)          │ │  ← Readable content
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

**Board Colors** (`constants/boardPresets.ts`): 20 presets with category-based moods
| Category | Mood | Colors |
|----------|------|--------|
| Productivity | Muted/Professional | Slate, emerald |
| Reading | Rich/Immersive | Violet, blue, pink |
| Creative | Vibrant/Dynamic | Cyan, teal, pink |
| Content | Warm/Writerly | Stone, blue, gray |
| Personal | Warm/Cozy | Amber, violet, orange |

**Note Colors** (`src/theme/tokens/colors.ts`): Light pastels for text readability
- `white`, `cream`, `mint`, `peach`, `lavender`, `sky`, `lemon`, `blush`

**Label Presets** (`constants/labelPresets.ts`): 30 presets that style notes (not boards)
- Use light backgrounds since they apply to note cards

### State Management

```typescript
// Zustand stores with debounced persistence
import { useNoteStore, useUserStore, useDesignStore, useAuthStore } from '@/stores';

// Auto-save pattern (note editor)
const prevValuesRef = useRef({ title, content });
useEffect(() => {
  if (!hasActualChanges(prevValuesRef.current, { title, content })) return;
  const timeout = setTimeout(() => updateNote(id, { title, content }), 500);
  return () => clearTimeout(timeout);
}, [title, content]);
```

### API Response Validation

```typescript
// All external API responses are validated with Zod
import { parseThemeResponse } from '@/utils/validation/apiResponse';

const rawData = await response.json();
const validated = parseThemeResponse(rawData);  // Returns defaults on failure
```

### Error Handling

```typescript
// Global error boundary in app/_layout.tsx
export { ErrorBoundary } from '@/components/ErrorBoundary';

// Manual error capture
import { captureException } from '@/services/sentry';
captureException(error, { context: 'design-generation' });

// Firebase error logging
import { recordError } from '@/services/firebaseAnalytics';
recordError(error, 'design_generation_failed');
```

### Accessibility

All interactive components must have accessibility labels:

```typescript
<TouchableOpacity
  accessibilityLabel="Create new note"
  accessibilityRole="button"
  accessibilityHint="Opens the note editor"
>
```

### Checklist Editor (Google Keep Style)

The note editor supports checklist mode with a Google Keep-inspired implementation. Key pattern:

```typescript
// IMPORTANT: Use stable UUIDs, NOT array indices
interface ChecklistItem {
  id: string;        // Stable UUID - never changes
  text: string;
  checked: boolean;
}

// Use Map for refs, NOT array
const inputRefs = useRef<Map<string, TextInput>>(new Map());

// Focus after render completes
const focusItem = (itemId: string) => {
  requestAnimationFrame(() => {
    inputRefs.current.get(itemId)?.focus();
  });
};
```

**Why this pattern?** React Native TextInput has cursor/focus issues when:
- Using array indices as keys (refs shift on insert/delete)
- Calling focus() immediately after setState (render not complete)

See `components/editor/ChecklistEditor.tsx` for full implementation.

## Data Models

- **Note**: Core entity with title, content, color, labels, designId, archive/delete status
- **NoteDesign**: AI-generated theme with colors, border style, sticker
- **User**: Economy state (coins, subscription tier) + Supabase auth
- **AppSettings**: Preferences (darkMode, defaultNoteColor)
- **Label**: Tag for note organization
- **Board**: Hashtag-based note grouping with custom design
- **Subscription**: Pro tier status and expiration

## Subscription Tiers

| Feature | Free | Pro |
|---------|------|-----|
| Notes | Unlimited | Unlimited |
| Designs | 1 free, then coins | Unlimited |
| Cloud Sync | No | Yes |
| AI Label Suggestions | Limited | Unlimited |
| Character Stickers | Coins | Unlimited |

## Production Readiness

### Configured & Ready
- [x] Error boundary with styled fallback UI
- [x] Sentry integration (add DSN to enable)
- [x] Secure storage (expo-secure-store via Supabase)
- [x] API response validation (Zod)
- [x] Accessibility labels on interactive elements
- [x] FlatList optimization for lists
- [x] Debounced state persistence
- [x] OAuth authentication (Google/Apple)
- [x] Cloud database (Supabase)
- [x] Firebase Analytics
- [x] In-app purchases

### Environment Variables

```bash
# .env or app.config.js
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-key  # For Vercel edge functions
```

### Sentry Setup

1. Create account at https://sentry.io
2. Create React Native project
3. Get DSN from Project Settings > Client Keys
4. Set `EXPO_PUBLIC_SENTRY_DSN` environment variable
5. Update `app.json` with your organization:
   ```json
   ["@sentry/react-native/expo", {
     "organization": "your-org",
     "project": "toonnotes"
   }]
   ```

### Building Native Apps

```bash
# Create development build (required for expo-secure-store)
npx expo prebuild
npx expo run:ios
npx expo run:android

# Or use EAS Build
eas build --platform ios --profile development
```

## Key Patterns

- Zustand stores with debounced AsyncStorage persistence
- NativeWind v4 for Tailwind CSS styling
- Expo Router file-based navigation
- Modal presentation for note editor, archive, trash views
- useRef pattern to prevent unnecessary re-renders in auto-save
- Memoized list items with custom `arePropsEqual`
- Supabase for authentication and cloud sync
- Vercel edge functions for AI features

## Implemented Features

### Core Features
- [x] Dark mode (toggle in Settings, persisted)
- [x] Archive view (view and manage archived notes)
- [x] Trash view (restore or permanently delete)
- [x] Design application to notes
- [x] Image picker for design creation
- [x] Error boundary with recovery
- [x] Accessibility support
- [x] Performance optimized lists
- [x] Checklist mode (Google Keep style with visual checkboxes)
- [x] Bullet list mode
- [x] Board/hashtag organization system

### Authentication & Cloud
- [x] OAuth authentication (Google, Apple)
- [x] Supabase cloud sync (Pro feature)
- [x] Local-to-cloud data migration
- [x] Session management

### AI Features
- [x] Gemini API integration (via Vercel edge functions)
- [x] AI note design generation
- [x] "Feeling Lucky" random designs
- [x] Character sticker generation
- [x] Background removal for stickers
- [x] Typography poster generation
- [x] AI-powered label suggestions

### Monetization
- [x] Pro subscription tier
- [x] In-app purchases
- [x] Coin economy system

### Analytics & Monitoring
- [x] Firebase Analytics
- [x] Sentry error monitoring (needs DSN)

### Onboarding
- [x] Welcome carousel
- [x] Coach marks system
- [x] Remote config for onboarding

## Quality Score: 85/100

Last assessed: January 2025

| Pillar | Score |
|--------|-------|
| Architecture & Code Quality | 9/10 |
| Type Safety & Data Integrity | 9/10 |
| State Management | 9/10 |
| Error Handling & Resilience | 8/10 |
| Security | 8/10 |
| Performance | 9/10 |
| UI/UX Consistency | 8/10 |
| Production Readiness | 8/10 |

## TODO

- [ ] Add Sentry DSN for production monitoring
- [ ] Share as image (partially implemented)
- [ ] Daily rewards system
- [ ] Offline-first improvements
