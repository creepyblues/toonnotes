# User Segments

Audience definitions for ToonNotes analytics, aligned with GA4 configuration.

## GA4 Configured Audiences

These audiences are defined in GA4 and can be used for analysis and targeting.

### Power Users

**Definition**: Highly engaged users with frequent app usage.

**GA4 Conditions**:
- `session_start` event count > 5 in last 7 days

**Characteristics**:
- Multiple daily sessions
- High feature adoption
- Likely to be Pro subscribers
- Strong retention

**Analysis Use Cases**:
- Benchmark for engagement targets
- Feature feedback candidates
- Referral program candidates

---

### At-Risk Users

**Definition**: Previously active users showing signs of churn.

**GA4 Conditions**:
- `session_start` occurred > 7 days ago
- AND `session_start` count > 3 in last 30 days

**Characteristics**:
- Were engaged, now inactive
- May be experiencing friction
- Recovery possible with intervention

**Analysis Use Cases**:
- Churn analysis
- Reactivation campaign targets
- Exit survey candidates

---

### Potential Converters

**Definition**: Free users who show high engagement with premium features.

**GA4 Conditions**:
- `subscription_tier` equals `free`
- AND `design_saved` event count >= 2

**Characteristics**:
- Using AI features
- Have hit paywall
- High conversion potential

**Analysis Use Cases**:
- Monetization funnel optimization
- Pricing experiments
- Feature value validation

---

### Pro Subscribers

**Definition**: Users with active Pro subscription.

**GA4 Conditions**:
- `subscription_tier` equals `pro`

**Characteristics**:
- Paying customers
- Full feature access
- Higher LTV

**Analysis Use Cases**:
- Revenue analysis
- Feature usage patterns
- Retention priorities

---

### Design Enthusiasts

**Definition**: Users heavily engaged with the design feature.

**GA4 Conditions**:
- `design_saved` event count >= 5

**Characteristics**:
- AI feature power users
- Visual customization focused
- High engagement with core differentiator

**Analysis Use Cases**:
- Design feature improvements
- UI/UX feedback
- Feature expansion ideas

---

### New Users (7 Days)

**Definition**: Users in their first week since install.

**GA4 Conditions**:
- `first_open` occurred in last 7 days

**Characteristics**:
- Onboarding phase
- High churn risk
- First impressions critical

**Analysis Use Cases**:
- Onboarding optimization
- Activation funnel analysis
- Early retention tracking

---

## Additional Behavioral Segments

### By Engagement Level

| Segment | Definition | Expected % |
|---------|------------|------------|
| **Dormant** | No activity in 30+ days | 40-50% |
| **Casual** | 1-3 sessions/month | 25-30% |
| **Active** | 4-10 sessions/month | 15-20% |
| **Power** | 11+ sessions/month | 5-10% |

### By Feature Adoption

| Segment | Features Used | Expected % |
|---------|---------------|------------|
| **Notes Only** | Only note creation | 30-40% |
| **Design Explorers** | Notes + tried designs | 20-30% |
| **Design Adopters** | Notes + saved designs | 15-25% |
| **Full Adopters** | Notes + designs + boards/labels | 10-15% |

### By Monetization Stage

| Segment | Status | Expected % |
|---------|--------|------------|
| **Never Converted** | Free, never saw paywall | 40-50% |
| **Paywall Exposed** | Saw paywall, didn't convert | 35-45% |
| **Trial/Lapsed** | Previous Pro, now free | 5-10% |
| **Active Pro** | Current Pro subscriber | 3-5% |

### By Lifecycle Stage

| Segment | Age | Focus |
|---------|-----|-------|
| **New** | 0-7 days | Activation |
| **Developing** | 8-30 days | Habit formation |
| **Established** | 31-90 days | Feature adoption |
| **Mature** | 90+ days | Retention & monetization |

---

## Segment Metrics

### Key Metrics by Segment

| Segment | Primary Metric | Target |
|---------|----------------|--------|
| New Users | D1 Retention | 40% |
| At-Risk | Return Rate | 20% |
| Potential Converters | Conversion Rate | 15% |
| Power Users | Feature Adoption | 90% |
| Pro Subscribers | Retention | 85% |

### Segment Size Targets

| Segment | Target % of MAU |
|---------|-----------------|
| Power Users | 10-15% |
| Active | 30-40% |
| Casual | 30-35% |
| At-Risk | <20% |

---

## BigQuery Segment Queries

### Power Users

```sql
SELECT
  user_pseudo_id,
  COUNT(DISTINCT event_date) AS active_days,
  COUNT(*) AS session_count
FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
WHERE _TABLE_SUFFIX BETWEEN
  FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'session_start'
GROUP BY user_pseudo_id
HAVING session_count > 5
```

### At-Risk Users

```sql
WITH user_activity AS (
  SELECT
    user_pseudo_id,
    MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_active,
    COUNT(DISTINCT event_date) AS active_days_30d
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id
)
SELECT *
FROM user_activity
WHERE last_active < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND active_days_30d >= 3
```

### Potential Converters

```sql
WITH user_designs AS (
  SELECT
    user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'subscription_tier') AS tier,
    COUNT(*) AS design_count
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
    AND event_name = 'design_saved'
  GROUP BY user_pseudo_id, tier
)
SELECT *
FROM user_designs
WHERE tier = 'free'
  AND design_count >= 2
```

### Feature Adoption Segments

```sql
WITH user_features AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name IN ('note_created', 'note_edited') THEN 1 ELSE 0 END) AS has_notes,
    MAX(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS has_designs,
    MAX(CASE WHEN event_name = 'label_created' THEN 1 ELSE 0 END) AS has_labels,
    MAX(CASE WHEN event_name = 'board_viewed' THEN 1 ELSE 0 END) AS has_boards
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  GROUP BY user_pseudo_id
)
SELECT
  CASE
    WHEN has_notes = 1 AND has_designs = 1 AND (has_labels = 1 OR has_boards = 1) THEN 'Full Adopters'
    WHEN has_notes = 1 AND has_designs = 1 THEN 'Design Adopters'
    WHEN has_notes = 1 AND has_designs = 0 THEN 'Notes Only'
    ELSE 'No Core Feature'
  END AS segment,
  COUNT(*) AS user_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) AS percentage
FROM user_features
GROUP BY segment
ORDER BY user_count DESC
```

---

## Segment Analysis Framework

### Segment Health Dashboard

| Segment | Size | Growth | Retention | Conversion | Action |
|---------|------|--------|-----------|------------|--------|
| Power | X% | +/-Y% | Z% | N/A | Maintain |
| Active | X% | +/-Y% | Z% | A% | Grow |
| At-Risk | X% | +/-Y% | Z% | N/A | Reduce |
| New | X% | +/-Y% | Z% | B% | Activate |

### Segment Movement Analysis

Track users moving between segments:
- **Upgrade**: Moving to higher engagement segment
- **Downgrade**: Moving to lower engagement segment
- **Churn**: Leaving active user base
- **Reactivation**: Returning from dormant

### Segment-Specific KPIs

| Segment | Primary KPI | Secondary KPI |
|---------|-------------|---------------|
| New Users | D7 Retention | Activation Rate |
| At-Risk | Return Rate | Time to Return |
| Potential Converters | Conversion Rate | Time to Convert |
| Power Users | LTV | Feature Adoption |
| Pro Subscribers | Churn Rate | Feature Usage |
