-- Retention Cohort Analysis for ToonNotes
-- Calculates Day 1, 7, 14, 30 retention by signup week
--
-- Usage:
-- 1. Replace YOUR_PROJECT_ID with your GCP project ID
-- 2. Replace PROPERTY_ID with your GA4 property ID (numeric)
-- 3. Adjust date range as needed
-- 4. Run in BigQuery Console

-- Configuration
DECLARE start_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY);
DECLARE end_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY);

WITH
-- Get first open date for each user
user_first_open AS (
  SELECT
    user_pseudo_id,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_open_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id
),

-- Get all active dates for each user
user_activity AS (
  SELECT
    user_pseudo_id,
    PARSE_DATE('%Y%m%d', event_date) AS active_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id, event_date
),

-- Join first open with activity
user_retention AS (
  SELECT
    fo.user_pseudo_id,
    fo.first_open_date,
    DATE_TRUNC(fo.first_open_date, WEEK(MONDAY)) AS cohort_week,
    DATE_DIFF(ua.active_date, fo.first_open_date, DAY) AS days_since_first_open
  FROM user_first_open fo
  LEFT JOIN user_activity ua
    ON fo.user_pseudo_id = ua.user_pseudo_id
    AND ua.active_date >= fo.first_open_date
),

-- Calculate retention by cohort
cohort_retention AS (
  SELECT
    cohort_week,
    COUNT(DISTINCT user_pseudo_id) AS cohort_size,
    COUNT(DISTINCT CASE WHEN days_since_first_open = 1 THEN user_pseudo_id END) AS retained_d1,
    COUNT(DISTINCT CASE WHEN days_since_first_open = 3 THEN user_pseudo_id END) AS retained_d3,
    COUNT(DISTINCT CASE WHEN days_since_first_open = 7 THEN user_pseudo_id END) AS retained_d7,
    COUNT(DISTINCT CASE WHEN days_since_first_open = 14 THEN user_pseudo_id END) AS retained_d14,
    COUNT(DISTINCT CASE WHEN days_since_first_open = 30 THEN user_pseudo_id END) AS retained_d30
  FROM user_retention
  GROUP BY cohort_week
)

-- Final output with retention percentages
SELECT
  cohort_week,
  cohort_size,
  retained_d1,
  retained_d3,
  retained_d7,
  retained_d14,
  retained_d30,
  ROUND(100.0 * retained_d1 / cohort_size, 1) AS retention_d1_pct,
  ROUND(100.0 * retained_d3 / cohort_size, 1) AS retention_d3_pct,
  ROUND(100.0 * retained_d7 / cohort_size, 1) AS retention_d7_pct,
  ROUND(100.0 * retained_d14 / cohort_size, 1) AS retention_d14_pct,
  ROUND(100.0 * retained_d30 / cohort_size, 1) AS retention_d30_pct
FROM cohort_retention
WHERE cohort_week <= DATE_SUB(end_date, INTERVAL 7 DAY)  -- Only show cohorts with at least D7 data
ORDER BY cohort_week DESC;


-- Alternative: Retention by platform
/*
WITH
user_first_open AS (
  SELECT
    user_pseudo_id,
    platform,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_open_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id, platform
),
-- ... rest of query with platform grouping
*/


-- Alternative: Retention by feature adoption (e.g., users who created a design)
/*
WITH
users_with_design AS (
  SELECT DISTINCT user_pseudo_id
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'design_saved'
),
-- ... join with retention calculation
*/
