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
├── (marketing)/           # Landing page route group
│   ├── layout.tsx         # Nav + footer wrapper
│   └── page.tsx           # Hero, features, download CTAs
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

components/notes/
└── SharedNoteCard.tsx     # Client component for note rendering
```

## Key Patterns

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
