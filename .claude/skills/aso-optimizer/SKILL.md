---
name: aso-optimizer
description: Optimizes ToonNotes App Store presence including keywords, descriptions, and screenshots for iOS and Android. This skill should be used when updating app store listings, preparing for launches, or improving organic discovery.
---

# ASO Optimizer

This skill optimizes App Store presence for ToonNotes using **Strategy v2: AI Organization + AI Design** positioning. All ASO targets the "Prolific Procrastinator" ICP with organization-first keywords.

## Strategy v2 Core Positioning

**One-liner:** "Capture everything. Organize nothing. See it beautifully."

**ICP:** The Prolific Procrastinator - heavy note-takers who have given up on organization

**Keyword Focus (v2):**
- Primary: organize, AI, automatic, effortless, beautiful
- Pain-point: find notes, messy notes, note chaos, lost notes

## When to Use This Skill

- Launching a new app version
- Optimizing for better search visibility
- Updating descriptions for new features
- Preparing for seasonal promotions
- Competitive analysis
- A/B testing copy variations

## Commands

```
/aso-optimizer analyze --platform=ios          # Analyze current listing
/aso-optimizer analyze --platform=android      # Analyze Play Store listing
/aso-optimizer keywords --platform=ios         # Keyword research
/aso-optimizer keywords --platform=android     # Play Store keywords
/aso-optimizer generate --platform=ios         # Generate optimized copy
/aso-optimizer generate --platform=android     # Generate Play Store copy
/aso-optimizer compare --competitor="Bear"     # Competitive analysis
/aso-optimizer whats-new --version=1.2.0       # Generate What's New
/aso-optimizer --dry-run                       # Preview without saving
```

## Source References

| Document | Use For |
|----------|---------|
| `marketing/strategy.md` | ICP, pain points, two pillars, competitive positioning |
| `marketing/messaging.md` | Core messaging, value props |
| `ToonNotes_Expo/PRD.md` | Feature descriptions |
| `marketing/audiences/prolific-procrastinator.yaml` | **Primary** ICP keywords |
| `marketing/audiences/webtoon-fans.yaml` | Secondary audience keywords |
| `ToonNotes_Expo/app.json` | Current version, app name |

## Output Locations

| Platform | Output Path |
|----------|-------------|
| iOS | `marketing/copy/app-store/ios.md` |
| Android | `marketing/copy/app-store/android.md` |

## iOS App Store Guidelines

### Field Limits

| Field | Limit | Guidelines |
|-------|-------|------------|
| App Name | 30 chars | Brand + differentiator, include primary keyword |
| Subtitle | 30 chars | Compelling hook with secondary keyword |
| Keywords | 100 chars | Comma-separated, no spaces, no duplicates of title |
| Description | 4000 chars | First 3 lines visible, front-load benefits |
| What's New | 4000 chars | Version highlights, user-focused |
| Promotional Text | 170 chars | Seasonal/promotional (changeable anytime) |

### Keyword Strategy (v2)

**Primary Keywords (include in Title/Subtitle):**
- organize, organization
- AI, automatic
- notes, note taking
- beautiful, design

**Secondary Keywords (include in Keyword field):**
- effortless, easy
- find notes, search
- second brain
- productivity
- aesthetic, visual
- no folders, no tags

**Tertiary Keywords (fandom-specific, secondary audience):**
- anime, webtoon
- journal, journaling
- planner, planning
- manga, comic

**Long-tail Keywords (v2):**
- AI note organizer
- automatic note organization
- organize notes automatically
- beautiful note layouts
- notes without organizing
- effortless note taking

**Pain-Point Keywords:**
- find my notes
- messy notes app
- lost notes
- note chaos

### Description Structure (v2)

```markdown
# iOS Description Template

## Paragraph 1: Hook with Pain Point (First 3 visible lines)
"For people who take lots of notes but hate organizing them..."
[Lead with pain, introduce AI solution - Make it compelling enough to tap "more"]

## Paragraph 2: Two Pillars Solution
[AI Organization + AI Design - explain how both work together]
"AI handles the organization AND the design—so your notes make sense and look amazing."

## Paragraph 3: Use Cases
• Studying? AI creates Knowledge Maps from your research notes
• Trip planning? Turn 50 saves into a beautiful itinerary
• Collecting ideas? See patterns in your random thoughts
• Writing? Turn fragments into an outline

## Paragraph 4: Feature List
• AI auto-labels every note—never manually organize again
• Smart grouping connects related notes automatically
• Beautiful visual layouts: timelines, maps, constellations
• Share-ready outputs without cleanup

## Paragraph 5: Social Proof / Closing
[Why users love it - focus on "it finally works" relief + CTA]

## Paragraph 6: Pricing (if freemium)
[What's free, what's Pro, value proposition]
```

## Google Play Store Guidelines

### Field Limits

| Field | Limit | Guidelines |
|-------|-------|------------|
| Title | 50 chars | More room than iOS, include tagline |
| Short Description | 80 chars | Primary hook, searchable |
| Full Description | 4000 chars | Similar to iOS, can include more detail |

### Play Store Specifics

- Bullet points render as text (no special formatting)
- Keywords in title and short description are heavily weighted
- Full description is searchable
- HTML formatting allowed in full description

## Keyword Research Workflow

### Step 1: Gather Seed Keywords

```
From PRD: note, notes, anime, webtoon, AI, design, custom
From Audience: aesthetic, journal, planner, manga, fan
From Competitors: [Research Bear, Notion, Keep keywords]
```

### Step 2: Expand Keywords

Consider:
- Synonyms (note → journal, memo, planner)
- Related terms (anime → manga, webtoon, cartoon)
- Action words (create, design, customize, personalize)
- Audience terms (fan, aesthetic, creative)

### Step 3: Prioritize

| Priority | Criteria |
|----------|----------|
| High | High search volume + high relevance + low competition |
| Medium | Moderate volume + high relevance |
| Low | Low volume OR low relevance |

### Step 4: Allocate

| Location | Keywords |
|----------|----------|
| Title | 1-2 highest priority |
| Subtitle | 1-2 secondary priority |
| Keyword field | Remaining, up to 100 chars |

## Competitive Analysis

When running `/aso-optimizer compare --competitor="App Name"`:

### Analysis Points

1. **Title & Subtitle:** What keywords are they targeting?
2. **Screenshots:** What features do they highlight first?
3. **Description:** How do they structure benefits?
4. **Keywords:** What terms might they rank for?
5. **Reviews:** What do users praise/complain about?

### Competitive 2x2 Framework (v2)

```
                     HIGH NOTE VOLUME
                          ↑
     ┌────────────────────┼────────────────────┐
     │   TOONNOTES        │    Notion          │
     │   AI Org + Design  │    Obsidian        │
     │   (Opportunity)    │    Roam            │
     │   You do nothing   │    You build the   │
     │   It looks amazing │    system yourself │
LOW  ├────────────────────┼────────────────────┤ HIGH
EFFORT│   Apple Notes      │    Evernote        │ EFFORT
     │   Google Keep      │    Bear            │
     │   Quick capture    │    Overkill zone   │
     │   Generic design   │                    │
     └────────────────────┼────────────────────┘
                          ↓
                     LOW NOTE VOLUME
```

### Differentiation Opportunities (v2)

| Competitor | Their Strength | ToonNotes Advantage |
|------------|----------------|---------------------|
| **Notion/Obsidian** | Powerful features | Zero setup, AI organizes automatically |
| **Apple Notes/Keep** | Simple capture | + AI organization + Beautiful design |
| **Bear** | Clean design, Markdown | AI-powered layouts, no manual effort |
| **Evernote** | Legacy features | Modern AI, visual organization |

**Key Differentiator:** No competitor offers **AI-powered visual organization**. ToonNotes is alone in automatically creating beautiful layouts that organize notes.

## What's New Copy

For `/aso-optimizer whats-new --version=X.X.X`:

### Guidelines

- Lead with the most exciting feature
- Use user-focused language (what they get, not what we built)
- Keep it scannable (short bullets)
- End with a thank you or engagement prompt

### Template

```markdown
Version X.X.X

🎨 [Main Feature]
[One sentence benefit]

✨ What's New:
• [Feature 1] - [Benefit]
• [Feature 2] - [Benefit]
• [Improvement]

🐛 Bug Fixes:
• [Fix that improves experience]

Thanks for using ToonNotes! Love the app? Leave us a review!
```

## Screenshot Text Overlays

### iOS Screenshot Guidelines

| Screen | Size (6.5") | Size (5.5") |
|--------|-------------|-------------|
| 1 | 1284 × 2778 | 1242 × 2208 |
| 2-10 | Same | Same |

### Recommended Screenshot Sequence

1. **Hero:** Main value prop + app preview
2. **AI Design:** Show design generation
3. **Customization:** Border and sticker options
4. **Sharing:** Social export feature
5. **Simplicity:** Clean note-taking UI

### Text Overlay Guidelines

- Short, punchy headlines (3-5 words)
- Benefit-focused, not feature-focused
- Consistent typography and colors
- Readable at small sizes

## Output Format

### iOS Copy (ios.md)

```markdown
# ToonNotes iOS App Store Copy

**Last Updated:** [Date]
**Version:** [X.X.X]

## App Name (30 chars)
[App Name]

## Subtitle (30 chars)
[Subtitle]

## Keywords (100 chars)
[keyword1,keyword2,keyword3,...]

## Description (4000 chars)
[Full description]

---

## What's New (4000 chars)
[Version-specific updates]

## Promotional Text (170 chars)
[Optional seasonal message]

---

## Keyword Analysis

| Keyword | Priority | Placement | Reasoning |
|---------|----------|-----------|-----------|
| [keyword] | High | Title | [Why] |
...

## Competitive Notes
[Insights from competitor analysis]
```

## Validation Checklist

Before finalizing:

- [ ] App name under 30 characters
- [ ] Subtitle under 30 characters
- [ ] Keywords under 100 characters (no duplicates of title)
- [ ] Description front-loads benefits
- [ ] No competitor names in copy (App Store violation)
- [ ] No pricing claims that could change
- [ ] Accurate feature descriptions
- [ ] What's New reflects actual changes

## Related Skills

- `/marketing-copy` - General copy generation
- `/marketing-campaign` - Campaign coordination
- `/marketing-assets` - Screenshot generation
