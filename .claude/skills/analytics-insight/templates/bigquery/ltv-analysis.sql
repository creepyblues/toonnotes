-- Lifetime Value (LTV) Analysis for ToonNotes
-- Calculates cumulative LTV by acquisition cohort
--
-- Usage:
-- 1. Replace YOUR_PROJECT_ID with your GCP project ID
-- 2. Replace PROPERTY_ID with your GA4 property ID (numeric)
-- 3. Adjust date range as needed
-- 4. Run in BigQuery Console

-- Configuration
DECLARE start_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY);
DECLARE end_date DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY);


-- ============================================
-- COHORT LTV (Cumulative Revenue by Week Since Install)
-- ============================================
WITH user_cohorts AS (
  SELECT
    user_pseudo_id,
    DATE_TRUNC(MIN(PARSE_DATE('%Y%m%d', event_date)), WEEK(MONDAY)) AS cohort_week
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id
),

user_purchases AS (
  SELECT
    user_pseudo_id,
    PARSE_DATE('%Y%m%d', event_date) AS purchase_date,
    (SELECT COALESCE(value.double_value, value.float_value)
     FROM UNNEST(event_params) WHERE key = 'value') AS revenue
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'purchase'
),

cohort_revenue AS (
  SELECT
    uc.cohort_week,
    uc.user_pseudo_id,
    DATE_DIFF(up.purchase_date, DATE(uc.cohort_week), WEEK) AS weeks_since_install,
    COALESCE(up.revenue, 0) AS revenue
  FROM user_cohorts uc
  LEFT JOIN user_purchases up ON uc.user_pseudo_id = up.user_pseudo_id
),

weekly_ltv AS (
  SELECT
    cohort_week,
    weeks_since_install,
    COUNT(DISTINCT user_pseudo_id) AS cohort_size,
    SUM(revenue) AS total_revenue
  FROM cohort_revenue
  WHERE weeks_since_install >= 0
  GROUP BY cohort_week, weeks_since_install
)

SELECT
  cohort_week,
  MAX(cohort_size) AS cohort_size,
  SUM(CASE WHEN weeks_since_install <= 0 THEN total_revenue ELSE 0 END) AS ltv_week_0,
  SUM(CASE WHEN weeks_since_install <= 1 THEN total_revenue ELSE 0 END) AS ltv_week_1,
  SUM(CASE WHEN weeks_since_install <= 2 THEN total_revenue ELSE 0 END) AS ltv_week_2,
  SUM(CASE WHEN weeks_since_install <= 4 THEN total_revenue ELSE 0 END) AS ltv_week_4,
  SUM(CASE WHEN weeks_since_install <= 8 THEN total_revenue ELSE 0 END) AS ltv_week_8,
  SUM(CASE WHEN weeks_since_install <= 12 THEN total_revenue ELSE 0 END) AS ltv_week_12,
  -- LTV per user
  ROUND(SUM(CASE WHEN weeks_since_install <= 4 THEN total_revenue ELSE 0 END) / NULLIF(MAX(cohort_size), 0), 2) AS ltv_per_user_week_4,
  ROUND(SUM(CASE WHEN weeks_since_install <= 12 THEN total_revenue ELSE 0 END) / NULLIF(MAX(cohort_size), 0), 2) AS ltv_per_user_week_12
FROM weekly_ltv
GROUP BY cohort_week
ORDER BY cohort_week DESC;


-- ============================================
-- CONVERSION TO PAID & ARPPU
-- ============================================
WITH user_cohorts AS (
  SELECT
    user_pseudo_id,
    DATE_TRUNC(MIN(PARSE_DATE('%Y%m%d', event_date)), MONTH) AS cohort_month
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id
),

user_revenue AS (
  SELECT
    user_pseudo_id,
    SUM((SELECT COALESCE(value.double_value, value.float_value)
         FROM UNNEST(event_params) WHERE key = 'value')) AS total_revenue,
    COUNT(*) AS purchase_count
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'purchase'
  GROUP BY user_pseudo_id
)

SELECT
  uc.cohort_month,
  COUNT(DISTINCT uc.user_pseudo_id) AS cohort_size,
  COUNT(DISTINCT ur.user_pseudo_id) AS paying_users,
  ROUND(100.0 * COUNT(DISTINCT ur.user_pseudo_id) / COUNT(DISTINCT uc.user_pseudo_id), 2) AS conversion_rate_pct,
  ROUND(SUM(ur.total_revenue), 2) AS total_revenue,
  ROUND(AVG(ur.total_revenue), 2) AS arppu,
  ROUND(SUM(ur.total_revenue) / COUNT(DISTINCT uc.user_pseudo_id), 4) AS arpu
FROM user_cohorts uc
LEFT JOIN user_revenue ur ON uc.user_pseudo_id = ur.user_pseudo_id
GROUP BY uc.cohort_month
ORDER BY uc.cohort_month DESC;


-- ============================================
-- LTV BY ACQUISITION SOURCE (if UTM tracking enabled)
-- ============================================
WITH user_acquisition AS (
  SELECT
    user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'source') AS source,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'medium') AS medium,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'campaign') AS campaign
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id, source, medium, campaign
),

user_revenue AS (
  SELECT
    user_pseudo_id,
    SUM((SELECT COALESCE(value.double_value, value.float_value)
         FROM UNNEST(event_params) WHERE key = 'value')) AS total_revenue
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'purchase'
  GROUP BY user_pseudo_id
)

SELECT
  COALESCE(ua.source, '(direct)') AS source,
  COALESCE(ua.medium, '(none)') AS medium,
  COUNT(DISTINCT ua.user_pseudo_id) AS users,
  COUNT(DISTINCT ur.user_pseudo_id) AS paying_users,
  ROUND(100.0 * COUNT(DISTINCT ur.user_pseudo_id) / COUNT(DISTINCT ua.user_pseudo_id), 2) AS conversion_rate_pct,
  ROUND(SUM(COALESCE(ur.total_revenue, 0)), 2) AS total_revenue,
  ROUND(SUM(COALESCE(ur.total_revenue, 0)) / COUNT(DISTINCT ua.user_pseudo_id), 4) AS ltv_per_user
FROM user_acquisition ua
LEFT JOIN user_revenue ur ON ua.user_pseudo_id = ur.user_pseudo_id
GROUP BY source, medium
HAVING COUNT(DISTINCT ua.user_pseudo_id) >= 10  -- Filter for statistical significance
ORDER BY total_revenue DESC;


-- ============================================
-- REVENUE BY PRODUCT
-- ============================================
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'item_id') AS product_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'item_name') AS product_name,
  COUNT(*) AS purchases,
  COUNT(DISTINCT user_pseudo_id) AS unique_buyers,
  ROUND(SUM((SELECT COALESCE(value.double_value, value.float_value)
             FROM UNNEST(event_params) WHERE key = 'value')), 2) AS total_revenue,
  ROUND(AVG((SELECT COALESCE(value.double_value, value.float_value)
             FROM UNNEST(event_params) WHERE key = 'value')), 2) AS avg_transaction
FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
  AND event_name = 'purchase'
GROUP BY product_id, product_name
ORDER BY total_revenue DESC;


-- ============================================
-- TIME TO FIRST PURCHASE
-- ============================================
WITH user_install AS (
  SELECT
    user_pseudo_id,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS install_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'first_open'
  GROUP BY user_pseudo_id
),

first_purchase AS (
  SELECT
    user_pseudo_id,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_purchase_date
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name = 'purchase'
  GROUP BY user_pseudo_id
)

SELECT
  'Time to First Purchase' AS metric,
  COUNT(*) AS converting_users,
  ROUND(AVG(DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY)), 1) AS avg_days,
  APPROX_QUANTILES(DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY), 100)[OFFSET(50)] AS median_days,
  MIN(DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY)) AS min_days,
  MAX(DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY)) AS max_days,
  -- Distribution
  COUNT(CASE WHEN DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY) = 0 THEN 1 END) AS day_0,
  COUNT(CASE WHEN DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY) BETWEEN 1 AND 7 THEN 1 END) AS day_1_to_7,
  COUNT(CASE WHEN DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY) BETWEEN 8 AND 30 THEN 1 END) AS day_8_to_30,
  COUNT(CASE WHEN DATE_DIFF(fp.first_purchase_date, ui.install_date, DAY) > 30 THEN 1 END) AS day_31_plus
FROM user_install ui
JOIN first_purchase fp ON ui.user_pseudo_id = fp.user_pseudo_id;


-- ============================================
-- SUBSCRIPTION RETENTION (for recurring revenue)
-- ============================================
WITH subscription_events AS (
  SELECT
    user_pseudo_id,
    event_name,
    PARSE_DATE('%Y%m%d', event_date) AS event_date,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'plan') AS plan
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN ('subscription_started', 'subscription_cancelled')
)

SELECT
  DATE_TRUNC(event_date, MONTH) AS month,
  SUM(CASE WHEN event_name = 'subscription_started' THEN 1 ELSE 0 END) AS new_subscriptions,
  SUM(CASE WHEN event_name = 'subscription_cancelled' THEN 1 ELSE 0 END) AS cancellations,
  SUM(CASE WHEN event_name = 'subscription_started' THEN 1 ELSE 0 END) -
  SUM(CASE WHEN event_name = 'subscription_cancelled' THEN 1 ELSE 0 END) AS net_change
FROM subscription_events
GROUP BY month
ORDER BY month DESC;
