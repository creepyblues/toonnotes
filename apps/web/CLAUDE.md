# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Overview

ToonNotes_Web is a Next.js 16 web application serving two purposes:
1. **Marketing site** - Landing page with app features and download links
2. **Shared note viewer** - Public viewing of notes shared from the mobile app

This is part of the ToonNotes monorepo and complements the main ToonNotes_Expo mobile application. Both share the same Supabase backend.

## Architecture

```
app/
├── (marketing)/           # Marketing pages route group
│   ├── layout.tsx         # Shared header + footer wrapper
│   ├── page.tsx           # Homepage: Hero, features, CTAs
│   ├── features/          # Features page
│   ├── scenarios/         # Scenarios section
│   │   ├── layout.tsx     # Scenarios-specific layout (solid header)
│   │   ├── page.tsx       # Scenarios index
│   │   ├── trip-planning/ # Individual scenario pages
│   │   ├── idea-growth/
│   │   ├── memory-capsule/
│   │   └── recipe-tracking/
│   └── development_diary/ # Public dev diary
├── note/[shareToken]/     # Dynamic shared note routes (SSR)
│   ├── page.tsx           # Fetches + renders shared note
│   ├── loading.tsx        # Loading skeleton
│   └── not-found.tsx      # Invalid token 404
├── api/og/
│   └── route.tsx          # Edge function: dynamic OG images
└── layout.tsx             # Root layout with metadata

lib/
├── supabase/
│   ├── client.ts          # Browser client (createBrowserClient)
│   └── server.ts          # Server client with cookie handling
└── design-engine/
    ├── types.ts           # SharedNoteData, NoteDesign, ComposedStyle
    └── composeStyle.ts    # Design → CSS composition

components/
├── marketing/
│   ├── MarketingHeader.tsx  # Shared header for all marketing pages
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── ...
└── notes/
    └── SharedNoteCard.tsx   # Client component for note rendering
```

## Key Patterns

### Marketing Site Header (IMPORTANT)

**All marketing pages MUST use the shared `MarketingHeader` component** to ensure consistent navigation across the site.

- **Location**: `components/marketing/MarketingHeader.tsx`
- **Navigation items** (always visible, in this order):
  1. Features (`/features`)
  2. Scenarios (`/scenarios`)
  3. Dev Diary (`/development_diary`)
  4. Download button (CTA)

**Variants:**
- `transparent` - For pages with hero sections (homepage, features)
- `solid` - For pages with content starting at the top (scenarios)

**Usage:**
```tsx
import { MarketingHeader } from '@/components/marketing';

// In layout.tsx
<MarketingHeader variant="transparent" />  // or "solid"
```

**When adding new marketing pages:**
1. Use the shared `MarketingHeader` - never create inline headers
2. If a new top-level nav item is needed, add it to the `navItems` array in `MarketingHeader.tsx`
3. Keep the header consistent across all pages

### Supabase SSR
- **Server components**: Use `createServerClient()` from `lib/supabase/server.ts` (handles cookies)
- **Client components**: Use `createBrowserClient()` from `lib/supabase/client.ts`
- **Shared note fetching**: Uses RPC function `get_shared_note(p_share_token)` which returns note + design data joined

### Design Engine
The design engine is **synchronized with ToonNotes_Expo**. When modifying design types or composition logic, ensure consistency with `ToonNotes_Expo/services/designEngine.ts`.

Key types:
- `NoteDesign`: Stored design configuration (colors, border, texture, stickers)
- `ComposedStyle`: View-ready CSS values after context-based composition
- `SharedNoteData`: Note + design joined for shared note display

Composition contexts: `grid`, `list`, `detail`, `share` - each applies different styling rules.

### OG Image Generation
`/api/og/route.tsx` runs on Vercel Edge Runtime and generates dynamic 1200x630 PNG images for social sharing. It fetches the shared note data and renders a branded preview.

## Environment Variables

Copy `.env.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://toonnotes.com
NEXT_PUBLIC_APP_STORE_URL=https://apps.apple.com/app/...
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/...
```

## Integration with Mobile App

- **Shared Supabase project**: Same database credentials as ToonNotes_Expo
- **Share flow**: Mobile app generates share tokens → web displays shared notes
- **Design types**: Must stay synchronized between web and mobile
- **No authentication**: Web only handles public shared note viewing

## Deployment

Deployed to Vercel with automatic deploys from git. Project configuration in `.vercel/project.json`.
