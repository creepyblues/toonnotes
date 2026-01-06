# ToonNotes Marketing Engine

A scalable marketing infrastructure built on Claude Code that connects product development with marketing asset generation through skills and agents.

---

## Strategy: The Two AI Pillars

ToonNotes is built on **AI Organization + AI Design** for heavy note-takers who hate organizing.

| Pillar | Tagline | Core Value |
|--------|---------|------------|
| **AI Organization** | Structure without effort | Auto-labeling, smart grouping, summaries, suggestions |
| **AI Design** | Visualization as organization | Visual layouts, smart theming, personal aesthetic, shareable beauty |

**Key Insight**: *Design IS Organization* — When notes *look* organized, users *feel* organized.

**Positioning**: "Capture everything. Organize nothing. See it beautifully."

See [Strategy v2](./strategy.md) for the full strategic framework including ICP, pain points, competitive landscape, and use cases.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Directory Structure](#directory-structure)
4. [Skills Reference](#skills-reference)
5. [Workflows](#workflows)
6. [Best Practices](#best-practices)
7. [Integration Guide](#integration-guide)

---

## Overview

The ToonNotes Marketing Engine enables:

- **Feature-to-Marketing Automation**: New features automatically trigger marketing asset generation
- **Consistent Messaging**: All copy derived from a single source of truth
- **Multi-Channel Coordination**: Unified campaigns across App Store, social, email, and web
- **Scalable Content**: Batch generation of social content, ASO copy, and campaign assets

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MARKETING ENGINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   SOURCE    │    │   SKILLS    │    │   OUTPUT    │         │
│  │   OF TRUTH  │───▶│   ENGINE    │───▶│   ASSETS    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│        │                  │                  │                  │
│   messaging.md      marketing-copy      App Store copy          │
│   audiences/        marketing-campaign  Social content          │
│   PRD.md            aso-optimizer       Campaign configs        │
│   MONETIZATION.md   social-scheduler    Landing pages           │
│                     marketing-assets    Visual assets           │
│                     marketing-report    Analytics               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comprehensive Workflow Visualization

### System Overview

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         TOONNOTES MARKETING ENGINE                            ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                        SOURCE OF TRUTH                                   │ ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ ║
║  │  │   PRD.md     │  │ MONETIZATION │  │ messaging.md │  │ audiences/  │  │ ║
║  │  │  Features    │  │   Pricing    │  │    Voice     │  │   Personas  │  │ ║
║  │  │  Value Props │  │   Segments   │  │    Tone      │  │   Hooks     │  │ ║
║  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │ ║
║  └─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘ ║
║            │                 │                 │                 │           ║
║            └─────────────────┴────────┬────────┴─────────────────┘           ║
║                                       │                                       ║
║                                       ▼                                       ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                          SKILL ENGINE                                    │ ║
║  │                                                                          │ ║
║  │   ┌────────────────────────────────────────────────────────────────┐    │ ║
║  │   │                   marketing-campaign                            │    │ ║
║  │   │                   (ORCHESTRATOR)                                │    │ ║
║  │   │                                                                 │    │ ║
║  │   │  Coordinates all skills for unified campaign execution          │    │ ║
║  │   └─────────┬───────────────────┬───────────────────┬──────────────┘    │ ║
║  │             │                   │                   │                    │ ║
║  │             ▼                   ▼                   ▼                    │ ║
║  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │ ║
║  │   │ marketing-copy  │ │  aso-optimizer  │ │social-scheduler │           │ ║
║  │   │                 │ │                 │ │                 │           │ ║
║  │   │ • App Store     │ │ • Keywords      │ │ • Calendars     │           │ ║
║  │   │ • Social        │ │ • Descriptions  │ │ • Batch posts   │           │ ║
║  │   │ • Email         │ │ • What's New    │ │ • Platform mix  │           │ ║
║  │   │ • Landing       │ │ • Competitive   │ │ • Export        │           │ ║
║  │   └────────┬────────┘ └────────┬────────┘ └────────┬────────┘           │ ║
║  │            │                   │                   │                    │ ║
║  │            └───────────────────┼───────────────────┘                    │ ║
║  │                                │                                         │ ║
║  │            ┌───────────────────┼───────────────────┐                    │ ║
║  │            ▼                   ▼                   ▼                    │ ║
║  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │ ║
║  │   │marketing-assets │ │marketing-report │ │ frontend-design │           │ ║
║  │   │                 │ │                 │ │   (external)    │           │ ║
║  │   │ • OG images     │ │ • Weekly        │ │                 │           │ ║
║  │   │ • Screenshots   │ │ • Monthly       │ │ • Landing pages │           │ ║
║  │   │ • Social gfx    │ │ • Campaign      │ │ • Components    │           │ ║
║  │   │ • Banners       │ │ • Attribution   │ │ • Pro pages     │           │ ║
║  │   └────────┬────────┘ └────────┬────────┘ └────────┬────────┘           │ ║
║  │            │                   │                   │                    │ ║
║  └────────────┼───────────────────┼───────────────────┼────────────────────┘ ║
║               │                   │                   │                      ║
║               ▼                   ▼                   ▼                      ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                           OUTPUT CHANNELS                               │ ║
║  │                                                                          │ ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │ ║
║  │  │App Store │ │Instagram │ │ TikTok   │ │Twitter/X │ │  Reddit  │       │ ║
║  │  │  (iOS)   │ │          │ │          │ │          │ │          │       │ ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │ ║
║  │                                                                          │ ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │ ║
║  │  │Play Store│ │  Email   │ │ Landing  │ │Analytics │                    │ ║
║  │  │(Android) │ │          │ │  Pages   │ │ Reports  │                    │ ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘                    │ ║
║  │                                                                          │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Skill Interconnection Map

```
                            ┌─────────────────────────┐
                            │   marketing-campaign    │
                            │     (ORCHESTRATOR)      │
                            │                         │
                            │  Entry point for all    │
                            │  campaign operations    │
                            └───────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  marketing-copy  │         │   aso-optimizer  │         │ social-scheduler │
│                  │         │                  │         │                  │
│ Generates text   │         │ App Store        │         │ Content          │
│ for all channels │         │ optimization     │         │ calendars        │
│                  │         │                  │         │                  │
│ ▪ --type=        │         │ ▪ --platform=    │         │ ▪ --weeks=       │
│   app-store      │◀───────▶│   ios/android    │         │ ▪ --platform=    │
│   social         │         │ ▪ --competitor=  │         │ ▪ --feature=     │
│   email          │         │ ▪ --version=     │         │ ▪ --export=      │
│   landing        │         │                  │         │                  │
└────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                            │                            │
         │         ┌──────────────────┼──────────────────┐         │
         │         │                  │                  │         │
         ▼         ▼                  ▼                  ▼         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              marketing-assets                                │
│                                                                              │
│  Generates visual assets for all channels                                    │
│                                                                              │
│  ▪ og --note-id= / --page=          ▪ social --platform= --template=        │
│  ▪ screenshot --platform= --feature= ▪ banner --campaign=                   │
│  ▪ audit / specs                                                             │
│                                                                              │
│  Integrates with:                                                            │
│  └── frontend-design (external) - for landing pages                         │
│  └── ToonNotes_Web/app/api/og/ - for OG image generation                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              marketing-report                                │
│                                                                              │
│  Aggregates data and generates performance reports                           │
│                                                                              │
│  ▪ weekly / monthly           ▪ campaign --name=                            │
│  ▪ channels / attribution     ▪ roi --period=                               │
│  ▪ --export=pdf/markdown                                                     │
│                                                                              │
│  Integrates with:                                                            │
│  └── Firebase Analytics - in-app events                                     │
│  └── App Store Connect / Play Console - store metrics                        │
│  └── Social platform analytics - engagement data                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Campaign Lifecycle Flow

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          CAMPAIGN LIFECYCLE                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌───────┐ ║
║   │ TRIGGER │────▶│ CREATE  │────▶│ GENERATE│────▶│ REVIEW  │────▶│APPROVE│ ║
║   └─────────┘     └─────────┘     └─────────┘     └─────────┘     └───────┘ ║
║                                                                        │     ║
║   Feature merged  Campaign YAML   Skills run      Human review    Set status ║
║   PRD updated     initialized     Copy, assets    Edit content    to active  ║
║   Seasonal need   Templates used  Calendar made   Approve final              ║
║                                                                        │     ║
║   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     ║
║                                                                              ║
║   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌───────┐ ║
║   │  LIVE   │────▶│ MONITOR │────▶│ ADJUST  │────▶│ REPORT  │────▶│ARCHIVE│ ║
║   └─────────┘     └─────────┘     └─────────┘     └─────────┘     └───────┘ ║
║                                                                              ║
║   Deploy content  Track metrics   Optimize based  Generate final  Move to    ║
║   Update stores   Engagement      on performance  performance     archive/   ║
║   Schedule posts  Conversions     Adjust content  Capture learns  campaigns  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

COMMANDS BY STAGE:

┌─────────────────────────────────────────────────────────────────────────────┐
│ TRIGGER → CREATE                                                            │
│ /marketing-campaign create --type=feature-launch --feature="Pro"            │
├─────────────────────────────────────────────────────────────────────────────┤
│ CREATE → GENERATE (Automatic Pipeline)                                      │
│ ├── /marketing-copy --feature="Pro"                                         │
│ ├── /aso-optimizer generate --platform=ios                                  │
│ ├── /social-scheduler generate --feature="Pro"                              │
│ └── /marketing-assets specs --campaign=pro-launch                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ REVIEW → APPROVE                                                            │
│ /marketing-campaign update --campaign=pro-launch --status=active            │
├─────────────────────────────────────────────────────────────────────────────┤
│ MONITOR                                                                     │
│ /marketing-campaign status --campaign=pro-launch                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ REPORT → ARCHIVE                                                            │
│ /marketing-report campaign --name=pro-launch                                │
│ /marketing-campaign archive --campaign=pro-launch                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
└──────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │         SOURCE DOCUMENTS        │
                    │                                 │
                    │  ToonNotes_Expo/                │
                    │  ├── PRD.md                     │
                    │  └── docs/                      │
                    │      ├── MONETIZATION.md        │
                    │      └── UX-DOCUMENTATION.md    │
                    │                                 │
                    │  marketing/                     │
                    │  ├── messaging.md               │
                    │  └── audiences/*.yaml           │
                    │                                 │
                    └───────────────┬─────────────────┘
                                    │
                                    │ READ
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            SKILL PROCESSING                                  │
│                                                                              │
│   ┌───────────────────┐                                                      │
│   │ marketing-campaign│──┐                                                   │
│   └───────────────────┘  │                                                   │
│            ▲             │ ORCHESTRATE                                       │
│            │             ▼                                                   │
│   ┌────────┴────────────────────────────────────────────────────┐           │
│   │                                                              │           │
│   │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │           │
│   │   │   COPY      │   │    ASO      │   │   SOCIAL    │       │           │
│   │   │ GENERATION  │   │OPTIMIZATION │   │  PLANNING   │       │           │
│   │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘       │           │
│   │          │                 │                 │               │           │
│   │          └─────────────────┼─────────────────┘               │           │
│   │                            ▼                                 │           │
│   │                   ┌─────────────┐                           │           │
│   │                   │   ASSETS    │                           │           │
│   │                   │ GENERATION  │                           │           │
│   │                   └──────┬──────┘                           │           │
│   │                          │                                   │           │
│   └──────────────────────────┼───────────────────────────────────┘           │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │
                               │ WRITE
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            OUTPUT STRUCTURE                                  │
│                                                                              │
│   marketing/                                                                 │
│   ├── campaigns/active/{campaign}/                                          │
│   │   ├── campaign.yaml        ◀── Campaign configuration                   │
│   │   ├── copy/                                                              │
│   │   │   ├── app-store.md     ◀── App Store descriptions                   │
│   │   │   ├── instagram.md     ◀── Instagram posts                          │
│   │   │   └── twitter.md       ◀── Twitter threads                          │
│   │   ├── calendar.md          ◀── Content calendar                         │
│   │   ├── assets/              ◀── Visual assets                            │
│   │   └── metrics.json         ◀── Performance data                         │
│   │                                                                          │
│   ├── copy/                                                                  │
│   │   ├── app-store/                                                         │
│   │   │   ├── ios.md           ◀── Master iOS listing                       │
│   │   │   └── android.md       ◀── Master Android listing                   │
│   │   ├── social/              ◀── Post templates                           │
│   │   └── email/               ◀── Email templates                          │
│   │                                                                          │
│   └── analytics/reports/       ◀── Generated reports                        │
│                                                                              │
│   ToonNotes_Web/app/(marketing)/  ◀── Landing pages                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                               │
                               │ DEPLOY
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DISTRIBUTION                                       │
│                                                                              │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│   │  iOS   │  │Android │  │  IG    │  │TikTok  │  │Twitter │  │ Reddit │   │
│   │  App   │  │  Play  │  │        │  │        │  │   /X   │  │        │   │
│   │ Store  │  │ Store  │  │        │  │        │  │        │  │        │   │
│   └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                               │
                               │ TRACK
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            ANALYTICS                                         │
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │   Firebase   │     │  App Store   │     │   Social     │                │
│   │  Analytics   │     │   Connect    │     │  Analytics   │                │
│   └───────┬──────┘     └───────┬──────┘     └───────┬──────┘                │
│           │                    │                    │                        │
│           └────────────────────┼────────────────────┘                        │
│                                │                                             │
│                                ▼                                             │
│                   ┌────────────────────────┐                                │
│                   │   marketing-report     │                                │
│                   │                        │                                │
│                   │  Aggregates all data   │                                │
│                   │  Generates insights    │                                │
│                   └────────────────────────┘                                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Content Pillar Distribution

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    CONTENT PILLAR DISTRIBUTION                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   RECOMMENDED MIX:                                                           │
│                                                                              │
│   ╔══════════════════════════════════════════════════════════════════════╗  │
│   ║                                                                      ║  │
│   ║   FEATURE SHOWCASES (30%)                                            ║  │
│   ║   ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║  │
│   ║   • App features in action                                           ║  │
│   ║   • Tutorials and demos                                              ║  │
│   ║   • Before/after transformations                                     ║  │
│   ║                                                                      ║  │
│   ╠══════════════════════════════════════════════════════════════════════╣  │
│   ║                                                                      ║  │
│   ║   USER CREATIVITY (25%)                                              ║  │
│   ║   ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║  │
│   ║   • User-generated designs (with permission)                         ║  │
│   ║   • Community spotlights                                             ║  │
│   ║   • Reposts and engagement                                           ║  │
│   ║                                                                      ║  │
│   ╠══════════════════════════════════════════════════════════════════════╣  │
│   ║                                                                      ║  │
│   ║   FANDOM CONNECTION (25%)                                            ║  │
│   ║   ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║  │
│   ║   • Webtoon/anime references                                         ║  │
│   ║   • Trending content participation                                   ║  │
│   ║   • Seasonal/event content                                           ║  │
│   ║                                                                      ║  │
│   ╠══════════════════════════════════════════════════════════════════════╣  │
│   ║                                                                      ║  │
│   ║   TIPS & TRICKS (15%)                                                ║  │
│   ║   ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║  │
│   ║   • Productivity tips                                                ║  │
│   ║   • Design inspiration                                               ║  │
│   ║   • Quick how-tos                                                    ║  │
│   ║                                                                      ║  │
│   ╠══════════════════════════════════════════════════════════════════════╣  │
│   ║                                                                      ║  │
│   ║   BEHIND THE SCENES (5%)                                             ║  │
│   ║   █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║  │
│   ║   • Development updates                                              ║  │
│   ║   • Team stories                                                     ║  │
│   ║   • Work-in-progress                                                 ║  │
│   ║                                                                      ║  │
│   ╚══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│   PLATFORM MAPPING:                                                          │
│   ┌────────────────┬────────────┬────────────┬────────────┬────────────┐    │
│   │     PILLAR     │ Instagram  │  TikTok    │  Twitter   │   Reddit   │    │
│   ├────────────────┼────────────┼────────────┼────────────┼────────────┤    │
│   │ Feature        │ Carousel   │ Demo video │ Thread     │ Tutorial   │    │
│   │                │ Reels      │ Tutorial   │ Single     │ post       │    │
│   ├────────────────┼────────────┼────────────┼────────────┼────────────┤    │
│   │ User           │ Repost     │ Duet       │ Quote RT   │ Showcase   │    │
│   │                │ Story      │ Stitch     │ Mention    │ Comment    │    │
│   ├────────────────┼────────────┼────────────┼────────────┼────────────┤    │
│   │ Fandom         │ Themed     │ Trend      │ Discussion │ r/webtoons │    │
│   │                │ post       │ sound      │ Opinion    │ r/anime    │    │
│   ├────────────────┼────────────┼────────────┼────────────┼────────────┤    │
│   │ Tips           │ Carousel   │ Quick tip  │ Tip thread │ How-to     │    │
│   │                │ Reel       │ 30-sec     │ Numbered   │ post       │    │
│   ├────────────────┼────────────┼────────────┼────────────┼────────────┤    │
│   │ BTS            │ Story      │ WIP video  │ Update     │ Dev diary  │    │
│   │                │ Poll       │ Casual     │ Single     │            │    │
│   └────────────────┴────────────┴────────────┴────────────┴────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Generate App Store Copy

```bash
# Generate iOS App Store listing
/marketing-copy --type=app-store --platform=ios

# Generate Android Play Store listing
/marketing-copy --type=app-store --platform=android
```

### 2. Create a Feature Launch Campaign

```bash
# Create a new campaign for a feature
/marketing-campaign create --type=feature-launch --feature="Pro Subscription"

# Check campaign status
/marketing-campaign status --campaign=pro-subscription-launch
```

### 3. Plan Social Content

```bash
# Generate 4-week content calendar
/social-scheduler plan --weeks=4

# Generate posts for a specific platform
/social-scheduler generate --platform=instagram --week=1
```

### 4. Generate Marketing Report

```bash
# Weekly summary
/marketing-report weekly

# Campaign performance
/marketing-report campaign --name=pro-subscription-launch
```

---

## Directory Structure

```
marketing/
├── README.md                      # This file
├── messaging.md                   # Core messaging framework (SOURCE OF TRUTH)
│
├── audiences/                     # Target audience definitions
│   ├── webtoon-fans.yaml          # Primary: Webtoon/anime fans (16-35)
│   └── aesthetic-creators.yaml    # Secondary: Aesthetic note-takers (18-30)
│
├── campaigns/                     # Campaign management
│   ├── active/                    # Currently running campaigns
│   │   └── {campaign-slug}/
│   │       ├── campaign.yaml      # Campaign configuration
│   │       ├── assets/            # Campaign-specific assets
│   │       ├── copy/              # Generated copy
│   │       └── metrics.json       # Performance data
│   ├── archive/                   # Completed campaigns
│   └── templates/                 # Campaign templates
│       ├── feature-launch.yaml    # For new feature releases
│       └── seasonal.yaml          # For holidays/trending moments
│
├── assets/                        # Marketing assets library
│   ├── brand/                     # Logos, colors, fonts, guidelines
│   ├── screenshots/               # App store screenshots
│   │   ├── ios/
│   │   └── android/
│   └── social/                    # Social media templates
│       ├── instagram/
│       ├── twitter/
│       └── tiktok/
│
├── copy/                          # Marketing copy library
│   ├── app-store/                 # ASO copy
│   │   ├── ios.md                 # iOS App Store
│   │   └── android.md             # Google Play Store
│   ├── social/                    # Social post templates
│   │   ├── instagram-templates.md
│   │   ├── twitter-templates.md
│   │   └── tiktok-templates.md
│   └── email/                     # Email templates
│       ├── welcome-sequence.md
│       └── feature-announcement.md
│
└── analytics/                     # Marketing analytics
    ├── reports/                   # Generated reports
    │   ├── weekly-{date}.md
    │   └── monthly-{month}.md
    └── dashboards/                # Dashboard configs
```

---

## Skills Reference

### marketing-copy

Generates marketing copy for any channel, derived from the messaging framework.

```bash
# App Store copy
/marketing-copy --type=app-store --platform=ios
/marketing-copy --type=app-store --platform=android

# Social media posts
/marketing-copy --type=social --platform=instagram
/marketing-copy --type=social --platform=twitter
/marketing-copy --type=social --platform=tiktok
/marketing-copy --type=social --platform=reddit

# Email templates
/marketing-copy --type=email --template=welcome
/marketing-copy --type=email --template=feature

# Landing page sections
/marketing-copy --type=landing --section=hero
/marketing-copy --type=landing --section=features

# Feature-specific copy
/marketing-copy --feature="AI Design"
/marketing-copy --feature="Pro Subscription"

# Audience-specific copy
/marketing-copy --audience=webtoon-fans
/marketing-copy --audience=aesthetic-creators

# Regenerate all copy
/marketing-copy --refresh
```

**Output:** `marketing/copy/{type}/`

---

### marketing-campaign

Orchestrates multi-channel marketing campaigns with a pipeline approach.

```bash
# Create campaigns
/marketing-campaign create --type=feature-launch --feature="Pro Subscription"
/marketing-campaign create --type=seasonal --theme="back-to-school"
/marketing-campaign create --type=partnership --partner="Webtoon Name"

# Manage campaigns
/marketing-campaign list                          # List all
/marketing-campaign list --status=active          # Filter by status
/marketing-campaign status --campaign=pro-launch  # Check specific
/marketing-campaign update --campaign=pro-launch --status=active
/marketing-campaign archive --campaign=pro-launch

# Generate reports
/marketing-campaign report --campaign=pro-launch
```

**Pipeline Stages:**
1. Initialize campaign.yaml
2. Generate copy for all channels (calls `/marketing-copy`)
3. Update App Store (calls `/aso-optimizer`)
4. Create content calendar (calls `/social-scheduler`)
5. Document asset requirements (calls `/marketing-assets`)

**Output:** `marketing/campaigns/active/{campaign-slug}/`

---

### aso-optimizer

Optimizes App Store presence for discoverability.

```bash
# Analyze current listing
/aso-optimizer analyze --platform=ios
/aso-optimizer analyze --platform=android

# Keyword research
/aso-optimizer keywords --platform=ios
/aso-optimizer keywords --platform=android

# Generate optimized copy
/aso-optimizer generate --platform=ios
/aso-optimizer generate --platform=android

# Competitive analysis
/aso-optimizer compare --competitor="Bear"
/aso-optimizer compare --competitor="Notion"

# What's New for updates
/aso-optimizer whats-new --version=1.2.0
```

**Output:** `marketing/copy/app-store/{platform}.md`

---

### social-scheduler

Plans and generates social media content calendars.

```bash
# Plan content calendars
/social-scheduler plan --weeks=4
/social-scheduler plan --weeks=4 --platforms=instagram,twitter

# Generate platform-specific content
/social-scheduler generate --platform=instagram --week=1
/social-scheduler generate --platform=twitter --week=1
/social-scheduler generate --platform=tiktok --count=10
/social-scheduler generate --platform=reddit --subreddit=webtoons

# Feature or campaign focused
/social-scheduler --feature="Checklist Mode"
/social-scheduler --campaign=pro-launch

# Export for scheduling tools
/social-scheduler export --format=csv
/social-scheduler export --format=notion
```

**Content Pillars:**
| Pillar | Mix | Description |
|--------|-----|-------------|
| Feature Showcases | 30% | App features in action |
| User Creativity | 25% | User-generated designs |
| Fandom Connection | 25% | Webtoon/anime references |
| Tips & Tricks | 15% | Productivity tips |
| Behind the Scenes | 5% | Development updates |

**Output:** `marketing/campaigns/active/{campaign}/calendar.md`

---

### marketing-assets

Generates and manages visual marketing assets.

```bash
# OG images
/marketing-assets og --note-id=abc123         # For shared note
/marketing-assets og --page=pro               # For landing page

# Social graphics
/marketing-assets social --platform=instagram --template=feature
/marketing-assets social --platform=twitter --template=announcement

# App screenshots
/marketing-assets screenshot --platform=ios --feature=pro
/marketing-assets screenshot --platform=android --feature=design

# Campaign assets
/marketing-assets banner --campaign=pro-launch
/marketing-assets specs --campaign=pro-launch

# Audit missing assets
/marketing-assets audit
/marketing-assets audit --campaign=pro-launch
```

**Output:** `marketing/assets/{type}/`

---

### marketing-report

Generates marketing performance reports.

```bash
# Periodic reports
/marketing-report weekly
/marketing-report monthly

# Campaign reports
/marketing-report campaign --name=pro-launch
/marketing-report campaign --name=pro-launch --compare=baseline

# Analysis
/marketing-report channels          # Channel comparison
/marketing-report attribution       # Attribution analysis
/marketing-report roi --period=30d  # ROI over period

# Export
/marketing-report --export=pdf
/marketing-report --export=markdown
```

**Output:** `marketing/analytics/reports/`

---

## Workflows

### Feature Launch Workflow

When launching a new feature:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FEATURE READY                                                │
│    Feature merged to main, documented in PRD                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CREATE CAMPAIGN                                              │
│    /marketing-campaign create --type=feature-launch             │
│                        --feature="Feature Name"                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. PIPELINE RUNS AUTOMATICALLY                                  │
│    ├─ Extract messaging from PRD                                │
│    ├─ /marketing-copy generates channel copy                    │
│    ├─ /aso-optimizer updates App Store                          │
│    ├─ /social-scheduler creates calendar                        │
│    └─ /marketing-assets documents requirements                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. REVIEW & APPROVE                                             │
│    Review generated content in:                                 │
│    marketing/campaigns/active/{campaign-slug}/                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. ACTIVATE                                                     │
│    /marketing-campaign update --campaign=X --status=active      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. EXECUTE                                                      │
│    - Update App Store listings                                  │
│    - Schedule social posts                                      │
│    - Deploy landing page updates                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. REPORT & ARCHIVE                                             │
│    /marketing-report campaign --name=X                          │
│    /marketing-campaign archive --campaign=X                     │
└─────────────────────────────────────────────────────────────────┘
```

### Weekly Content Workflow

For ongoing social media management:

```bash
# Every Monday: Plan the week
/social-scheduler plan --weeks=1

# Generate platform content
/social-scheduler generate --platform=instagram --week=1
/social-scheduler generate --platform=twitter --week=1
/social-scheduler generate --platform=tiktok --count=7

# Export for scheduling tool
/social-scheduler export --format=csv

# Every Friday: Review performance
/marketing-report weekly
```

### App Store Update Workflow

For version releases:

```bash
# Generate What's New
/aso-optimizer whats-new --version=1.2.0

# Update full listing if needed
/aso-optimizer generate --platform=ios

# Generate new screenshots if features changed
/marketing-assets screenshot --platform=ios --feature=new-feature
```

---

## Best Practices

### 1. Keep Messaging.md Updated

The `marketing/messaging.md` file is the source of truth for all marketing copy. Update it when:
- Value propositions change
- New features are added
- Target audience evolves
- Competitive positioning shifts

### 2. Use Campaigns for Major Launches

Create a campaign for:
- New feature releases
- Major version updates
- Seasonal promotions
- Partnership announcements

Skip campaigns for:
- Bug fix releases
- Minor improvements
- Routine content

### 3. Maintain Content Pillars

Keep social content balanced across pillars:
- Don't over-promote (max 30% feature content)
- Include user content to build community
- Connect with fandom to stay relevant

### 4. Track Everything

Use UTM parameters consistently:
```
utm_source=toonnotes
utm_medium={channel}
utm_campaign={campaign-slug}
```

### 5. Archive Completed Campaigns

After a campaign ends:
```bash
/marketing-report campaign --name=campaign-slug
/marketing-campaign archive --campaign=campaign-slug
```

This preserves learnings for future reference.

---

## Integration Guide

### With ToonNotes_Expo (Mobile App)

**Source Documents:**
- `ToonNotes_Expo/PRD.md` - Feature descriptions, value props
- `ToonNotes_Expo/docs/MONETIZATION-STRATEGY.md` - Pricing, audience insights
- `ToonNotes_Expo/docs/UX-DOCUMENTATION.md` - User flows

**When to Update Marketing:**
- New feature added to PRD → Create campaign
- Pricing change → Update messaging.md, regenerate ASO
- UX change → Update relevant copy

### With ToonNotes_Web (Promo Website)

**Landing Pages:** `ToonNotes_Web/app/(marketing)/`

**Integration Points:**
- Hero section copy from `marketing/messaging.md`
- Feature descriptions from campaigns
- OG images from `/marketing-assets og`

**To Add New Pages:**
```bash
# Use frontend-design skill (called by marketing-assets)
/marketing-assets specs --campaign=pro-launch
# Then create page in ToonNotes_Web based on specs
```

### With Existing Skills

| Skill | Integration |
|-------|-------------|
| `deploy-staging` | Deploy marketing page updates |
| `pr-production` | Include marketing assets in PRs |
| `health-check` | Verify marketing endpoints |
| `cost-report` | Track marketing AI costs |
| `frontend-design` | Generate landing page components |

---

## Appendix

### A. Audience Quick Reference

**Primary: Webtoon/Anime Fans**
- Age: 16-35
- Platforms: Instagram, TikTok, Twitter, Reddit
- Hook: "Notes that match your aesthetic"

**Secondary: Aesthetic Creators**
- Age: 18-30
- Platforms: Instagram, Pinterest, YouTube
- Hook: "AI-powered custom themes"

### B. Content Pillar Examples

| Pillar | Instagram | TikTok | Twitter |
|--------|-----------|--------|---------|
| Feature | Carousel tutorial | Demo video | Thread walkthrough |
| User | Repost + credit | Duet | Quote tweet |
| Fandom | Anime reference post | Trend participation | Discussion tweet |
| Tips | Quick tip carousel | 30-sec tip | Tip thread |
| BTS | Story poll | Work-in-progress | Update tweet |

### C. Asset Dimensions Quick Reference

| Platform | Format | Dimensions |
|----------|--------|------------|
| OG Image | Default | 1200 × 630 |
| Instagram | Square | 1080 × 1080 |
| Instagram | Portrait | 1080 × 1350 |
| Instagram/TikTok | Story/Reel | 1080 × 1920 |
| Twitter | Post | 1200 × 675 |
| iOS Screenshot | 6.7" | 1320 × 2868 |
| iOS Screenshot | 6.5" | 1284 × 2778 |

### D. Related Documentation

- [Messaging Framework](./messaging.md)
- [PRD](../ToonNotes_Expo/PRD.md)
- [Monetization Strategy](../ToonNotes_Expo/docs/MONETIZATION-STRATEGY.md)
- [UX Documentation](../ToonNotes_Expo/docs/UX-DOCUMENTATION.md)
