# GA4 Configuration Guide (Phase 4)

> **Purpose:** Step-by-step guide for configuring Google Analytics 4 in the Firebase Console
> **Time Required:** ~30 minutes
> **Prerequisites:** Firebase project with Analytics enabled

---

## Table of Contents

1. [Access GA4 from Firebase](#1-access-ga4-from-firebase)
2. [Create Custom Dimensions](#2-create-custom-dimensions)
3. [Create Custom Metrics](#3-create-custom-metrics)
4. [Build Funnel Explorations](#4-build-funnel-explorations)
5. [Set Up Audiences](#5-set-up-audiences)
6. [Configure Alerts](#6-configure-alerts)
7. [Verify Configuration](#7-verify-configuration)

---

## 1. Access GA4 from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the **ToonNotes** project
3. In the left sidebar, click **Analytics** → **Dashboard**
4. Click **"View more in Google Analytics"** (top right) to open GA4

Or go directly to [analytics.google.com](https://analytics.google.com/) and select the ToonNotes property.

---

## 2. Create Custom Dimensions

Custom dimensions allow you to segment and filter reports by event parameters.

### Navigation
GA4 → Admin (gear icon) → Property Settings → **Custom definitions** → **Custom dimensions**

### Event-Scoped Dimensions (Create These)

Click **"Create custom dimension"** for each:

| Display Name | Event Parameter | Scope | Description |
|--------------|-----------------|-------|-------------|
| Note ID | `note_id` | Event | Unique identifier for notes |
| Design ID | `design_id` | Event | Unique identifier for designs |
| Design Type | `design_type` | Event | Type of design (normal/lucky/free) |
| Label Name | `label_name` | Event | Name of label |
| Source | `source` | Event | Where action originated |
| Error Type | `error_type` | Event | Type of error |
| Share Method | `share_method` | Event | How note was shared |
| Section | `section` | Event | Page section (hero, final_cta) |
| Store | `store` | Event | App store (ios/android) |
| Coach Mark ID | `coach_mark_id` | Event | Onboarding coach mark identifier |

### User-Scoped Dimensions (Create These)

| Display Name | User Property | Scope | Description |
|--------------|---------------|-------|-------------|
| Subscription Tier | `subscription_tier` | User | free or pro |
| Total Notes Bucket | `total_notes_bucket` | User | Note count range |
| Total Designs Bucket | `total_designs_bucket` | User | Design count range |
| Has Custom Design | `has_custom_design` | User | true/false |
| Coin Balance Tier | `coin_balance_tier` | User | zero/low/medium/high |
| Platform | `platform` | User | ios/android/web |
| Onboarding Complete | `onboarding_complete` | User | true/false |

---

## 3. Create Custom Metrics

Custom metrics allow you to track numeric values in reports.

### Navigation
GA4 → Admin → Property Settings → **Custom definitions** → **Custom metrics**

Click **"Create custom metric"** for each:

| Display Name | Event Parameter | Scope | Unit |
|--------------|-----------------|-------|------|
| Coin Amount | `amount` | Event | Standard |
| Remaining Balance | `remaining_balance` | Event | Standard |
| Duration Seconds | `duration_seconds` | Event | Seconds |
| Scroll Depth | `depth_percent` | Event | Standard |

---

## 4. Build Funnel Explorations

Funnels show conversion rates between steps.

### Navigation
GA4 → **Explore** (left sidebar) → **"+"** to create new exploration

### Funnel 1: Design Conversion

**Name:** Design Conversion Funnel

**Steps:**
1. `design_flow_started` - User enters design creation
2. `design_image_selected` - User picks an image
3. `design_generation_started` - AI generation begins
4. `design_generated` - Design successfully created
5. `design_saved` - User saves to gallery
6. `design_applied` - User applies to a note

**Configuration:**
- Technique: **Funnel exploration**
- Open funnel: Yes (allows entering at any step)
- Breakdown: `subscription_tier` (to compare free vs pro)

### Funnel 2: Onboarding Flow

**Name:** Onboarding Funnel

**Steps:**
1. `first_open` (automatic event)
2. `onboarding_started` - Carousel begins
3. `onboarding_completed` - Carousel finished
4. `note_created` - First note created
5. `design_flow_started` - First design attempt

**Configuration:**
- Breakdown: `platform` (to compare iOS vs Android vs Web)

### Funnel 3: Purchase Conversion

**Name:** Purchase Funnel

**Steps:**
1. `paywall_shown` - Paywall displayed
2. `shop_opened` - Coin shop opened
3. `begin_checkout` - Purchase initiated
4. `purchase` - Purchase completed

**Configuration:**
- Breakdown: `subscription_tier`
- Filter: Exclude `purchase_failed` events

### Funnel 4: Marketing Site Conversion

**Name:** Marketing → App Store

**Steps:**
1. `page_view` (filter: page_path = "/")
2. `scroll_depth` (filter: depth_percent >= 50)
3. `app_store_clicked`

**Configuration:**
- Breakdown: `store` (ios vs android)

---

## 5. Set Up Audiences

Audiences are user segments for analysis and targeting.

### Navigation
GA4 → Admin → Property Settings → **Audiences** → **"New audience"**

### Audience 1: Power Users

**Name:** Power Users
**Description:** Users with 5+ sessions in 7 days

**Conditions:**
- Include users when: `session_start` event count > 5
- In the last 7 days

### Audience 2: At-Risk Users

**Name:** At-Risk Users
**Description:** Previously active users with no recent activity

**Conditions:**
- Include users when: `session_start` event occurred
- More than 7 days ago
- AND `session_start` count > 3 (in last 30 days)

### Audience 3: Potential Converters

**Name:** Potential Converters
**Description:** Free users who've created designs

**Conditions:**
- Include users when: `subscription_tier` equals `free`
- AND `design_saved` event count >= 2

### Audience 4: Pro Subscribers

**Name:** Pro Subscribers
**Description:** Users with Pro subscription

**Conditions:**
- Include users when: `subscription_tier` equals `pro`

### Audience 5: Design Enthusiasts

**Name:** Design Enthusiasts
**Description:** Users who've created 5+ designs

**Conditions:**
- Include users when: `design_saved` event count >= 5

### Audience 6: New Users (7 Days)

**Name:** New Users
**Description:** Users in their first week

**Conditions:**
- Include users when: `first_open` occurred
- In the last 7 days

---

## 6. Configure Alerts

Alerts notify you of significant changes.

### Navigation
GA4 → **Insights** (left sidebar) → **"Create"** (top right) → **Custom insight**

### Alert 1: Crash Spike

**Name:** Crash Rate Spike
**Description:** Notifies when crashes increase significantly

**Conditions:**
- Metric: `app_exception` event count
- Evaluation frequency: Daily
- Condition: Increases by more than 100%
- Compared to: Same day last week

### Alert 2: Purchase Drop

**Name:** Purchase Volume Drop
**Description:** Notifies when purchases decline

**Conditions:**
- Metric: `purchase` event count
- Evaluation frequency: Daily
- Condition: Decreases by more than 50%
- Compared to: 7-day average

### Alert 3: Generation Failures

**Name:** Design Generation Failures
**Description:** Notifies when AI generation fails frequently

**Conditions:**
- Metric: `design_generation_failed` event count
- Evaluation frequency: Daily
- Condition: Exceeds 10% of `design_generation_started`

### Alert 4: Onboarding Drop-off

**Name:** Onboarding Completion Drop
**Description:** Notifies when fewer users complete onboarding

**Conditions:**
- Metric: `onboarding_completed` / `onboarding_started` ratio
- Evaluation frequency: Weekly
- Condition: Decreases by more than 20%
- Compared to: Previous week

---

## 7. Verify Configuration

### Test Custom Dimensions

1. Go to GA4 → **Reports** → **Realtime**
2. In your app, perform actions that send tracked events
3. Check that custom parameters appear in the event details
4. Verify user properties show in the User snapshot

### Test Funnels

1. Open each funnel exploration
2. Verify all steps show data (may take 24-48 hours for historical data)
3. Check that breakdowns work correctly

### Test Audiences

1. Go to Admin → Audiences
2. Check each audience shows a user count (may take up to 24 hours)
3. Verify the count seems reasonable

### Test Alerts

1. Alerts will trigger based on your configured thresholds
2. Check that email notifications are enabled in your GA4 settings
3. Consider creating a test alert with a low threshold to verify delivery

---

## Data Retention Settings

### Navigation
GA4 → Admin → Property Settings → **Data collection and modification** → **Data retention**

### Recommended Settings

| Setting | Value |
|---------|-------|
| Event data retention | 14 months (maximum for free) |
| Reset user data on new activity | Yes |

---

## BigQuery Export (Optional)

For advanced analysis, you can export raw data to BigQuery.

### Navigation
GA4 → Admin → Property Settings → **Product links** → **BigQuery links**

### Setup
1. Click **"Link"**
2. Select or create a BigQuery project
3. Choose export frequency: **Daily** (recommended) or Streaming
4. Select data streams to export (all platforms)

**Note:** BigQuery has a free tier (10GB storage, 1TB queries/month) but may incur costs at scale.

---

## Checklist

Use this checklist to track your progress:

### Custom Definitions
- [ ] Created all 10 event-scoped dimensions
- [ ] Created all 7 user-scoped dimensions
- [ ] Created all 4 custom metrics

### Explorations
- [ ] Built Design Conversion Funnel
- [ ] Built Onboarding Funnel
- [ ] Built Purchase Funnel
- [ ] Built Marketing Site Conversion Funnel

### Audiences
- [ ] Created Power Users audience
- [ ] Created At-Risk Users audience
- [ ] Created Potential Converters audience
- [ ] Created Pro Subscribers audience
- [ ] Created Design Enthusiasts audience
- [ ] Created New Users audience

### Alerts
- [ ] Configured Crash Spike alert
- [ ] Configured Purchase Drop alert
- [ ] Configured Generation Failures alert
- [ ] Configured Onboarding Drop-off alert

### Settings
- [ ] Set data retention to 14 months
- [ ] Verified email notifications are enabled
- [ ] (Optional) Set up BigQuery export

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Custom dimension not showing data | Wait 24-48 hours; ensure parameter is being sent in code |
| Funnel shows no data | Check date range; verify events are being tracked |
| Audience shows 0 users | Audiences need time to populate; check conditions |
| Alerts not triggering | Verify threshold isn't too high; check notification settings |
| User properties not updating | Ensure `updateUserProperties()` is called in code |

---

## Next Steps

After completing this configuration:

1. **Wait 24-48 hours** for data to fully populate
2. **Review funnels** to identify drop-off points
3. **Check audiences** to understand user segments
4. **Monitor alerts** for anomalies
5. **Schedule weekly reviews** of key metrics

---

*Configuration guide for ToonNotes GA4 Analytics (Phase 4)*
