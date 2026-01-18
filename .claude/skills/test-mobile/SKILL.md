---
name: test-mobile
description: Runs E2E/integration tests and build verification on mobile simulators (iOS Simulator and Android Emulator) for the ToonNotes Expo React Native app using Maestro. This skill should be used when testing mobile app functionality, verifying builds before release, running automated UI tests on simulators/emulators, or generating E2E tests for new screens.
---

# Test Mobile

Mobile E2E testing and build verification skill using Maestro for the ToonNotes Expo app.

## When to Use This Skill

- Before app store submissions to verify functionality
- After major feature implementations
- As part of CI/CD pipeline for mobile testing
- When debugging mobile-specific issues
- To verify app builds and launches correctly
- To generate E2E tests for new screens

## Prerequisites

### Required Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| Maestro | E2E test runner | `curl -Ls "https://get.maestro.mobile.dev" \| bash` |
| Xcode | iOS builds/simulator | App Store (macOS only) |
| Android Studio | Android builds/emulator | developer.android.com |
| EAS CLI | Expo builds | `npm install -g eas-cli` |
| Node.js | Runtime | nodejs.org |

### Prerequisite Check

Run the prerequisite check script:

```bash
bash .claude/skills/test-mobile/scripts/check_prerequisites.sh
```

## Commands

### Full Test Suite

```
/test-mobile                        # Run all Maestro flows on default device
/test-mobile --ios                  # iOS Simulator only
/test-mobile --android              # Android Emulator only
```

### Build & Launch Verification

```
/test-mobile --build                # Build verification only (no tests)
/test-mobile --build --ios          # iOS build only
/test-mobile --build --android      # Android build only
/test-mobile --launch               # Launch verification only
```

### Specific Flow Execution

```
/test-mobile --flow=app-launch      # Run specific flow
/test-mobile --flow=create-note     # Run note creation flow
/test-mobile --flow=*.yaml          # Run all flows
```

### Device Selection

```
/test-mobile --device="iPhone 15"        # Specify iOS Simulator
/test-mobile --emulator="Pixel_7"        # Specify Android AVD
/test-mobile --list-devices              # List available simulators/emulators
```

### Debugging

```
/test-mobile --debug                # Run with verbose Maestro output
/test-mobile --record               # Record video of test run
```

## Available Test Flows

| Flow | Description | Screens Tested |
|------|-------------|----------------|
| `app-launch.yaml` | Basic launch verification | Splash, Home, Tab bar |
| `create-note.yaml` | Note creation flow | Home, Editor |
| `note-editor.yaml` | Editor functionality | Editor (text, checklist, bullet) |
| `search-notes.yaml` | Search functionality | Home (search bar) |
| `boards-navigation.yaml` | Boards tab navigation | Boards, Board detail |
| `settings.yaml` | Settings screen | Settings tab |

## Build Verification Workflow

### iOS Build

1. Check Xcode installation and simulators
2. Run prebuild: `npx expo prebuild --platform ios`
3. Build app: `npx expo run:ios --device`
4. Verify successful build output

### Android Build

1. Check Android SDK and emulators
2. Run prebuild: `npx expo prebuild --platform android`
3. Build app: `npx expo run:android --device`
4. Verify successful build output

### Commands Used

```bash
# iOS
cd apps/expo
npx expo prebuild --platform ios --clean
npx expo run:ios --device "iPhone 15"

# Android
cd apps/expo
npx expo prebuild --platform android --clean
npx expo run:android --device "Pixel_7"
```

## Launch Verification Workflow

### iOS Simulator

1. Detect available simulators: `xcrun simctl list devices`
2. Boot selected simulator if not running
3. Install and launch app
4. Verify initial screen loads

### Android Emulator

1. Detect available AVDs: `emulator -list-avds`
2. Start emulator if not running
3. Install APK and launch
4. Verify initial screen loads

## Running Maestro Tests

### Setup (First Time)

1. Install Maestro:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. Copy flow templates to app directory:
   ```bash
   mkdir -p apps/expo/.maestro/flows
   cp .claude/skills/test-mobile/templates/flows/*.yaml apps/expo/.maestro/flows/
   cp .claude/skills/test-mobile/templates/maestro-config.yaml apps/expo/.maestro/config.yaml
   ```

3. Ensure app is running on simulator/emulator

### Running Tests

```bash
# Single flow
cd apps/expo
maestro test .maestro/flows/app-launch.yaml

# All flows
maestro test .maestro/flows/

# With specific device
maestro test --device "iPhone 15" .maestro/flows/

# With recording
maestro record .maestro/flows/create-note.yaml
```

### Test Execution Pattern

```
1. Prerequisites check (scripts/check_prerequisites.sh)
2. Device detection (scripts/detect_simulators.sh or detect_emulators.sh)
3. Build if needed (npx expo run:ios/android)
4. Wait for app launch
5. Execute Maestro flows
6. Parse results (scripts/parse_results.py)
7. Generate summary report
```

## Result Reporting

### Console Output Format

```
Test Results - ToonNotes Mobile E2E
===================================
Platform: iOS (iPhone 15 Pro)
Flows Run: 6
Duration: 2m 34s

Results:
  [PASS] app-launch (12s)
  [PASS] create-note (45s)
  [PASS] note-editor (38s)
  [FAIL] search-notes (timeout)
  [PASS] boards-navigation (41s)
  [PASS] settings (18s)

Summary: 5/6 passed (83%)

Failed Tests:
  search-notes:
    - Step: assertVisible "Search"
    - Error: Element not found within 5000ms
    - Screenshot: ./test-results/search-notes-failure.png
```

### JSON Output

Use `--output json` flag for machine-readable results:

```json
{
  "platform": "iOS",
  "device": "iPhone 15 Pro",
  "total": 6,
  "passed": 5,
  "failed": 1,
  "duration_ms": 154000,
  "results": [
    {"name": "app-launch", "status": "passed", "duration_ms": 12000},
    {"name": "search-notes", "status": "failed", "error": "Element not found"}
  ]
}
```

## Writing Custom Flows

### Basic Flow Structure

```yaml
# Flow name and description
appId: com.toonnotes.app

---
# Commands execute sequentially
- launchApp

- extendedWaitUntil:
    visible: "Expected Text"
    timeout: 10000

- tapOn: "Button Text"

- inputText: "Text to type"

- assertVisible: "Success Message"
```

### Common Commands

| Command | Description |
|---------|-------------|
| `launchApp` | Launch the app |
| `tapOn` | Tap element by text or id |
| `inputText` | Type text into focused field |
| `assertVisible` | Assert element is visible |
| `extendedWaitUntil` | Wait for element with timeout |
| `back` | Press back button |
| `scroll` | Scroll in direction |

### Using Accessibility IDs

Prefer accessibility labels for stable selectors:

```yaml
- tapOn:
    id: "Create new note"

- assertVisible:
    id: "Note editor"
```

See `references/accessibility-ids.md` for ToonNotes component mapping.

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Maestro not found` | Not installed | Run installation command |
| `No simulators found` | Xcode not configured | Open Xcode > Preferences > Platforms |
| `Build fails` | Stale dependencies | Run `npx expo prebuild --clean` |
| `Element not found` | Missing testID | Add `accessibilityLabel` to component |
| `Timeout waiting` | App slow to load | Increase timeout in flow |
| `ANDROID_HOME not set` | SDK not configured | Set environment variable |

### Debug Mode

Run Maestro with debug output:

```bash
maestro test --debug .maestro/flows/app-launch.yaml
```

### Recording Tests

Record video of test execution:

```bash
maestro record .maestro/flows/create-note.yaml
```

### Viewing Maestro Studio

Interactive test builder:

```bash
maestro studio
```

## CI/CD Integration

### GitHub Actions Example

```yaml
jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - run: cd apps/expo && npx expo prebuild --platform ios
      - run: cd apps/expo && npx expo run:ios --device "iPhone 15"
      - run: maestro test apps/expo/.maestro/flows/
```

### EAS Build Integration

Add to `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

## Related Skills

- `/test-e2e` - Web Playwright E2E tests
- `/deploy-staging` - Deploy before testing
- `/health-check` - Quick health verification

## App Details

- **App ID**: `com.toonnotes.app` (iOS and Android)
- **App Name**: ToonNotes
- **Framework**: Expo SDK 54 / React Native
- **Expo Project**: `apps/expo/`

---

## Tested & Verified (January 2026)

This section documents actual test results and learnings from running Maestro on ToonNotes.

### Environment Tested

- **Maestro Version**: 2.1.0
- **iOS Simulator**: iPhone 17 Pro (iOS 26.2)
- **Device UDID**: `CB0A56CE-CD13-4E06-AABE-60B586990451`

### Working Test Example

```yaml
appId: com.toonnotes.app

---
- launchApp

- extendedWaitUntil:
    visible: "Recent"
    timeout: 15000

- assertVisible: "Recent"
```

**Result**: PASSED

### Key Learnings

#### 1. Always Specify Device UDID

If a physical iPhone is connected, Maestro defaults to it instead of the simulator. Always use `--udid`:

```bash
# Get simulator UDID
xcrun simctl list devices booted

# Run with specific simulator
maestro test --udid CB0A56CE-CD13-4E06-AABE-60B586990451 .maestro/flows/app-launch.yaml
```

#### 2. Logo Text Not Searchable as "ToonNotes"

The ToonNotes logo renders each letter as a separate `<Text>` element with individual colors. Maestro cannot find "ToonNotes" as a single string.

**Don't use**:
```yaml
- assertVisible: "ToonNotes"  # FAILS - text is split into letters
```

**Use instead**:
```yaml
- assertVisible: "Recent"     # WORKS - visible section header
```

#### 3. Working Selectors for Home Screen

| Selector | Works | Notes |
|----------|-------|-------|
| `"Recent"` | Yes | Section header on home screen |
| `"ToonNotes"` | No | Logo renders letters separately |
| `"Notes"` (tab) | Needs verification | Tab bar accessibility |
| `id: "Create new note"` | Needs verification | FAB button |

#### 4. Simulator Lock Screen Issue

If the simulator is locked, Maestro captures the lock screen instead of the app. Solutions:

```bash
# Option 1: Launch app directly first
xcrun simctl launch <UDID> com.toonnotes.app

# Option 2: Bring simulator to foreground
open -a Simulator

# Option 3: Use AppleScript to unlock
osascript -e 'tell application "Simulator" to activate'
```

### Debug Artifacts Location

Maestro saves screenshots and logs to:
```
~/.maestro/tests/YYYY-MM-DD_HHMMSS/
├── screenshot-❌-*.png      # Failure screenshots
├── commands-*.json          # Command execution log
└── maestro.log              # Full debug log
```

### Recommended Test Flow Pattern

Based on testing, this pattern works reliably:

```yaml
appId: com.toonnotes.app

---
# 1. Launch without clearing state (faster)
- launchApp

# 2. Wait for a KNOWN VISIBLE element
- extendedWaitUntil:
    visible: "Recent"
    timeout: 15000

# 3. Assert the same element
- assertVisible: "Recent"

# 4. Additional assertions using visible text (not accessibility IDs until verified)
```

### Commands Reference

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to PATH (add to ~/.zshrc for persistence)
export PATH="$PATH":"$HOME/.maestro/bin"

# List booted simulators
xcrun simctl list devices booted

# Run test on specific simulator
maestro test --udid <SIMULATOR_UDID> .maestro/flows/app-launch.yaml

# Run all flows
maestro test --udid <SIMULATOR_UDID> .maestro/flows/

# Interactive test builder
maestro studio
```
