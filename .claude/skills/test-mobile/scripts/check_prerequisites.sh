#!/bin/bash
# check_prerequisites.sh
# Verify all required tools for mobile E2E testing are installed

set -e

echo "=========================================="
echo "  ToonNotes Mobile Testing Prerequisites"
echo "=========================================="
echo ""

MISSING_TOOLS=0

check_tool() {
    local name="$1"
    local command="$2"
    local install_hint="$3"

    if command -v "$command" &> /dev/null; then
        local version=$("$command" --version 2>&1 | head -1)
        echo "[OK]    $name"
        echo "        Version: $version"
    else
        echo "[FAIL]  $name not found"
        echo "        Install: $install_hint"
        MISSING_TOOLS=$((MISSING_TOOLS + 1))
    fi
    echo ""
}

# Check Maestro
echo "Checking Maestro..."
if command -v maestro &> /dev/null; then
    echo "[OK]    Maestro"
    echo "        Version: $(maestro --version 2>&1)"
else
    echo "[FAIL]  Maestro not found"
    echo "        Install: curl -Ls \"https://get.maestro.mobile.dev\" | bash"
    MISSING_TOOLS=$((MISSING_TOOLS + 1))
fi
echo ""

# Check Node.js
check_tool "Node.js" "node" "https://nodejs.org"

# Check npm
check_tool "npm" "npm" "Comes with Node.js"

# Check EAS CLI
echo "Checking EAS CLI..."
if command -v eas &> /dev/null; then
    echo "[OK]    EAS CLI"
    echo "        Version: $(eas --version 2>&1)"
else
    echo "[WARN]  EAS CLI not found (optional for local builds)"
    echo "        Install: npm install -g eas-cli"
fi
echo ""

# macOS-specific checks
if [ "$(uname)" == "Darwin" ]; then
    echo "--- iOS Development (macOS) ---"
    echo ""

    # Check Xcode
    if xcode-select -p &> /dev/null; then
        echo "[OK]    Xcode Command Line Tools"
        echo "        Path: $(xcode-select -p)"

        if command -v xcodebuild &> /dev/null; then
            echo "[OK]    Xcode"
            echo "        Version: $(xcodebuild -version | head -1)"
        fi
    else
        echo "[FAIL]  Xcode Command Line Tools not found"
        echo "        Install: xcode-select --install"
        MISSING_TOOLS=$((MISSING_TOOLS + 1))
    fi
    echo ""

    # Check for iOS Simulators
    echo "Checking iOS Simulators..."
    if command -v xcrun &> /dev/null; then
        SIMULATOR_COUNT=$(xcrun simctl list devices available --json 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(sum(len(v) for v in data.get('devices', {}).values()))" 2>/dev/null || echo "0")
        if [ "$SIMULATOR_COUNT" -gt 0 ]; then
            echo "[OK]    iOS Simulators available: $SIMULATOR_COUNT devices"
        else
            echo "[WARN]  No iOS Simulators found"
            echo "        Add via: Xcode > Preferences > Platforms"
        fi
    fi
    echo ""
fi

# Android checks
echo "--- Android Development ---"
echo ""

# Check ANDROID_HOME
if [ -n "$ANDROID_HOME" ]; then
    echo "[OK]    ANDROID_HOME is set"
    echo "        Path: $ANDROID_HOME"
else
    echo "[WARN]  ANDROID_HOME not set"
    echo "        Set in ~/.zshrc or ~/.bashrc:"
    echo "        export ANDROID_HOME=\$HOME/Library/Android/sdk"
fi
echo ""

# Check for Android emulator
if [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/emulator/emulator" ]; then
    echo "[OK]    Android Emulator found"

    AVD_COUNT=$("$ANDROID_HOME/emulator/emulator" -list-avds 2>/dev/null | grep -c "." || echo "0")
    if [ "$AVD_COUNT" -gt 0 ]; then
        echo "[OK]    Android AVDs available: $AVD_COUNT devices"
    else
        echo "[WARN]  No Android AVDs found"
        echo "        Create via: Android Studio > Device Manager"
    fi
else
    echo "[WARN]  Android Emulator not found"
    echo "        Install via Android Studio"
fi
echo ""

# Check adb
if command -v adb &> /dev/null; then
    echo "[OK]    adb"
    echo "        Version: $(adb --version | head -1)"
else
    echo "[WARN]  adb not found (optional)"
fi
echo ""

# Summary
echo "=========================================="
echo "  Summary"
echo "=========================================="
if [ $MISSING_TOOLS -eq 0 ]; then
    echo "[OK]    All required tools are installed!"
    echo ""
    echo "Next steps:"
    echo "  1. Ensure iOS Simulator or Android Emulator is running"
    echo "  2. Build the app: cd apps/expo && npx expo run:ios"
    echo "  3. Run tests: maestro test .maestro/flows/"
    exit 0
else
    echo "[FAIL]  Missing $MISSING_TOOLS required tool(s)"
    echo "        Please install missing tools and run this check again."
    exit 1
fi
