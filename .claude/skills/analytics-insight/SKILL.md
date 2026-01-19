---
name: analytics-insight
description: Analyzes GA4 and Firebase Analytics data for ToonNotes to generate actionable insights on user engagement, retention, funnel conversion, and feature adoption. This skill should be used when reviewing app performance, analyzing user behavior patterns, generating weekly/monthly analytics reports, understanding retention and churn, or answering questions about how users engage with features.
---

# Analytics Insight

This skill analyzes GA4 and Firebase Analytics data for ToonNotes to generate actionable insights on user engagement, retention, funnel conversion, and feature adoption.

## When to Use This Skill

- Reviewing weekly/monthly app performance
- Analyzing user engagement patterns
- Understanding retention and churn
- Evaluating funnel conversion rates
- Measuring feature adoption
- Benchmarking against industry standards
- Generating SQL queries for BigQuery analysis

## Commands

```bash
/analytics-insight                           # Interactive mode - choose analysis type
/analytics-insight weekly                    # Weekly summary report
/analytics-insight monthly                   # Monthly deep-dive report
/analytics-insight retention                 # Retention cohort analysis
/analytics-insight funnel --name=design      # Specific funnel analysis (design, onboarding, purchase, marketing)
/analytics-insight features                  # Feature adoption analysis
/analytics-insight segments                  # User segmentation breakdown
/analytics-insight benchmark                 # Compare metrics to industry benchmarks
/analytics-insight query --type=retention    # Generate BigQuery SQL (retention, funnel, features, segments, ltv, churn)
```

## Data Sources

### Primary: MCP Analytics Server

**Use the `toonnotes-analytics` MCP server to pull GA4 data directly.**

The MCP server is deployed at `https://mcp-analytics.vercel.app/api/mcp` and provides 23 tools for querying GA4 data programmatically.

#### Quick Reference - MCP Tools

| Tool | Use Case | Example |
|------|----------|---------|
| `ga4_get_active_users` | DAU/WAU/MAU | `period: "7d"` |
| `ga4_get_top_events` | Event frequency | `period: "30d", limit: 20` |
| `ga4_realtime_users` | Current active users | (no params) |
| `ga4_realtime_events` | Recent events (30min) | `eventName: "design_generated"` |
| `ga4_get_user_metrics` | Acquisition & engagement | `period: "30d"` |
| `ga4_get_page_views` | Page/screen views | `dimension: "pageTitle"` |
| `ga4_run_report` | Custom queries | dimensions, metrics, filters |
| `ga4_summary_report` | Comprehensive overview | `period: "30d"` |
| `ga4_compare_periods` | Period comparison | currentPeriod, previousPeriod |
| `ga4_batch_report` | Multiple reports at once | array of report configs |
| `ga4_export_csv` | Export to CSV | dimensions, metrics |

#### Example: Pull Weekly Summary

```
Use tool: ga4_summary_report with period: "7d"
```

This returns:
- Overall metrics (activeUsers, newUsers, sessions, pageViews, avgSessionDuration)
- Daily trends
- Top pages and events
- Device breakdown
- Country breakdown

#### Example: Compare This Week vs Last Week

```
Use tool: ga4_compare_periods with:
  metrics: ["activeUsers", "sessions", "screenPageViews"]
  currentPeriod: { startDate: "7daysAgo", endDate: "today" }
  previousPeriod: { startDate: "14daysAgo", endDate: "8daysAgo" }
```

#### Example: Event Analysis

```
Use tool: ga4_run_report with:
  dimensions: ["eventName"]
  metrics: ["eventCount", "totalUsers"]
  startDate: "30daysAgo"
  endDate: "today"
```

### Secondary (Manual Access)

| Source | Access | Data Available |
|--------|--------|----------------|
| Firebase Analytics Console | [console.firebase.google.com](https://console.firebase.google.com/) | Real-time events, user properties |
| GA4 | [analytics.google.com](https://analytics.google.com/) | Reports, explorations, funnels, cohorts |
| BigQuery | [console.cloud.google.com/bigquery](https://console.cloud.google.com/bigquery) | Raw event data (if export enabled) |
| Firebase DebugView | Firebase Console > Analytics > DebugView | Testing & validation |

### Event Taxonomy

See `apps/expo/docs/ANALYTICS.md` for complete event definitions:

- **Note Events** (8): note_created, note_opened, note_edited, note_deleted, note_archived, note_restored, note_pinned, note_shared
- **Design Events** (9): design_flow_started, design_image_selected, design_generation_started, design_generated, design_generation_failed, design_saved, design_applied, design_removed, design_deleted
- **Label Events** (6): label_created, label_added, label_removed, label_suggestion_shown, label_suggestion_accepted, label_suggestion_declined
- **Board Events** (2): board_viewed, board_customized
- **Monetization Events** (10): paywall_shown, paywall_dismissed, shop_opened, begin_checkout, purchase, purchase_failed, coins_spent, coins_granted, subscription_started, subscription_cancelled
- **Auth Events** (3): sign_up, login, sign_out
- **Onboarding Events** (5): onboarding_started, onboarding_completed, onboarding_skipped, coach_mark_shown, coach_mark_dismissed
- **Editor Events** (3): editor_mode_changed, editor_image_added, editor_design_picker_opened

### User Properties

| Property | Values | Description |
|----------|--------|-------------|
| `subscription_tier` | free, pro | Subscription status |
| `total_notes_bucket` | 0, 1-5, 6-20, 21-50, 50+ | Note count range |
| `total_designs_bucket` | 0, 1-3, 4-10, 10+ | Design count range |
| `has_custom_design` | true, false | Has created a design |
| `coin_balance_tier` | zero, low, medium, high | Coin balance |
| `free_designs_remaining` | 0-3 | Free designs left |
| `onboarding_complete` | true, false | Completed onboarding |
| `platform` | ios, android, web | User platform |

## Key Metrics & Targets

From PRD and industry benchmarks:

| Metric | Industry Avg | ToonNotes Target | Source |
|--------|--------------|------------------|--------|
| Day 1 Retention | 25-35% | 40% | PRD |
| Day 7 Retention | 10-15% | 25% | PRD |
| Day 30 Retention | 5-10% | 15% | PRD |
| DAU/MAU Ratio | 15-20% | >20% | PRD |
| Free-to-Paid Conversion | 2-4% | 5% | Industry |
| Onboarding Completion | 60-70% | 70% | GA4 Config |
| Design Generation Success | 80-85% | 85% | GA4 Config |

## Funnels

### Design Conversion Funnel

```
design_flow_started → design_image_selected → design_generation_started → design_generated → design_saved → design_applied
```

**Target Conversion Rates:**
- Flow started → Generated: 85%
- Generated → Saved: 80%
- Saved → Applied: 70%

### Onboarding Funnel

```
first_open → onboarding_started → onboarding_completed → note_created → design_flow_started
```

**Target Conversion Rates:**
- first_open → onboarding_completed: 70%
- onboarding_completed → note_created (D1): 60%
- note_created → design_flow_started (D7): 40%

### Purchase Funnel

```
paywall_shown → shop_opened → begin_checkout → purchase
```

**Target Conversion Rates:**
- Paywall → Shop opened: 30%
- Shop → Begin checkout: 15%
- Begin checkout → Purchase: 70%
- **Overall: 3%**

### Marketing Site Funnel

```
page_view (/) → scroll_depth (≥50%) → app_store_clicked
```

## Report Generation Workflow

### Weekly Report

1. **Gather Data** (via MCP Server)
   ```
   # Run these MCP tools:
   ga4_summary_report          period: "7d"
   ga4_compare_periods         currentPeriod: 7d, previousPeriod: 14d-8d
   ga4_realtime_users          (current snapshot)
   ga4_get_top_events          period: "7d", limit: 20
   ```

2. **Apply Template**
   - Use `templates/weekly-insight-report.md`
   - Fill in metrics from MCP responses
   - Compare to previous week (from compare_periods)
   - Note any anomalies

3. **Generate Insights**
   - Identify top 3 highlights
   - Identify top 3 concerns
   - Provide 3 actionable recommendations

4. **Save Report**
   - Output to `docs/analytics/reports/weekly-YYYY-MM-DD.md`

### Monthly Report

1. **Gather Data** (via MCP Server)
   ```
   # Run these MCP tools:
   ga4_summary_report          period: "30d"
   ga4_compare_periods         currentPeriod: 30d, previousPeriod: 60d-31d
   ga4_get_user_metrics        period: "30d"
   ga4_batch_report            [user_growth, feature_usage, monetization]
   ga4_list_audiences          (segment analysis)
   ```

2. **Apply Template**
   - Use `templates/monthly-insight-report.md`
   - Include MoM comparisons
   - Deep-dive into retention cohorts

3. **Generate Insights**
   - Strategic recommendations
   - Feature prioritization suggestions
   - Growth opportunities

4. **Save Report**
   - Output to `docs/analytics/reports/monthly-YYYY-MM.md`

## BigQuery Integration

If BigQuery export is enabled, use SQL templates for advanced analysis:

| Query | File | Purpose |
|-------|------|---------|
| Retention Cohorts | `templates/bigquery/retention-cohort.sql` | Day N retention by signup week |
| Funnel Conversion | `templates/bigquery/funnel-conversion.sql` | Step-by-step conversion analysis |
| Feature Adoption | `templates/bigquery/feature-adoption.sql` | Feature usage patterns by cohort |
| User Segments | `templates/bigquery/user-segments.sql` | Segment users and calculate metrics |
| LTV Analysis | `templates/bigquery/ltv-analysis.sql` | Lifetime value by acquisition cohort |
| Churn Prediction | `templates/bigquery/churn-prediction.sql` | Identify users showing churn signals |

### Running BigQuery Queries

1. Navigate to [BigQuery Console](https://console.cloud.google.com/bigquery)
2. Select the ToonNotes project
3. Copy template SQL from `templates/bigquery/`
4. Replace `YOUR_PROJECT_ID` with actual project ID
5. Adjust date ranges as needed
6. Run query and export results

## Output Locations

| Report Type | Path |
|-------------|------|
| Weekly Reports | `docs/analytics/reports/weekly-YYYY-MM-DD.md` |
| Monthly Reports | `docs/analytics/reports/monthly-YYYY-MM.md` |
| Retention Analysis | `docs/analytics/reports/retention-YYYY-MM-DD.md` |
| Feature Analysis | `docs/analytics/reports/features-YYYY-MM-DD.md` |

## Key Questions This Skill Answers

1. **Engagement**: How are users engaging with the app? (DAU/MAU, session metrics, stickiness)
2. **Retention**: What's our retention like and where do users drop off? (cohort analysis, churn indicators)
3. **Features**: Which features drive the most engagement? (adoption rates, usage frequency)
4. **Onboarding**: How effective is our onboarding? (completion rates, time to first action)
5. **Monetization**: What's our conversion performance? (funnel, ARPPU, LTV)
6. **Segments**: Which user segments are most valuable? (power users, at-risk, potential converters)
7. **Benchmarks**: Are we hitting our targets? (vs industry, vs PRD goals)

## Reference Files

| File | Purpose |
|------|---------|
| `references/metric-definitions.md` | Complete metric glossary with formulas |
| `references/benchmarks.md` | Industry benchmarks and ToonNotes targets |
| `references/bigquery-schema.md` | Firebase export schema reference |
| `references/user-segments.md` | Audience definitions from GA4 |
| `templates/weekly-insight-report.md` | Weekly report template |
| `templates/monthly-insight-report.md` | Monthly report template |
| `templates/retention-analysis.md` | Retention deep-dive template |
| `templates/feature-adoption.md` | Feature analysis template |

## Related Documentation

| File | Description |
|------|-------------|
| `apps/expo/docs/ANALYTICS.md` | Event taxonomy, implementation status |
| `apps/expo/docs/GA4-CONFIGURATION-GUIDE.md` | Console setup guide |
| `apps/expo/services/firebaseAnalytics.ts` | Event implementation code |

## MCP Server Configuration

The analytics MCP server must be configured in your Claude Code settings:

```json
{
  "mcpServers": {
    "toonnotes-analytics": {
      "url": "https://mcp-analytics.vercel.app/api/mcp"
    }
  }
}
```

**Required Environment Variables** (in Vercel):
- `GA4_PROPERTY_ID` - ToonNotes GA4 property ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Base64-encoded private key

**Available MCP Tools** (23 total):
- Query: `ga4_run_report`, `ga4_get_active_users`, `ga4_get_top_events`, `ga4_get_user_metrics`, `ga4_get_page_views`, `ga4_get_metadata`
- Real-time: `ga4_realtime_users`, `ga4_realtime_events`, `ga4_realtime_pages`, `ga4_realtime_locations`, `ga4_realtime_traffic_sources`
- Admin: `ga4_list_custom_dimensions`, `ga4_create_custom_dimension`, `ga4_list_custom_metrics`, `ga4_list_key_events`, `ga4_create_key_event`, `ga4_list_audiences`, `ga4_get_property_info`, `ga4_list_properties`
- Export: `ga4_batch_report`, `ga4_export_csv`, `ga4_summary_report`, `ga4_compare_periods`

## Related Skills

- `/marketing-report` - Marketing performance and campaign metrics
- `/cost-report` - API cost tracking and optimization
- `/health-check` - System health verification
