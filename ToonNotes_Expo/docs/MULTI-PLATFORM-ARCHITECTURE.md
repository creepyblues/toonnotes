# ToonNotes Multi-Platform Architecture Plan

> **Status**: Ready for Implementation | **Priority**: After v1.2
> **Decision**: Full Web App (Option B) with text-only creation on web
> **Last Updated**: January 2026

---

## Executive Summary

This document proposes a **federated architecture** for ToonNotes that:
1. Separates marketing site (`toonnotes.com`) from web app (`app.toonnotes.com`)
2. Enables cross-device sync as a premium service (already implemented for mobile)
3. Follows patterns used by world-class apps (Linear, Notion, Slack, Discord)

---

## Research Findings: How World-Class Apps Do This

### Domain Separation Patterns

| App | Marketing | Web App | Pattern |
|-----|-----------|---------|---------|
| **Linear** | linear.app | app.linear.app | `app.` subdomain |
| **Notion** | notion.so | notion.so/[workspace] | Path-based |
| **Slack** | slack.com | app.slack.com | `app.` subdomain |
| **Discord** | discord.com | discord.com/app | Path-based |
| **Figma** | figma.com | figma.com/files | Path-based |
| **Todoist** | todoist.com | app.todoist.com | `app.` subdomain |
| **Bear** | bear.app | N/A (native only) | No web app |
| **Craft** | craft.do | N/A (native only) | No web app |

**Key insight**: Note-taking apps like Bear and Craft often don't have web apps—they focus on native experiences. Productivity apps (Notion, Todoist) always have web apps.

### Why Separate Subdomains?

From [Serverless First](https://serverlessfirst.com/how-to-select-a-future-proof-subdomain-structure-for-saas-web-app/) and [Ghinda](https://ghinda.com/blog/products/2020/domain-structure-for-saas-products.html):

1. **Security isolation**: Marketing site changes can't introduce vulnerabilities to the app
2. **Independent deployment**: Deploy marketing updates without app deployments
3. **Tech stack flexibility**: Marketing on WordPress/Webflow, app on React/Next.js
4. **SEO optimization**: Blog on marketing domain benefits from main domain authority
5. **Cookie/session isolation**: Separate auth contexts
6. **Performance**: Different caching strategies per subdomain

### Cross-Platform Sync Architecture

| App | Sync Backend | Free Tier | Premium Sync |
|-----|--------------|-----------|--------------|
| **Todoist** | Proprietary | Full sync | - |
| **Notion** | Proprietary | Full sync | - |
| **Bear** | iCloud | No sync | $15/yr |
| **Day One** | Proprietary | Local only | $35/yr |
| **Standard Notes** | Self-hosted | E2E sync | $90/yr |
| **Obsidian** | Obsidian Sync | Local only | $96/yr |

**ToonNotes approach** (already implemented): Supabase sync for Pro users ($4.99/month)

---

## Current ToonNotes Architecture

### What Exists Today

```
┌─────────────────────────────────────────────────────────────────┐
│                        ToonNotes Monorepo                        │
├───────────────────────┬─────────────────────┬───────────────────┤
│    ToonNotes_Expo     │   ToonNotes_Web     │     Supabase      │
│   (React Native)      │    (Next.js 16)     │    (Backend)      │
├───────────────────────┼─────────────────────┼───────────────────┤
│ • iOS app             │ • Marketing site    │ • Auth (OAuth)    │
│ • Android app         │ • Shared note viewer│ • PostgreSQL DB   │
│ • Local + Cloud sync  │ • OG image gen      │ • Real-time sync  │
│ • RevenueCat IAP      │                     │ • File storage    │
└───────────────────────┴─────────────────────┴───────────────────┘
```

### Sync Implementation (Already Working)

- **Service**: `ToonNotes_Expo/services/syncService.ts`
- **Real-time**: Supabase Postgres Changes subscription
- **Gating**: `isPro()` check in authStore
- **Conflict resolution**: `latest_wins` (timestamp-based)
- **What syncs**: Notes, designs, labels, boards, profiles

---

## Final Decision: Full Web App (Notion/Todoist Model)

**Timeline**: After v1.2 mobile release (mobile monetization first)

```
toonnotes.com           → Marketing site (Next.js) - EXISTING
app.toonnotes.com       → Full web app (Next.js) - NEW
                          - Notes CRUD (text-only creation on web)
                          - Full editing capabilities
                          - Design viewing (creation = mobile only)
                          - Pro subscription required for sync

Mobile apps sync ←→ Web app via Supabase (existing infrastructure)
```

### Why Full Web App?

1. **Competitive positioning**: Matches Notion/Todoist accessibility
2. **Power user retention**: Desktop editing for heavy users
3. **Platform expansion**: Reach users who start on desktop
4. **Existing infrastructure**: Supabase sync already working

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ToonNotes Multi-Platform                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │  toonnotes.com   │    │ app.toonnotes.com│    │  Mobile Apps     │   │
│  │  (Marketing)     │    │ (Web Companion)  │    │  (iOS/Android)   │   │
│  ├──────────────────┤    ├──────────────────┤    ├──────────────────┤   │
│  │ • Landing page   │    │ • Notes list     │    │ • Full CRUD      │   │
│  │ • Pricing        │    │ • Note viewer    │    │ • Design create  │   │
│  │ • Blog           │    │ • Quick edit     │    │ • AI generation  │   │
│  │ • Download CTAs  │    │ • Search         │    │ • Camera/Images  │   │
│  │ • Shared notes   │    │ • PRO ONLY       │    │ • Offline mode   │   │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘   │
│           │                       │                       │              │
│           └───────────────────────┼───────────────────────┘              │
│                                   │                                      │
│                      ┌────────────▼────────────┐                         │
│                      │       Supabase          │                         │
│                      │   (Shared Backend)      │                         │
│                      ├─────────────────────────┤                         │
│                      │ • Auth (Google/Apple)   │                         │
│                      │ • PostgreSQL (notes)    │                         │
│                      │ • Real-time sync        │                         │
│                      │ • Storage (images)      │                         │
│                      │ • Edge Functions        │                         │
│                      └─────────────────────────┘                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Domain Strategy

| Domain | Purpose | Tech Stack |
|--------|---------|------------|
| `toonnotes.com` | Marketing + shared notes | Next.js 16 (existing ToonNotes_Web) |
| `app.toonnotes.com` | Web companion (Pro only) | Next.js 16 (new project) |

### Feature Matrix

| Feature | Mobile (iOS/Android) | Web App | Marketing Site |
|---------|---------------------|---------|----------------|
| View notes | ✅ | ✅ (Pro) | Shared only |
| Create notes (text) | ✅ | ✅ (Pro) | ❌ |
| Edit text | ✅ | ✅ (Pro) | ❌ |
| AI design creation | ✅ | ❌ (mobile only) | ❌ |
| Apply saved designs | ✅ | ✅ (Pro) | ❌ |
| Upload images | ✅ | ✅ (Pro) | ❌ |
| Checklist mode | ✅ | ✅ (Pro) | ❌ |
| Bullet list mode | ✅ | ✅ (Pro) | ❌ |
| Boards/labels | ✅ | ✅ (Pro) | ❌ |
| Search | ✅ | ✅ (Pro) | ❌ |
| Archive/Trash | ✅ | ✅ (Pro) | ❌ |
| Offline | ✅ | ❌ | ❌ |
| Sync | Pro only | Pro only | N/A |

### Web App Scope (app.toonnotes.com)

**Full Features**:
- OAuth login (Google/Apple) via Supabase
- Notes list with grid/list toggle
- Full text editing (title, content, formatting)
- Text-only note creation (new notes start with default color)
- Checklist and bullet list editing
- Apply saved designs to notes
- Image upload and viewing
- Board and label management
- Archive and trash views
- Search with filters
- Responsive design (desktop + tablet + mobile web)
- Real-time sync with mobile apps

**Mobile-Only Features** (Not on Web):
- AI design generation (requires camera/image capture UX)
- Design creation wizard
- Background removal for stickers
- Offline mode with queue

---

## Implementation Plan

**Target Start**: After v1.2 mobile release
**Estimated Duration**: 8-10 weeks

### Phase 1: Infrastructure Setup (Week 1)

1. Configure DNS for `app.toonnotes.com` pointing to Vercel
2. Create new Vercel project linked to monorepo
3. Add OAuth callback URL in Supabase: `https://app.toonnotes.com/auth/callback`
4. Set up environment variables (shared Supabase keys)
5. Configure CORS for cross-origin requests if needed

### Phase 2: Foundation (Weeks 2-3)

1. Create `ToonNotes_WebApp/` in monorepo
2. Initialize Next.js 16 with App Router, TypeScript, Tailwind v4
3. Port design system from ToonNotes_Web (colors, typography, spacing)
4. Configure Supabase SSR client with cookie-based auth
5. Implement middleware for route protection (Pro verification)
6. Create auth pages: login, callback handler, logout
7. Verify subscription status from `profiles.is_pro`

### Phase 3: Notes Core (Weeks 4-5)

1. Notes list page with grid/list toggle
2. Port design engine from mobile (`ToonNotes_Expo/services/designEngine.ts`)
3. Note viewer with full design rendering
4. Note editor with debounced auto-save
5. Text-only note creation (default color, no design)
6. Real-time sync via Supabase subscriptions

### Phase 4: Editor Features (Week 6)

1. Checklist mode (Google Keep style)
2. Bullet list mode
3. Image upload via Supabase Storage
4. Apply saved designs from designStore
5. Note color picker

### Phase 5: Navigation & Organization (Week 7)

1. Boards list and board detail view
2. Labels management
3. Search with filters (title, content, labels)
4. Archive view
5. Trash view with restore/permanent delete

### Phase 6: Polish & Launch (Weeks 8-10)

1. Responsive design testing (desktop, tablet, mobile web)
2. Performance optimization (lazy loading, suspense)
3. Error boundaries and loading states
4. Pro upgrade prompts for non-Pro visitors
5. Deep links to mobile app for AI features
6. Documentation (CLAUDE.md, README)
7. E2E tests with Playwright
8. Launch to production

---

## Files to Create/Modify

### New Project: `ToonNotes_WebApp/`

```
ToonNotes_WebApp/
├── app/
│   ├── layout.tsx              # Root layout with auth provider
│   ├── page.tsx                # Redirect to /notes or /login
│   ├── (auth)/
│   │   ├── login/page.tsx      # OAuth login options
│   │   └── callback/route.ts   # OAuth callback handler
│   ├── (app)/
│   │   ├── layout.tsx          # App shell with sidebar
│   │   ├── notes/
│   │   │   ├── page.tsx        # Notes list (grid/list)
│   │   │   ├── new/page.tsx    # New note creation
│   │   │   └── [id]/page.tsx   # Note editor
│   │   ├── boards/
│   │   │   ├── page.tsx        # Boards list
│   │   │   └── [hashtag]/page.tsx
│   │   ├── archive/page.tsx
│   │   ├── trash/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       └── og/route.tsx        # OG image generation
├── components/
│   ├── notes/
│   │   ├── NoteCard.tsx
│   │   ├── NoteEditor.tsx
│   │   ├── NoteList.tsx
│   │   └── DesignRenderer.tsx
│   ├── editor/
│   │   ├── ChecklistEditor.tsx
│   │   ├── BulletEditor.tsx
│   │   └── TextEditor.tsx
│   ├── boards/
│   │   └── BoardCard.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── SearchBar.tsx
│   └── ui/                     # Shared UI primitives
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware helpers
│   ├── design-engine/          # Ported from ToonNotes_Expo
│   │   ├── compose.ts
│   │   ├── types.ts
│   │   └── textures.ts
│   └── utils/
│       ├── debounce.ts
│       └── validation.ts
├── stores/                     # Zustand for client state
│   ├── noteStore.ts
│   └── uiStore.ts
├── types/
│   └── index.ts                # Shared with mobile where possible
├── middleware.ts               # Route protection
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

### Shared Code Strategy

Code to **port/copy** from `ToonNotes_Expo/`:
- `services/designEngine.ts` → `lib/design-engine/`
- `types/index.ts` (partial) → `types/index.ts`
- `constants/themes.ts` → `lib/design-engine/themes.ts`
- `constants/patterns.ts` → `lib/design-engine/patterns.ts`
- `constants/boardPresets.ts` → `lib/constants/`
- `constants/labelPresets.ts` → `lib/constants/`

Code to **share via npm package** (future consideration):
- Design engine could be extracted to `@toonnotes/design-engine`
- Types could be `@toonnotes/types`

### Existing Files to Modify

| File | Change |
|------|--------|
| `ToonNotes_Web/` | Keep as marketing site (no changes needed) |
| Supabase Dashboard | Add OAuth callback URL: `https://app.toonnotes.com/auth/callback` |
| Vercel Dashboard | Create new project for app.toonnotes.com |
| DNS (domain registrar) | Add CNAME record: `app` → Vercel |

---

## Cost Considerations

### Supabase (Already on Pro - $25/month)
- Web app adds minimal cost (same data, additional access point)
- Real-time subscriptions shared pool with mobile
- No additional storage (same user data)

### Vercel
- New project for app.toonnotes.com
- Estimated: Free tier (hobby) initially, upgrade if traffic demands
- Pro ($20/month) if team collaboration needed

### Total Additional Cost
- **Development phase**: ~$0 (free tiers)
- **Production**: ~$20/month additional if Vercel Pro needed

---

## Roadmap Context

### Mobile-First Priority (Before Web App)

| Version | Focus | Status |
|---------|-------|--------|
| **v1.0** | Launch with Pro subscription + cloud sync | ✅ Complete |
| **v1.1** | Conversion optimization (usage limits, watermarks) | Planned |
| **v1.2** | Yearly subscription, cosmetics marketplace | Planned |
| **v2.0** | **Web App Launch** | After v1.2 |

### Why Mobile First?

1. Core monetization must be validated before expanding platforms
2. Mobile is primary use case (camera, capture, visual design)
3. Web app leverages existing Supabase infrastructure
4. Avoid spreading resources too thin

---

## Summary

**Architecture Decision**: Full Web App at `app.toonnotes.com` with feature parity except AI design creation (mobile-only).

**Key Points**:
- Marketing site remains at `toonnotes.com` (existing ToonNotes_Web)
- Web app is Pro-only (requires subscription for access)
- Text-only note creation on web; AI design features require mobile
- Shares Supabase backend with mobile apps (no new infrastructure)
- Real-time sync across all platforms via existing syncService

**Timeline**: 8-10 weeks development, starting after v1.2 mobile release

---

## Sources

- [SaaS Subdomain Best Practices - Serverless First](https://serverlessfirst.com/how-to-select-a-future-proof-subdomain-structure-for-saas-web-app/)
- [Domain Structure for SaaS - Ghinda](https://ghinda.com/blog/products/2020/domain-structure-for-saas-products.html)
- [Why Keep SaaS on Subdomain - Tortoise & Hare](https://tortoiseandharesoftware.com/blog/why-you-should-keep-your-saas-installed-on-a-subdomain/)
- [Bear Notes E2E Encryption Case Study](https://www.cossacklabs.com/case-studies/bear/)
- [Supabase + Expo Integration Guide](https://docs.expo.dev/guides/using-supabase/)
- [Local-First Architecture - Expo](https://docs.expo.dev/guides/local-first/)
- [Bear vs Craft Comparison](https://www.selecthub.com/note-taking-software/bear-app-vs-craft-docs/)
