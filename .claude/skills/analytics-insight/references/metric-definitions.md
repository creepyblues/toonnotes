# Metric Definitions

Complete glossary of ToonNotes analytics metrics with definitions, formulas, data sources, and interpretation guidelines.

## Engagement Metrics

### Daily Active Users (DAU)

**Definition**: Unique users who opened the app on a given day.

**Formula**: `COUNT(DISTINCT user_id) WHERE event_name = 'session_start' AND date = target_date`

**Data Source**: GA4 > Reports > Engagement > Overview

**Interpretation**:
- Track day-over-day and week-over-week trends
- Expect weekday vs weekend patterns
- Seasonal variations (holidays may dip)

---

### Monthly Active Users (MAU)

**Definition**: Unique users who opened the app in a 28-day period.

**Formula**: `COUNT(DISTINCT user_id) WHERE event_name = 'session_start' AND date BETWEEN start_date AND end_date`

**Data Source**: GA4 > Reports > Engagement > Overview

**Interpretation**:
- Primary growth indicator
- Compare to total installs for activation rate
- Industry benchmark: Note apps typically have 20-40% of installs become MAU

---

### Stickiness (DAU/MAU Ratio)

**Definition**: Percentage of monthly users who are active on any given day.

**Formula**: `DAU / MAU * 100`

**Target**: >20%

**Data Source**: Calculate from GA4 DAU and MAU

**Interpretation**:
- Higher = more engaged user base
- <10% indicates casual usage
- >30% indicates high engagement/habit formation
- Note-taking apps: 15-25% typical

---

### Sessions Per User

**Definition**: Average number of app sessions per active user.

**Formula**: `COUNT(session_start) / COUNT(DISTINCT user_id)`

**Data Source**: GA4 > Reports > Engagement > Overview

**Interpretation**:
- Target: 3+ sessions/day for power users
- <2 sessions/day: casual users
- Track by subscription tier (Pro vs Free)

---

### Session Duration

**Definition**: Average time users spend in the app per session.

**Formula**: `SUM(engagement_time_msec) / COUNT(sessions)`

**Data Source**: GA4 > Reports > Engagement > Overview

**Interpretation**:
- Longer sessions = deeper engagement
- Note creation should increase duration
- Design creation typically adds 3-5 minutes

---

### Engagement Rate

**Definition**: Percentage of sessions where users performed a meaningful action.

**Formula**: `Sessions with (note_created OR design_saved OR note_edited) / Total Sessions * 100`

**Data Source**: GA4 Custom Exploration

**Interpretation**:
- >50% is good for productivity apps
- Low engagement may indicate UX issues
- Track by user segment

---

## Retention Metrics

### Day 1 Retention (D1)

**Definition**: Percentage of users who return the day after first use.

**Formula**: `Users active on Day 1 after install / Users who installed * 100`

**Target**: 40%

**Data Source**: GA4 > Reports > Retention

**Interpretation**:
- Critical metric - if D1 is low, D7/D30 will suffer
- Industry: 25-35% for productivity apps
- Below 20%: investigate onboarding

---

### Day 7 Retention (D7)

**Definition**: Percentage of users who return 7 days after first use.

**Formula**: `Users active on Day 7 after install / Users who installed * 100`

**Target**: 25%

**Data Source**: GA4 > Reports > Retention

**Interpretation**:
- Indicates habit formation potential
- Industry: 10-15% for productivity apps
- Below 10%: value proposition issue

---

### Day 14 Retention (D14)

**Definition**: Percentage of users who return 14 days after first use.

**Formula**: `Users active on Day 14 after install / Users who installed * 100`

**Target**: 20%

**Data Source**: GA4 > Reports > Retention

**Interpretation**:
- Mid-term retention indicator
- If D14 << D7, investigate week 2 drop-off causes
- Feature adoption in week 2 helps here

---

### Day 30 Retention (D30)

**Definition**: Percentage of users who return 30 days after first use.

**Formula**: `Users active on Day 30 after install / Users who installed * 100`

**Target**: 15%

**Data Source**: GA4 > Reports > Retention

**Interpretation**:
- Long-term retention indicator
- Industry: 5-10% for productivity apps
- >15% indicates strong product-market fit

---

### Churn Rate

**Definition**: Percentage of active users who stop using the app in a given period.

**Formula**: `(Users active in period N-1 but not in period N) / Users active in period N-1 * 100`

**Data Source**: BigQuery custom query

**Interpretation**:
- Weekly churn >10% is concerning
- Monthly churn <20% is healthy
- Track by user segment and subscription tier

---

### Return Rate

**Definition**: Percentage of churned users who return.

**Formula**: `Users who returned after X days inactive / Users who churned * 100`

**Data Source**: BigQuery custom query

**Interpretation**:
- >10% return rate indicates recoverable users
- Reactivation campaigns can target these users

---

## Feature Metrics

### Notes Per User (Weekly)

**Definition**: Average number of notes created per active user per week.

**Formula**: `COUNT(note_created) / COUNT(DISTINCT user_id)` in 7-day window

**Target**: 5+ notes/week for engaged users

**Data Source**: GA4 > Explore > Custom

**Interpretation**:
- Primary engagement indicator
- <1 note/week: user may churn
- >10 notes/week: power user

---

### Designs Created Per User

**Definition**: Average number of designs saved per user.

**Formula**: `COUNT(design_saved) / COUNT(DISTINCT user_id)`

**Data Source**: GA4 event count

**Interpretation**:
- Tracks AI feature engagement
- Free users: limited by coins
- Pro users: unlimited, expect higher

---

### Design Application Rate

**Definition**: Percentage of saved designs that get applied to notes.

**Formula**: `COUNT(design_applied) / COUNT(design_saved) * 100`

**Target**: 70%

**Data Source**: GA4 event comparison

**Interpretation**:
- Low rate: users save but don't use
- May indicate design quality issues
- Track by design type

---

### Label Suggestion Acceptance Rate

**Definition**: Percentage of AI label suggestions that users accept.

**Formula**: `COUNT(label_suggestion_accepted) / (COUNT(label_suggestion_accepted) + COUNT(label_suggestion_declined)) * 100`

**Target**: 70%

**Data Source**: GA4 event comparison

**Interpretation**:
- Measures AI relevance
- <50%: AI suggestions not useful
- >80%: AI is highly relevant

---

### Board Usage Rate

**Definition**: Percentage of active users who view boards.

**Formula**: `COUNT(DISTINCT user_id with board_viewed) / MAU * 100`

**Data Source**: GA4 custom exploration

**Interpretation**:
- Measures organization feature adoption
- Low rate: need better discovery
- High rate: users find value in organization

---

### Editor Mode Distribution

**Definition**: Distribution of editor mode usage (text, checklist, bullet).

**Formula**: Count of `editor_mode_changed` by mode value

**Data Source**: GA4 with custom dimension

**Interpretation**:
- Helps prioritize editor improvements
- If checklist is popular, invest there
- Track changes over time

---

## Monetization Metrics

### Conversion Rate

**Definition**: Percentage of free users who become paying users.

**Formula**: `Paying users / Total users * 100`

**Target**: 5%

**Data Source**: GA4 user properties + purchase events

**Interpretation**:
- Industry: 2-4% for freemium apps
- <2%: value proposition issue
- >5%: strong monetization

---

### Average Revenue Per Paying User (ARPPU)

**Definition**: Average revenue generated per paying user.

**Formula**: `Total Revenue / Paying Users`

**Data Source**: RevenueCat or IAP tracking

**Interpretation**:
- Track monthly and lifetime
- Compare Pro subscription vs coin purchases
- Higher ARPPU = better monetization

---

### Lifetime Value (LTV)

**Definition**: Total revenue expected from a user over their lifetime.

**Formula**: `ARPPU * Average Customer Lifetime`

**Data Source**: BigQuery cohort analysis

**Interpretation**:
- Should be > Customer Acquisition Cost (CAC)
- LTV:CAC ratio >3 is healthy
- Track by acquisition channel

---

### Paywall Conversion Rate

**Definition**: Percentage of users who see paywall and make a purchase.

**Formula**: `COUNT(purchase) / COUNT(paywall_shown) * 100`

**Target**: 3%

**Data Source**: GA4 funnel exploration

**Interpretation**:
- <1%: paywall UX or pricing issue
- >5%: excellent conversion

---

### Trial Conversion Rate

**Definition**: Percentage of trial users who convert to paid.

**Formula**: `Paid conversions from trial / Trial starts * 100`

**Data Source**: RevenueCat or subscription tracking

**Interpretation**:
- Industry: 30-50% for good trials
- <20%: trial doesn't demonstrate value

---

### Coin Purchase Rate

**Definition**: Percentage of free users who purchase coins.

**Formula**: `COUNT(DISTINCT users with coin purchase) / Free users * 100`

**Data Source**: GA4 purchase events filtered by product

**Interpretation**:
- Alternative monetization path
- Track which coin packs are popular

---

## Onboarding Metrics

### Onboarding Completion Rate

**Definition**: Percentage of new users who complete onboarding.

**Formula**: `COUNT(onboarding_completed) / COUNT(onboarding_started) * 100`

**Target**: 70%

**Data Source**: GA4 funnel exploration

**Interpretation**:
- <60%: onboarding too long/confusing
- >80%: excellent onboarding
- Track by platform

---

### Time to First Note

**Definition**: Time between first open and first note creation.

**Formula**: `AVG(timestamp(note_created) - timestamp(first_open))`

**Data Source**: BigQuery

**Interpretation**:
- <5 minutes: excellent activation
- >24 hours: activation friction

---

### Time to First Design

**Definition**: Time between first note and first design creation.

**Formula**: `AVG(timestamp(design_flow_started) - timestamp(note_created))`

**Data Source**: BigQuery

**Interpretation**:
- Measures AI feature discovery
- Track if design feature is prominent enough

---

### Coach Mark Engagement

**Definition**: Percentage of coach marks viewed vs dismissed.

**Formula**: `COUNT(coach_mark_dismissed) / COUNT(coach_mark_shown) * 100`

**Data Source**: GA4 events

**Interpretation**:
- Per coach mark analysis
- Low engagement = mark not helpful
- High skip rate on specific marks = UX issue

---

## User Properties

### Subscription Tier Distribution

**Definition**: Percentage of users on each subscription tier.

**Formula**: Count users by `subscription_tier` property

**Data Source**: GA4 user properties

**Values**: `free`, `pro`

---

### Notes Bucket Distribution

**Definition**: Distribution of users by note count.

**Formula**: Count users by `total_notes_bucket` property

**Data Source**: GA4 user properties

**Values**: `0`, `1-5`, `6-20`, `21-50`, `50+`

---

### Design Bucket Distribution

**Definition**: Distribution of users by design count.

**Formula**: Count users by `total_designs_bucket` property

**Data Source**: GA4 user properties

**Values**: `0`, `1-3`, `4-10`, `10+`

---

### Coin Balance Distribution

**Definition**: Distribution of users by coin balance.

**Formula**: Count users by `coin_balance_tier` property

**Data Source**: GA4 user properties

**Values**: `zero`, `low`, `medium`, `high`

---

### Platform Distribution

**Definition**: Distribution of users by platform.

**Formula**: Count users by `platform` property

**Data Source**: GA4 user properties

**Values**: `ios`, `android`, `web`

---

## Derived Metrics

### Feature Adoption Score

**Definition**: Composite score of feature usage depth.

**Formula**: `(has_notes * 1 + has_designs * 2 + has_labels * 1 + has_boards * 1) / 5`

**Interpretation**:
- 0-1: Minimal adoption
- 2-3: Moderate adoption
- 4-5: Power user

---

### Engagement Score

**Definition**: Composite engagement metric.

**Formula**: `(session_frequency * 0.3) + (feature_usage * 0.3) + (retention_class * 0.4)`

**Interpretation**:
- Used for user segmentation
- High score = engaged user
- Low score = at risk

---

### Health Score

**Definition**: Overall app health metric.

**Formula**: `(D1 retention / target) + (DAU/MAU / target) + (conversion / target)) / 3`

**Interpretation**:
- <0.7: Needs attention
- 0.7-1.0: On track
- >1.0: Exceeding targets
