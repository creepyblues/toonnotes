# BigQuery Schema Reference

Reference for Firebase Analytics export to BigQuery.

## Overview

When BigQuery export is enabled, Firebase Analytics exports event data daily to BigQuery tables in the format `analytics_PROPERTY_ID.events_YYYYMMDD`.

**Table naming**: `firebase-project.analytics_123456789.events_20250118`

## Main Events Table Schema

### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `event_date` | STRING | Date of event (YYYYMMDD) |
| `event_timestamp` | INTEGER | Event timestamp in microseconds |
| `event_name` | STRING | Name of the event |
| `event_params` | RECORD (REPEATED) | Event parameters array |
| `user_id` | STRING | User ID (if set) |
| `user_pseudo_id` | STRING | App instance ID |
| `user_properties` | RECORD (REPEATED) | User properties array |
| `user_first_touch_timestamp` | INTEGER | First open timestamp |
| `device` | RECORD | Device information |
| `geo` | RECORD | Geographic information |
| `app_info` | RECORD | App information |
| `traffic_source` | RECORD | Traffic source data |
| `stream_id` | STRING | Data stream ID |
| `platform` | STRING | Platform (IOS, ANDROID, WEB) |

### Event Parameters Structure

```sql
event_params ARRAY<STRUCT<
  key STRING,
  value STRUCT<
    string_value STRING,
    int_value INT64,
    float_value FLOAT64,
    double_value FLOAT64
  >
>>
```

### User Properties Structure

```sql
user_properties ARRAY<STRUCT<
  key STRING,
  value STRUCT<
    string_value STRING,
    int_value INT64,
    float_value FLOAT64,
    double_value FLOAT64,
    set_timestamp_micros INT64
  >
>>
```

### Device Record

```sql
device STRUCT<
  category STRING,
  mobile_brand_name STRING,
  mobile_model_name STRING,
  mobile_marketing_name STRING,
  mobile_os_hardware_model STRING,
  operating_system STRING,
  operating_system_version STRING,
  language STRING,
  is_limited_ad_tracking STRING,
  time_zone_offset_seconds INT64
>
```

### Geo Record

```sql
geo STRUCT<
  city STRING,
  country STRING,
  continent STRING,
  region STRING,
  sub_continent STRING
>
```

### App Info Record

```sql
app_info STRUCT<
  id STRING,
  version STRING,
  install_store STRING,
  firebase_app_id STRING,
  install_source STRING
>
```

---

## Common Query Patterns

### Extract Event Parameter

```sql
-- Extract string parameter
(SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'param_name') AS param_name

-- Extract int parameter
(SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'param_name') AS param_name

-- Extract float parameter
(SELECT COALESCE(value.float_value, value.double_value) FROM UNNEST(event_params) WHERE key = 'param_name') AS param_name
```

### Extract User Property

```sql
-- Extract string user property
(SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'property_name') AS property_name

-- Extract with timestamp
(SELECT
  value.string_value,
  TIMESTAMP_MICROS(value.set_timestamp_micros) AS set_time
FROM UNNEST(user_properties)
WHERE key = 'property_name')
```

### Date Range Filter

```sql
-- Last 30 days
WHERE _TABLE_SUFFIX BETWEEN
  FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))

-- Specific date range
WHERE _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'

-- Using PARSE_DATE for flexibility
WHERE PARSE_DATE('%Y%m%d', event_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
```

### Platform Filter

```sql
-- iOS only
WHERE platform = 'IOS'

-- Mobile only
WHERE platform IN ('IOS', 'ANDROID')

-- Web only
WHERE platform = 'WEB'
```

### User Deduplication

```sql
-- Count unique users
COUNT(DISTINCT user_pseudo_id)

-- If user_id is set, prefer it
COUNT(DISTINCT COALESCE(user_id, user_pseudo_id))
```

---

## ToonNotes Event Parameters

### Note Events

| Event | Parameter | Type | Description |
|-------|-----------|------|-------------|
| `note_created` | `note_id` | string | Note UUID |
| `note_opened` | `note_id` | string | Note UUID |
| `note_edited` | `note_id` | string | Note UUID |
| `note_deleted` | `note_id` | string | Note UUID |
| `note_archived` | `note_id` | string | Note UUID |
| `note_restored` | `note_id` | string | Note UUID |
| `note_pinned` | `note_id`, `is_pinned` | string, bool | Note UUID, pin state |
| `note_shared` | `note_id`, `share_method` | string, string | Note UUID, method |

### Design Events

| Event | Parameter | Type | Description |
|-------|-----------|------|-------------|
| `design_flow_started` | `source` | string | Entry point |
| `design_image_selected` | `image_source` | string | Image source |
| `design_generation_started` | `design_type`, `is_free` | string, bool | Type, free status |
| `design_generated` | `design_type` | string | Design type |
| `design_generation_failed` | `error_type` | string | Error type |
| `design_saved` | `design_id` | string | Design UUID |
| `design_applied` | `design_id`, `note_id` | string, string | Design + Note UUIDs |
| `design_removed` | `design_id`, `note_id` | string, string | Design + Note UUIDs |
| `design_deleted` | `design_id` | string | Design UUID |

### Monetization Events

| Event | Parameter | Type | Description |
|-------|-----------|------|-------------|
| `paywall_shown` | `source`, `free_remaining`, `coin_balance` | string, int, int | Context |
| `paywall_dismissed` | `source` | string | Context |
| `shop_opened` | `source` | string | Entry point |
| `begin_checkout` | `product_id`, `price` | string, float | Product info |
| `purchase` | `product_id`, `price`, `transaction_id` | string, float, string | Purchase info |
| `purchase_failed` | `product_id`, `error` | string, string | Error info |
| `coins_spent` | `amount`, `purpose`, `remaining_balance` | int, string, int | Spend info |
| `coins_granted` | `amount`, `source` | int, string | Grant info |

### Label Events

| Event | Parameter | Type | Description |
|-------|-----------|------|-------------|
| `label_created` | `label_name` | string | Label name |
| `label_added` | `label_name`, `note_id` | string, string | Label + Note |
| `label_removed` | `label_name`, `note_id` | string, string | Label + Note |
| `label_suggestion_shown` | `label_name`, `note_id` | string, string | Suggestion |
| `label_suggestion_accepted` | `label_name`, `note_id` | string, string | Accepted |
| `label_suggestion_declined` | `label_name`, `note_id` | string, string | Declined |

---

## ToonNotes User Properties

| Property | Type | Values |
|----------|------|--------|
| `subscription_tier` | string | `free`, `pro` |
| `total_notes_bucket` | string | `0`, `1-5`, `6-20`, `21-50`, `50+` |
| `total_designs_bucket` | string | `0`, `1-3`, `4-10`, `10+` |
| `has_custom_design` | string | `true`, `false` |
| `coin_balance_tier` | string | `zero`, `low`, `medium`, `high` |
| `free_designs_remaining` | int | 0-3 |
| `onboarding_complete` | string | `true`, `false` |
| `platform` | string | `ios`, `android`, `web` |

---

## Useful Query Templates

### Event Counts by Day

```sql
SELECT
  event_date,
  event_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_pseudo_id) AS unique_users
FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
GROUP BY event_date, event_name
ORDER BY event_date, event_count DESC
```

### User Property Distribution

```sql
SELECT
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'subscription_tier') AS subscription_tier,
  COUNT(DISTINCT user_pseudo_id) AS user_count
FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'session_start'
GROUP BY subscription_tier
```

### Funnel Analysis

```sql
WITH funnel AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name = 'design_flow_started' THEN 1 ELSE 0 END) AS step1_started,
    MAX(CASE WHEN event_name = 'design_generated' THEN 1 ELSE 0 END) AS step2_generated,
    MAX(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS step3_saved,
    MAX(CASE WHEN event_name = 'design_applied' THEN 1 ELSE 0 END) AS step4_applied
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
  GROUP BY user_pseudo_id
)
SELECT
  SUM(step1_started) AS started,
  SUM(step2_generated) AS generated,
  SUM(step3_saved) AS saved,
  SUM(step4_applied) AS applied,
  ROUND(100.0 * SUM(step2_generated) / NULLIF(SUM(step1_started), 0), 1) AS started_to_generated_pct,
  ROUND(100.0 * SUM(step3_saved) / NULLIF(SUM(step2_generated), 0), 1) AS generated_to_saved_pct,
  ROUND(100.0 * SUM(step4_applied) / NULLIF(SUM(step3_saved), 0), 1) AS saved_to_applied_pct
FROM funnel
```

---

## BigQuery Export Setup

### Enable Export

1. Go to Firebase Console > Project Settings > Integrations
2. Click "Link" next to BigQuery
3. Select data streams to export
4. Choose export frequency (Daily recommended)

### Export Frequency

| Type | Latency | Cost |
|------|---------|------|
| Daily | ~24 hours | Free (10GB storage) |
| Streaming | Real-time | Paid |

### Cost Considerations

- Storage: First 10GB/month free
- Queries: First 1TB/month free
- Streaming: $0.05 per 200MB

For ToonNotes expected volume, should stay within free tier.
