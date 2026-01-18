---
name: build-dist
description: Builds and distributes ToonNotes Expo app to iOS App Store (TestFlight) and Google Play Store. This skill should be used when creating release builds, submitting to app stores, managing version numbers, or verifying build credentials.
---

# Build Distribution

This skill automates the build and distribution process for the ToonNotes Expo app to iOS App Store and Google Play Store.

## When to Use This Skill

- Creating production builds for app store submission
- Submitting builds to TestFlight or Play Store
- Incrementing version/build numbers before release
- Verifying build credentials and signing configuration
- Creating local builds for testing distribution profiles

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| EAS CLI | >= 14.0.0 | Cloud builds & submission |
| Expo CLI | Latest | Local development builds |
| Xcode | 15+ | Local iOS builds (optional) |
| Android Studio | Latest | Local Android builds (optional) |
| Node.js | 18+ | JavaScript runtime |

### Required Credentials

| Credential | Platform | Setup |
|------------|----------|-------|
| Apple Developer Account | iOS | `eas credentials -p ios` |
| App Store Connect API Key | iOS | For automated submission |
| Google Play Service Account | Android | JSON key file |
| Distribution Certificate | iOS | Managed by EAS |
| Provisioning Profile | iOS | Managed by EAS |
| Keystore | Android | Managed by EAS |

## Commands

### Basic Usage

```
/build-dist ios                    # Build iOS for App Store
/build-dist android                # Build Android for Play Store
/build-dist all                    # Build both platforms
```

### With Options

```
/build-dist ios --profile=preview           # Preview build (TestFlight internal)
/build-dist ios --profile=production        # Production build (App Store)
/build-dist android --profile=production    # Production AAB for Play Store

/build-dist ios --submit                    # Build and submit to App Store
/build-dist android --submit                # Build and submit to Play Store
/build-dist all --submit                    # Build and submit both

/build-dist ios --local                     # Local build (requires Xcode)
/build-dist android --local                 # Local build (requires Android Studio)

/build-dist ios --bump=patch                # Bump version before build (1.2.2 -> 1.2.3)
/build-dist ios --bump=minor                # Bump minor version (1.2.2 -> 1.3.0)
/build-dist ios --bump=major                # Bump major version (1.2.2 -> 2.0.0)
/build-dist ios --bump=build                # Bump build number only (12 -> 13)

/build-dist --check                         # Pre-flight checks only
/build-dist --status                        # Check recent build status
```

## Build Profiles

| Profile | Distribution | iOS | Android | Use Case |
|---------|--------------|-----|---------|----------|
| development | internal | Simulator | APK | Local testing |
| preview | internal | Ad-hoc IPA | APK | TestFlight internal/beta |
| production | store | App Store IPA | AAB | Store submission |

## Configuration Reference

**Project Directory**: `/Users/sungholee/code/toonnotes/apps/expo`

**Key Files**:
- `app.json` - Version, build number, bundle identifiers
- `eas.json` - Build profiles, submission config
- `ios/` - Native iOS project (after prebuild)
- `android/` - Native Android project (after prebuild)

**Current Configuration**:
- EAS Project ID: `ba0e8d8b-bbf2-4690-9701-ba675bcd4bc9`
- iOS Bundle ID: `com.toonnotes.app`
- Android Package: `com.toonnotes.app`
- App Store Connect ID: `6757282692`

## Workflow

### Step 1: Pre-flight Checks

Verify the environment is ready for building:

```bash
# Navigate to project directory
cd /Users/sungholee/code/toonnotes/apps/expo

# Check EAS CLI version
eas --version
# Expected: >= 14.0.0

# Check EAS authentication
eas whoami
# Expected: logged in user

# Verify project configuration
cat app.json | grep -E '"version"|"buildNumber"'

# Check for uncommitted changes (warning only)
git status --porcelain

# Verify credentials (platform-specific)
eas credentials -p ios
eas credentials -p android
```

**Validation Checklist:**
- [ ] EAS CLI installed and authenticated
- [ ] app.json has valid version and identifiers
- [ ] eas.json exists with required profiles
- [ ] Firebase config files present (GoogleService-Info.plist, google-services.json)
- [ ] No uncommitted changes (warning only)

### Step 2: Version Management (if --bump specified)

Update version numbers before building:

```bash
# Read current versions from app.json
# expo.version: "1.2.2"
# expo.ios.buildNumber: "12"

# Bump patterns:
# --bump=patch: 1.2.2 -> 1.2.3
# --bump=minor: 1.2.2 -> 1.3.0
# --bump=major: 1.2.2 -> 2.0.0
# --bump=build: build number only (12 -> 13)
```

**Version Update Process:**
1. Read current version from `app.json`
2. Calculate new version based on bump type
3. Update `app.json` expo.version
4. Update `app.json` expo.ios.buildNumber (always increment)
5. Update `package.json` version (keep in sync)
6. Show diff and confirm with user
7. Stage changes for commit (optional)

### Step 3: Build Configuration Validation

Verify eas.json is correctly configured:

**Critical Check - Android Production:**
The Android production profile MUST use `buildType: "aab"` for Play Store:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

If `buildType: "apk"` is found for production, WARN the user.

### Step 4: Execute Build

#### Cloud Build (Default)

```bash
cd /Users/sungholee/code/toonnotes/apps/expo

# iOS Build
eas build --platform ios --profile production --non-interactive

# Android Build
eas build --platform android --profile production --non-interactive

# Both Platforms
eas build --platform all --profile production --non-interactive
```

Capture output:
- Build ID
- Build URL (for monitoring)
- Estimated completion time

#### Local Build (--local flag)

```bash
cd /Users/sungholee/code/toonnotes/apps/expo

# iOS Local Build
npx expo prebuild --platform ios --clean
cd ios && xcodebuild -workspace ToonNotes.xcworkspace \
  -scheme ToonNotes \
  -configuration Release \
  -archivePath build/ToonNotes.xcarchive archive

xcodebuild -exportArchive \
  -archivePath build/ToonNotes.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

# Android Local Build (AAB)
npx expo prebuild --platform android --clean
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Step 5: Monitor Build Progress

Poll build status until completion:

```bash
# Get build status
eas build:list --platform ios --limit 1 --json

# View specific build
eas build:view <build-id>
```

**Build Statuses:**
- `NEW` - Build created
- `IN_QUEUE` - Waiting for worker
- `IN_PROGRESS` - Building
- `FINISHED` - Success
- `ERRORED` - Failed

**Progress Output:**
```
Building ToonNotes v1.2.3 (build 13)...

[1/5] Pre-flight checks       COMPLETE
[2/5] iOS Build started       IN_PROGRESS
      Build ID: 12345678-1234-1234-1234-123456789012
      Profile: production
      URL: https://expo.dev/accounts/.../builds/...
[3/5] Waiting for completion  8m 30s
[4/5] Build completed         SUCCESS (12m 45s)
[5/5] Ready for submission

Run: /build-dist ios --submit
```

### Step 6: Submit to Store (if --submit flag)

#### iOS Submission

```bash
# Submit latest build
eas submit --platform ios --latest --non-interactive

# With specific TestFlight group
eas submit --platform ios --latest --groups "Internal Testers"

# With What to Test notes
eas submit --platform ios --latest \
  --what-to-test "Bug fixes and performance improvements"
```

Required in eas.json:
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

#### Android Submission

```bash
eas submit --platform android --latest --non-interactive
```

Requires Google Play service account JSON key configured in EAS.

### Step 7: Report Results

Generate comprehensive build summary:

```
## Build Distribution Summary

**App**: ToonNotes
**Version**: 1.2.3 (build 13)
**Date**: 2026-01-15
**Profile**: production

### Builds

| Platform | Status | Duration | Artifact |
|----------|--------|----------|----------|
| iOS | SUCCESS | 12m 45s | [Download](url) |
| Android | SUCCESS | 8m 30s | [Download](url) |

### iOS Details
- Bundle ID: com.toonnotes.app
- Build Number: 13
- Signing: Distribution Certificate (managed)

### Android Details
- Package: com.toonnotes.app
- Build Type: AAB
- Signing: Upload keystore (managed)

### Next Steps
1. iOS: Review build in App Store Connect > TestFlight
2. Android: Review in Google Play Console > Internal Testing
3. After testing, promote to external testers or production

### Commands
eas build:list --platform all --limit 5
eas submit --platform ios --latest
eas submit --platform android --latest
```

## Error Handling

### EAS Not Authenticated

```
ERROR: Not logged in to EAS

Fix: Run `eas login` and retry the build.
```

### Invalid Credentials

```
ERROR: iOS credentials not configured

Missing: Distribution Certificate

Fix: Run `eas credentials -p ios` to set up credentials.
```

### Build Failed

```
ERROR: Build failed

Platform: iOS
Build ID: 12345678-...
Error: Code signing failed

Troubleshooting:
1. Check credentials: eas credentials -p ios
2. Regenerate if needed: eas credentials -p ios --force
3. View full logs: eas build:view <build-id>

Common fixes:
- Expired provisioning profile: Regenerate via EAS
- Bundle ID mismatch: Verify app.json matches App Store Connect
- Missing entitlements: Check app.json plugins configuration
```

### Android Using Wrong Format

```
WARNING: Android production using APK format

Play Store requires AAB (Android App Bundle).

Fix: Update eas.json production profile to use buildType: "aab"
```

## Notification Channels

### Console Output

Real-time progress during build:

```
Building ToonNotes for iOS...

Pre-flight    [======] Complete
Uploading     [======] Complete
Queued        [======] Complete
Building      [===   ] 45%  (5m remaining)
```

### Slack Notification (if SLACK_WEBHOOK_URL set)

```json
{
  "text": "ToonNotes Build Complete",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*ToonNotes Build Complete*\nVersion: 1.2.3 (13)\nPlatform: iOS, Android"
      }
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*iOS*\nSUCCESS (12m)"},
        {"type": "mrkdwn", "text": "*Android*\nSUCCESS (8m)"}
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Builds"},
          "url": "https://expo.dev/accounts/creepyblues/projects/ToonNotes_Expo/builds"
        }
      ]
    }
  ]
}
```

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| EXPO_TOKEN | EAS authentication token | For CI/CD only |
| SLACK_WEBHOOK_URL | Slack notifications | No |
| APPLE_ID | Apple Developer email | Local builds only |
| APPLE_TEAM_ID | Apple Team ID | Local builds only |

## Tips

- Always run `--check` before important releases to validate configuration
- Use `--bump=build` for TestFlight iterations (same version, new build)
- Use `--bump=patch` for bug fix releases
- Monitor builds at https://expo.dev dashboard
- For faster iteration, use `preview` profile for internal testing
- Production builds take longer due to optimization; plan accordingly
- Android production MUST use AAB format (Play Store requirement)

## Related Skills

- `/test-mobile` - Run E2E tests before building
- `/deploy-staging` - Deploy web/API to staging
- `/health-check` - Verify system health
- `/aso-optimizer` - Optimize App Store listing before release
