-- Feature Adoption Analysis for ToonNotes
-- Calculates feature usage patterns by cohort and segment
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
-- OVERALL FEATURE ADOPTION
-- ============================================
WITH mau AS (
  SELECT COUNT(DISTINCT user_pseudo_id) AS total_mau
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
),

feature_users AS (
  SELECT
    event_name,
    COUNT(DISTINCT user_pseudo_id) AS users,
    COUNT(*) AS total_events
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN (
      'note_created',
      'note_edited',
      'design_flow_started',
      'design_generated',
      'design_saved',
      'design_applied',
      'label_created',
      'label_suggestion_shown',
      'label_suggestion_accepted',
      'board_viewed',
      'note_shared'
    )
  GROUP BY event_name
)

SELECT
  fu.event_name AS feature,
  fu.users,
  fu.total_events,
  ROUND(fu.total_events / fu.users, 1) AS events_per_user,
  ROUND(100.0 * fu.users / mau.total_mau, 1) AS adoption_rate_pct
FROM feature_users fu
CROSS JOIN mau
ORDER BY fu.users DESC;


-- ============================================
-- FEATURE ADOPTION BY COHORT WEEK
-- ============================================
WITH user_cohorts AS (
  SELECT
    user_pseudo_id,
    DATE_TRUNC(MIN(PARSE_DATE('%Y%m%d', event_date)), WEEK(MONDAY)) AS cohort_week
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(start_date, INTERVAL 90 DAY)) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id
),

cohort_features AS (
  SELECT
    uc.cohort_week,
    e.user_pseudo_id,
    MAX(CASE WHEN e.event_name = 'note_created' THEN 1 ELSE 0 END) AS used_notes,
    MAX(CASE WHEN e.event_name = 'design_saved' THEN 1 ELSE 0 END) AS used_designs,
    MAX(CASE WHEN e.event_name = 'label_created' THEN 1 ELSE 0 END) AS used_labels,
    MAX(CASE WHEN e.event_name = 'board_viewed' THEN 1 ELSE 0 END) AS used_boards
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*` e
  JOIN user_cohorts uc ON e.user_pseudo_id = uc.user_pseudo_id
  WHERE e._TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
  GROUP BY uc.cohort_week, e.user_pseudo_id
)

SELECT
  cohort_week,
  COUNT(DISTINCT user_pseudo_id) AS cohort_users,
  ROUND(100.0 * SUM(used_notes) / COUNT(DISTINCT user_pseudo_id), 1) AS notes_adoption_pct,
  ROUND(100.0 * SUM(used_designs) / COUNT(DISTINCT user_pseudo_id), 1) AS designs_adoption_pct,
  ROUND(100.0 * SUM(used_labels) / COUNT(DISTINCT user_pseudo_id), 1) AS labels_adoption_pct,
  ROUND(100.0 * SUM(used_boards) / COUNT(DISTINCT user_pseudo_id), 1) AS boards_adoption_pct
FROM cohort_features
GROUP BY cohort_week
ORDER BY cohort_week DESC;


-- ============================================
-- FEATURE ADOPTION BY SUBSCRIPTION TIER
-- ============================================
WITH user_tiers AS (
  SELECT
    user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'subscription_tier') AS subscription_tier
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'session_start'
  GROUP BY user_pseudo_id, subscription_tier
),

tier_features AS (
  SELECT
    COALESCE(ut.subscription_tier, 'unknown') AS subscription_tier,
    e.user_pseudo_id,
    MAX(CASE WHEN e.event_name = 'note_created' THEN 1 ELSE 0 END) AS used_notes,
    MAX(CASE WHEN e.event_name = 'design_saved' THEN 1 ELSE 0 END) AS used_designs,
    MAX(CASE WHEN e.event_name = 'label_created' THEN 1 ELSE 0 END) AS used_labels,
    MAX(CASE WHEN e.event_name = 'board_viewed' THEN 1 ELSE 0 END) AS used_boards
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*` e
  LEFT JOIN user_tiers ut ON e.user_pseudo_id = ut.user_pseudo_id
  WHERE e._TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
  GROUP BY subscription_tier, e.user_pseudo_id
)

SELECT
  subscription_tier,
  COUNT(DISTINCT user_pseudo_id) AS users,
  ROUND(100.0 * SUM(used_notes) / COUNT(DISTINCT user_pseudo_id), 1) AS notes_adoption_pct,
  ROUND(100.0 * SUM(used_designs) / COUNT(DISTINCT user_pseudo_id), 1) AS designs_adoption_pct,
  ROUND(100.0 * SUM(used_labels) / COUNT(DISTINCT user_pseudo_id), 1) AS labels_adoption_pct,
  ROUND(100.0 * SUM(used_boards) / COUNT(DISTINCT user_pseudo_id), 1) AS boards_adoption_pct
FROM tier_features
GROUP BY subscription_tier
ORDER BY users DESC;


-- ============================================
-- FEATURE USAGE DEPTH
-- ============================================
WITH user_feature_counts AS (
  SELECT
    user_pseudo_id,
    event_name,
    COUNT(*) AS event_count
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN ('note_created', 'design_saved', 'label_created')
  GROUP BY user_pseudo_id, event_name
)

SELECT
  event_name AS feature,
  COUNT(DISTINCT user_pseudo_id) AS total_users,
  COUNT(DISTINCT CASE WHEN event_count = 1 THEN user_pseudo_id END) AS used_once,
  COUNT(DISTINCT CASE WHEN event_count BETWEEN 2 AND 5 THEN user_pseudo_id END) AS used_2_to_5,
  COUNT(DISTINCT CASE WHEN event_count BETWEEN 6 AND 10 THEN user_pseudo_id END) AS used_6_to_10,
  COUNT(DISTINCT CASE WHEN event_count > 10 THEN user_pseudo_id END) AS used_over_10,
  ROUND(AVG(event_count), 1) AS avg_usage,
  APPROX_QUANTILES(event_count, 100)[OFFSET(50)] AS median_usage
FROM user_feature_counts
GROUP BY event_name
ORDER BY total_users DESC;


-- ============================================
-- FEATURE ADOPTION TIMING (Days Since Install)
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

feature_timing AS (
  SELECT
    e.user_pseudo_id,
    e.event_name,
    MIN(DATE_DIFF(PARSE_DATE('%Y%m%d', e.event_date), ui.install_date, DAY)) AS days_to_first_use
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*` e
  JOIN user_install ui ON e.user_pseudo_id = ui.user_pseudo_id
  WHERE e._TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND e.event_name IN ('note_created', 'design_saved', 'design_applied', 'label_created', 'board_viewed')
  GROUP BY e.user_pseudo_id, e.event_name
)

SELECT
  event_name AS feature,
  COUNT(*) AS users,
  ROUND(AVG(days_to_first_use), 1) AS avg_days_to_adopt,
  APPROX_QUANTILES(days_to_first_use, 100)[OFFSET(50)] AS median_days,
  COUNT(CASE WHEN days_to_first_use = 0 THEN 1 END) AS adopted_day_0,
  COUNT(CASE WHEN days_to_first_use <= 1 THEN 1 END) AS adopted_day_1,
  COUNT(CASE WHEN days_to_first_use <= 7 THEN 1 END) AS adopted_week_1,
  ROUND(100.0 * COUNT(CASE WHEN days_to_first_use = 0 THEN 1 END) / COUNT(*), 1) AS day_0_pct,
  ROUND(100.0 * COUNT(CASE WHEN days_to_first_use <= 1 THEN 1 END) / COUNT(*), 1) AS day_1_pct,
  ROUND(100.0 * COUNT(CASE WHEN days_to_first_use <= 7 THEN 1 END) / COUNT(*), 1) AS week_1_pct
FROM feature_timing
GROUP BY event_name
ORDER BY avg_days_to_adopt;


-- ============================================
-- MULTI-FEATURE ADOPTION PATTERNS
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
)

SELECT
  CASE
    WHEN has_notes = 1 AND has_designs = 1 AND has_labels = 1 AND has_boards = 1 THEN 'All Features'
    WHEN has_notes = 1 AND has_designs = 1 AND (has_labels = 1 OR has_boards = 1) THEN 'Notes + Designs + 1 More'
    WHEN has_notes = 1 AND has_designs = 1 THEN 'Notes + Designs'
    WHEN has_notes = 1 AND has_labels = 1 THEN 'Notes + Labels'
    WHEN has_notes = 1 THEN 'Notes Only'
    ELSE 'No Core Features'
  END AS adoption_pattern,
  COUNT(*) AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) AS percentage
FROM user_features
GROUP BY adoption_pattern
ORDER BY users DESC;


-- ============================================
-- AI LABEL SUGGESTION ACCEPTANCE
-- ============================================
WITH label_suggestions AS (
  SELECT
    user_pseudo_id,
    SUM(CASE WHEN event_name = 'label_suggestion_shown' THEN 1 ELSE 0 END) AS shown,
    SUM(CASE WHEN event_name = 'label_suggestion_accepted' THEN 1 ELSE 0 END) AS accepted,
    SUM(CASE WHEN event_name = 'label_suggestion_declined' THEN 1 ELSE 0 END) AS declined
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN ('label_suggestion_shown', 'label_suggestion_accepted', 'label_suggestion_declined')
  GROUP BY user_pseudo_id
)

SELECT
  COUNT(DISTINCT user_pseudo_id) AS users_with_suggestions,
  SUM(shown) AS total_shown,
  SUM(accepted) AS total_accepted,
  SUM(declined) AS total_declined,
  ROUND(100.0 * SUM(accepted) / NULLIF(SUM(shown), 0), 1) AS acceptance_rate_pct,
  ROUND(AVG(shown), 1) AS avg_suggestions_per_user,
  ROUND(AVG(accepted), 1) AS avg_accepted_per_user
FROM label_suggestions;
