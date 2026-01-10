-- Migration: Create admin_users table for marketing dashboard access
-- ============================================

-- ============================================
-- ADMIN_USERS TABLE
-- ============================================
-- Manually populated table for admin access. No signup flow.
-- Admins are added via SQL Editor after they sign in once with magic link.

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Policy: Only authenticated admins can view the admin_users table
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- No INSERT/UPDATE/DELETE policies - admins are managed via SQL Editor only

-- ============================================
-- HELPER FUNCTION
-- ============================================

-- Function to check if a user is an admin (for use in middleware/API)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = check_user_id
  );
$$;

-- ============================================
-- TRIGGER
-- ============================================

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- MANUAL ADMIN SETUP (Run after user signs in)
-- ============================================
--
-- After a user signs in via magic link for the first time,
-- add them to admin_users with this SQL:
--
-- INSERT INTO public.admin_users (user_id, email, role)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'your-admin@email.com'),
--   'your-admin@email.com',
--   'super_admin'
-- );
