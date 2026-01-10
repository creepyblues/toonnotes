# Onboarding User Profiling System

> **Status**: Planned (not implemented)
> **Created**: January 2025
> **Purpose**: Identify user profiles during onboarding to personalize experience and gather product analytics

---

## Overview

Add a chat-style questionnaire during onboarding to identify user profiles, enabling:
1. Personalized onboarding experience
2. Auto-suggested boards based on use case
3. Cohort analytics in Supabase for product decisions

---

## Research Summary

### Market Context
- Note-taking app market: **$11.11B in 2025** (16.5% CAGR)
- Key pain points: organization, search, syncing, tool complexity
- ToonNotes ICP: Users who take many notes but struggle organizing

### User Framework (Forte Labs)

| Type | Thinking Style | Current Tools | Pain Point |
|------|---------------|---------------|------------|
| Architects | Top-down, systematic | Notion, Craft | Overwhelmed by complexity |
| Gardeners | Bottom-up, organic | Obsidian, Roam | Lost in connections |
| Collectors | Capture-focused | Evernote, Apple Notes | Can't find anything |
| Minimalists | Quick & simple | Google Keep, Bear | Outgrow simplicity |

---

## Competitor Analysis

### Tier 1: Mass Market (Bundled with OS/Ecosystem)
These apps come pre-installed or bundled - users don't "choose" them, they just use what's there.

| App | Platform | Users | Why They Use It |
|-----|----------|-------|-----------------|
| **Apple Notes** | iOS/macOS | 1B+ devices | Built-in, just works, iCloud sync |
| **Google Keep** | Android/Web | 3B+ (Google ecosystem) | Free, colorful, Google integration |
| **Samsung Notes** | Samsung devices | 400M+ Galaxy users | Pre-installed on Samsung |
| **Microsoft OneNote** | Windows/Office | 1B+ Office users | Free with Office, enterprise standard |

**ToonNotes opportunity**: These users have never actively chosen a notes app. They're open to switching if something feels better.

### Tier 2: Popular Standalone (Actively Chosen)
Users deliberately download these - they've made a conscious choice.

| App | Users | Price | Why They Use It |
|-----|-------|-------|-----------------|
| **Notion** | 100M+ | Free/$10/mo | All-in-one workspace, databases, teams |
| **Evernote** | 225M (legacy) | $15/mo | Web clipping, search, been around since 2008 |
| **Simplenote** | 10M+ | Free | Pure minimalism, cross-platform |
| **ColorNote** | 100M+ downloads | Free | Simple, Android-focused, color coding |
| **Standard Notes** | 5M+ | Free/$90/yr | Privacy-focused, encrypted |

**ToonNotes opportunity**: These users actively seek better tools. They compare features and switch if unsatisfied.

### Tier 3: Niche/Power User (Specialized)
Small but passionate user bases with specific needs.

| App | Users | Price | Target User |
|-----|-------|-------|-------------|
| **Obsidian** | 1M+ | Free/$50/yr sync | PKM nerds, markdown lovers, researchers |
| **Bear** | 1M+ | $3/mo | Apple users, writers, minimalist design |
| **Roam Research** | 100K+ | $15/mo | Academics, networked thought |
| **Logseq** | 500K+ | Free | Open-source PKM, outliner fans |
| **Craft** | 1M+ | Free/$5/mo | Apple users, beautiful documents |
| **Day One** | 1M+ | $3/mo | Journalers, memory keepers |
| **Notability** | 5M+ | $15 one-time | Students, handwriting + audio |
| **GoodNotes** | 10M+ | $9 one-time | Students, handwriting on iPad |

**ToonNotes opportunity**: These users have strong opinions. They value differentiation over mass appeal.

### Competitor Positioning Map

```
                    COMPLEX
                       │
           Notion ●    │    ● Obsidian
                       │    ● Roam
                       │
    UTILITY ───────────┼─────────── DELIGHT
                       │
     OneNote ●         │         ● Bear
     Evernote ●        │         ● Craft
                       │    ● ToonNotes (target)
           Keep ●      │
        Apple Notes ●  │
                       │
                    SIMPLE
```

**ToonNotes positioning**: Simple + Delightful (the underserved quadrant)

### Sources
- [Notion: 100 Million Users](https://www.notion.com/blog/100-million-of-you)
- [Notion vs Evernote Statistics 2025](https://coolest-gadgets.com/notion-vs-evernote-statistics/)
- [Forte Labs: 4 Notetaking Styles](https://fortelabs.com/blog/the-4-notetaking-styles-how-to-choose-a-digital-notes-app-as-your-second-brain/)
- [Note Taking App Market Report 2025](https://www.researchandmarkets.com/reports/5790688/note-taking-app-market-report)
- [Zapier: Best Note-Taking Apps 2025](https://zapier.com/blog/best-note-taking-apps/)

---

## User Profiles for ToonNotes

### Profile 1: Quick Capturer
- **Current app**: Apple Notes, Google Keep
- **Behavior**: Takes lots of quick notes throughout the day
- **Pain**: "I have 500 notes and can't find anything"
- **ToonNotes hook**: AI-powered hashtags + automatic boards
- **Suggested boards**: #ideas, #reminders, #random

### Profile 2: Checklist Lover
- **Current app**: Todoist, Reminders, Google Tasks
- **Behavior**: Uses notes mainly for to-dos and checklists
- **Pain**: "My lists are scattered everywhere"
- **ToonNotes hook**: Checklist mode + visual boards by project
- **Suggested boards**: #todo, #shopping, #projects

### Profile 3: Creative Collector
- **Current app**: Pinterest, Notes app, Screenshots folder
- **Behavior**: Saves inspiration, ideas, media reviews
- **Pain**: "My ideas feel boring and unsorted"
- **ToonNotes hook**: AI designs + visual note cards
- **Suggested boards**: #inspiration, #reviews, #ideas

### Profile 4: Journal Keeper
- **Current app**: Day One, Notes app, physical notebook
- **Behavior**: Daily reflections, reading notes, thoughts
- **Pain**: "I never look back at my notes"
- **ToonNotes hook**: Beautiful designs + automatic organization
- **Suggested boards**: #daily, #reflections, #reading

---

## Question Flow

### Question 1: Current Note App
```
"What do you mainly use for notes right now?"

Tier 1 (show first - most common):
- Apple Notes
- Google Keep
- Samsung Notes
- OneNote

Tier 2 (show second):
- Notion
- Evernote

Other options:
- Paper / Physical notebook
- Other app
- Nothing specific
```

**Rationale**: Tier 1 competitors are where most users come from. Showing them first reduces cognitive load and speeds up selection.

### Question 2: Primary Use Case
```
"What do you use notes for most?"

Options:
- Quick thoughts & reminders     → Quick Capturer
- To-do lists & checklists       → Checklist Lover
- Ideas, inspiration & collections → Creative Collector
- Journaling & reflections       → Journal Keeper
- Work/school notes              → (variant)
```

### Question 3: Biggest Pain Point
```
"What frustrates you most about your notes?"

Options:
- Too many notes, can't find anything  → emphasize AI hashtags
- Notes feel boring/unmotivating       → emphasize AI designs
- Scattered across too many apps       → emphasize boards
- Takes too long to organize           → emphasize automatic features
- Nothing, I'm just exploring
```

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **UI Style** | Chat-style progressive | Conversational, engaging, one question at a time |
| **Data Storage** | Sync to Supabase | Enables cohort analysis and product decisions |
| **Skip Option** | No skip allowed | Ensures complete profile data for all users |
| **Personalization** | Light | Onboarding + suggested boards/hashtags |

---

## UI Design

### Chat-Style Interface

```
┌─────────────────────────────────────┐
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 🎨 Hey! Quick question...    │   │  ← Bot message bubble
│  │ What app do you use for      │   │
│  │ notes right now?             │   │
│  └──────────────────────────────┘   │
│                                     │
│  — Tier 1 (most common) —           │
│  ┌─────────────┐ ┌─────────────┐   │  ← Tappable option pills
│  │ Apple Notes │ │ Google Keep │   │
│  └─────────────┘ └─────────────┘   │
│  ┌──────────────┐ ┌─────────────┐  │
│  │ Samsung Notes│ │   OneNote   │  │
│  └──────────────┘ └─────────────┘  │
│                                     │
│  — Tier 2 (power users) —           │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Notion    │ │  Evernote   │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  — Other —                          │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Paper     │ │   Other     │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### User Flow

```
[Splash] → [Chat Q1] → [Chat Q2] → [Chat Q3] → [Welcome Carousel] → [Main App]
                                                  (personalized)     (with boards)
```

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `components/onboarding/ProfileChat.tsx` | Main chat container |
| `components/onboarding/ChatBubble.tsx` | Message bubble component |
| `components/onboarding/OptionPill.tsx` | Tappable option pill |
| `constants/profileQuestions.ts` | Question config & mapping |
| `services/profileService.ts` | Profile sync to Supabase |
| `services/boardSuggestionService.ts` | Generate boards from profile |

### Files to Modify

| File | Changes |
|------|---------|
| `types/index.ts` | Add `UserProfile` interface |
| `stores/userStore.ts` | Add `userProfile` to OnboardingState |
| `app/_layout.tsx` | Insert ProfileChat before WelcomeCarousel |
| `components/onboarding/WelcomeCarousel.tsx` | Personalize copy |

### Type Definitions

```typescript
// types/index.ts

export type UserProfileType =
  | 'quick-capturer'
  | 'checklist-lover'
  | 'creative-collector'
  | 'journal-keeper'
  | 'unknown';

export interface UserProfile {
  type: UserProfileType;
  currentApp: string;
  primaryUseCase: string;
  painPoint: string;
  capturedAt: number;
}

// In OnboardingState
interface OnboardingState {
  hasCompletedWelcome: boolean;
  hasCompletedProfileChat: boolean;  // NEW
  seenCoachMarks: string[];
  onboardingVersion: number;
  notesCreatedCount: number;
  userProfile?: UserProfile;  // NEW
}
```

### Supabase Schema

```sql
-- Migration: add_user_profiles.sql

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL,
  current_app TEXT NOT NULL,
  primary_use_case TEXT NOT NULL,
  pain_point TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Implementation Steps

### Step 1: Database Setup
1. Create `user_profiles` table in Supabase
2. Add migration: `supabase/migrations/xxx_add_user_profiles.sql`

### Step 2: Type Definitions
1. Add interfaces to `types/index.ts`
2. Update `OnboardingState` in `stores/userStore.ts`

### Step 3: Question Configuration
1. Create `constants/profileQuestions.ts`
2. Define mapping logic (answers → profile type)

### Step 4: Chat UI Components
1. Create `ProfileChat.tsx` (container)
2. Create `ChatBubble.tsx` (messages)
3. Create `OptionPill.tsx` (options)

### Step 5: Profile Service
1. Create `services/profileService.ts`
2. Implement Supabase sync
3. Add profile determination algorithm

### Step 6: Board Suggestion Service
1. Create `services/boardSuggestionService.ts`
2. Map profiles to board configs
3. Auto-create boards on completion

### Step 7: Flow Integration
1. Update `app/_layout.tsx` flow
2. Personalize `WelcomeCarousel.tsx`

### Step 8: Testing
1. Unit tests for profile mapping
2. Integration tests for full flow
3. Supabase sync verification

---

## Personalization Features

### Welcome Carousel Customization

| Profile | Emphasized Feature | Carousel Slide Focus |
|---------|-------------------|---------------------|
| Quick Capturer | AI hashtags | "Notes organize themselves" |
| Checklist Lover | Checklist mode | "Beautiful to-do lists" |
| Creative Collector | AI designs | "Make your ideas shine" |
| Journal Keeper | Board views | "Revisit your memories" |

### Suggested Boards by Profile

| Profile | Auto-Created Boards |
|---------|-------------------|
| Quick Capturer | #ideas, #reminders, #random |
| Checklist Lover | #todo, #shopping, #projects |
| Creative Collector | #inspiration, #reviews, #ideas |
| Journal Keeper | #daily, #reflections, #reading |

### First Coach Mark by Profile

| Profile | First Feature Highlighted |
|---------|--------------------------|
| Quick Capturer | Hashtag autocomplete |
| Checklist Lover | Checklist mode toggle |
| Creative Collector | Design creation button |
| Journal Keeper | Boards tab |

---

## Analytics Opportunities

With profile data in Supabase, we can analyze:

1. **Acquisition**: Which profile types sign up most?
2. **Retention**: Which profiles have best D7/D30 retention?
3. **Monetization**: Which profiles convert to Pro?
4. **Feature usage**: Do profiles use expected features?
5. **Pain point validation**: Do we solve stated pain points?

### Example Queries

```sql
-- Profile distribution
SELECT profile_type, COUNT(*)
FROM user_profiles
GROUP BY profile_type;

-- Pro conversion by profile
SELECT
  up.profile_type,
  COUNT(CASE WHEN u.is_pro THEN 1 END)::float / COUNT(*) as conversion_rate
FROM user_profiles up
JOIN users u ON up.user_id = u.id
GROUP BY up.profile_type;
```

---

## Future Enhancements

1. **A/B test question order** - Does order affect profile distribution?
2. **Deep personalization** - Design style preferences by profile
3. **Re-profiling** - Allow users to update profile in settings
4. **Profile-based notifications** - Customize push notification content
5. **Onboarding variants** - Different carousel for each profile
