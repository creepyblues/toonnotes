---
name: social-scheduler
description: Plans and generates social media content for ToonNotes across Instagram, TikTok, Twitter/X, and Reddit. This skill should be used when creating content calendars, batch-generating posts, or coordinating social campaigns.
---

# Social Content Scheduler

This skill plans and generates social media content using **Strategy v2: AI Organization + AI Design** positioning. All content targets the "Prolific Procrastinator" ICP with pain-relief messaging and dual-pillar framing.

## Strategy v2 Core Positioning

**One-liner:** "Capture everything. Organize nothing. See it beautifully."

**ICP:** The Prolific Procrastinator - heavy note-takers who have given up on organization

**Content Focus (v2):**
- Pain-point content: "I know I wrote this somewhere..."
- Dual-pillar demos: AI Organization + AI Design in action
- Use case content: Studying, Ideas, Writing, Trip Planning

## When to Use This Skill

- Planning weekly or monthly content calendars
- Batch-generating social posts for a campaign
- Creating feature-focused social content
- Planning seasonal or trending content
- Generating platform-specific variations
- Exporting content for scheduling tools

## Commands

```
/social-scheduler plan --weeks=4                    # 4-week content calendar
/social-scheduler plan --weeks=4 --platforms=instagram,twitter
/social-scheduler generate --platform=instagram --week=1
/social-scheduler generate --platform=twitter --week=1
/social-scheduler generate --platform=tiktok --count=10
/social-scheduler generate --platform=reddit --subreddit=webtoons
/social-scheduler --feature="Checklist Mode"        # Feature-focused content
/social-scheduler --campaign=pro-launch             # Campaign-specific
/social-scheduler export --format=csv               # Export for scheduling tools
/social-scheduler export --format=notion            # Export as Notion database
/social-scheduler --dry-run                         # Preview without saving
```

## Source References

| Document | Use For |
|----------|---------|
| `marketing/messaging.md` | Voice, tone, hashtags |
| `marketing/audiences/webtoon-fans.yaml` | Primary audience preferences |
| `ToonNotes_Expo/PRD.md` | Feature descriptions |
| Campaign YAML | Campaign-specific messaging |

## Output Locations

| Type | Output Path |
|------|-------------|
| Calendar | `marketing/campaigns/active/{campaign}/calendar.md` |
| Post Templates | `marketing/copy/social/{platform}-templates.md` |
| CSV Export | `marketing/analytics/exports/calendar-{date}.csv` |

## Content Pillars (v2)

All content should align with these pillars:

| Pillar | Mix | Description | Example Topics |
|--------|-----|-------------|----------------|
| **AI Organization** | 30% | How AI auto-labels, groups, summarizes | Auto-labeling demo, smart search, "I found it!" moments |
| **AI Design** | 25% | Visual layouts, theming, shareable beauty | Board layouts, Knowledge Maps, Trip Planners |
| **Use Case Demos** | 25% | Studying, Ideas, Writing, Trip Planning | Before/after: chaos → organized board |
| **Pain Point Relief** | 15% | "I know I wrote this...", retrieval stories | Relatable pain → solution moments |
| **Behind the Scenes** | 5% | Dev updates, team stories | New features coming, user feedback |

### Content by Pillar

**AI Organization Content:**
- "Watch AI auto-label 50 random notes in seconds"
- "Never say 'I know I wrote this somewhere' again"
- "From chaos to categorized—no effort required"

**AI Design Content:**
- "Design IS Organization—see your thoughts beautifully"
- "Knowledge Map transformation: before/after"
- "Share-ready outputs without cleanup"

**Use Case Content:**
- "Studying for finals? Turn scattered notes into a Knowledge Map"
- "Trip planning chaos? AI creates your itinerary"
- "Writer's block? AI organizes your fragments into an outline"

**Pain Point Content:**
- "POV: You finally found that note from 3 months ago"
- "This is what 100 unorganized notes look like. Now watch AI fix it."
- "We know you've tried everything. This one actually works."

## Platform Guidelines

### Instagram

**Account:** @toonnotes (proposed)

| Format | Frequency | Best Times (EST) |
|--------|-----------|------------------|
| Reels | 3/week | 6-9 PM |
| Carousels | 2/week | 12-3 PM |
| Stories | Daily | Throughout day |
| Posts | 2/week | 11 AM-1 PM |

**Content Types (v2):**
- Reels: AI Organization demos, before/after transformations, use case stories
- Carousels: Dual-pillar breakdowns, pain-point solutions, use case walkthroughs
- Stories: Polls about organization pain, Q&As, behind-the-scenes
- Posts: Board showcases, Knowledge Maps, Trip Planners

**Hashtag Strategy (v2):**
```
Branded: #ToonNotes #CaptureEverything #DesignIsOrganization (2-3)
Organization: #AIOrganization #SecondBrain #NoteOrganization (3-5)
Aesthetic: #AestheticNotes #VisualThinking #BeautifulNotes (3-5)
Discovery: #NoteTakingApp #ProductivityApp #AIpowered (3-5)
Trending: [Check weekly for relevant trends] (2-3)
Total: 15-25 per post
```

### TikTok

**Account:** @toonnotes (proposed)

| Format | Frequency | Best Times (EST) |
|--------|-----------|------------------|
| Short videos | 5-7/week | 7-11 PM |

**Content Types (v2):**
- Satisfying AI organization (ASMR-style: watch 100 notes get auto-labeled)
- POV videos: "POV: You finally found that note from 3 months ago"
- Pain-point skits: "Me trying to find that one note I know I saved..."
- Before/after transformations: chaos → beautiful board
- Quick tips: "How AI turns my trip bookmarks into an itinerary"
- Trend participation with organization spin

**Hashtag Strategy:**
```
3-5 hashtags per video
Mix of: #ToonNotes + trending sounds/hashtags + niche tags
```

### Twitter/X

**Account:** @toonnotes_app (proposed)

| Format | Frequency | Best Times (EST) |
|--------|-----------|------------------|
| Tweets | Daily | 9 AM, 12 PM, 5 PM |
| Threads | 1-2/week | 9 AM |
| Polls | 1/week | 12 PM |

**Content Types:**
- Feature announcements (threads)
- Quick tips (single tweets)
- Engagement polls (preferences, features)
- Webtoon/anime commentary (build community)
- User retweets and engagement

### Reddit

**Target Subreddits:**
- r/webtoons (485K)
- r/anime (8.5M)
- r/manga (2.5M)
- r/bulletjournal (1.2M)
- r/NoteTaking (38K)
- r/productivity (2.1M)

| Format | Frequency |
|--------|-----------|
| Posts | 2-3/week across subreddits |

**Guidelines:**
- Read and follow each subreddit's rules
- Contribute genuinely to discussions first
- Soft launches via "I made this" posts
- Respond to relevant "looking for app" threads
- No overt self-promotion

## Content Calendar Format

```markdown
# ToonNotes Social Content Calendar

**Period:** [Start Date] - [End Date]
**Campaign:** [Campaign name or "General"]

## Week 1: [Date Range]

### Monday
| Platform | Type | Pillar | Content | Assets | Status |
|----------|------|--------|---------|--------|--------|
| Instagram | Reel | Feature | How AI design works | video_ai_demo | pending |
| Twitter | Tweet | Tips | Quick tip thread | - | pending |

### Tuesday
| Platform | Type | Pillar | Content | Assets | Status |
|----------|------|--------|---------|--------|--------|
| TikTok | Video | Feature | Design generation satisfying | video_satisfying | pending |
| Instagram | Story | BTS | Behind the scenes | story_bts | pending |

[Continue for each day...]

## Week 2: [Date Range]
[...]
```

## Post Templates

### Instagram Carousel Template

```markdown
## Post Title: [Topic]

**Slide 1 (Cover):**
Hook headline: "[Compelling question or statement]"
Visual: [Description]

**Slide 2-N (Content):**
[Slide content with text overlays]

**Final Slide (CTA):**
"Save this for later! 📌"
"Try it in ToonNotes - link in bio"

**Caption:**
[Hook - first line visible]

[Value/Story - 2-3 sentences]

[Bullet points if applicable]

[CTA]

[Hashtags]

**Hashtags:**
#ToonNotes #[relevant tags]
```

### TikTok Video Template

```markdown
## Video Concept: [Title]

**Hook (0-3 sec):**
[What stops the scroll]

**Content (3-30 sec):**
[Main content with text overlays]

**CTA (last 3 sec):**
[Follow, download, comment prompt]

**Caption:**
[Short, punchy caption with hooks]

**Hashtags:**
#ToonNotes #[trending] #[niche]

**Sound:**
[Trending sound or original]
```

### Twitter Thread Template

```markdown
## Thread: [Topic]

**Tweet 1 (Hook):**
[Compelling statement or question - must stand alone]

🧵 [Thread indicator]

**Tweet 2-N:**
[Each tweet is a complete thought, numbered]

**Final Tweet (CTA):**
[Summary + CTA + relevant link]

**Tags:** [Minimal, 1-2 if any]
```

## Feature-Focused Content

When generating for `--feature="Feature Name"`:

### Required Posts Per Feature

| Platform | Count | Types |
|----------|-------|-------|
| Instagram | 3 | 1 Reel, 1 Carousel, 1 Post |
| TikTok | 2 | Tutorial, Satisfying demo |
| Twitter | 5 | Announcement thread + 4 highlight tweets |

### Content Angles

1. **What it is:** Announce the feature
2. **How it works:** Tutorial/demo
3. **Why it matters:** Benefits and use cases
4. **User reactions:** Social proof (after launch)
5. **Tips:** Getting the most out of it

## Export Formats

### CSV Export

```csv
date,platform,type,pillar,content,caption,hashtags,assets,status
2026-01-15,instagram,reel,feature,"AI design tutorial","Learn how to...",#ToonNotes...,video_ai,pending
```

### Notion Export

```markdown
# Content Database

| Date | Platform | Type | Content | Status |
|------|----------|------|---------|--------|
| Jan 15 | Instagram | Reel | AI design tutorial | 📝 Draft |
```

## Scheduling Recommendations

### Optimal Posting Times (EST)

| Platform | Best Times | Days |
|----------|------------|------|
| Instagram | 11 AM, 1 PM, 6 PM | Tue-Fri |
| TikTok | 7 PM, 9 PM | Daily |
| Twitter | 9 AM, 12 PM, 5 PM | Mon-Fri |
| Reddit | 6-8 PM | Weekdays, Weekends |

### Spacing Guidelines

- Same platform: Minimum 4 hours between posts
- Cross-platform: Can post simultaneously
- Stories: Throughout the day, not all at once

## Related Skills

- `/marketing-copy` - Generate copy for posts
- `/marketing-campaign` - Campaign coordination
- `/marketing-assets` - Asset creation
- `/marketing-report` - Performance tracking
