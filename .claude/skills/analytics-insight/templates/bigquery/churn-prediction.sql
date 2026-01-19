-- Churn Prediction Analysis for ToonNotes
-- Identifies users showing churn signals and patterns
--
-- Usage:
-- 1. Replace YOUR_PROJECT_ID with your GCP project ID
-- 2. Replace PROPERTY_ID with your GA4 property ID (numeric)
-- 3. Adjust date range as needed
-- 4. Run in BigQuery Console

-- Configuration
DECLARE analysis_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY);
DECLARE lookback_days INT64 DEFAULT 30;


-- ============================================
-- AT-RISK USERS (Haven't been active in 7+ days but were previously active)
-- ============================================
WITH user_activity_summary AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT event_date) AS active_days_30d,
    MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_active_date,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_active_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(analysis_date, INTERVAL lookback_days DAY))
    AND FORMAT_DATE('%Y%m%d', analysis_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id
)

SELECT
  user_pseudo_id,
  active_days_30d,
  last_active_date,
  DATE_DIFF(analysis_date, last_active_date, DAY) AS days_since_last_active,
  CASE
    WHEN DATE_DIFF(analysis_date, last_active_date, DAY) BETWEEN 7 AND 14 THEN 'At Risk - Early'
    WHEN DATE_DIFF(analysis_date, last_active_date, DAY) BETWEEN 15 AND 21 THEN 'At Risk - Medium'
    WHEN DATE_DIFF(analysis_date, last_active_date, DAY) > 21 THEN 'At Risk - High'
    ELSE 'Active'
  END AS risk_level
FROM user_activity_summary
WHERE active_days_30d >= 3  -- Was somewhat active
  AND DATE_DIFF(analysis_date, last_active_date, DAY) >= 7  -- But not recently
ORDER BY days_since_last_active DESC;


-- ============================================
-- CHURN SIGNAL INDICATORS
-- ============================================
WITH user_metrics AS (
  SELECT
    user_pseudo_id,
    -- Activity metrics
    COUNT(DISTINCT CASE
      WHEN PARSE_DATE('%Y%m%d', event_date) >= DATE_SUB(analysis_date, INTERVAL 7 DAY)
      THEN event_date END) AS active_days_7d,
    COUNT(DISTINCT CASE
      WHEN PARSE_DATE('%Y%m%d', event_date) BETWEEN DATE_SUB(analysis_date, INTERVAL 14 DAY) AND DATE_SUB(analysis_date, INTERVAL 8 DAY)
      THEN event_date END) AS active_days_prev_week,
    -- Feature usage
    SUM(CASE WHEN event_name = 'note_created' AND PARSE_DATE('%Y%m%d', event_date) >= DATE_SUB(analysis_date, INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS notes_7d,
    SUM(CASE WHEN event_name = 'note_created' AND PARSE_DATE('%Y%m%d', event_date) BETWEEN DATE_SUB(analysis_date, INTERVAL 14 DAY) AND DATE_SUB(analysis_date, INTERVAL 8 DAY) THEN 1 ELSE 0 END) AS notes_prev_week,
    -- Session metrics
    COUNT(CASE WHEN event_name = 'session_start' AND PARSE_DATE('%Y%m%d', event_date) >= DATE_SUB(analysis_date, INTERVAL 7 DAY) THEN 1 END) AS sessions_7d,
    COUNT(CASE WHEN event_name = 'session_start' AND PARSE_DATE('%Y%m%d', event_date) BETWEEN DATE_SUB(analysis_date, INTERVAL 14 DAY) AND DATE_SUB(analysis_date, INTERVAL 8 DAY) THEN 1 END) AS sessions_prev_week,
    -- Error/friction signals
    SUM(CASE WHEN event_name = 'design_generation_failed' THEN 1 ELSE 0 END) AS generation_failures,
    SUM(CASE WHEN event_name = 'purchase_failed' THEN 1 ELSE 0 END) AS purchase_failures
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(analysis_date, INTERVAL 14 DAY))
    AND FORMAT_DATE('%Y%m%d', analysis_date)
  GROUP BY user_pseudo_id
),

churn_signals AS (
  SELECT
    user_pseudo_id,
    active_days_7d,
    active_days_prev_week,
    sessions_7d,
    sessions_prev_week,
    notes_7d,
    notes_prev_week,
    generation_failures,
    purchase_failures,
    -- Churn signal flags
    CASE WHEN active_days_7d = 0 AND active_days_prev_week > 0 THEN 1 ELSE 0 END AS dropped_off,
    CASE WHEN sessions_7d < sessions_prev_week * 0.5 AND sessions_prev_week > 2 THEN 1 ELSE 0 END AS declining_sessions,
    CASE WHEN notes_7d < notes_prev_week * 0.5 AND notes_prev_week > 1 THEN 1 ELSE 0 END AS declining_engagement,
    CASE WHEN generation_failures >= 2 THEN 1 ELSE 0 END AS repeated_failures
  FROM user_metrics
  WHERE active_days_prev_week > 0  -- Was active before
)

SELECT
  user_pseudo_id,
  active_days_7d,
  active_days_prev_week,
  sessions_7d,
  sessions_prev_week,
  dropped_off,
  declining_sessions,
  declining_engagement,
  repeated_failures,
  dropped_off + declining_sessions + declining_engagement + repeated_failures AS churn_signal_count,
  CASE
    WHEN dropped_off = 1 THEN 'Critical - Dropped Off'
    WHEN dropped_off + declining_sessions + declining_engagement + repeated_failures >= 2 THEN 'High Risk'
    WHEN dropped_off + declining_sessions + declining_engagement + repeated_failures = 1 THEN 'Medium Risk'
    ELSE 'Low Risk'
  END AS churn_risk
FROM churn_signals
WHERE dropped_off + declining_sessions + declining_engagement + repeated_failures > 0
ORDER BY churn_signal_count DESC, dropped_off DESC;


-- ============================================
-- CHURN COHORT ANALYSIS (Who churned and when)
-- ============================================
WITH user_first_last AS (
  SELECT
    user_pseudo_id,
    DATE_TRUNC(MIN(PARSE_DATE('%Y%m%d', event_date)), WEEK(MONDAY)) AS cohort_week,
    MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_active
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(analysis_date, INTERVAL 90 DAY))
    AND FORMAT_DATE('%Y%m%d', analysis_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id
),

churned_users AS (
  SELECT
    *,
    DATE_DIFF(last_active, DATE(cohort_week), DAY) AS lifetime_days,
    DATE_DIFF(analysis_date, last_active, DAY) AS days_since_last_active,
    CASE WHEN DATE_DIFF(analysis_date, last_active, DAY) >= 14 THEN 1 ELSE 0 END AS is_churned
  FROM user_first_last
)

SELECT
  cohort_week,
  COUNT(*) AS cohort_size,
  SUM(is_churned) AS churned_users,
  ROUND(100.0 * SUM(is_churned) / COUNT(*), 1) AS churn_rate_pct,
  ROUND(AVG(CASE WHEN is_churned = 1 THEN lifetime_days END), 1) AS avg_lifetime_churned_days,
  -- Lifetime distribution for churned users
  SUM(CASE WHEN is_churned = 1 AND lifetime_days <= 1 THEN 1 ELSE 0 END) AS churned_day_0_1,
  SUM(CASE WHEN is_churned = 1 AND lifetime_days BETWEEN 2 AND 7 THEN 1 ELSE 0 END) AS churned_day_2_7,
  SUM(CASE WHEN is_churned = 1 AND lifetime_days BETWEEN 8 AND 14 THEN 1 ELSE 0 END) AS churned_day_8_14,
  SUM(CASE WHEN is_churned = 1 AND lifetime_days > 14 THEN 1 ELSE 0 END) AS churned_after_day_14
FROM churned_users
GROUP BY cohort_week
ORDER BY cohort_week DESC;


-- ============================================
-- CHURN BY FEATURE ADOPTION
-- ============================================
WITH user_features AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name = 'note_created' THEN 1 ELSE 0 END) AS created_note,
    MAX(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS created_design,
    MAX(CASE WHEN event_name = 'label_created' THEN 1 ELSE 0 END) AS created_label,
    MAX(CASE WHEN event_name = 'onboarding_completed' THEN 1 ELSE 0 END) AS completed_onboarding,
    MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_active
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(analysis_date, INTERVAL 90 DAY))
    AND FORMAT_DATE('%Y%m%d', analysis_date)
  GROUP BY user_pseudo_id
),

feature_churn AS (
  SELECT
    *,
    CASE WHEN DATE_DIFF(analysis_date, last_active, DAY) >= 14 THEN 1 ELSE 0 END AS is_churned
  FROM user_features
)

SELECT
  'Overall' AS segment,
  COUNT(*) AS users,
  SUM(is_churned) AS churned,
  ROUND(100.0 * SUM(is_churned) / COUNT(*), 1) AS churn_rate_pct

UNION ALL

SELECT
  CASE
    WHEN completed_onboarding = 1 THEN 'Completed Onboarding'
    ELSE 'Skipped Onboarding'
  END AS segment,
  COUNT(*) AS users,
  SUM(is_churned) AS churned,
  ROUND(100.0 * SUM(is_churned) / COUNT(*), 1) AS churn_rate_pct
FROM feature_churn
GROUP BY completed_onboarding

UNION ALL

SELECT
  CASE
    WHEN created_note = 1 THEN 'Created Note'
    ELSE 'No Note'
  END AS segment,
  COUNT(*) AS users,
  SUM(is_churned) AS churned,
  ROUND(100.0 * SUM(is_churned) / COUNT(*), 1) AS churn_rate_pct
FROM feature_churn
GROUP BY created_note

UNION ALL

SELECT
  CASE
    WHEN created_design = 1 THEN 'Created Design'
    ELSE 'No Design'
  END AS segment,
  COUNT(*) AS users,
  SUM(is_churned) AS churned,
  ROUND(100.0 * SUM(is_churned) / COUNT(*), 1) AS churn_rate_pct
FROM feature_churn
GROUP BY created_design

ORDER BY segment;


-- ============================================
-- REACTIVATION ANALYSIS (Who came back after being inactive)
-- ============================================
WITH user_sessions AS (
  SELECT
    user_pseudo_id,
    PARSE_DATE('%Y%m%d', event_date) AS session_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(analysis_date, INTERVAL 90 DAY))
    AND FORMAT_DATE('%Y%m%d', analysis_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id, event_date
),

session_gaps AS (
  SELECT
    user_pseudo_id,
    session_date,
    LAG(session_date) OVER (PARTITION BY user_pseudo_id ORDER BY session_date) AS prev_session_date,
    DATE_DIFF(session_date, LAG(session_date) OVER (PARTITION BY user_pseudo_id ORDER BY session_date), DAY) AS days_since_prev
  FROM user_sessions
)

SELECT
  'Reactivations' AS metric,
  COUNT(DISTINCT user_pseudo_id) AS users_reactivated,
  COUNT(*) AS reactivation_events,
  ROUND(AVG(days_since_prev), 1) AS avg_gap_days,
  -- Gap distribution
  SUM(CASE WHEN days_since_prev BETWEEN 7 AND 14 THEN 1 ELSE 0 END) AS gap_7_14_days,
  SUM(CASE WHEN days_since_prev BETWEEN 15 AND 30 THEN 1 ELSE 0 END) AS gap_15_30_days,
  SUM(CASE WHEN days_since_prev > 30 THEN 1 ELSE 0 END) AS gap_30_plus_days
FROM session_gaps
WHERE days_since_prev >= 7;  -- At least 7 days gap = reactivation


-- ============================================
-- DAILY CHURN MONITORING
-- ============================================
WITH daily_active AS (
  SELECT
    PARSE_DATE('%Y%m%d', event_date) AS active_date,
    COUNT(DISTINCT user_pseudo_id) AS dau
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(analysis_date, INTERVAL 14 DAY))
    AND FORMAT_DATE('%Y%m%d', analysis_date)
    AND event_name = 'session_start'
  GROUP BY event_date
),

daily_new AS (
  SELECT
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS install_date,
    COUNT(DISTINCT user_pseudo_id) AS new_users
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(analysis_date, INTERVAL 14 DAY))
    AND FORMAT_DATE('%Y%m%d', analysis_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id
)

SELECT
  da.active_date,
  da.dau,
  LAG(da.dau) OVER (ORDER BY da.active_date) AS prev_day_dau,
  da.dau - LAG(da.dau) OVER (ORDER BY da.active_date) AS dau_change,
  dn.new_users,
  -- Net user change (simplified churn proxy)
  da.dau - LAG(da.dau) OVER (ORDER BY da.active_date) - COALESCE(dn.new_users, 0) AS net_returning_change
FROM daily_active da
LEFT JOIN (
  SELECT install_date, SUM(new_users) AS new_users
  FROM daily_new
  GROUP BY install_date
) dn ON da.active_date = dn.install_date
ORDER BY da.active_date DESC;
