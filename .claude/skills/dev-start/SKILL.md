---
name: dev-start
description: Starts the ToonNotes Expo development environment with clean state by killing existing processes, starting local API server, launching Expo dev server with iOS simulator, and verifying readiness. This skill should be used when starting development, after port conflicts, or when seeing "API error" messages.
---

# Dev Start

This skill provides a one-command solution to start a fully functioning ToonNotes Expo development environment with clean state.

## When to Use This Skill

- Starting a new development session
- After seeing "API error" or port conflict errors
- When the iOS Simulator shows stale content
- After restarting your machine
- When `npm run ios` fails with port already in use
- To ensure all development services are running correctly

## Prerequisites

- Xcode installed with iOS Simulator
- Node.js 18+
- The ToonNotes repo cloned

## Commands

```
/dev-start                  # Full clean start (recommended)
/dev-start --quick          # Skip simulator reset, just restart servers
/dev-start --api-only       # Start only the local API server
/dev-start --expo-only      # Start only Expo dev server (no API)
/dev-start --status         # Check status of all services
/dev-start --kill           # Kill all dev processes without restarting
```

## Development Environment Components

| Component | Port | Command | Purpose |
|-----------|------|---------|---------|
| Expo Dev Server | 6061 | `npm start` | Metro bundler, serves JS to simulator |
| Local API Server | 3001 | `npm run api` | Local Gemini API proxy (optional) |
| iOS Simulator | - | Launched by Expo | Runs the app |

### When is Local API Server Needed?

The local API server (`npm run api`) is needed when:
- Testing AI features locally without using production API quota
- Developing or debugging API endpoints
- Working offline (with cached responses)

By default, the app uses `https://toonnotes-api.vercel.app` for AI features. The local server is optional but recommended for active AI feature development.

## Startup Workflow

When `/dev-start` is invoked, execute these steps:

### Step 1: Kill Existing Processes

```bash
# Kill processes on Expo dev server port (6061)
lsof -ti :6061 | xargs kill -9 2>/dev/null || true

# Kill processes on local API server port (3001)
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

# Kill any orphaned node processes
pkill -f "expo start" 2>/dev/null || true
pkill -f "local-api-server" 2>/dev/null || true
```

### Step 2: Start Local API Server (Background)

```bash
cd /Users/sungholee/code/toonnotes/apps/expo

# Start API server in background
nohup npm run api > /tmp/toonnotes-api.log 2>&1 &

# Wait for startup
sleep 2

# Verify
lsof -ti :3001 > /dev/null && echo "API server running" || echo "API failed to start"
```

### Step 3: Start Expo with iOS Simulator

```bash
cd /Users/sungholee/code/toonnotes/apps/expo
npm run ios
```

### Step 4: Verify Environment

```bash
# Check all services
lsof -i :6061 > /dev/null && echo "[OK] Expo on :6061"
lsof -i :3001 > /dev/null && echo "[OK] API on :3001"
xcrun simctl list devices booted | grep -q "Booted" && echo "[OK] Simulator booted"
```

## Console Output Format

```
Starting ToonNotes Development Environment...

[1/4] Cleaning up existing processes
      Port 6061: Killed process 12345
      Port 3001: No process found

[2/4] Starting local API server
      Command: npm run api (background)
      Logs: /tmp/toonnotes-api.log
      Status: Running on port 3001

[3/4] Starting Expo dev server with iOS
      Command: npm run ios

[4/4] Environment ready!

Summary:
  Expo Dev Server: http://localhost:6061
  Local API Server: http://localhost:3001
  iOS Simulator: Running

Next steps:
  - The app should open automatically in the simulator
  - If AI features fail, check: tail -f /tmp/toonnotes-api.log
  - Press 'r' in terminal to reload the app
```

## Quick Reference Commands

### Check What's Using a Port

```bash
lsof -i :6061  # Expo port
lsof -i :3001  # API port
```

### Kill Specific Port

```bash
lsof -ti :6061 | xargs kill -9  # Kill Expo
lsof -ti :3001 | xargs kill -9  # Kill API
```

### View API Server Logs

```bash
tail -f /tmp/toonnotes-api.log
```

### Restart Just the API Server

```bash
lsof -ti :3001 | xargs kill -9 2>/dev/null
cd /Users/sungholee/code/toonnotes/apps/expo && npm run api
```

## Troubleshooting

### "Address already in use" Error

```bash
lsof -ti :6061 | xargs kill -9
lsof -ti :3001 | xargs kill -9
```

### Simulator Shows Old Version

```bash
cd /Users/sungholee/code/toonnotes/apps/expo
npx expo run:ios --device
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

### "Cannot connect to design server" Error

1. **Production API (default)**: Check internet connection to `toonnotes-api.vercel.app`
2. **Local development**: Start the API server with `npm run api`

### Simulator Won't Boot

```bash
xcrun simctl shutdown all
xcrun simctl list devices
xcrun simctl boot "iPhone 15 Pro"
```

## Environment Variables

The local API server requires:

| Variable | Purpose | Location |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API access | `apps/expo/.env` |

## Script Location

For automated execution:

```bash
bash .claude/skills/dev-start/scripts/start-dev.sh
bash .claude/skills/dev-start/scripts/start-dev.sh --status
bash .claude/skills/dev-start/scripts/start-dev.sh --kill
```

## Related Skills

- `/test-mobile` - Run E2E tests after starting dev environment
- `/health-check` - Verify all services are running
- `/deploy-staging` - Deploy to staging when ready
