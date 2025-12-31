# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

ToonNotes is a mobile note-taking app for webtoon/anime fans built with Expo (React Native). The app features AI-powered custom note designs generated from uploaded images.

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
- **Secure Storage**: expo-secure-store (API keys)

## Project Structure

```
ToonNotes_Expo/
├── app/                      # Expo Router pages
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab navigator
│   │   ├── index.tsx         # Notes list
│   │   ├── boards.tsx        # Boards/hashtag view
│   │   ├── designs.tsx       # My Designs
│   │   └── settings.tsx      # Settings
│   ├── note/
│   │   └── [id].tsx          # Note editor modal
│   ├── board/
│   │   └── [hashtag].tsx     # Board detail
│   ├── design/
│   │   └── create.tsx        # Design creation flow
│   ├── archive.tsx           # Archived notes
│   ├── trash.tsx             # Deleted notes
│   ├── +not-found.tsx        # 404 page
│   └── _layout.tsx           # Root layout (providers, error boundary)
├── components/               # Reusable UI components
│   ├── notes/
│   │   └── NoteCard.tsx      # Memoized note card with accessibility
│   ├── boards/
│   │   └── BoardCard.tsx     # Board preview card
│   ├── ErrorBoundary.tsx     # Global error fallback UI
│   ├── Themed.tsx            # Theme-aware Text/View components
│   └── useColorScheme.ts     # Dark mode hook
├── src/
│   └── theme/                # Design token system (single source of truth)
│       ├── tokens/
│       │   ├── colors.ts     # iOS HIG colors (light/dark)
│       │   ├── typography.ts # Font styles
│       │   ├── spacing.ts    # Spacing scale
│       │   └── effects.ts    # Shadows, radii
│       ├── useTheme.ts       # Theme hook
│       └── index.ts          # Re-exports
├── stores/                   # Zustand state management
│   ├── noteStore.ts          # Note CRUD with debounced persistence
│   ├── userStore.ts          # User, economy & settings
│   ├── designStore.ts        # Saved designs
│   ├── boardStore.ts         # Board/hashtag management
│   ├── debouncedStorage.ts   # Batched AsyncStorage writes
│   └── index.ts              # Export all stores
├── services/                 # External services
│   ├── geminiService.ts      # Gemini AI (with response validation)
│   ├── secureStorage.ts      # expo-secure-store wrapper
│   ├── purchaseService.ts    # RevenueCat integration (skeleton)
│   ├── designEngine.ts       # Design composition engine
│   └── sentry.ts             # Error monitoring configuration
├── utils/
│   ├── validation/
│   │   └── apiResponse.ts    # Zod schemas for API responses
│   ├── validation.ts         # Input sanitization
│   └── uuid.ts               # UUID generation
├── types/
│   └── index.ts              # TypeScript interfaces (500+ lines)
├── constants/
│   ├── themes.ts             # Pre-made design themes
│   ├── patterns.ts           # Background patterns
│   └── boardPresets.ts       # Board styling presets
├── tailwind.config.js        # Tailwind theme (iOS HIG colors)
├── global.css                # Tailwind imports
└── metro.config.js           # Metro + NativeWind
```

## Architecture Patterns

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

### State Management

```typescript
// Zustand stores with debounced persistence
import { useNoteStore, useUserStore, useDesignStore } from '@/stores';

// Auto-save pattern (note editor)
const prevValuesRef = useRef({ title, content });
useEffect(() => {
  if (!hasActualChanges(prevValuesRef.current, { title, content })) return;
  const timeout = setTimeout(() => updateNote(id, { title, content }), 500);
  return () => clearTimeout(timeout);
}, [title, content]);
```

### Secure Storage

```typescript
// API keys use expo-secure-store (encrypted)
import { saveApiKey, getApiKey, deleteApiKey } from '@/services/secureStorage';

await saveApiKey(key);  // Keychain (iOS) / EncryptedSharedPrefs (Android)
const key = await getApiKey();
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

## Data Models

- **Note**: Core entity with title, content, color, labels, designId, archive/delete status
- **NoteDesign**: AI-generated theme with colors, border style, sticker
- **User**: Economy state (coins, free design flag) - starts with 0 coins, 1 free design
- **AppSettings**: Preferences (darkMode, defaultNoteColor, geminiApiKey)
- **Label**: Tag for note organization

## Production Readiness

### Configured & Ready
- [x] Error boundary with styled fallback UI
- [x] Sentry integration (add DSN to enable)
- [x] Secure API key storage (expo-secure-store)
- [x] API response validation (Zod)
- [x] Accessibility labels on interactive elements
- [x] FlatList optimization for lists
- [x] Debounced state persistence

### Environment Variables

```bash
# .env or app.config.js
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn-here  # Error monitoring
EXPO_PUBLIC_API_URL=https://your-api.vercel.app  # Production API
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

## Economy System

- Users start with 0 coins and 1 free design
- Additional designs cost 1 coin each
- RevenueCat skeleton ready (configure API keys for production)

## Implemented Features

- [x] Dark mode (toggle in Settings, persisted)
- [x] Gemini API key management (secure storage)
- [x] Archive view (view and manage archived notes)
- [x] Trash view (restore or permanently delete)
- [x] Design application to notes
- [x] Image picker for design creation
- [x] Gemini API integration
- [x] Error boundary with recovery
- [x] Accessibility support
- [x] Performance optimized lists

## Quality Score: 85/100

Last assessed: December 2024

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

- [ ] Configure RevenueCat API keys (when ready for IAP)
- [ ] Add Sentry DSN for production monitoring
- [ ] Implement rich text editing
- [ ] Add share as image functionality
- [ ] Background removal for stickers
- [ ] Daily rewards system
