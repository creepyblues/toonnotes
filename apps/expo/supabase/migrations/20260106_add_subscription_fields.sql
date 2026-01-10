-- Migration: Add subscription fields to profiles table
-- This migration adds Pro subscription tracking fields for ToonNotes Pro subscribers.
-- Pro subscribers get cloud sync access and 100 coins monthly.

-- Add subscription columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_last_coin_grant_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_will_renew BOOLEAN DEFAULT FALSE;

-- Add constraint for valid subscription plans
DO $$ BEGIN
  ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_plan_check
  CHECK (subscription_plan IS NULL OR subscription_plan IN ('monthly'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create index for efficient Pro user queries (partial index on active Pro users)
CREATE INDEX IF NOT EXISTS idx_profiles_is_pro
ON public.profiles(is_pro)
WHERE is_pro = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_pro IS 'Whether user has active Pro subscription';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Subscription plan type: monthly';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'When the current subscription period expires';
COMMENT ON COLUMN public.profiles.subscription_last_coin_grant_date IS 'When the last monthly 100 coin grant occurred';
COMMENT ON COLUMN public.profiles.subscription_will_renew IS 'Whether subscription will auto-renew (from RevenueCat)';
