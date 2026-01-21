-- Migration: Add batch share status lookup function
-- ============================================
-- This function allows efficient lookup of share status for multiple notes
-- Used by the mobile app to show "Public" badges on shared notes

CREATE OR REPLACE FUNCTION public.get_share_status_batch(p_note_ids UUID[])
RETURNS TABLE (
  note_id UUID,
  share_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT sn.note_id, sn.share_token
  FROM shared_notes sn
  WHERE sn.note_id = ANY(p_note_ids)
    AND sn.is_active = TRUE
    AND (sn.expires_at IS NULL OR sn.expires_at > NOW())
    AND sn.created_by = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_share_status_batch(UUID[]) TO authenticated;
