---
name: marketing-copy
description: Generates marketing copy for ToonNotes across channels (App Store, social, email, landing pages). This skill should be used when creating or updating marketing messaging, launching features, or preparing campaigns.
---

# Marketing Copy Generator

This skill generates marketing copy for ToonNotes using **Strategy v2: AI Organization + AI Design** positioning. All copy targets the "Prolific Procrastinator" ICP and leads with pain-relief messaging.

## Strategy v2 Core Positioning

**One-liner:** "Capture everything. Organize nothing. See it beautifully."

**ICP:** The Prolific Procrastinator - heavy note-takers who have given up on organization

**Two Pillars:**
1. **AI Organization** - Structure without effort (auto-labeling, smart grouping, summaries)
2. **AI Design** - Visualization as organization (visual layouts, smart theming, shareable beauty)

**Key Insight:** Design IS Organization. When notes look organized, users feel organized.

## When to Use This Skill

- Creating App Store descriptions (iOS, Android)
- Writing social media posts for campaigns
- Generating email copy (welcome, feature announcements)
- Writing landing page content
- Refreshing marketing messages after feature updates
- Creating feature-specific promotional content

## Commands

```
/marketing-copy --type=app-store --platform=ios      # iOS App Store copy
/marketing-copy --type=app-store --platform=android  # Google Play Store copy
/marketing-copy --type=social --platform=instagram   # Instagram posts
/marketing-copy --type=social --platform=twitter     # Twitter/X posts
/marketing-copy --type=social --platform=tiktok      # TikTok captions
/marketing-copy --type=social --platform=reddit      # Reddit posts
/marketing-copy --type=email --template=welcome      # Welcome email sequence
/marketing-copy --type=email --template=feature      # Feature announcement
/marketing-copy --type=landing --section=hero        # Landing page section
/marketing-copy --feature="AI Design"                # Feature-specific copy
/marketing-copy --audience=webtoon-fans              # Audience-specific
/marketing-copy --refresh                            # Regenerate all core copy
/marketing-copy --dry-run                            # Preview without saving
```

## Source References

Before generating copy, read these source documents:

| Document | Path | Use For |
|----------|------|---------|
| **Strategy v2** | `marketing/strategy.md` | ICP, pain points, two pillars, competitive positioning |
| Messaging Framework | `marketing/messaging.md` | Voice, tone, key messages, use case hooks |
| PRD | `ToonNotes_Expo/PRD.md` | Feature descriptions, value props |
| Monetization Strategy | `ToonNotes_Expo/docs/MONETIZATION-STRATEGY.md` | Pricing, segments |
| Prolific Procrastinator | `marketing/audiences/prolific-procrastinator.yaml` | **Primary** audience (ICP) |
| Webtoon Fans Audience | `marketing/audiences/webtoon-fans.yaml` | Secondary audience (fandom-specific) |
| Aesthetic Creators | `marketing/audiences/aesthetic-creators.yaml` | Tertiary audience |

## Output Locations

| Type | Output Path |
|------|-------------|
| App Store (iOS) | `marketing/copy/app-store/ios.md` |
| App Store (Android) | `marketing/copy/app-store/android.md` |
| Social Templates | `marketing/copy/social/{platform}-templates.md` |
| Email Templates | `marketing/copy/email/{template}.md` |
| Landing Copy | `marketing/copy/landing/{section}.md` |

## Copy Generation Workflow

### Step 1: Load Context

Read the strategy and messaging documents:

```
1. Read marketing/strategy.md for ICP, pain points, two pillars
2. Read marketing/messaging.md for voice, tone, key messages
3. Read appropriate audience YAML for specific messaging hooks
4. Read PRD sections relevant to the feature (if feature-specific)
```

### Step 2: Generate Copy (v2 Guidelines)

Apply the following guidelines:

**Voice (v2):**
- Empathetic—we understand the pain
- Relieved—the solution is effortless
- Not preachy—no productivity guilt
- Aspirational without being overwhelming

**Structure (v2):**
- Lead with **pain relief**, not features
- Use dual-pillar framing (AI Organization + AI Design)
- Reference use cases when relevant (Studying, Ideas, Writing, Trip)
- Include clear CTAs from the CTA library
- Follow platform-specific constraints

**Pain-Point Hooks to Use:**
- "I know I saved it but can't find it" → AI Organization
- "My notes are an ugly mess" → AI Design
- "I've tried everything, nothing sticks" → Zero effort
- "Notes too messy to share" → Shareable beauty

### Step 3: Output

Write copy to the appropriate file in `marketing/copy/`.

## Platform-Specific Guidelines

### iOS App Store

| Field | Limit | Guidelines |
|-------|-------|------------|
| App Name | 30 chars | Include "ToonNotes" + differentiator |
| Subtitle | 30 chars | Key value prop |
| Keywords | 100 chars | Comma-separated, no spaces |
| Description | 4000 chars | Front-load benefits, include features |
| What's New | 4000 chars | Version-specific updates |
| Promotional Text | 170 chars | Seasonal/promotional (optional) |

**Template (v2):**
```markdown
# iOS App Store Copy

## App Name (30 chars)
ToonNotes - AI Note Organizer

## Subtitle (30 chars)
Capture. AI Organizes. Beautiful.

## Keywords (100 chars)
organize,notes,AI,automatic,beautiful,design,second brain,productivity,effortless,no folders

## Description
[Paragraph 1: Hook with pain point - "For people who take lots of notes but hate organizing them..."]

[Paragraph 2: Two Pillars solution - AI Organization + AI Design]

[Paragraph 3: Use cases - Studying, Ideas, Writing, Trip Planning]

[Paragraph 4: Key features bullet list with benefits]

[Paragraph 5: Social proof / closing CTA]

## What's New
Version X.X
- [Feature 1 with benefit]
- [Feature 2 with benefit]
- [Bug fixes and improvements]

## Promotional Text (optional)
[Seasonal or promotional message - use v2 hooks]
```

### Google Play Store

| Field | Limit | Guidelines |
|-------|-------|------------|
| Title | 50 chars | App name + short tagline |
| Short Description | 80 chars | Primary hook |
| Full Description | 4000 chars | Similar to iOS, with Play-specific CTAs |

### Instagram

| Format | Guidelines |
|--------|------------|
| Carousel | 2200 chars caption, 30 hashtags max, 3-10 slides |
| Reels | 2200 chars caption, hook in first line |
| Stories | Text overlays, interactive elements |
| Posts | 2200 chars, front-load message |

**Caption Structure:**
```
[Hook - first line that stops scrolling]

[Value statement or story]

[Details or bullet points]

[CTA]

[Hashtags - mix of branded + discovery]
```

### Twitter/X

| Format | Guidelines |
|--------|------------|
| Single tweet | 280 chars, one clear message |
| Thread | 280 chars each, numbered, hook in first |
| Quote tweet | Add value to shared content |

### TikTok

| Element | Guidelines |
|---------|------------|
| Caption | 2200 chars max, hook first |
| Hashtags | 3-5 relevant, trending when applicable |
| Text overlays | Short, readable, on-brand |

### Reddit

| Element | Guidelines |
|---------|------------|
| Title | Clear, not clickbait |
| Body | Genuine, community-appropriate |
| Tone | Helpful, not promotional |
| Subreddit rules | Always check before posting |

## Feature Copy Templates

When generating feature-specific copy, use this structure:

```markdown
# [Feature Name] Copy

## One-liner
[10-15 words]

## Short Description
[25-50 words]

## Medium Description
[75-100 words]

## Long Description
[150-200 words]

## Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Social Hooks
- Instagram: [Platform-specific hook]
- Twitter: [Platform-specific hook]
- TikTok: [Platform-specific hook]

## CTAs
- Primary: [Main action]
- Secondary: [Alternative action]
```

## Email Templates

### Welcome Sequence

**Email 1 (Immediate):** Welcome + First Design CTA
**Email 2 (Day 2):** Feature highlight + Tips
**Email 3 (Day 5):** Social proof + Design inspiration

### Feature Announcement

```markdown
Subject: [New Feature] is here!

Preview text: [Compelling preview that creates curiosity]

Body:
[Personal greeting]

[Announcement hook]

[What it does - 2-3 sentences]

[Key benefits - bullet list]

[CTA button]

[Secondary CTA or link]

[Sign-off]
```

## Use Case Copy Templates (v2)

When generating copy for specific use cases, use these templates:

### Studying a Subject
```markdown
**Pain:** "50 scattered notes about [topic]. No idea where to start."
**Solution:** "AI groups by theme, generates summaries you can study from."
**Output:** "A visual Knowledge Map—organized knowledge, not chaos."
```

### Collecting Ideas
```markdown
**Pain:** "Random thoughts piling up. Are any of them connected?"
**Solution:** "AI detects themes: 'These 8 notes are about [theme].'"
**Output:** "An Idea Constellation—patterns you never noticed."
```

### Drafting Writing
```markdown
**Pain:** "I want to write about [topic]. I have scattered fragments."
**Solution:** "AI organizes by narrative flow, suggests an outline."
**Output:** "A Writing Workspace—a starting point, not a blank page."
```

### Trip Planning
```markdown
**Pain:** "50 saves across apps. Restaurants, hotels, activities. Chaos."
**Solution:** "AI organizes by city, creates day-by-day draft."
**Output:** "A Trip Planner—shareable itinerary without the work."
```

---

## Copy Validation Checklist (v2)

Before finalizing copy:

- [ ] Leads with pain relief, not features
- [ ] Uses v2 voice (empathetic, relieved, not preachy)
- [ ] References dual pillars when appropriate (AI Organization + AI Design)
- [ ] Uses ICP language ("Prolific Procrastinator" pain points)
- [ ] Includes clear CTA
- [ ] Within character limits
- [ ] No jargon or productivity-guilt language
- [ ] Accessible to new users
- [ ] Accurate feature descriptions
- [ ] Hashtags include v2 keywords (social only)

## Related Skills

- `/marketing-campaign` - Orchestrate full campaign copy needs
- `/aso-optimizer` - Deep App Store optimization
- `/social-scheduler` - Content calendar planning
