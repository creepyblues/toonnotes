---
name: health-check
description: Verifies system health across all ToonNotes apps, API edge functions, and external services. This skill should be used for quick deployment verification, debugging service issues, daily operations checks, or before/after major deployments.
---

# Health Check

Comprehensive health monitoring for all ToonNotes services.

## When to Use

- After deploying API functions or apps
- Debugging service availability issues
- Daily operations health checks
- Investigating user-reported issues

## Monitored Services

### Applications (3)

| App | Vercel Project | Production URL |
|-----|---------------|----------------|
| API | `toonnotes-api` | toonnotes-api.vercel.app |
| Webapp | `webapp` | app.toonnotes.com |
| Marketing | `web` | toonnotes.com |

### API Edge Functions (12 max on Hobby plan)

All deployed from `apps/expo/api/` to `toonnotes-api.vercel.app`:

| Endpoint | Purpose |
|----------|---------|
| `/api/health-check` | Self-monitoring with Slack alerts |
| `/api/onboarding-config` | Remote onboarding config |
| `/api/analyze-note-content` | NLP for label suggestions |
| `/api/goal-agent` | AI goal inference + beta feedback (routes by `action`) |
| `/api/generate-theme` | AI note design from image |
| `/api/generate-lucky-theme` | Random chaotic design |
| `/api/extract-colors` | Color palette extraction |
| `/api/generate-board-design` | Board/hashtag backgrounds |
| `/api/generate-character-mascot` | AI sticker generation |
| `/api/generate-label-design` | Label-specific designs |
| `/api/generate-typography-poster` | Typography art |
| `/api/remove-background` | Background removal |

## How to Run

### Quick Check (default)

```bash
# 1. Built-in health check endpoint (checks onboarding-config + analyze-note-content)
curl -s 'https://toonnotes-api.vercel.app/api/health-check' | python3 -m json.tool

# 2. Check all apps
curl -s -o /dev/null -w "%{http_code}" 'https://toonnotes-api.vercel.app/api/health-check'
curl -s -o /dev/null -w "%{http_code}" 'https://app.toonnotes.com'
curl -s -o /dev/null -w "%{http_code}" 'https://toonnotes.com'

# 3. Check goal-agent endpoint
curl -s -o /dev/null -w "%{http_code}" -X POST 'https://toonnotes-api.vercel.app/api/goal-agent' \
  -H 'Content-Type: application/json' \
  -d '{"action":"analyze","noteTitle":"Test","noteContent":"test content for health check"}'
```

### Comprehensive Check

Test every API endpoint individually:

```bash
# Non-AI endpoints (fast)
curl -s -o /dev/null -w "%{http_code}" 'https://toonnotes-api.vercel.app/api/onboarding-config'

# AI endpoints (need POST with body)
curl -s -o /dev/null -w "%{http_code}" -X POST 'https://toonnotes-api.vercel.app/api/analyze-note-content' \
  -H 'Content-Type: application/json' \
  -d '{"noteTitle":"Health check","noteContent":"watching anime and reading manga"}'

curl -s -o /dev/null -w "%{http_code}" -X POST 'https://toonnotes-api.vercel.app/api/goal-agent' \
  -H 'Content-Type: application/json' \
  -d '{"action":"feedback","feedbackText":"test","goalId":"test"}'
```

## Expected Responses

| Service | Expected Status | Notes |
|---------|----------------|-------|
| API health-check | 200 | Returns JSON with endpoint statuses |
| app.toonnotes.com | 307 | Redirects to login (expected) |
| toonnotes.com | 307 | Redirects (expected) |
| goal-agent (invalid action) | 400 | Returns error message |
| goal-agent (analyze, no content) | 400 | `noteTitle and noteContent required` |
| goal-agent (analyze, valid) | 200 | Returns engagement classification |

## Output Format

Present results as a table:

```
| Service | Status | Details |
|---------|--------|---------|
| API (toonnotes-api.vercel.app) | ✅ Healthy | All endpoints responding |
| ├─ onboarding-config | ✅ 200 | 50ms |
| ├─ analyze-note-content | ✅ 200 | 1700ms |
| └─ goal-agent | ✅ 200 | AI response working |
| Webapp (app.toonnotes.com) | ✅ 307 | Redirecting (expected) |
| Marketing (toonnotes.com) | ✅ 307 | Redirecting (expected) |
```

## Troubleshooting

### API returns 404
```bash
# Verify deployment from correct directory
cd /Users/sungholee/code/toonnotes/apps/expo
cat .vercel/project.json  # Should show toonnotes-api
vercel --prod              # Redeploy
```

### API returns 500
- Check Gemini model name — `gemini-2.0-flash` (not `flash-exp`)
- Check env vars: `GEMINI_API_KEY`, `SLACK_WEBHOOK_URL`, `RESEND_API_KEY`
- Check Vercel function logs: `vercel logs --follow`

### Vercel deploy fails with function limit
- Hobby plan allows max 12 serverless functions
- Count: `ls apps/expo/api/*.ts | grep -v _utils | wc -l`
- Consolidate endpoints if needed (like goal-agent pattern)

### Webapp not loading
- Check DNS: `dig app.toonnotes.com +short`
- Check Vercel domains: `vercel domains ls`
- Verify project: check Vercel dashboard for `webapp` project

## Environment Variables (API)

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini AI calls | Yes |
| `SLACK_WEBHOOK_URL` | Health check + feedback alerts | Optional |
| `RESEND_API_KEY` | Email delivery for feedback | Optional |
| `ADMIN_EMAIL` | Feedback email recipient | Optional |
| `CRON_SECRET` | Vercel cron auth | Optional |

## Slack Alerts

The `/api/health-check` endpoint automatically sends Slack alerts when endpoints are unhealthy (requires `SLACK_WEBHOOK_URL` env var). Runs on Vercel cron schedule.

## Related Skills

- `/deploy-functions` — Deploy API functions
- `/deploy-staging` — Deploy to staging
- `/cost-report` — Check API costs
