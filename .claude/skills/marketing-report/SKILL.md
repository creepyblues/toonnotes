---
name: marketing-report
description: Generates marketing performance reports including campaign metrics, channel attribution, and ROI analysis. This skill should be used for weekly/monthly reviews, campaign post-mortems, and stakeholder updates.
---

# Marketing Report Generator

This skill generates marketing performance reports for ToonNotes using **Strategy v2** success metrics. Reports track dual-pillar engagement (AI Organization vs AI Design) and use-case effectiveness.

## Strategy v2 Success Metrics

From `marketing/strategy.md`:

| Hypothesis | Metric to Track |
|------------|-----------------|
| Users capture heavily | Notes per user per week |
| AI organization works | Time-to-find (search success) |
| **AI design resonates** | Theme/layout customization rate |
| Users return to boards | Weekly active board users |
| **Users share outputs** | Share/export actions |
| Users would pay | Conversion to paid tier |

## When to Use This Skill

- Weekly marketing performance reviews
- Monthly comprehensive reports
- Campaign post-mortem analysis
- Channel performance comparison
- ROI and attribution analysis
- Stakeholder updates

## Commands

```
/marketing-report weekly                            # Weekly summary
/marketing-report monthly                           # Monthly deep-dive
/marketing-report campaign --name=pro-launch        # Campaign performance
/marketing-report campaign --name=pro-launch --compare=baseline
/marketing-report channels                          # Channel comparison
/marketing-report attribution                       # Attribution analysis
/marketing-report roi --period=30d                  # ROI over period
/marketing-report --export=pdf                      # Export as PDF
/marketing-report --export=markdown                 # Export as Markdown
```

## Output Locations

| Type | Output Path |
|------|-------------|
| Weekly | `marketing/analytics/reports/weekly-{date}.md` |
| Monthly | `marketing/analytics/reports/monthly-{month}.md` |
| Campaign | `marketing/campaigns/{status}/{slug}/report.md` |
| Dashboard | `marketing/analytics/dashboards/` |

## Data Sources

### Primary Sources

| Source | Data |
|--------|------|
| App Store Connect | Downloads, impressions, conversion |
| Google Play Console | Installs, ratings, reviews |
| Firebase Analytics | In-app events, user properties |
| Social Analytics | Engagement, reach, followers |
| Supabase | UTM attribution, campaign tracking |

### Campaign Data

```yaml
# From campaign.yaml metrics section
metrics:
  impressions: 0
  clicks: 0
  installs: 0
  conversions: 0
  spend: 0
```

## Report Templates

### Weekly Summary

```markdown
# ToonNotes Marketing Weekly Report

**Period:** [Start Date] - [End Date]
**Generated:** [Date]

## Executive Summary

[2-3 sentence overview of the week's performance]

## Key Metrics

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| App Downloads | {n} | {n} | {+/-}% |
| New Users | {n} | {n} | {+/-}% |
| Active Campaigns | {n} | {n} | - |
| Social Followers | {n} | {n} | {+/-}% |
| Engagement Rate | {%} | {%} | {+/-}% |

## Campaign Updates

### Active Campaigns

| Campaign | Status | Progress | Key Metric |
|----------|--------|----------|------------|
| {name} | Active | {%} complete | {metric} |

### Completed This Week

| Campaign | Result | vs Target |
|----------|--------|-----------|
| {name} | {result} | {+/-}% |

## Channel Performance

| Channel | Reach | Engagement | Conversions |
|---------|-------|------------|-------------|
| Instagram | {n} | {%} | {n} |
| TikTok | {n} | {%} | {n} |
| Twitter | {n} | {%} | {n} |
| ASO | {n} impressions | {%} CVR | {n} |

## Top Performing Content

1. **[Content Title]** - {platform} - {metric}
2. **[Content Title]** - {platform} - {metric}
3. **[Content Title]** - {platform} - {metric}

## Highlights

- [Positive highlight 1]
- [Positive highlight 2]

## Challenges

- [Challenge 1 and mitigation]
- [Challenge 2 and mitigation]

## Next Week Focus

- [Priority 1]
- [Priority 2]
- [Priority 3]
```

### Monthly Report

```markdown
# ToonNotes Marketing Monthly Report

**Period:** [Month Year]
**Generated:** [Date]

## Executive Summary

[Comprehensive overview of the month's marketing performance, key wins, challenges, and strategic insights]

## Performance Dashboard

### Acquisition

| Metric | Target | Actual | % of Target |
|--------|--------|--------|-------------|
| Total Downloads | {n} | {n} | {%} |
| Organic Downloads | {n} | {n} | {%} |
| Paid Downloads | {n} | {n} | {%} |
| Cost per Install | ${n} | ${n} | {%} |

### Activation

| Metric | Target | Actual | % of Target |
|--------|--------|--------|-------------|
| First Note Created | {%} | {%} | {%} |
| First Design Created | {%} | {%} | {%} |
| Day 1 Retention | {%} | {%} | {%} |

### Engagement

| Metric | Target | Actual | Change MoM |
|--------|--------|--------|------------|
| DAU | {n} | {n} | {+/-}% |
| MAU | {n} | {n} | {+/-}% |
| DAU/MAU Ratio | {%} | {%} | {+/-}% |
| Notes per User | {n} | {n} | {+/-}% |

### Monetization

| Metric | Target | Actual | % of Target |
|--------|--------|--------|-------------|
| Revenue | ${n} | ${n} | {%} |
| Paying Users | {n} | {n} | {%} |
| ARPPU | ${n} | ${n} | {%} |
| Conversion Rate | {%} | {%} | {%} |

## Channel Deep-Dive

### Instagram

**Followers:** {n} ({+/-}% MoM)
**Reach:** {n}
**Engagement Rate:** {%}

| Content Type | Posts | Avg Reach | Avg Engagement |
|--------------|-------|-----------|----------------|
| Reels | {n} | {n} | {%} |
| Carousels | {n} | {n} | {%} |
| Posts | {n} | {n} | {%} |
| Stories | {n} | {n} views | - |

**Top Performing:**
1. [Content] - {metric}
2. [Content] - {metric}

**Insights:**
- [Insight 1]
- [Insight 2]

### TikTok

[Similar structure...]

### Twitter

[Similar structure...]

### App Store Optimization

**iOS:**
| Metric | Value | Change |
|--------|-------|--------|
| Impressions | {n} | {+/-}% |
| Product Page Views | {n} | {+/-}% |
| Conversion Rate | {%} | {+/-}% |
| Keyword Rankings | [Top keywords and positions] |

**Android:**
[Similar structure...]

## Campaign Performance

### Completed Campaigns

| Campaign | Type | Duration | Result | ROI |
|----------|------|----------|--------|-----|
| {name} | {type} | {days} | {result} | {%} |

### Ongoing Campaigns

| Campaign | Status | Progress | Current Performance |
|----------|--------|----------|---------------------|
| {name} | Active | {%} | {metric} |

### Campaign Learnings

**What Worked:**
- [Learning 1]
- [Learning 2]

**What Didn't:**
- [Learning 1]
- [Learning 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

## Attribution Analysis

### Source Breakdown

| Source | Users | % of Total | Quality Score |
|--------|-------|------------|---------------|
| Organic | {n} | {%} | {score}/10 |
| Instagram | {n} | {%} | {score}/10 |
| TikTok | {n} | {%} | {score}/10 |
| Twitter | {n} | {%} | {score}/10 |
| Reddit | {n} | {%} | {score}/10 |
| Other | {n} | {%} | {score}/10 |

### Quality = Retention × Conversion weighted

## Budget & ROI

| Category | Budget | Spent | Remaining | ROI |
|----------|--------|-------|-----------|-----|
| Paid Social | ${n} | ${n} | ${n} | {%} |
| Influencers | ${n} | ${n} | ${n} | {%} |
| Content | ${n} | ${n} | ${n} | - |
| **Total** | **${n}** | **${n}** | **${n}** | **{%}** |

## Strategic Recommendations

### Short-term (Next Month)

1. [Recommendation with rationale]
2. [Recommendation with rationale]

### Medium-term (Next Quarter)

1. [Recommendation with rationale]
2. [Recommendation with rationale]

## Appendix

### Raw Data Tables
[Detailed data...]

### Methodology Notes
[How metrics are calculated...]
```

### Campaign Report

```markdown
# Campaign Report: {Campaign Name}

**Type:** {Feature Launch / Seasonal / Partnership}
**Duration:** {Start} - {End}
**Status:** {Completed / Active}

## Overview

[Campaign summary and objectives]

## Goals vs Actuals

| Goal | Target | Actual | Achievement |
|------|--------|--------|-------------|
| Impressions | {n} | {n} | {%} |
| Clicks | {n} | {n} | {%} |
| Installs | {n} | {n} | {%} |
| Conversions | {n} | {n} | {%} |
| Revenue | ${n} | ${n} | {%} |

## Channel Performance

| Channel | Impressions | Clicks | CTR | Conversions |
|---------|-------------|--------|-----|-------------|
| {channel} | {n} | {n} | {%} | {n} |

## Content Performance

| Content | Platform | Reach | Engagement | Conversions |
|---------|----------|-------|------------|-------------|
| {content} | {platform} | {n} | {%} | {n} |

## Asset Performance

| Asset | Uses | Performance |
|-------|------|-------------|
| {asset} | {n} | {metric} |

## Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| {date} | {milestone} | ✅ / ❌ |

## Budget

| Category | Planned | Actual | Variance |
|----------|---------|--------|----------|
| Creative | ${n} | ${n} | ${n} |
| Paid | ${n} | ${n} | ${n} |
| **Total** | **${n}** | **${n}** | **${n}** |

## ROI Analysis

**Total Spend:** ${n}
**Revenue Generated:** ${n}
**ROI:** {%}

## Learnings

### What Worked
- [Learning 1]
- [Learning 2]

### What Didn't
- [Learning 1]
- [Learning 2]

### Recommendations for Future
- [Recommendation 1]
- [Recommendation 2]
```

## Metrics Definitions

| Metric | Definition | Source |
|--------|------------|--------|
| Downloads | App store downloads | App Store Connect / Play Console |
| Installs | Successful app installations | Firebase |
| MAU | Monthly Active Users (opened app) | Firebase |
| DAU | Daily Active Users | Firebase |
| Conversion Rate | Purchases / Active Users | Firebase |
| ARPPU | Revenue / Paying Users | RevenueCat |
| Engagement Rate | (Likes + Comments + Saves) / Reach | Social platforms |
| CTR | Clicks / Impressions | Ad platforms |
| CPI | Spend / Installs | Calculated |

## Strategy v2 Dual-Pillar Metrics

Track engagement separately for each AI pillar:

### AI Organization Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Auto-label usage | % of notes with AI-assigned labels | 80%+ |
| Search success rate | Searches that find target note | 90%+ |
| Smart grouping engagement | Users viewing AI-grouped clusters | 50%+ |
| Summary generation | Users generating cluster summaries | 30%+ |

### AI Design Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Board creation rate | Boards created per active user per week | 2+ |
| Layout customization | % of boards with non-default layouts | 60%+ |
| Theme personalization | % of boards with custom theming | 40%+ |
| Share/export rate | Boards shared or exported | 25%+ |

### Use Case Tracking

Track engagement by use case:

| Use Case | Key Metric | Target |
|----------|------------|--------|
| Studying | Knowledge Maps created | [baseline TBD] |
| Collecting Ideas | Idea Constellations created | [baseline TBD] |
| Drafting Writing | Writing Workspaces created | [baseline TBD] |
| Trip Planning | Trip Planners created | [baseline TBD] |

## Benchmarks

| Metric | Industry Average | ToonNotes Target |
|--------|------------------|------------------|
| Day 1 Retention | 25-35% | 40% |
| Day 7 Retention | 10-15% | 25% |
| Conversion Rate | 2-4% | 5% |
| Engagement Rate (IG) | 1-3% | 5% |

## Related Skills

- `/marketing-campaign` - Campaign management
- `/marketing-copy` - Content performance tracking
- `/social-scheduler` - Social analytics
- `/cost-report` - API cost tracking
