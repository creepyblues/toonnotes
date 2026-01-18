#!/bin/bash
# detect_emulators.sh
# List available Android Emulators (AVDs) in JSON format

set -e

# Check ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    # Try common locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "$HOME/Android/Sdk" ]; then
        ANDROID_HOME="$HOME/Android/Sdk"
    else
        echo '{"error": "ANDROID_HOME not set and SDK not found in default locations", "emulators": []}'
        exit 1
    fi
fi

EMULATOR_PATH="$ANDROID_HOME/emulator/emulator"

# Check if emulator exists
if [ ! -f "$EMULATOR_PATH" ]; then
    echo '{"error": "Android emulator not found at '$EMULATOR_PATH'", "emulators": []}'
    exit 1
fi

# Get list of AVDs
AVD_LIST=$("$EMULATOR_PATH" -list-avds 2>/dev/null || echo "")

# Check for running emulators
RUNNING_EMULATORS=""
if command -v adb &> /dev/null; then
    RUNNING_EMULATORS=$(adb devices 2>/dev/null | grep "emulator-" | cut -f1 || echo "")
fi

# Format as JSON
python3 -c "
import json

avd_list = '''$AVD_LIST'''.strip().split('\n')
running = '''$RUNNING_EMULATORS'''.strip().split('\n')

emulators = []
for avd in avd_list:
    if avd:
        emulators.append({
            'name': avd,
            'isRunning': False  # Would need more complex check to determine this
        })

result = {
    'count': len(emulators),
    'android_home': '$ANDROID_HOME',
    'running_count': len([r for r in running if r]),
    'emulators': emulators
}

print(json.dumps(result, indent=2))
"
