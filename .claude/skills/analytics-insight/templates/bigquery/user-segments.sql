-- User Segmentation Analysis for ToonNotes
-- Segments users by behavior and calculates segment metrics
--
-- Usage:
-- 1. Replace YOUR_PROJECT_ID with your GCP project ID
-- 2. Replace PROPERTY_ID with your GA4 property ID (numeric)
-- 3. Adjust date range as needed
-- 4. Run in BigQuery Console

-- Configuration
DECLARE start_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY);
DECLARE end_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY);


-- ============================================
-- ENGAGEMENT-BASED SEGMENTS
-- ============================================
WITH user_activity AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT event_date) AS active_days,
    COUNT(*) AS total_sessions,
    MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_active
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id
),

engagement_segments AS (
  SELECT
    user_pseudo_id,
    active_days,
    total_sessions,
    last_active,
    CASE
      WHEN active_days >= 20 THEN 'Power User'
      WHEN active_days >= 10 THEN 'Active'
      WHEN active_days >= 4 THEN 'Casual'
      WHEN active_days >= 1 THEN 'Light'
      ELSE 'Dormant'
    END AS engagement_segment
  FROM user_activity
)

SELECT
  engagement_segment,
  COUNT(*) AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) AS percentage,
  ROUND(AVG(active_days), 1) AS avg_active_days,
  ROUND(AVG(total_sessions), 1) AS avg_sessions
FROM engagement_segments
GROUP BY engagement_segment
ORDER BY users DESC;


-- ============================================
-- AT-RISK USERS
-- ============================================
WITH user_activity AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT event_date) AS active_days_30d,
    MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_active
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id
)

SELECT
  'At-Risk Users' AS segment,
  COUNT(*) AS users,
  ROUND(AVG(active_days_30d), 1) AS avg_active_days_before,
  AVG(DATE_DIFF(end_date, last_active, DAY)) AS avg_days_inactive
FROM user_activity
WHERE last_active < DATE_SUB(end_date, INTERVAL 7 DAY)
  AND active_days_30d >= 3;


-- ============================================
-- POTENTIAL CONVERTERS
-- ============================================
WITH user_features AS (
  SELECT
    e.user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(e.user_properties) WHERE key = 'subscription_tier') AS subscription_tier,
    COUNT(DISTINCT CASE WHEN e.event_name = 'design_saved' THEN event_timestamp END) AS designs_saved,
    COUNT(DISTINCT CASE WHEN e.event_name = 'paywall_shown' THEN event_timestamp END) AS paywall_views
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*` e
  WHERE e._TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
  GROUP BY e.user_pseudo_id, subscription_tier
)

SELECT
  'Potential Converters' AS segment,
  COUNT(*) AS users,
  ROUND(AVG(designs_saved), 1) AS avg_designs,
  ROUND(AVG(paywall_views), 1) AS avg_paywall_views
FROM user_features
WHERE (subscription_tier = 'free' OR subscription_tier IS NULL)
  AND designs_saved >= 2;


-- ============================================
-- POWER USERS (5+ sessions in 7 days)
-- ============================================
WITH weekly_sessions AS (
  SELECT
    user_pseudo_id,
    COUNT(*) AS session_count
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(end_date, INTERVAL 7 DAY))
    AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id
)

SELECT
  'Power Users (7-day)' AS segment,
  COUNT(*) AS users,
  ROUND(AVG(session_count), 1) AS avg_sessions,
  MIN(session_count) AS min_sessions,
  MAX(session_count) AS max_sessions
FROM weekly_sessions
WHERE session_count > 5;


-- ============================================
-- FEATURE ADOPTION SEGMENTS
-- ============================================
WITH user_features AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name IN ('note_created', 'note_edited') THEN 1 ELSE 0 END) AS has_notes,
    MAX(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS has_designs,
    MAX(CASE WHEN event_name = 'label_created' THEN 1 ELSE 0 END) AS has_labels,
    MAX(CASE WHEN event_name = 'board_viewed' THEN 1 ELSE 0 END) AS has_boards
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
  GROUP BY user_pseudo_id
),

feature_segments AS (
  SELECT
    user_pseudo_id,
    has_notes + has_designs + has_labels + has_boards AS features_used,
    CASE
      WHEN has_notes + has_designs + has_labels + has_boards >= 4 THEN 'Full Adopter'
      WHEN has_notes + has_designs + has_labels + has_boards >= 3 THEN 'Multi-Feature'
      WHEN has_notes = 1 AND has_designs = 1 THEN 'Core Adopter'
      WHEN has_notes = 1 THEN 'Notes Only'
      ELSE 'No Core Features'
    END AS adoption_segment
  FROM user_features
)

SELECT
  adoption_segment,
  COUNT(*) AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) AS percentage,
  ROUND(AVG(features_used), 1) AS avg_features
FROM feature_segments
GROUP BY adoption_segment
ORDER BY users DESC;


-- ============================================
-- LIFECYCLE SEGMENTS
-- ============================================
WITH user_install AS (
  SELECT
    user_pseudo_id,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS install_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(start_date, INTERVAL 90 DAY)) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id
),

active_users AS (
  SELECT DISTINCT user_pseudo_id
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
),

lifecycle AS (
  SELECT
    ui.user_pseudo_id,
    DATE_DIFF(end_date, ui.install_date, DAY) AS days_since_install,
    CASE
      WHEN DATE_DIFF(end_date, ui.install_date, DAY) <= 7 THEN 'New (0-7 days)'
      WHEN DATE_DIFF(end_date, ui.install_date, DAY) <= 30 THEN 'Developing (8-30 days)'
      WHEN DATE_DIFF(end_date, ui.install_date, DAY) <= 90 THEN 'Established (31-90 days)'
      ELSE 'Mature (90+ days)'
    END AS lifecycle_segment
  FROM user_install ui
  JOIN active_users au ON ui.user_pseudo_id = au.user_pseudo_id
)

SELECT
  lifecycle_segment,
  COUNT(*) AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) AS percentage,
  ROUND(AVG(days_since_install), 0) AS avg_days_since_install
FROM lifecycle
GROUP BY lifecycle_segment
ORDER BY
  CASE lifecycle_segment
    WHEN 'New (0-7 days)' THEN 1
    WHEN 'Developing (8-30 days)' THEN 2
    WHEN 'Established (31-90 days)' THEN 3
    ELSE 4
  END;


-- ============================================
-- SEGMENT METRICS COMPARISON
-- ============================================
WITH user_activity AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT event_date) AS active_days,
    COUNT(*) AS total_sessions
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id
),

user_features AS (
  SELECT
    user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'subscription_tier') AS subscription_tier,
    SUM(CASE WHEN event_name = 'note_created' THEN 1 ELSE 0 END) AS notes_created,
    SUM(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS designs_saved
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
  GROUP BY user_pseudo_id, subscription_tier
),

user_segments AS (
  SELECT
    ua.user_pseudo_id,
    ua.active_days,
    ua.total_sessions,
    COALESCE(uf.subscription_tier, 'free') AS subscription_tier,
    COALESCE(uf.notes_created, 0) AS notes_created,
    COALESCE(uf.designs_saved, 0) AS designs_saved,
    CASE
      WHEN ua.active_days >= 20 THEN 'Power'
      WHEN ua.active_days >= 10 THEN 'Active'
      WHEN ua.active_days >= 4 THEN 'Casual'
      ELSE 'Light'
    END AS engagement_segment
  FROM user_activity ua
  LEFT JOIN user_features uf ON ua.user_pseudo_id = uf.user_pseudo_id
)

SELECT
  engagement_segment,
  COUNT(*) AS users,
  ROUND(AVG(active_days), 1) AS avg_active_days,
  ROUND(AVG(total_sessions), 1) AS avg_sessions,
  ROUND(AVG(notes_created), 1) AS avg_notes,
  ROUND(AVG(designs_saved), 1) AS avg_designs,
  ROUND(100.0 * SUM(CASE WHEN subscription_tier = 'pro' THEN 1 ELSE 0 END) / COUNT(*), 1) AS pro_rate_pct
FROM user_segments
GROUP BY engagement_segment
ORDER BY
  CASE engagement_segment
    WHEN 'Power' THEN 1
    WHEN 'Active' THEN 2
    WHEN 'Casual' THEN 3
    ELSE 4
  END;


-- ============================================
-- PLATFORM SEGMENTS
-- ============================================
SELECT
  platform,
  COUNT(DISTINCT user_pseudo_id) AS users,
  ROUND(100.0 * COUNT(DISTINCT user_pseudo_id) / SUM(COUNT(DISTINCT user_pseudo_id)) OVER(), 1) AS percentage
FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
  AND event_name = 'session_start'
GROUP BY platform
ORDER BY users DESC;
