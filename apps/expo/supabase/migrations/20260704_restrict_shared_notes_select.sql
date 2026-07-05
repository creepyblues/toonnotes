-- Migration: Restrict shared_notes SELECT to owners only
-- ============================================
-- The previous policy ("Anyone can view active shared notes") had no
-- per-token predicate, so any anon client could `SELECT * FROM shared_notes`
-- and enumerate every active share_token / note_id, then read every shared
-- note through get_shared_note(). Public access must go exclusively through
-- the token-scoped RPCs:
--   - get_shared_note(p_share_token)        SECURITY DEFINER, token lookup
--   - get_share_status_batch(p_note_ids)    SECURITY DEFINER, owner-scoped
-- Owners keep full access via the existing
-- "Users can manage own shared notes" (FOR ALL, created_by = auth.uid()).

DROP POLICY IF EXISTS "Anyone can view active shared notes" ON public.shared_notes;
