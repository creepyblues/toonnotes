-- Migration: Add MODE Framework v2.0
-- This migration adds cognitive mode tracking to boards and creates the
-- note_behaviors table for tracking note lifecycle and engagement.
--
-- The four cognitive modes are:
-- - 'manage': Getting things done (tasks, checklists, deadlines)
-- - 'develop': Growing ideas (brainstorming, creativity, drafts)
-- - 'organize': Keeping for later (references, bookmarks, learning)
-- - 'experience': Recording life (journal, memories, reflections)

-- ============================================
-- 1. Add mode fields to boards table
-- ============================================

ALTER TABLE public.boards
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT NULL;

ALTER TABLE public.boards
ADD COLUMN IF NOT EXISTS organize_stage TEXT DEFAULT NULL;

-- Add check constraints for valid mode values (idempotent)
DO $$ BEGIN
  ALTER TABLE public.boards
  ADD CONSTRAINT boards_mode_check
  CHECK (mode IS NULL OR mode IN ('manage', 'develop', 'organize', 'experience'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.boards
  ADD CONSTRAINT boards_organize_stage_check
  CHECK (organize_stage IS NULL OR organize_stage IN ('inbox', 'store', 'learn'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add constraint: organize_stage only valid when mode is 'organize'
DO $$ BEGIN
  ALTER TABLE public.boards
  ADD CONSTRAINT boards_organize_stage_mode_check
  CHECK (organize_stage IS NULL OR mode = 'organize');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create index for filtering by mode
CREATE INDEX IF NOT EXISTS idx_boards_mode ON public.boards(mode);

-- Add column comments for documentation
COMMENT ON COLUMN public.boards.mode IS 'Cognitive mode: manage, develop, organize, or experience';
COMMENT ON COLUMN public.boards.organize_stage IS 'ORGANIZE mode sub-stage: inbox, store, or learn';

-- ============================================
-- 2. Create note_behaviors table
-- ============================================

CREATE TABLE IF NOT EXISTS public.note_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Mode
  mode TEXT NOT NULL DEFAULT 'organize',

  -- Lifecycle scores
  usefulness_score INTEGER NOT NULL DEFAULT 0 CHECK (usefulness_score >= 0 AND usefulness_score <= 100),
  usefulness_level TEXT NOT NULL DEFAULT 'filed',

  -- Engagement metrics
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER NOT NULL DEFAULT 0,
  edit_count INTEGER NOT NULL DEFAULT 0,

  -- Nudge tracking
  last_nudged_at TIMESTAMPTZ,
  nudge_count INTEGER NOT NULL DEFAULT 0,
  nudge_response_rate REAL CHECK (nudge_response_rate IS NULL OR (nudge_response_rate >= 0 AND nudge_response_rate <= 1)),

  -- Mode-specific data (stored as JSONB for flexibility)
  mode_data JSONB NOT NULL DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT note_behaviors_mode_check CHECK (mode IN ('manage', 'develop', 'organize', 'experience')),
  CONSTRAINT note_behaviors_unique_note UNIQUE (note_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_note_behaviors_user_id ON public.note_behaviors(user_id);
CREATE INDEX IF NOT EXISTS idx_note_behaviors_mode ON public.note_behaviors(mode);
CREATE INDEX IF NOT EXISTS idx_note_behaviors_usefulness_score ON public.note_behaviors(usefulness_score);
CREATE INDEX IF NOT EXISTS idx_note_behaviors_last_accessed ON public.note_behaviors(last_accessed_at);

-- Enable RLS
ALTER TABLE public.note_behaviors ENABLE ROW LEVEL SECURITY;

-- RLS policies (idempotent)
DROP POLICY IF EXISTS "Users can view their own note behaviors" ON public.note_behaviors;
CREATE POLICY "Users can view their own note behaviors"
ON public.note_behaviors FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own note behaviors" ON public.note_behaviors;
CREATE POLICY "Users can insert their own note behaviors"
ON public.note_behaviors FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own note behaviors" ON public.note_behaviors;
CREATE POLICY "Users can update their own note behaviors"
ON public.note_behaviors FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own note behaviors" ON public.note_behaviors;
CREATE POLICY "Users can delete their own note behaviors"
ON public.note_behaviors FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_note_behaviors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_note_behaviors_updated_at ON public.note_behaviors;
CREATE TRIGGER trigger_note_behaviors_updated_at
BEFORE UPDATE ON public.note_behaviors
FOR EACH ROW
EXECUTE FUNCTION update_note_behaviors_updated_at();

-- Table comment
COMMENT ON TABLE public.note_behaviors IS 'MODE Framework: Tracks note lifecycle, engagement, and AI nudge interactions';

-- ============================================
-- 3. Create nudges table
-- ============================================

CREATE TABLE IF NOT EXISTS public.nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Nudge identity
  skill_id TEXT NOT NULL,
  agent_id TEXT NOT NULL CHECK (agent_id IN ('manager', 'muse', 'librarian', 'biographer')),

  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',

  -- Context
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,

  -- Delivery
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  delivery_channel TEXT NOT NULL DEFAULT 'toast' CHECK (delivery_channel IN ('toast', 'sheet', 'notification', 'inline')),

  -- Timing
  show_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  shown_at TIMESTAMPTZ,
  interacted_at TIMESTAMPTZ,

  -- Outcome
  outcome TEXT CHECK (outcome IS NULL OR outcome IN ('accepted', 'dismissed', 'snoozed', 'ignored', 'expired')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nudges_user_id ON public.nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_nudges_note_id ON public.nudges(note_id);
CREATE INDEX IF NOT EXISTS idx_nudges_agent_id ON public.nudges(agent_id);
CREATE INDEX IF NOT EXISTS idx_nudges_show_at ON public.nudges(show_at);
CREATE INDEX IF NOT EXISTS idx_nudges_outcome ON public.nudges(outcome);

-- Enable RLS
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- RLS policies (idempotent)
DROP POLICY IF EXISTS "Users can view their own nudges" ON public.nudges;
CREATE POLICY "Users can view their own nudges"
ON public.nudges FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own nudges" ON public.nudges;
CREATE POLICY "Users can insert their own nudges"
ON public.nudges FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own nudges" ON public.nudges;
CREATE POLICY "Users can update their own nudges"
ON public.nudges FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own nudges" ON public.nudges;
CREATE POLICY "Users can delete their own nudges"
ON public.nudges FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Table comment
COMMENT ON TABLE public.nudges IS 'MODE Framework: AI agent nudge delivery and outcome tracking';

-- ============================================
-- 4. Create user_patterns table
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Time patterns
  active_hours INTEGER[] DEFAULT '{}',
  journaling_time INTEGER,
  task_completion_time INTEGER,

  -- Engagement patterns
  nudge_response_rate REAL DEFAULT 0 CHECK (nudge_response_rate >= 0 AND nudge_response_rate <= 1),
  preferred_nudge_channel TEXT DEFAULT 'toast',
  dismissed_skill_ids TEXT[] DEFAULT '{}',

  -- Content patterns
  average_note_length INTEGER DEFAULT 0,
  common_tags TEXT[] DEFAULT '{}',
  mode_distribution JSONB DEFAULT '{"manage": 0, "develop": 0, "organize": 0, "experience": 0}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_patterns_user_id ON public.user_patterns(user_id);

-- Enable RLS
ALTER TABLE public.user_patterns ENABLE ROW LEVEL SECURITY;

-- RLS policies (idempotent)
DROP POLICY IF EXISTS "Users can view their own patterns" ON public.user_patterns;
CREATE POLICY "Users can view their own patterns"
ON public.user_patterns FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own patterns" ON public.user_patterns;
CREATE POLICY "Users can insert their own patterns"
ON public.user_patterns FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own patterns" ON public.user_patterns;
CREATE POLICY "Users can update their own patterns"
ON public.user_patterns FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_user_patterns_updated_at ON public.user_patterns;
CREATE TRIGGER trigger_user_patterns_updated_at
BEFORE UPDATE ON public.user_patterns
FOR EACH ROW
EXECUTE FUNCTION update_note_behaviors_updated_at();

-- Table comment
COMMENT ON TABLE public.user_patterns IS 'MODE Framework: Learned user behavior patterns for AI personalization';
