#!/bin/bash
# start-dev.sh
# One-command ToonNotes Expo development environment startup
# Usage: bash .claude/skills/dev-start/scripts/start-dev.sh [--quick|--api-only|--expo-only|--status|--kill]

set -e

EXPO_DIR="/Users/sungholee/code/toonnotes/apps/expo"
EXPO_PORT=6061
API_PORT=3001
API_LOG="/tmp/toonnotes-api.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}  ToonNotes Development Environment${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
}

print_step() {
    local step=$1
    local total=$2
    local message=$3
    echo -e "${BLUE}[$step/$total]${NC} $message"
}

print_ok() {
    echo -e "      ${GREEN}[OK]${NC} $1"
}

print_warn() {
    echo -e "      ${YELLOW}[WARN]${NC} $1"
}

print_fail() {
    echo -e "      ${RED}[FAIL]${NC} $1"
}

check_port() {
    local port=$1
    lsof -ti :$port 2>/dev/null
}

kill_port() {
    local port=$1
    local pids=$(check_port $port)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null || true
        return 0
    fi
    return 1
}

status_check() {
    print_header
    echo "Checking development environment status..."
    echo ""

    # Check Expo
    if check_port $EXPO_PORT > /dev/null; then
        print_ok "Expo Dev Server running on port $EXPO_PORT"
    else
        print_warn "Expo Dev Server not running"
    fi

    # Check API
    if check_port $API_PORT > /dev/null; then
        print_ok "Local API Server running on port $API_PORT"
    else
        print_warn "Local API Server not running (optional)"
    fi

    # Check Simulator
    if xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
        local sim_name=$(xcrun simctl list devices booted | grep "Booted" | head -1 | sed 's/.*\(iPhone[^(]*\).*/\1/' | xargs)
        print_ok "iOS Simulator: $sim_name"
    else
        print_warn "No iOS Simulator booted"
    fi

    echo ""
}

kill_all() {
    print_header
    print_step 1 2 "Killing Expo Dev Server"
    if kill_port $EXPO_PORT; then
        print_ok "Killed process on port $EXPO_PORT"
    else
        print_ok "No process on port $EXPO_PORT"
    fi

    print_step 2 2 "Killing Local API Server"
    if kill_port $API_PORT; then
        print_ok "Killed process on port $API_PORT"
    else
        print_ok "No process on port $API_PORT"
    fi

    # Also kill by process name
    pkill -f "expo start" 2>/dev/null || true
    pkill -f "local-api-server" 2>/dev/null || true

    echo ""
    echo -e "${GREEN}All development processes killed.${NC}"
}

start_api() {
    cd "$EXPO_DIR"

    # Kill existing
    kill_port $API_PORT > /dev/null 2>&1 || true

    # Start in background
    nohup npm run api > "$API_LOG" 2>&1 &
    local api_pid=$!

    # Wait for startup
    sleep 2

    # Verify
    if check_port $API_PORT > /dev/null; then
        print_ok "Local API server started (PID: $api_pid)"
        print_ok "Logs: $API_LOG"
        return 0
    else
        print_fail "API server failed to start. Check: tail -f $API_LOG"
        return 1
    fi
}

start_expo() {
    cd "$EXPO_DIR"

    # Kill existing
    kill_port $EXPO_PORT > /dev/null 2>&1 || true

    print_ok "Starting Expo with iOS simulator..."
    echo ""

    # Run Expo (this will take over the terminal)
    npm run ios
}

main() {
    local mode="${1:-full}"

    case "$mode" in
        --status)
            status_check
            exit 0
            ;;
        --kill)
            kill_all
            exit 0
            ;;
        --api-only)
            print_header
            print_step 1 1 "Starting Local API Server"
            start_api
            echo ""
            echo "API server running. View logs with: tail -f $API_LOG"
            exit 0
            ;;
        --expo-only)
            print_header
            print_step 1 2 "Killing existing Expo process"
            if kill_port $EXPO_PORT; then
                print_ok "Killed process on port $EXPO_PORT"
            else
                print_ok "Port $EXPO_PORT clear"
            fi

            print_step 2 2 "Starting Expo Dev Server"
            start_expo
            exit 0
            ;;
        --quick)
            print_header
            print_step 1 3 "Quick restart - killing processes"
            kill_port $EXPO_PORT && print_ok "Killed Expo" || print_ok "Expo port clear"
            kill_port $API_PORT && print_ok "Killed API" || print_ok "API port clear"

            print_step 2 3 "Starting Local API Server"
            start_api || true

            print_step 3 3 "Starting Expo Dev Server"
            start_expo
            ;;
        *)
            # Full start (default)
            print_header

            print_step 1 4 "Cleaning up existing processes"
            if kill_port $EXPO_PORT; then
                print_ok "Killed Expo on :$EXPO_PORT"
            else
                print_ok "Port $EXPO_PORT clear"
            fi
            if kill_port $API_PORT; then
                print_ok "Killed API on :$API_PORT"
            else
                print_ok "Port $API_PORT clear"
            fi

            print_step 2 4 "Starting Local API Server"
            start_api || print_warn "API server skipped (optional)"

            print_step 3 4 "Starting Expo Dev Server with iOS"
            start_expo

            # Step 4 would be verification but Expo takes over terminal
            ;;
    esac
}

# Run main function with all arguments
main "$@"
