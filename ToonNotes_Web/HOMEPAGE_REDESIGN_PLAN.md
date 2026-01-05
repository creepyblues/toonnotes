# ToonNotes Homepage Redesign Plan

**Goal**: Convert aesthetics-sensitive, well-educated visitors into app downloads by speaking directly to their pain points.

---

## Design Philosophy

### Target User: The Prolific Procrastinator

> "I take a lot of notes but lack the organization skill or time to organize them. I've tried the fancy tools—they're too much work. I just need my notes to make sense and look good without me doing anything."

**Key traits:**
- Takes 20-100+ notes per month
- Has abandoned Notion/Obsidian (tried power tools, gave up)
- Cares about aesthetics (uses Pinterest, design-forward apps)
- Says "I know I wrote this somewhere..."
- Envies organized people but won't build a system

---

## Design Direction: Refined Minimalism

Inspired by Things 3, Bear, and premium productivity apps:

### Visual Principles

| Principle | Implementation |
|-----------|----------------|
| **Generous whitespace** | 80-120px between sections, breathing room around all elements |
| **Limited color palette** | Teal primary, warm neutrals, minimal accent colors |
| **Bold typography** | Large headlines (56-72px), clear hierarchy |
| **Purposeful animation** | Subtle, meaningful micro-interactions (not decorative) |
| **Native quality feel** | Polished, crafted, no generic stock imagery |

### Typography System

```
Headlines: Outfit (display) - Bold/Semibold - 56-72px
Subheadlines: Outfit - Medium - 24-32px
Body: Inter - Regular - 18-20px
Accents: Caveat (handwritten) - sparingly for personality
```

### Color Refinement

```
Primary: Teal-600 (#428888) - refined, not bright
Accent: Coral-500 (#FF6B6B) - for CTAs only
Background: Warm-50 (#FAFAF9) - off-white, warm
Text: Warm-900 (#1C1917) - near-black, warm
Muted: Warm-500 (#78716C) - secondary text
```

---

## Page Structure

### 1. Hero Section (Above Fold)

**Formula**: Pain Point → Solution → Action

```
┌─────────────────────────────────────────────────────────────┐
│  NAV: Logo ────────────────────────── Features · Download   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│     "I have 100 notes somewhere.                            │
│      I can't find anything."                                │
│                                                              │
│     Sound familiar?                                         │
│                                                              │
│     ToonNotes uses AI to organize your notes                │
│     and make them beautiful—automatically.                  │
│                                                              │
│     [Download Free]                                         │
│                                                              │
│              ┌──────────────┐                               │
│              │   App        │                               │
│              │   Preview    │                               │
│              │   (Board     │                               │
│              │    view)     │                               │
│              └──────────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Copy approach:**
- Lead with the user's voice (quote-style pain point)
- Short, punchy solution statement
- Single CTA above fold

---

### 2. Pain Point Expansion

**Purpose**: Build empathy, show we understand

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│          Heavy note-takers have a problem.                  │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ "I save     │  │ "I should   │  │ "My notes   │         │
│  │  everything │  │  organize   │  │  are an     │         │
│  │  but can't  │  │  but never  │  │  ugly mess" │         │
│  │  find it"   │  │  do"        │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│       You've tried the power tools.                         │
│       Notion. Obsidian. Roam.                               │
│       Too much setup. Too much maintenance.                 │
│                                                              │
│       You need something that just works.                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. The Solution: Two AI Pillars

**Purpose**: Present ToonNotes' unique value proposition

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│         ToonNotes is different.                             │
│                                                              │
│         AI handles both organization AND design.            │
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────────┐ │
│  │                        │  │                            │ │
│  │   AI Organization      │  │   AI Design                │ │
│  │                        │  │                            │ │
│  │   Notes auto-labeled   │  │   Notes look beautiful     │ │
│  │   by topic, type,      │  │   with colors and styles   │ │
│  │   and theme.           │  │   that match your taste.   │ │
│  │                        │  │                            │ │
│  │   Find anything        │  │   Feel proud of your       │ │
│  │   instantly.           │  │   notes again.             │ │
│  │                        │  │                            │ │
│  └────────────────────────┘  └────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Features: What's Available Now

**Purpose**: Show concrete features, build trust

Mark available features with subtle "Available" badge, future features with "Coming soon"

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              Here's what you can do today.                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  [✓ Available]  Mark Boards                             ││
│  │                                                          ││
│  │  Organize notes by objective—Trip Planning,             ││
│  │  Study Notes, Writing Projects. See them laid out       ││
│  │  beautifully in board view.                             ││
│  │                                                          ││
│  │  [Screenshot: Board view with notes organized]          ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  [✓ Available]  Auto-Labeling                           ││
│  │                                                          ││
│  │  AI reads your notes and suggests labels.               ││
│  │  No manual tagging required.                            ││
│  │                                                          ││
│  │  [Screenshot: Auto-label suggestion UI]                 ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  [✓ Available]  AI Design                               ││
│  │                                                          ││
│  │  Upload any image. AI extracts colors and style.        ││
│  │  Apply it to your notes instantly.                      ││
│  │                                                          ││
│  │  [Screenshot: Design creation flow]                     ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Coming Soon Preview (Optional, brief)

**Purpose**: Show vision, build excitement without overpromising

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              And we're just getting started.                │
│                                                              │
│     Smart Grouping · Summaries · Visual Layouts             │
│               · Shareable Outputs ·                         │
│                                                              │
│              Sign up for early access.                      │
│              [Email input] [Notify me]                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Social Proof (If available)

**Purpose**: Build trust with testimonials or metrics

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│    "Finally, a note app that doesn't make me feel           │
│     guilty about not organizing."                           │
│                                              — @username     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Final CTA

**Purpose**: Drive download action

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              Capture everything.                            │
│              Organize nothing.                              │
│              See it beautifully.                            │
│                                                              │
│              [Download for iOS]  [Download for Android]     │
│                                                              │
│              Free to use. No account required.              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. Footer

Minimal: Logo, Privacy, Terms, Contact

---

## Technical Implementation

### File Changes

1. `app/(marketing)/page.tsx` - Complete rewrite
2. `app/(marketing)/layout.tsx` - Simplify nav
3. `app/globals.css` - Add new utility classes if needed
4. `components/marketing/` - New folder for marketing components

### New Components

```
components/marketing/
├── Hero.tsx           # Pain-point hero section
├── PainPoints.tsx     # Three-card pain expansion
├── TwoPillars.tsx     # AI Org + AI Design value prop
├── FeatureCard.tsx    # Individual feature with status badge
├── Features.tsx       # Features section container
├── ComingSoon.tsx     # Future features teaser
├── FinalCTA.tsx       # Download section
└── index.ts           # Re-exports
```

### Responsive Considerations

- Mobile-first approach
- Hero: Stack vertically on mobile, side-by-side on desktop
- Pain points: 1 column mobile, 3 columns desktop
- Features: Full-width cards on all screens
- Generous touch targets for CTAs

---

## Copy Reference

### Headlines (Options)

**Pain-first:**
- "100 notes. Zero organization."
- "Your notes are chaos. AI can fix that."
- "Tired of losing notes in the pile?"

**Solution-first:**
- "AI organizes your notes. Beautifully."
- "Notes that organize themselves."
- "The note app for people who don't organize."

### Tagline

> "Capture everything. Organize nothing. See it beautifully."

### CTAs

- Primary: "Download Free"
- Secondary: "See How It Works"
- Tertiary: "Get Early Access" (for waitlist)

---

## Success Metrics

| Metric | Goal |
|--------|------|
| Time to first CTA click | < 30 seconds |
| Scroll depth | > 70% reach features section |
| Download button clicks | > 5% of visitors |
| Email signups (if added) | > 2% of visitors |

---

## Implementation Priority

1. **Phase 1**: Hero + Pain Points + Two Pillars (MVP)
2. **Phase 2**: Features section with screenshots
3. **Phase 3**: Coming Soon + Final CTA
4. **Phase 4**: Social proof (when available)

---

*Created: January 2026*
*Based on: Strategy v2, Research on premium app landing pages*
