#!/bin/bash
# detect_simulators.sh
# List available iOS Simulators in JSON format

set -e

# Check if running on macOS
if [ "$(uname)" != "Darwin" ]; then
    echo '{"error": "iOS simulators are only available on macOS", "simulators": []}'
    exit 1
fi

# Check if xcrun is available
if ! command -v xcrun &> /dev/null; then
    echo '{"error": "Xcode Command Line Tools not installed", "simulators": []}'
    exit 1
fi

# Get simulators and format as JSON
xcrun simctl list devices available --json 2>/dev/null | python3 -c "
import sys
import json

try:
    data = json.load(sys.stdin)
    simulators = []

    for runtime, devices in data.get('devices', {}).items():
        # Extract runtime name (e.g., 'iOS-17-2' from 'com.apple.CoreSimulator.SimRuntime.iOS-17-2')
        runtime_name = runtime.split('.')[-1].replace('-', ' ').replace('iOS ', 'iOS ')

        for device in devices:
            if device.get('isAvailable', False):
                simulators.append({
                    'name': device['name'],
                    'udid': device['udid'],
                    'state': device['state'],
                    'runtime': runtime_name,
                    'isBooted': device['state'] == 'Booted'
                })

    # Sort by runtime (newest first) then by name
    simulators.sort(key=lambda x: (x['runtime'], x['name']), reverse=True)

    result = {
        'count': len(simulators),
        'simulators': simulators
    }

    print(json.dumps(result, indent=2))

except json.JSONDecodeError:
    print(json.dumps({'error': 'Failed to parse simulator list', 'simulators': []}))
except Exception as e:
    print(json.dumps({'error': str(e), 'simulators': []}))
"
