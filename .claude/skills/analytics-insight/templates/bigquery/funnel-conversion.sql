-- Funnel Conversion Analysis for ToonNotes
-- Calculates step-by-step conversion for key funnels
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
-- DESIGN CONVERSION FUNNEL
-- ============================================
WITH design_funnel AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name = 'design_flow_started' THEN 1 ELSE 0 END) AS step1_started,
    MAX(CASE WHEN event_name = 'design_image_selected' THEN 1 ELSE 0 END) AS step2_image_selected,
    MAX(CASE WHEN event_name = 'design_generation_started' THEN 1 ELSE 0 END) AS step3_generation_started,
    MAX(CASE WHEN event_name = 'design_generated' THEN 1 ELSE 0 END) AS step4_generated,
    MAX(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS step5_saved,
    MAX(CASE WHEN event_name = 'design_applied' THEN 1 ELSE 0 END) AS step6_applied
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN (
      'design_flow_started',
      'design_image_selected',
      'design_generation_started',
      'design_generated',
      'design_saved',
      'design_applied'
    )
  GROUP BY user_pseudo_id
)

SELECT
  'Design Funnel' AS funnel_name,
  SUM(step1_started) AS step1_flow_started,
  SUM(step2_image_selected) AS step2_image_selected,
  SUM(step3_generation_started) AS step3_generation_started,
  SUM(step4_generated) AS step4_generated,
  SUM(step5_saved) AS step5_saved,
  SUM(step6_applied) AS step6_applied,
  -- Conversion rates
  ROUND(100.0 * SUM(step2_image_selected) / NULLIF(SUM(step1_started), 0), 1) AS conv_1_to_2_pct,
  ROUND(100.0 * SUM(step3_generation_started) / NULLIF(SUM(step2_image_selected), 0), 1) AS conv_2_to_3_pct,
  ROUND(100.0 * SUM(step4_generated) / NULLIF(SUM(step3_generation_started), 0), 1) AS conv_3_to_4_pct,
  ROUND(100.0 * SUM(step5_saved) / NULLIF(SUM(step4_generated), 0), 1) AS conv_4_to_5_pct,
  ROUND(100.0 * SUM(step6_applied) / NULLIF(SUM(step5_saved), 0), 1) AS conv_5_to_6_pct,
  -- Overall conversion
  ROUND(100.0 * SUM(step6_applied) / NULLIF(SUM(step1_started), 0), 1) AS overall_conversion_pct
FROM design_funnel;


-- ============================================
-- ONBOARDING FUNNEL
-- ============================================
WITH onboarding_funnel AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name = 'first_open' THEN 1 ELSE 0 END) AS step1_first_open,
    MAX(CASE WHEN event_name = 'onboarding_started' THEN 1 ELSE 0 END) AS step2_onboarding_started,
    MAX(CASE WHEN event_name = 'onboarding_completed' THEN 1 ELSE 0 END) AS step3_onboarding_completed,
    MAX(CASE WHEN event_name = 'note_created' THEN 1 ELSE 0 END) AS step4_note_created,
    MAX(CASE WHEN event_name = 'design_flow_started' THEN 1 ELSE 0 END) AS step5_design_started
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN (
      'first_open',
      'onboarding_started',
      'onboarding_completed',
      'note_created',
      'design_flow_started'
    )
  GROUP BY user_pseudo_id
)

SELECT
  'Onboarding Funnel' AS funnel_name,
  SUM(step1_first_open) AS step1_first_open,
  SUM(step2_onboarding_started) AS step2_onboarding_started,
  SUM(step3_onboarding_completed) AS step3_onboarding_completed,
  SUM(step4_note_created) AS step4_note_created,
  SUM(step5_design_started) AS step5_design_started,
  -- Conversion rates
  ROUND(100.0 * SUM(step2_onboarding_started) / NULLIF(SUM(step1_first_open), 0), 1) AS conv_1_to_2_pct,
  ROUND(100.0 * SUM(step3_onboarding_completed) / NULLIF(SUM(step2_onboarding_started), 0), 1) AS conv_2_to_3_pct,
  ROUND(100.0 * SUM(step4_note_created) / NULLIF(SUM(step3_onboarding_completed), 0), 1) AS conv_3_to_4_pct,
  ROUND(100.0 * SUM(step5_design_started) / NULLIF(SUM(step4_note_created), 0), 1) AS conv_4_to_5_pct,
  -- Overall conversion
  ROUND(100.0 * SUM(step5_design_started) / NULLIF(SUM(step1_first_open), 0), 1) AS overall_conversion_pct
FROM onboarding_funnel;


-- ============================================
-- PURCHASE FUNNEL
-- ============================================
WITH purchase_funnel AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name = 'paywall_shown' THEN 1 ELSE 0 END) AS step1_paywall_shown,
    MAX(CASE WHEN event_name = 'shop_opened' THEN 1 ELSE 0 END) AS step2_shop_opened,
    MAX(CASE WHEN event_name = 'begin_checkout' THEN 1 ELSE 0 END) AS step3_begin_checkout,
    MAX(CASE WHEN event_name = 'purchase' THEN 1 ELSE 0 END) AS step4_purchase
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN (
      'paywall_shown',
      'shop_opened',
      'begin_checkout',
      'purchase'
    )
  GROUP BY user_pseudo_id
)

SELECT
  'Purchase Funnel' AS funnel_name,
  SUM(step1_paywall_shown) AS step1_paywall_shown,
  SUM(step2_shop_opened) AS step2_shop_opened,
  SUM(step3_begin_checkout) AS step3_begin_checkout,
  SUM(step4_purchase) AS step4_purchase,
  -- Conversion rates
  ROUND(100.0 * SUM(step2_shop_opened) / NULLIF(SUM(step1_paywall_shown), 0), 1) AS conv_1_to_2_pct,
  ROUND(100.0 * SUM(step3_begin_checkout) / NULLIF(SUM(step2_shop_opened), 0), 1) AS conv_2_to_3_pct,
  ROUND(100.0 * SUM(step4_purchase) / NULLIF(SUM(step3_begin_checkout), 0), 1) AS conv_3_to_4_pct,
  -- Overall conversion
  ROUND(100.0 * SUM(step4_purchase) / NULLIF(SUM(step1_paywall_shown), 0), 1) AS overall_conversion_pct
FROM purchase_funnel;


-- ============================================
-- FUNNEL BY PLATFORM (Design Funnel Example)
-- ============================================
WITH design_funnel_by_platform AS (
  SELECT
    platform,
    user_pseudo_id,
    MAX(CASE WHEN event_name = 'design_flow_started' THEN 1 ELSE 0 END) AS step1_started,
    MAX(CASE WHEN event_name = 'design_generated' THEN 1 ELSE 0 END) AS step2_generated,
    MAX(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS step3_saved,
    MAX(CASE WHEN event_name = 'design_applied' THEN 1 ELSE 0 END) AS step4_applied
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN (
      'design_flow_started',
      'design_generated',
      'design_saved',
      'design_applied'
    )
  GROUP BY platform, user_pseudo_id
)

SELECT
  platform,
  SUM(step1_started) AS started,
  SUM(step2_generated) AS generated,
  SUM(step3_saved) AS saved,
  SUM(step4_applied) AS applied,
  ROUND(100.0 * SUM(step2_generated) / NULLIF(SUM(step1_started), 0), 1) AS started_to_generated_pct,
  ROUND(100.0 * SUM(step3_saved) / NULLIF(SUM(step2_generated), 0), 1) AS generated_to_saved_pct,
  ROUND(100.0 * SUM(step4_applied) / NULLIF(SUM(step3_saved), 0), 1) AS saved_to_applied_pct
FROM design_funnel_by_platform
GROUP BY platform
ORDER BY platform;


-- ============================================
-- TIME-BASED FUNNEL (Closed Funnel - Same Session)
-- ============================================
WITH design_sessions AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    event_name,
    event_timestamp
  FROM `YOUR_PROJECT_ID.analytics_PROPERTY_ID.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', start_date) AND FORMAT_DATE('%Y%m%d', end_date)
    AND event_name IN (
      'design_flow_started',
      'design_generated',
      'design_saved',
      'design_applied'
    )
),

session_funnels AS (
  SELECT
    user_pseudo_id,
    session_id,
    MAX(CASE WHEN event_name = 'design_flow_started' THEN 1 ELSE 0 END) AS started,
    MAX(CASE WHEN event_name = 'design_generated' THEN 1 ELSE 0 END) AS generated,
    MAX(CASE WHEN event_name = 'design_saved' THEN 1 ELSE 0 END) AS saved,
    MAX(CASE WHEN event_name = 'design_applied' THEN 1 ELSE 0 END) AS applied
  FROM design_sessions
  GROUP BY user_pseudo_id, session_id
)

SELECT
  'Same-Session Design Funnel' AS funnel_name,
  COUNT(*) AS sessions_with_design,
  SUM(started) AS started,
  SUM(generated) AS generated,
  SUM(saved) AS saved,
  SUM(applied) AS applied,
  ROUND(100.0 * SUM(generated) / NULLIF(SUM(started), 0), 1) AS started_to_generated_pct,
  ROUND(100.0 * SUM(saved) / NULLIF(SUM(generated), 0), 1) AS generated_to_saved_pct,
  ROUND(100.0 * SUM(applied) / NULLIF(SUM(saved), 0), 1) AS saved_to_applied_pct
FROM session_funnels
WHERE started = 1;
