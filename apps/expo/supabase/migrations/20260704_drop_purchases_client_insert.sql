-- Migration: Drop client INSERT policy on purchases
-- ============================================
-- No application code inserts into purchases from the client, and client
-- self-attested purchase rows (arbitrary coins_granted, no receipt
-- validation) are a latent exploit if balances are ever derived from this
-- table. Purchase records should only be written by a trusted server-side
-- path (e.g. a future RevenueCat webhook) using the service role, which
-- bypasses RLS.

DROP POLICY IF EXISTS "Users can insert own purchases" ON public.purchases;
