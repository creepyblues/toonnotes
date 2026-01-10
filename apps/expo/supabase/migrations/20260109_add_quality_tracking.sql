-- Migration: Add quality tracking for AI image generation
-- This migration creates quality event tracking for monitoring AI generation quality,
-- helping identify hallucination issues and background removal failures.

-- Add quality fields to designs table
ALTER TABLE public.designs
ADD COLUMN IF NOT EXISTS quality_score REAL,
ADD COLUMN IF NOT EXISTS quality_signals JSONB,
ADD COLUMN IF NOT EXISTS user_accepted BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS generation_attempts INTEGER DEFAULT 1;

-- Add constraint for quality_score range
DO $$ BEGIN
  ALTER TABLE public.designs
  ADD CONSTRAINT designs_quality_score_check
  CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create quality events tracking table
CREATE TABLE IF NOT EXISTS public.quality_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  generation_type TEXT NOT NULL,
  quality_score REAL,
  quality_signals JSONB,
  fallback_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints for valid event and generation types
DO $$ BEGIN
  ALTER TABLE public.quality_events
  ADD CONSTRAINT quality_events_event_type_check
  CHECK (event_type IN ('generation', 'accepted', 'rejected', 'retry'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.quality_events
  ADD CONSTRAINT quality_events_generation_type_check
  CHECK (generation_type IN ('sticker', 'character', 'background_removal'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.quality_events
  ADD CONSTRAINT quality_events_quality_score_check
  CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_quality_events_user_id
ON public.quality_events(user_id);

CREATE INDEX IF NOT EXISTS idx_quality_events_type
ON public.quality_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quality_events_generation_type
ON public.quality_events(generation_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.quality_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own quality events
CREATE POLICY "Users can insert own quality events"
ON public.quality_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own quality events"
ON public.quality_events
FOR SELECT
USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.quality_events IS 'Tracks AI image generation quality events for analytics';
COMMENT ON COLUMN public.quality_events.event_type IS 'Type of quality event: generation, accepted, rejected, retry';
COMMENT ON COLUMN public.quality_events.generation_type IS 'What was generated: sticker, character, background_removal';
COMMENT ON COLUMN public.quality_events.quality_score IS 'Confidence score from 0 to 1';
COMMENT ON COLUMN public.quality_events.quality_signals IS 'Detailed quality metrics as JSON';
COMMENT ON COLUMN public.quality_events.fallback_used IS 'Whether fallback image was used due to processing failure';

COMMENT ON COLUMN public.designs.quality_score IS 'Quality confidence score of the final design (0-1)';
COMMENT ON COLUMN public.designs.quality_signals IS 'Detailed quality signals from generation';
COMMENT ON COLUMN public.designs.user_accepted IS 'Whether user accepted despite quality warnings';
COMMENT ON COLUMN public.designs.generation_attempts IS 'Number of attempts before user accepted';
