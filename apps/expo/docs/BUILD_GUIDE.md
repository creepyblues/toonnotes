# ToonNotes Expo Build Guide

This guide covers building iOS and Android apps from the ToonNotes Expo project, including critical lessons learned from platform-specific issues.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [iOS Build](#ios-build)
4. [Android Build](#android-build)
5. [Critical Styling Rules](#critical-styling-rules)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Testing Checklist](#testing-checklist)
8. [App Store Submission](#app-store-submission)

---

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| pnpm | 8+ | Package manager |
| Xcode | 15+ | iOS builds |
| Android Studio | Latest | Android builds |
| Expo CLI | Latest | Development server |
| EAS CLI | Latest | Cloud builds |

### Install Dependencies

```bash
# Install pnpm if not present
npm install -g pnpm

# Install project dependencies
cd apps/expo
pnpm install

# Install Expo CLI and EAS CLI globally
npm install -g expo-cli eas-cli
```

---

## Environment Setup

### Environment Variables

Create `.env.local` file in `apps/expo/`:

```bash
# Required
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Features (for Vercel edge functions)
GEMINI_API_KEY=your-gemini-api-key

# In-App Purchases (RevenueCat)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your-revenuecat-ios-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your-revenuecat-android-key

# Optional
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## iOS Build

### Development Build (Simulator)

```bash
# Start Expo development server
npx expo start

# Press 'i' to open iOS simulator
# Or run directly:
npx expo run:ios
```

### Development Build (Physical Device)

```bash
# Create development build
npx expo prebuild --platform ios

# Open in Xcode and run on device
open ios/ToonNotesExpo.xcworkspace
```

### Production Build (EAS)

```bash
# Configure EAS (first time only)
eas build:configure

# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Local Production Build

```bash
# Generate native project
npx expo prebuild --platform ios --clean

# Open Xcode
open ios/ToonNotesExpo.xcworkspace

# Archive and submit manually via Xcode
# Product > Archive > Distribute App
```

---

## Android Build

### Development Build (Emulator)

```bash
# Start Expo development server
npx expo start

# Press 'a' to open Android emulator
# Or run directly:
npx expo run:android
```

### Development Build (Physical Device)

```bash
# Enable USB debugging on device
# Connect device via USB

# Run on device
npx expo run:android --device
```

### Production Build (EAS)

```bash
# Create production AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Local Production Build

```bash
# Generate native project
npx expo prebuild --platform android --clean

# Build release APK
cd android
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Output locations:
# APK: android/app/build/outputs/apk/release/
# AAB: android/app/build/outputs/bundle/release/
```

---

## Critical Styling Rules

### NativeWind/Tailwind CSS Platform Differences

**CRITICAL**: React Native with NativeWind (Tailwind CSS) has significant differences between iOS and Android when mixing `className` and `style` props.

#### The Problem

When combining NativeWind's `className` prop with React Native's `style` prop on the same element:
- **Android**: Works as expected (styles merge correctly)
- **iOS**: Can cause layout issues (styles may not merge properly)

This is especially problematic for:
- `flex-*` layout properties
- `padding` and `margin`
- Child elements that rely on parent's className processing

#### Root Cause

NativeWind processes `className` and generates styles that get merged with the `style` prop. On iOS, this merging can fail or produce unexpected results when:
1. Parent elements use `style` prop instead of `className`
2. Child elements still use `className` for layout

#### ❌ Incorrect Patterns (Cause iOS Issues)

```tsx
// BAD: Mixing className and style for layout
<SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

// BAD: Parent uses style, children use className
<ScrollView style={styles.scrollView}>
  <View className="flex-row items-center">  {/* This may break on iOS! */}
    <Icon />
    <Text>Label</Text>
  </View>
</ScrollView>

// BAD: flex in className, other styles in style prop
<View className="flex-1 px-4" style={{ backgroundColor: colors.card }}>
```

#### ✅ Correct Patterns

**Pattern 1: StyleSheet Only (Recommended for screen layouts)**

```tsx
import { StyleSheet } from 'react-native';

<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
  <View style={[styles.header, { backgroundColor: colors.background }]}>
    <Text style={[styles.title, { color: colors.textPrimary }]}>Title</Text>
  </View>
  {/* Keep className for scrollable content */}
  <ScrollView className="flex-1 px-4">
    {/* Children can use className safely */}
    <View className="flex-row items-center">
      <Icon />
      <Text>Label</Text>
    </View>
  </ScrollView>
</SafeAreaView>

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
});
```

**Pattern 2: className Only (For static layouts)**

```tsx
// Good: All Tailwind, no style prop
<View className="flex-1 px-4 py-3 bg-white rounded-xl">
  <View className="flex-row items-center gap-2">
    <Icon />
    <Text className="text-lg font-semibold">Label</Text>
  </View>
</View>
```

**Pattern 3: style for Dynamic Theme Values Only**

```tsx
// Acceptable: className for layout, style ONLY for dynamic colors
<View className="px-4 py-3 rounded-xl" style={{ backgroundColor: colors.card }}>
  {/* But NEVER mix layout properties! */}
</View>
```

### Screen Layout Template

All tab screens and modal screens MUST follow this template:

```tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';

export default function ExampleScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header - ALWAYS use StyleSheet */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Screen Title
        </Text>
      </View>

      {/* Content - Can use className for ScrollView/FlatList */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Internal content can safely use className */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center gap-3">
            {/* Icons and text in flex-row work correctly */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
});
```

### FlatList Styling

FlatList uses `contentContainerStyle` (not `style`) for content styling:

```tsx
// CORRECT: FlatList with contentContainerStyle
<FlatList
  data={items}
  contentContainerStyle={{ padding: 12 }}  // This is different from style!
  renderItem={({ item }) => (
    <View className="flex-row items-center">  {/* className works fine */}
      <Icon />
      <Text>{item.label}</Text>
    </View>
  )}
/>
```

---

## Common Issues & Solutions

### Issue 1: Icons on Separate Lines from Text (iOS)

**Symptom**: `flex-row` layouts don't work, icons appear above/below text instead of beside it.

**Cause**: Parent ScrollView/View using `style` prop breaks NativeWind for children.

**Solution**: Keep ScrollView using `className`, only use `style` for SafeAreaView and header.

### Issue 2: Header Alignment Inconsistency

**Symptom**: Headers have different padding/alignment on iOS vs Android.

**Cause**: Mixing `className="px-4 py-3"` with `style={{ backgroundColor }}`

**Solution**: Use StyleSheet for all header properties:

```tsx
<View style={[styles.header, { backgroundColor: colors.background }]}>
```

### Issue 3: RevenueCat Configuration Error

**Symptom**: "Error fetching offerings" on app launch in development.

**Cause**: RevenueCat products not configured in App Store Connect/Play Console.

**Solution**:
- This is expected in development
- Configure products in RevenueCat dashboard
- Set up products in App Store Connect and Play Console for production

### Issue 4: Simulator Device Not Found

**Symptom**: `CommandError: No device UDID or name matching "device name"`

**Solution**:
```bash
# List available simulators
xcrun simctl list devices

# Start specific simulator
xcrun simctl boot "iPhone 16 Pro"

# Or let Expo choose
npx expo start --ios
```

### Issue 5: Metro Bundler Port Conflict

**Symptom**: Port 8081 already in use.

**Solution**:
```bash
# Use different port
npx expo start --port 8082

# Or kill existing process
lsof -ti:8081 | xargs kill -9
```

---

## Testing Checklist

Before releasing, verify these items on BOTH iOS and Android:

### Layout & Styling

- [ ] **Settings page**: All icons aligned with text in rows
- [ ] **Notes list**: Cards display correctly
- [ ] **Boards page**: Grid layout renders properly
- [ ] **Designs page**: Design cards display correctly
- [ ] **Note editor**: Toolbar buttons aligned
- [ ] **Dark mode**: All screens render correctly

### Functionality

- [ ] **Authentication**: Google/Apple sign-in works
- [ ] **Cloud sync**: Notes sync between devices (Pro)
- [ ] **AI features**: Design generation works
- [ ] **In-app purchases**: Purchase flow completes
- [ ] **Deep links**: Navigation via URL scheme works

### Platform-Specific

**iOS Only:**
- [ ] Safe area insets respected
- [ ] Notch/Dynamic Island handled
- [ ] Keyboard avoidance works

**Android Only:**
- [ ] Back button navigation works
- [ ] Status bar theming correct
- [ ] Hardware back handled in modals

### Performance

- [ ] Lists scroll smoothly (60 FPS)
- [ ] No memory leaks on tab switching
- [ ] Images load without flicker

---

## Quick Reference

### Development Commands

```bash
# Start dev server
npx expo start

# Run iOS
npx expo run:ios

# Run Android
npx expo run:android

# Type check
npx tsc --noEmit

# Prebuild native projects
npx expo prebuild --clean
```

### EAS Build Commands

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## App Store Submission

### iOS App Store (App Store Connect)

iOS submission via EAS works out of the box after initial setup:

```bash
# Build and auto-submit
eas build --platform ios --profile production --auto-submit

# Or submit latest build
eas submit --platform ios --latest
```

**Configuration** (`eas.json`):
```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6757282692"
      }
    }
  }
}
```

### Google Play Store (First-Time Submission)

**CRITICAL**: For first-time Android app submissions, the Google Play API **cannot** create new apps. You must manually create the app and upload the first AAB through the Google Play Console web interface.

#### Why This Error Occurs

```
Google Api Error: Invalid request - Package not found: com.toonnotes.app
```

This error means the app `com.toonnotes.app` doesn't exist in Google Play Console yet. The Play Store API only allows updates to existing apps, not creation of new ones.

#### Step 1: Create App in Play Console

1. Go to https://play.google.com/console
2. Click **"Create app"**
3. Fill in required information:
   - **App name**: ToonNotes
   - **Default language**: English (US)
   - **App or game**: App
   - **Free or paid**: Free (with in-app purchases)
4. Accept developer policies and create

#### Step 2: Complete Store Listing

Navigate to **Store presence > Main store listing**:

| Field | Requirement |
|-------|-------------|
| Short description | ≤80 characters |
| Full description | ≤4000 characters |
| App icon | 512x512 PNG |
| Feature graphic | 1024x500 PNG |
| Phone screenshots | At least 2 |
| Privacy policy URL | Required |

#### Step 3: Complete Content Rating

Navigate to **Policy > App content** and complete the IARC rating questionnaire.

#### Step 4: Set Up App Signing

Navigate to **Release > App integrity**:
- Opt into Google Play App Signing (recommended)
- This lets Google manage your app signing key

#### Step 5: Upload First AAB Manually

Navigate to **Release > Internal testing** (or Production):

1. Click **"Create new release"**
2. Upload the AAB from your EAS build
3. Add release notes
4. Click **"Review release"**
5. Submit for review

**Locating your AAB file:**
```bash
# List recent builds
eas build:list --platform android

# Download specific build
eas build:download --id <build-id>
```

#### Step 6: Set Up Service Account (for future automated submissions)

1. In Play Console: **Users and permissions > API access**
2. Create or link Google Cloud project
3. Create service account with **"Release manager"** role
4. Download JSON key file
5. Save as `apps/expo/google-play-service-account.json`

**IMPORTANT**: This file is in `.gitignore` - never commit credentials!

**Configuration** (`eas.json`):
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

#### After First Submission

Once the app exists in Play Console, automated submissions work:

```bash
# Build and auto-submit
eas build --platform android --profile production --auto-submit

# Or submit latest build
eas submit --platform android --latest
```

#### Track Options

| Track | Purpose |
|-------|---------|
| `internal` | Internal testing (up to 100 testers) |
| `alpha` | Closed testing |
| `beta` | Open testing |
| `production` | Full release |

---

### Useful Simulator Commands

```bash
# List devices
xcrun simctl list devices

# Take screenshot
xcrun simctl io booted screenshot screenshot.png

# Open URL in simulator
xcrun simctl openurl booted "exp+toonnotesexpo://settings"

# Reset simulator
xcrun simctl erase booted
```

---

## Summary of Key Learnings

1. **Never mix `className` and `style` for layout properties** - causes iOS rendering issues
2. **Use StyleSheet for SafeAreaView and headers** - ensures consistent cross-platform behavior
3. **Keep `className` on ScrollView/FlatList** - allows NativeWind to process child elements correctly
4. **Test on both platforms early and often** - issues may only appear on one platform
5. **FlatList uses `contentContainerStyle`, not `style`** - different API from regular Views

---

*Last updated: January 2025*
*Includes: iOS alignment fixes, Google Play first-time submission guide*
