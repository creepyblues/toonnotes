-- Migration: Create shared_notes table for public note sharing
-- ============================================

-- ============================================
-- SHARED_NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  share_token TEXT UNIQUE NOT NULL,

  -- Sharing settings
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,  -- NULL = never expires

  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_notes_token ON public.shared_notes(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_notes_note_id ON public.shared_notes(note_id);
CREATE INDEX IF NOT EXISTS idx_shared_notes_created_by ON public.shared_notes(created_by);

-- Enable RLS
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Policy 1: Anyone (including anonymous) can SELECT shared notes by token
CREATE POLICY "Anyone can view active shared notes"
  ON public.shared_notes FOR SELECT
  TO anon, authenticated
  USING (
    is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Policy 2: Authenticated users can manage their own shared notes
CREATE POLICY "Users can manage own shared notes"
  ON public.shared_notes FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate unique share tokens (URL-safe base64, 12 chars)
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate 12-character URL-safe token
    token := encode(gen_random_bytes(9), 'base64');
    token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');

    -- Check uniqueness
    SELECT COUNT(*) INTO exists_count FROM shared_notes WHERE share_token = token;
    EXIT WHEN exists_count = 0;
  END LOOP;

  RETURN token;
END;
$$;

-- Function to get a shared note with its design (for anonymous access)
CREATE OR REPLACE FUNCTION public.get_shared_note(p_share_token TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  labels TEXT[],
  color TEXT,
  design_id TEXT,
  background_override JSONB,
  typography_poster_uri TEXT,
  character_mascot_uri TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- Design fields (joined)
  design_name TEXT,
  design_background JSONB,
  design_colors JSONB,
  design_typography JSONB,
  design_sticker JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment view count
  UPDATE shared_notes
  SET view_count = view_count + 1,
      last_viewed_at = NOW(),
      updated_at = NOW()
  WHERE share_token = p_share_token
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());

  -- Return note with design
  RETURN QUERY
  SELECT
    n.id,
    n.title,
    n.content,
    n.labels,
    n.color,
    n.design_id,
    n.background_override,
    n.typography_poster_uri,
    n.character_mascot_uri,
    n.images,
    n.created_at,
    n.updated_at,
    d.name as design_name,
    d.background as design_background,
    d.colors as design_colors,
    d.typography as design_typography,
    d.sticker as design_sticker
  FROM shared_notes sn
  JOIN notes n ON n.id = sn.note_id
  LEFT JOIN designs d ON d.id::text = n.design_id
  WHERE sn.share_token = p_share_token
    AND sn.is_active = TRUE
    AND (sn.expires_at IS NULL OR sn.expires_at > NOW())
    AND n.is_deleted = FALSE;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_shared_notes_updated_at ON public.shared_notes;
CREATE TRIGGER update_shared_notes_updated_at
  BEFORE UPDATE ON public.shared_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
