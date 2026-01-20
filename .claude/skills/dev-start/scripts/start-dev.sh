#!/bin/bash
# start-dev.sh
# One-command ToonNotes development environment startup
# Usage: bash .claude/skills/dev-start/scripts/start-dev.sh [OPTIONS]
#
# Options:
#   --all       Start everything (website, webapp, API, Expo iOS)
#   --mobile    Mobile dev: API + Expo iOS (recommended for app dev)
#   --web       Web dev: website + webapp
#   --ios       Start Expo with iOS simulator
#   --android   Start Expo with Android emulator
#   --website   Start website only (port 3000)
#   --webapp    Start webapp only (port 3002)
#   --api       Start local API server only (port 3001)
#   --status    Check status of all services
#   --kill      Kill all dev processes

set -e

REPO_ROOT="/Users/sungholee/code/toonnotes"
EXPO_DIR="$REPO_ROOT/apps/expo"
WEB_DIR="$REPO_ROOT/apps/web"
WEBAPP_DIR="$REPO_ROOT/apps/webapp"

# Ports
WEBSITE_PORT=3000
API_PORT=3001
WEBAPP_PORT=3002
EXPO_PORT=6061

# Log files
WEBSITE_LOG="/tmp/toonnotes-website.log"
WEBAPP_LOG="/tmp/toonnotes-webapp.log"
API_LOG="/tmp/toonnotes-api.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}  ToonNotes Development Environment${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
}

print_mode() {
    echo -e "${CYAN}Mode: $1${NC}"
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

print_info() {
    echo -e "      ${CYAN}$1${NC}"
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

wait_for_port() {
    local port=$1
    local max_attempts=${2:-30}
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if check_port $port > /dev/null; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

status_check() {
    print_header
    echo "Checking development environment status..."
    echo ""

    # Check Website
    if check_port $WEBSITE_PORT > /dev/null; then
        print_ok "Website running on port $WEBSITE_PORT"
    else
        print_warn "Website not running"
    fi

    # Check API
    if check_port $API_PORT > /dev/null; then
        print_ok "Local API Server running on port $API_PORT"
    else
        print_warn "Local API Server not running"
    fi

    # Check Webapp
    if check_port $WEBAPP_PORT > /dev/null; then
        print_ok "Webapp running on port $WEBAPP_PORT"
    else
        print_warn "Webapp not running"
    fi

    # Check Expo
    if check_port $EXPO_PORT > /dev/null; then
        print_ok "Expo Dev Server running on port $EXPO_PORT"
    else
        print_warn "Expo Dev Server not running"
    fi

    # Check iOS Simulator
    if xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
        local sim_name=$(xcrun simctl list devices booted | grep "Booted" | head -1 | sed 's/.*\(iPhone[^(]*\).*/\1/' | xargs)
        print_ok "iOS Simulator: $sim_name"
    else
        print_warn "No iOS Simulator booted"
    fi

    # Check Android Emulator
    if command -v adb &> /dev/null && adb devices | grep -q "emulator"; then
        print_ok "Android Emulator running"
    else
        print_warn "No Android Emulator running"
    fi

    echo ""
    echo "Logs:"
    echo "  Website: tail -f $WEBSITE_LOG"
    echo "  Webapp:  tail -f $WEBAPP_LOG"
    echo "  API:     tail -f $API_LOG"
    echo ""
}

kill_all() {
    print_header
    print_mode "Killing all processes"

    print_step 1 4 "Killing Website"
    if kill_port $WEBSITE_PORT; then
        print_ok "Killed process on port $WEBSITE_PORT"
    else
        print_ok "Port $WEBSITE_PORT clear"
    fi

    print_step 2 4 "Killing Local API Server"
    if kill_port $API_PORT; then
        print_ok "Killed process on port $API_PORT"
    else
        print_ok "Port $API_PORT clear"
    fi

    print_step 3 4 "Killing Webapp"
    if kill_port $WEBAPP_PORT; then
        print_ok "Killed process on port $WEBAPP_PORT"
    else
        print_ok "Port $WEBAPP_PORT clear"
    fi

    print_step 4 4 "Killing Expo Dev Server"
    if kill_port $EXPO_PORT; then
        print_ok "Killed process on port $EXPO_PORT"
    else
        print_ok "Port $EXPO_PORT clear"
    fi

    # Also kill by process name
    pkill -f "expo start" 2>/dev/null || true
    pkill -f "local-api-server" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true

    echo ""
    echo -e "${GREEN}All development processes killed.${NC}"
}

start_website() {
    cd "$WEB_DIR"

    # Kill existing
    kill_port $WEBSITE_PORT > /dev/null 2>&1 || true

    # Start in background
    nohup npm run dev > "$WEBSITE_LOG" 2>&1 &
    local pid=$!

    # Wait for startup
    if wait_for_port $WEBSITE_PORT 15; then
        print_ok "Website started (PID: $pid)"
        print_info "URL: http://localhost:$WEBSITE_PORT"
        print_info "Logs: $WEBSITE_LOG"
        return 0
    else
        print_fail "Website failed to start. Check: tail -f $WEBSITE_LOG"
        return 1
    fi
}

start_webapp() {
    cd "$WEBAPP_DIR"

    # Kill existing
    kill_port $WEBAPP_PORT > /dev/null 2>&1 || true

    # Start in background on port 3002
    nohup npm run dev -- --port $WEBAPP_PORT > "$WEBAPP_LOG" 2>&1 &
    local pid=$!

    # Wait for startup
    if wait_for_port $WEBAPP_PORT 15; then
        print_ok "Webapp started (PID: $pid)"
        print_info "URL: http://localhost:$WEBAPP_PORT"
        print_info "Logs: $WEBAPP_LOG"
        return 0
    else
        print_fail "Webapp failed to start. Check: tail -f $WEBAPP_LOG"
        return 1
    fi
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
        print_info "URL: http://localhost:$API_PORT"
        print_info "Logs: $API_LOG"
        return 0
    else
        print_fail "API server failed to start. Check: tail -f $API_LOG"
        return 1
    fi
}

start_expo_ios() {
    cd "$EXPO_DIR"

    # Kill existing
    kill_port $EXPO_PORT > /dev/null 2>&1 || true

    print_ok "Starting Expo with iOS simulator..."
    echo ""

    # Run Expo (this will take over the terminal)
    npm run ios
}

start_expo_android() {
    cd "$EXPO_DIR"

    # Kill existing
    kill_port $EXPO_PORT > /dev/null 2>&1 || true

    print_ok "Starting Expo with Android emulator..."
    echo ""

    # Run Expo (this will take over the terminal)
    npm run android
}

print_summary() {
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}  Environment Ready!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "Services:"

    if check_port $WEBSITE_PORT > /dev/null; then
        echo -e "  Website:      ${GREEN}http://localhost:$WEBSITE_PORT${NC}"
    fi
    if check_port $WEBAPP_PORT > /dev/null; then
        echo -e "  Webapp:       ${GREEN}http://localhost:$WEBAPP_PORT${NC}"
    fi
    if check_port $API_PORT > /dev/null; then
        echo -e "  Local API:    ${GREEN}http://localhost:$API_PORT${NC}"
    fi
    if check_port $EXPO_PORT > /dev/null; then
        echo -e "  Expo Dev:     ${GREEN}http://localhost:$EXPO_PORT${NC}"
    fi

    echo ""
    echo "Logs:"
    echo "  tail -f $WEBSITE_LOG"
    echo "  tail -f $WEBAPP_LOG"
    echo "  tail -f $API_LOG"
    echo ""
}

main() {
    local mode="${1:-interactive}"

    case "$mode" in
        --status)
            status_check
            exit 0
            ;;
        --kill)
            kill_all
            exit 0
            ;;
        --api)
            print_header
            print_mode "API Only"
            print_step 1 1 "Starting Local API Server"
            start_api
            echo ""
            echo "API server running. View logs with: tail -f $API_LOG"
            exit 0
            ;;
        --website)
            print_header
            print_mode "Website Only"
            print_step 1 1 "Starting Website"
            start_website
            exit 0
            ;;
        --webapp)
            print_header
            print_mode "Webapp Only"
            print_step 1 1 "Starting Webapp"
            start_webapp
            exit 0
            ;;
        --ios)
            print_header
            print_mode "Expo iOS Only"
            print_step 1 1 "Starting Expo with iOS Simulator"
            start_expo_ios
            exit 0
            ;;
        --android)
            print_header
            print_mode "Expo Android Only"
            print_step 1 1 "Starting Expo with Android Emulator"
            start_expo_android
            exit 0
            ;;
        --web)
            print_header
            print_mode "Web Development (Website + Webapp)"

            print_step 1 3 "Cleaning up existing processes"
            if kill_port $WEBSITE_PORT; then
                print_ok "Killed website on :$WEBSITE_PORT"
            else
                print_ok "Port $WEBSITE_PORT clear"
            fi
            if kill_port $WEBAPP_PORT; then
                print_ok "Killed webapp on :$WEBAPP_PORT"
            else
                print_ok "Port $WEBAPP_PORT clear"
            fi

            print_step 2 3 "Starting Website"
            start_website || print_warn "Website skipped"

            print_step 3 3 "Starting Webapp"
            start_webapp || print_warn "Webapp skipped"

            print_summary
            exit 0
            ;;
        --mobile)
            print_header
            print_mode "Mobile Development (API + Expo iOS)"

            print_step 1 3 "Cleaning up existing processes"
            if kill_port $API_PORT; then
                print_ok "Killed API on :$API_PORT"
            else
                print_ok "Port $API_PORT clear"
            fi
            if kill_port $EXPO_PORT; then
                print_ok "Killed Expo on :$EXPO_PORT"
            else
                print_ok "Port $EXPO_PORT clear"
            fi

            print_step 2 3 "Starting Local API Server"
            start_api || print_warn "API server skipped (optional)"

            print_step 3 3 "Starting Expo with iOS Simulator"
            start_expo_ios
            ;;
        --all)
            print_header
            print_mode "Full Stack (Website + Webapp + API + Expo iOS)"

            print_step 1 5 "Cleaning up existing processes"
            if kill_port $WEBSITE_PORT; then
                print_ok "Killed website on :$WEBSITE_PORT"
            else
                print_ok "Port $WEBSITE_PORT clear"
            fi
            if kill_port $API_PORT; then
                print_ok "Killed API on :$API_PORT"
            else
                print_ok "Port $API_PORT clear"
            fi
            if kill_port $WEBAPP_PORT; then
                print_ok "Killed webapp on :$WEBAPP_PORT"
            else
                print_ok "Port $WEBAPP_PORT clear"
            fi
            if kill_port $EXPO_PORT; then
                print_ok "Killed Expo on :$EXPO_PORT"
            else
                print_ok "Port $EXPO_PORT clear"
            fi

            print_step 2 5 "Starting Website"
            start_website || print_warn "Website skipped"

            print_step 3 5 "Starting Webapp"
            start_webapp || print_warn "Webapp skipped"

            print_step 4 5 "Starting Local API Server"
            start_api || print_warn "API server skipped (optional)"

            print_step 5 5 "Starting Expo with iOS Simulator"
            start_expo_ios
            ;;
        *)
            # Default: same as --mobile (most common use case)
            print_header
            print_mode "Mobile Development (default)"
            echo "Tip: Use --all for full stack, --web for website development"
            echo ""

            print_step 1 3 "Cleaning up existing processes"
            if kill_port $API_PORT; then
                print_ok "Killed API on :$API_PORT"
            else
                print_ok "Port $API_PORT clear"
            fi
            if kill_port $EXPO_PORT; then
                print_ok "Killed Expo on :$EXPO_PORT"
            else
                print_ok "Port $EXPO_PORT clear"
            fi

            print_step 2 3 "Starting Local API Server"
            start_api || print_warn "API server skipped (optional)"

            print_step 3 3 "Starting Expo with iOS Simulator"
            start_expo_ios
            ;;
    esac
}

# Run main function with all arguments
main "$@"
