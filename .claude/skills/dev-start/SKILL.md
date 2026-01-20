---
name: dev-start
description: Starts the ToonNotes Expo development environment with clean state by killing existing processes, starting local API server, launching Expo dev server with iOS simulator, and verifying readiness. This skill should be used when starting development, after port conflicts, or when seeing "API error" messages.
---

# Dev Start

This skill provides a one-command solution to start the ToonNotes development environment across all platforms: website, webapp, iOS simulator, and Android emulator.

## When to Use This Skill

- Starting a new development session
- After seeing "API error" or port conflict errors
- When simulators show stale content
- After restarting your machine
- When any dev server fails with "port already in use"
- To ensure all development services are running correctly

## Prerequisites

- Node.js 18+
- pnpm installed (`npm install -g pnpm`)
- Xcode installed with iOS Simulator (for iOS development)
- Android Studio with emulator (for Android development)
- The ToonNotes repo cloned

## Commands

```
/dev-start                  # Interactive mode - choose what to start
/dev-start --all            # Start everything (website, webapp, API, Expo iOS)
/dev-start --mobile         # Mobile dev: API + Expo iOS (recommended for app dev)
/dev-start --web            # Web dev: website + webapp
/dev-start --ios            # Start Expo with iOS simulator
/dev-start --android        # Start Expo with Android emulator
/dev-start --website        # Start website only (port 3000)
/dev-start --webapp         # Start webapp only (port 3002)
/dev-start --api            # Start local API server only (port 3001)
/dev-start --status         # Check status of all services
/dev-start --kill           # Kill all dev processes
```

## Development Environment Components

| Component | Port | Directory | Purpose |
|-----------|------|-----------|---------|
| Website | 3000 | `apps/web` | Marketing site, dev diary |
| Local API | 3001 | `apps/expo` | Gemini AI proxy for mobile |
| Webapp | 3002 | `apps/webapp` | Web dashboard |
| Expo Dev | 6061 | `apps/expo` | Metro bundler for mobile |
| iOS Simulator | - | - | Runs iOS app |
| Android Emulator | - | - | Runs Android app |

### Port Allocation Strategy

| Port | Service | Notes |
|------|---------|-------|
| 3000 | Website (Next.js) | Marketing & diary pages |
| 3001 | Local API Server | AI endpoints for Expo |
| 3002 | Webapp (Next.js) | Web dashboard (shifted from 3001) |
| 6061 | Expo Dev Server | Metro bundler |

## Startup Modes

### Mobile Development (`/dev-start --mobile`)

Best for developing the iOS/Android app:

1. Kills existing processes on ports 3001 and 6061
2. Starts local API server (background, port 3001)
3. Starts Expo dev server with iOS simulator

```
Services started:
  - Local API: http://localhost:3001
  - Expo Dev: http://localhost:6061
  - iOS Simulator: Running
```

### Web Development (`/dev-start --web`)

Best for developing website or webapp:

1. Kills existing processes on ports 3000 and 3002
2. Starts website (background, port 3000)
3. Starts webapp (background, port 3002)

```
Services started:
  - Website: http://localhost:3000
  - Webapp: http://localhost:3002
```

### Full Stack (`/dev-start --all`)

Starts everything for comprehensive testing:

1. Kills all existing dev processes
2. Starts website (background, port 3000)
3. Starts webapp (background, port 3002)
4. Starts local API server (background, port 3001)
5. Starts Expo with iOS simulator (foreground)

## Startup Workflow

When `/dev-start` is invoked, execute these steps based on the mode:

### Step 1: Kill Existing Processes

```bash
# Kill by port
lsof -ti :3000 | xargs kill -9 2>/dev/null || true  # Website
lsof -ti :3001 | xargs kill -9 2>/dev/null || true  # Local API
lsof -ti :3002 | xargs kill -9 2>/dev/null || true  # Webapp
lsof -ti :6061 | xargs kill -9 2>/dev/null || true  # Expo

# Kill by process name
pkill -f "expo start" 2>/dev/null || true
pkill -f "local-api-server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
```

### Step 2: Start Services

```bash
REPO_ROOT="/Users/sungholee/code/toonnotes"

# Website (background)
cd "$REPO_ROOT/apps/web"
nohup npm run dev > /tmp/toonnotes-website.log 2>&1 &

# Webapp on port 3002 (background)
cd "$REPO_ROOT/apps/webapp"
nohup npm run dev -- --port 3002 > /tmp/toonnotes-webapp.log 2>&1 &

# Local API (background)
cd "$REPO_ROOT/apps/expo"
nohup npm run api > /tmp/toonnotes-api.log 2>&1 &

# Expo with iOS (foreground - takes over terminal)
cd "$REPO_ROOT/apps/expo"
npm run ios
```

### Step 3: Verify Environment

```bash
# Check all services
lsof -i :3000 > /dev/null && echo "[OK] Website on :3000"
lsof -i :3001 > /dev/null && echo "[OK] API on :3001"
lsof -i :3002 > /dev/null && echo "[OK] Webapp on :3002"
lsof -i :6061 > /dev/null && echo "[OK] Expo on :6061"
xcrun simctl list devices booted | grep -q "Booted" && echo "[OK] iOS Simulator"
```

## Console Output Format

```
Starting ToonNotes Development Environment...

Mode: Full Stack (--all)

[1/5] Cleaning up existing processes
      Port 3000: Killed (website)
      Port 3001: Clear
      Port 3002: Clear
      Port 6061: Killed (expo)

[2/5] Starting Website
      Command: npm run dev (background)
      URL: http://localhost:3000
      Logs: /tmp/toonnotes-website.log

[3/5] Starting Webapp
      Command: npm run dev --port 3002 (background)
      URL: http://localhost:3002
      Logs: /tmp/toonnotes-webapp.log

[4/5] Starting Local API Server
      Command: npm run api (background)
      URL: http://localhost:3001
      Logs: /tmp/toonnotes-api.log

[5/5] Starting Expo with iOS Simulator

Summary:
  Website:      http://localhost:3000
  Webapp:       http://localhost:3002
  Local API:    http://localhost:3001
  Expo Dev:     http://localhost:6061
  iOS Simulator: Running

Logs:
  tail -f /tmp/toonnotes-website.log
  tail -f /tmp/toonnotes-webapp.log
  tail -f /tmp/toonnotes-api.log
```

## Quick Reference Commands

### Check What's Using Ports

```bash
lsof -i :3000  # Website
lsof -i :3001  # API
lsof -i :3002  # Webapp
lsof -i :6061  # Expo
```

### Kill Specific Service

```bash
lsof -ti :3000 | xargs kill -9  # Kill website
lsof -ti :3001 | xargs kill -9  # Kill API
lsof -ti :3002 | xargs kill -9  # Kill webapp
lsof -ti :6061 | xargs kill -9  # Kill Expo
```

### View Service Logs

```bash
tail -f /tmp/toonnotes-website.log
tail -f /tmp/toonnotes-webapp.log
tail -f /tmp/toonnotes-api.log
```

### Restart Individual Services

```bash
# Restart website
lsof -ti :3000 | xargs kill -9 2>/dev/null
cd /Users/sungholee/code/toonnotes/apps/web && npm run dev

# Restart webapp
lsof -ti :3002 | xargs kill -9 2>/dev/null
cd /Users/sungholee/code/toonnotes/apps/webapp && npm run dev -- --port 3002

# Restart API
lsof -ti :3001 | xargs kill -9 2>/dev/null
cd /Users/sungholee/code/toonnotes/apps/expo && npm run api

# Restart Expo
lsof -ti :6061 | xargs kill -9 2>/dev/null
cd /Users/sungholee/code/toonnotes/apps/expo && npm run ios
```

## Troubleshooting

### "Address already in use" Error

```bash
# Kill all dev processes
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null
lsof -ti :6061 | xargs kill -9 2>/dev/null
```

### iOS Simulator Shows Old Version

```bash
cd /Users/sungholee/code/toonnotes/apps/expo
npx expo run:ios --device
```

### Android Emulator Not Starting

```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_7_API_34

# Then run Expo Android
cd /Users/sungholee/code/toonnotes/apps/expo
npm run android
```

### API Server Crashes on Start

Check for missing environment variables:

```bash
cat /Users/sungholee/code/toonnotes/apps/expo/.env | grep GEMINI
```

### Metro Bundler Stuck

```bash
cd /Users/sungholee/code/toonnotes/apps/expo
rm -rf node_modules/.cache
npm start -- --reset-cache
```

### Website/Webapp Build Errors

```bash
cd /Users/sungholee/code/toonnotes
pnpm install
pnpm run build
```

### Simulator Won't Boot

```bash
xcrun simctl shutdown all
xcrun simctl list devices
xcrun simctl boot "iPhone 15 Pro"
```

## Environment Variables

### Required for Local API Server

| Variable | Purpose | Location |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API access | `apps/expo/.env` |

### Required for Webapp/Website

| Variable | Purpose | Location |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase connection | `apps/web/.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase auth | `apps/web/.env.local` |

## Script Location

For automated execution:

```bash
bash .claude/skills/dev-start/scripts/start-dev.sh
bash .claude/skills/dev-start/scripts/start-dev.sh --mobile
bash .claude/skills/dev-start/scripts/start-dev.sh --web
bash .claude/skills/dev-start/scripts/start-dev.sh --all
bash .claude/skills/dev-start/scripts/start-dev.sh --status
bash .claude/skills/dev-start/scripts/start-dev.sh --kill
```

## Related Skills

- `/test-mobile` - Run E2E tests on mobile after starting dev environment
- `/test-e2e` - Run Playwright E2E tests on webapp
- `/health-check` - Verify all services are running
- `/deploy-staging` - Deploy to staging when ready
