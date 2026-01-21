-- Migration: Add editor_mode column to notes table
-- This column stores the editing mode preference for each note:
-- - 'plain': Regular text mode
-- - 'checklist': Checkbox/task list mode
-- - 'bullet': Bullet list mode

ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS editor_mode TEXT DEFAULT 'plain';

-- Add check constraint for valid values (idempotent)
DO $$ BEGIN
  ALTER TABLE public.notes
  ADD CONSTRAINT notes_editor_mode_check
  CHECK (editor_mode IS NULL OR editor_mode IN ('plain', 'checklist', 'bullet'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create index for filtering by editor mode (optional, for future use)
CREATE INDEX IF NOT EXISTS idx_notes_editor_mode ON public.notes(editor_mode);

-- Add column comment for documentation
COMMENT ON COLUMN public.notes.editor_mode IS 'Editor mode: plain (text), checklist (checkbox items), or bullet (bullet list)';
