# Vercel Deployment Guide

## Project Mapping

| Vercel Project | Production URL | Monorepo App | Purpose |
|----------------|----------------|--------------|---------|
| `webapp` | app.toonnotes.com | `apps/webapp` | Main authenticated web app |
| `toonnotes-web` | www.toonnotes.com | `apps/web` | Marketing site + shared note viewer |
| `toonnotes-api` | toonnotes-api.vercel.app | `apps/expo` | API edge functions for mobile app |

## Deployment Configuration

All projects use:
- **Root Directory**: Set to app directory (e.g., `apps/webapp`)
- **Build Command**: Default (auto-detected by Vercel)
- **Install Command**: Default (pnpm detected from monorepo root)
- **Node.js Version**: 20.x

### webapp (app.toonnotes.com)

| Setting | Value |
|---------|-------|
| Root Directory | `apps/webapp` |
| Framework | Next.js (auto-detected) |
| Build Command | Override OFF |
| Install Command | Override OFF |

### toonnotes-web (www.toonnotes.com)

| Setting | Value |
|---------|-------|
| Root Directory | `apps/web` |
| Framework | Next.js (auto-detected) |
| Build Command | Override OFF |
| Install Command | Override OFF |

### toonnotes-api (API functions)

| Setting | Value |
|---------|-------|
| Root Directory | `apps/expo` |
| Framework | Other (serverless functions) |
| Config | `vercel.json` in `apps/expo` |

## Local Development

Each app runs on a different port:
- **webapp**: http://localhost:3001
- **web**: http://localhost:3000
- **expo**: Expo dev server on port 6061

## Deploying from CLI

Always deploy from the **monorepo root**, not from app directories:

```bash
# Deploy webapp (currently linked)
cd /path/to/toonnotes  # monorepo root
vercel --yes           # deploys to staging
vercel --prod          # deploys to production

# To deploy a different app, re-link first:
vercel link --yes --project toonnotes-web
vercel --yes
```

## Vercel Dashboard Links

- [webapp settings](https://vercel.com/creepyblues-9060s-projects/webapp/settings)
- [toonnotes-web settings](https://vercel.com/creepyblues-9060s-projects/toonnotes-web/settings)
- [toonnotes-api settings](https://vercel.com/creepyblues-9060s-projects/toonnotes-api/settings)
