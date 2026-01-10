# ToonNotes Web App - Product Requirements Document

**Version:** 1.0
**Last Updated:** January 2025
**Status:** In Development
**Reference:** Based on Mobile App PRD v2.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Feature Requirements](#3-feature-requirements)
4. [Design System](#4-design-system)
5. [Economy System](#5-economy-system)
6. [Technical Architecture](#6-technical-architecture)
7. [User Flows](#7-user-flows)
8. [Web-Specific Considerations](#8-web-specific-considerations)
9. [Implementation Status](#9-implementation-status)
10. [Appendix](#10-appendix)

---

## 1. Executive Summary

**ToonNotes Web** is the web companion to the ToonNotes mobile app, providing cross-platform access to notes, designs, and boards. The web app maintains feature parity with mobile while leveraging web-specific capabilities like keyboard shortcuts, larger screens, and desktop workflows.

### Key Goals

- **Feature Parity**: Match mobile app functionality for seamless cross-platform experience
- **Web-First UX**: Leverage keyboard shortcuts, multi-column layouts, and desktop interactions
- **Real-Time Sync**: Instant synchronization with mobile app via Supabase
- **Pro Continuity**: Single subscription works across mobile and web

### Target Users

- Existing ToonNotes mobile users who want desktop access
- Users who prefer keyboard-centric note-taking
- Power users managing large note collections

---

## 2. Product Overview

### Platform

- **Web**: Next.js 15 with App Router
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Responsive**: Desktop-first with tablet support

### Core Capabilities

| Capability | Description | Status |
|------------|-------------|--------|
| Note Management | Create, edit, archive, delete, pin notes | ✅ Implemented |
| Rich Text Editor | TipTap-based with formatting toolbar | ✅ Implemented |
| Editor Modes | Plain text, checklist, bullet list | 🔲 Pending |
| Labels | Hashtag-based with 30 presets | 🔲 Partial |
| Boards | Auto-created hashtag collections | ✅ Structure only |
| Custom Designs | AI-generated note themes | 🔲 Pending |
| Cloud Sync | Real-time sync via Supabase | 🔲 Partial |
| Keyboard Shortcuts | Power user navigation | 🔲 Pending |

### Shared Packages (Monorepo)

The webapp uses shared packages from the monorepo:

| Package | Purpose |
|---------|---------|
| `@toonnotes/types` | TypeScript interfaces (Note, Design, Board, etc.) |
| `@toonnotes/constants` | Label presets, board presets, themes |
| `@toonnotes/design-engine` | Design composition for different contexts |
| `@toonnotes/supabase` | Shared Supabase client and queries |

---

## 3. Feature Requirements

### 3.1 Note Management

#### Create & Edit Notes

| Status | Requirement | Web Adaptation |
|--------|-------------|----------------|
| ✅ | Create new note from + button | Also via `Ctrl/Cmd + N` |
| ✅ | Notes auto-save as user types | Debounced 500ms |
| ✅ | Edit note title and body | Inline editing |
| 🔲 | "Saved" indicator | Toast notification |

#### Delete & Archive

| Status | Requirement | Web Adaptation |
|--------|-------------|----------------|
| ✅ | Archive notes | Context menu + `Ctrl/Cmd + E` |
| ✅ | View archived notes | Sidebar navigation |
| ✅ | Delete notes (Trash) | Context menu + `Delete` key |
| ✅ | Restore from Trash | In trash view |
| ✅ | Permanently delete | With confirmation dialog |

#### Pin & Search

| Status | Requirement | Web Adaptation |
|--------|-------------|----------------|
| ✅ | Pin notes to top | Context menu + `Ctrl/Cmd + Shift + P` |
| ✅ | Search notes | `Ctrl/Cmd + K` command palette |
| 🔲 | Search highlights | Highlight matching text |

---

### 3.2 Rich Text Editor

Built with TipTap for web-native editing experience.

#### Formatting Options

| Status | Feature | Shortcut |
|--------|---------|----------|
| ✅ | Bold | `Ctrl/Cmd + B` |
| ✅ | Italic | `Ctrl/Cmd + I` |
| ✅ | Underline | `Ctrl/Cmd + U` |
| ✅ | Strikethrough | `Ctrl/Cmd + Shift + X` |
| ✅ | Headings (H1-H3) | `Ctrl/Cmd + 1/2/3` |
| 🔲 | Text color | Toolbar picker |
| 🔲 | Highlight | `Ctrl/Cmd + Shift + H` |

#### Editor Modes

| Status | Mode | Implementation |
|--------|------|----------------|
| ✅ | Plain Text | Default TipTap |
| 🔲 | Checklist | TipTap TaskList extension |
| 🔲 | Bullet List | TipTap BulletList extension |

---

### 3.3 Labels

#### Hashtag-Based Labels

| Status | Requirement |
|--------|-------------|
| ✅ | Type #word to create/assign label |
| 🔲 | Hashtag autocomplete dropdown |
| ✅ | Case-insensitive normalization |
| ✅ | Label management (rename, delete) |

#### 30 Label Presets

Import from `@toonnotes/constants`:

| Category | Labels |
|----------|--------|
| **Productivity** | todo, in-progress, done, waiting, priority |
| **Planning** | goals, meeting, planning, deadline, project |
| **Checklists** | shopping, wishlist, packing, bucket-list, errands |
| **Media** | reading, watchlist, bookmarks, review, recommendation |
| **Creative** | ideas, draft, brainstorm, inspiration, research |
| **Personal** | journal, memory, reflection, gratitude, quotes |
| **System** | uncategorized |

| Status | Requirement |
|--------|-------------|
| 🔲 | Auto-apply preset design when label added |
| 🔲 | Show preset icon in label pills |
| 🔲 | AI label suggestions (Pro feature) |

---

### 3.4 Boards

| Status | Requirement |
|--------|-------------|
| ✅ | Auto-create board from hashtag |
| ✅ | Display notes with matching label |
| 🔲 | Board styling from 20 presets |
| 🔲 | AI-generated board designs |
| 🔲 | Board accent decorations |

---

### 3.5 Note Appearance

#### Basic Colors (7)

| Color | Hex | Status |
|-------|-----|--------|
| White | #FFFFFF | ✅ |
| Lavender | #EDE9FE | ✅ |
| Rose | #FFE4E6 | ✅ |
| Peach | #FED7AA | ✅ |
| Mint | #D1FAE5 | ✅ |
| Sky | #E0F2FE | ✅ |
| Violet | #DDD6FE | ✅ |

#### Custom Designs

| Status | Requirement |
|--------|-------------|
| 🔲 | Apply custom design from picker |
| 🔲 | Design gallery with thumbnails |
| 🔲 | Remove design (revert to color) |
| 🔲 | Label preset designs auto-apply |

---

### 3.6 Custom Design Creation

| Status | Requirement | Web Adaptation |
|--------|-------------|----------------|
| 🔲 | Upload image for design | Drag & drop + file picker |
| 🔲 | AI color extraction | Same API endpoint |
| 🔲 | Character sticker generation | Same API endpoint |
| 🔲 | "Feeling Lucky" random designs | Same API endpoint |
| 🔲 | Design preview before save | Modal with preview |
| 🔲 | Name and save design | Form input |

---

### 3.7 Authentication

| Status | Requirement |
|--------|-------------|
| ✅ | Google OAuth sign-in |
| 🔲 | Apple OAuth sign-in |
| ✅ | Session persistence |
| ✅ | Sign out |
| 🔲 | Account deletion |

---

### 3.8 Cloud Sync

| Status | Requirement |
|--------|-------------|
| 🔲 | Full sync on sign-in |
| 🔲 | Real-time updates via Supabase Realtime |
| 🔲 | Optimistic updates with rollback |
| 🔲 | Conflict resolution (last-write-wins) |
| 🔲 | Offline indicator |

---

### 3.9 Settings

| Status | Requirement |
|--------|-------------|
| ✅ | Settings page structure |
| 🔲 | Dark mode toggle |
| 🔲 | Default note color |
| 🔲 | Account management |
| 🔲 | Pro subscription status |
| 🔲 | Manage designs |

---

### 3.10 Keyboard Shortcuts

Web-specific power user features:

| Shortcut | Action | Status |
|----------|--------|--------|
| `Ctrl/Cmd + N` | New note | 🔲 |
| `Ctrl/Cmd + K` | Command palette / Search | 🔲 |
| `Ctrl/Cmd + E` | Archive note | 🔲 |
| `Ctrl/Cmd + Shift + P` | Pin/unpin note | 🔲 |
| `Escape` | Close modal / editor | 🔲 |
| `Ctrl/Cmd + S` | Force save (visual feedback) | 🔲 |
| `Ctrl/Cmd + /` | Show keyboard shortcuts | 🔲 |
| `G then N` | Go to Notes | 🔲 |
| `G then B` | Go to Boards | 🔲 |
| `G then D` | Go to Designs | 🔲 |
| `G then S` | Go to Settings | 🔲 |

---

## 4. Design System

### 4.1 Layout

Desktop-optimized layout with sidebar navigation:

```
┌─────────────────────────────────────────────────────────┐
│  TopBar (Search, Theme Toggle, User Menu)               │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Main Content Area                           │
│          │  (Notes Grid / Editor / Boards / etc.)       │
│ - Notes  │                                              │
│ - Boards │                                              │
│ - Designs│                                              │
│ - Archive│                                              │
│ - Trash  │                                              │
│ - Settings│                                             │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 4.2 Note Grid

| View | Columns | Note Size |
|------|---------|-----------|
| Desktop (>1200px) | 4-5 | 280px |
| Tablet (768-1200px) | 3-4 | 260px |
| Mobile (<768px) | 2 | Full width |

### 4.3 Color System

Use shared constants from `@toonnotes/constants`:

- **Note Colors**: 7 light pastels for text readability
- **Label Presets**: 30 unique color schemes
- **Board Presets**: 20 rich background colors
- **System Colors**: Tailwind CSS v4 with custom tokens

### 4.4 Typography

| Element | Font | Size |
|---------|------|------|
| Note Title | Inter | 18px / 1.4 |
| Note Body | Inter | 14px / 1.6 |
| Label Pills | Inter Medium | 12px |
| Sidebar | Inter Medium | 14px |

### 4.5 Dark Mode

| Element | Light | Dark |
|---------|-------|------|
| Background | #FFFFFF | #1A1A1A |
| Surface | #F5F5F5 | #2D2D2D |
| Text Primary | #1A1A1A | #F5F5F5 |
| Text Secondary | #6B7280 | #9CA3AF |
| Border | #E5E7EB | #404040 |

---

## 5. Economy System

### 5.1 Free Tier (Web)

| Feature | Limit |
|---------|-------|
| Notes | Unlimited |
| Basic colors | 7 |
| Custom designs | 3 free |
| Label presets | All 30 |
| Cloud sync | Required (web is cloud-only) |

### 5.2 Pro Subscription

Same subscription as mobile - single purchase works across platforms:

| Feature | Access |
|---------|--------|
| Custom designs | Unlimited |
| AI label suggestions | Unlimited |
| Priority support | Yes |

### 5.3 Coin Packages

Coins purchased on mobile can be used on web. Web purchase flow:

| Status | Requirement |
|--------|-------------|
| 🔲 | Display coin balance |
| 🔲 | Coin purchase via Stripe |
| 🔲 | Sync balance with mobile |

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Editor | TipTap (ProseMirror) |
| UI Components | Radix UI primitives |
| Icons | Phosphor Icons |
| Auth | Supabase Auth (SSR) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI | Gemini 2.0 Flash (via Vercel Edge) |
| Testing | Vitest + Playwright |

### 6.2 Project Structure

```
apps/webapp/
├── app/                      # Next.js App Router
│   ├── (main)/               # Authenticated routes
│   │   ├── page.tsx          # Notes list
│   │   ├── archive/page.tsx  # Archived notes
│   │   ├── trash/page.tsx    # Deleted notes
│   │   ├── notes/[id]/page.tsx # Note editor
│   │   ├── boards/page.tsx   # Boards list
│   │   ├── boards/[hashtag]/page.tsx # Board detail
│   │   ├── designs/page.tsx  # Design gallery
│   │   ├── settings/page.tsx # Settings
│   │   └── layout.tsx        # Main layout with sidebar
│   ├── auth/                 # Auth routes
│   │   ├── login/page.tsx    # Login page
│   │   ├── callback/route.ts # OAuth callback
│   │   └── logout/route.ts   # Logout handler
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── layout/               # AppShell, Sidebar, TopBar
│   ├── notes/                # NoteCard, NoteGrid
│   ├── editor/               # NoteEditor (TipTap)
│   ├── boards/               # BoardCard, BoardGrid
│   ├── designs/              # DesignCard, DesignGallery
│   └── providers/            # ThemeProvider, etc.
├── stores/                   # Zustand stores
│   ├── noteStore.ts          # Notes + labels
│   ├── designStore.ts        # Designs
│   └── uiStore.ts            # UI state (sidebar, modals)
├── lib/
│   ├── supabase/             # Supabase client (client.ts, server.ts)
│   ├── hooks/                # Custom hooks
│   └── utils.ts              # Utility functions
├── tests/
│   ├── unit/                 # Vitest unit tests
│   └── e2e/                  # Playwright E2E tests
└── middleware.ts             # Auth middleware
```

### 6.3 Zustand Stores

| Store | Purpose | Status |
|-------|---------|--------|
| `noteStore` | Notes + labels CRUD, queries | ✅ |
| `designStore` | Custom designs | ✅ Structure |
| `uiStore` | Sidebar state, modals, view mode | ✅ |
| `userStore` | User profile, economy | 🔲 |
| `boardStore` | Board customizations | 🔲 |

### 6.4 API Integration

Use same Vercel Edge Functions as mobile app:

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/api/generate-theme` | AI design from image | 🔲 |
| `/api/generate-lucky-theme` | Random chaotic design | 🔲 |
| `/api/extract-colors` | Color palette extraction | 🔲 |
| `/api/generate-board-design` | Board backgrounds | 🔲 |
| `/api/generate-character-mascot` | AI sticker | 🔲 |
| `/api/generate-label-design` | Label-specific designs | 🔲 |
| `/api/analyze-note-content` | NLP for labels | 🔲 |

**Base URL**: `https://toonnotes-api.vercel.app`

---

## 7. User Flows

### 7.1 First-Time User (Web)

```
1. Landing Page
   └── "Get Started" CTA → Login

2. OAuth Sign-In
   └── Choose Google (or Apple)
   └── Redirect back to app

3. First Sync
   └── Pull existing notes from mobile
   └── Show notes grid

4. Empty State (if no notes)
   └── "Create your first note" CTA
   └── Keyboard hint: "Ctrl+N"
```

### 7.2 Create Note Flow

```
1. Trigger
   ├── Click "+" button in TopBar
   ├── Press Ctrl/Cmd + N
   └── Click "New Note" in empty state

2. Editor Opens
   └── Full-width editor view
   └── Auto-focus on title
   └── Auto-save as typing

3. Add Labels
   └── Type #hashtag inline
   └── Autocomplete dropdown appears
   └── Select or create new label

4. Apply Design (optional)
   └── Click design icon in toolbar
   └── Design picker modal opens
   └── Select design or color

5. Close
   └── Click back / press Escape
   └── Note saved to grid
```

### 7.3 Create Design Flow (Web)

```
1. Entry Points
   ├── Designs page → "Create Design"
   └── Note editor → Design picker → "Create New"

2. Image Upload
   ├── Drag & drop zone
   └── Click to open file picker
   └── Supported: JPEG, PNG, WebP

3. Preview & Options
   └── Image preview
   └── "Generate Design" / "Feeling Lucky"
   └── Coin cost indicator

4. Generation
   └── Loading overlay
   └── Progress indicator
   └── 15-30 second wait

5. Result Preview
   └── Design applied to sample note
   └── Name input field
   └── Color palette display

6. Save
   └── "Save Design" button
   └── Success toast
   └── Redirect to Designs
```

---

## 8. Web-Specific Considerations

### 8.1 Differences from Mobile

| Aspect | Mobile | Web |
|--------|--------|-----|
| Navigation | Bottom tabs | Sidebar |
| Image upload | Camera + Photo library | File picker + Drag & drop |
| Payments | RevenueCat (IAP) | Stripe |
| Shortcuts | None | Full keyboard support |
| Editor | Custom TextInput | TipTap (ProseMirror) |
| Gestures | Swipe actions | Right-click context menu |
| Storage | Local-first + optional cloud | Cloud-only |

### 8.2 SEO & Meta

```tsx
// app/layout.tsx
export const metadata = {
  title: 'ToonNotes - Aesthetic Notes for Fans',
  description: 'Create beautiful, personalized notes with AI-generated designs from your favorite webtoons and anime.',
  openGraph: {
    title: 'ToonNotes',
    description: 'Aesthetic notes for webtoon & anime fans',
    images: ['/og-image.png'],
  },
};
```

### 8.3 Performance Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3s |

### 8.4 Accessibility

| Requirement | Status |
|-------------|--------|
| Keyboard navigation | 🔲 |
| ARIA labels | 🔲 |
| Focus indicators | 🔲 |
| Screen reader support | 🔲 |
| Color contrast (WCAG AA) | ✅ |

---

## 9. Implementation Status

### Phase 1: Foundation (✅ Complete)

- [x] Next.js 15 setup with App Router
- [x] Supabase authentication (Google OAuth)
- [x] Zustand state management
- [x] Basic note CRUD
- [x] TipTap rich text editor
- [x] Sidebar navigation
- [x] Notes grid view
- [x] Archive and Trash pages
- [x] Board pages (structure)
- [x] Design gallery (structure)
- [x] Settings page (structure)
- [x] Vitest + Playwright testing setup

### Phase 2: Core Features (🔄 In Progress)

- [ ] Real-time Supabase sync
- [ ] Label presets with auto-apply designs
- [ ] Editor modes (checklist, bullet)
- [ ] Note color picker
- [ ] Board styling from presets
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts

### Phase 3: AI Features (🔲 Pending)

- [ ] Design creation flow
- [ ] Image upload with drag & drop
- [ ] AI design generation
- [ ] Character sticker generation
- [ ] "Feeling Lucky" designs
- [ ] AI label suggestions

### Phase 4: Economy & Polish (🔲 Pending)

- [ ] User profile & economy
- [ ] Coin balance display
- [ ] Stripe payment integration
- [ ] Pro subscription management
- [ ] Onboarding flow
- [ ] Empty states
- [ ] Error handling
- [ ] Loading states

---

## 10. Appendix

### A. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Server-only (for API routes)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
STRIPE_SECRET_KEY=sk_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

### B. Testing

```bash
# Unit tests (Vitest)
pnpm test           # Watch mode
pnpm test:run       # Single run
pnpm test:coverage  # With coverage

# E2E tests (Playwright)
pnpm test:e2e       # Headless
pnpm test:e2e:ui    # UI mode
```

### C. Deployment

```bash
# Vercel deployment
vercel --prod

# Environment
- Production: toonnotes.com
- Staging: v2.toonnotes.com
```

### D. Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 |
| Firefox | Last 2 |
| Safari | Last 2 |
| Edge | Last 2 |

---

*This PRD is derived from the Mobile App PRD v2.0 and adapted for web platform.*
