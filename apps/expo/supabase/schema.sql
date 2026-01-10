-- ToonNotes Supabase Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,

  -- Economy (from local User type)
  free_design_used BOOLEAN DEFAULT FALSE,
  coin_balance INTEGER DEFAULT 0,

  -- Onboarding state
  has_completed_welcome BOOLEAN DEFAULT FALSE,
  seen_coach_marks TEXT[] DEFAULT '{}',
  onboarding_version INTEGER DEFAULT 0,
  notes_created_count INTEGER DEFAULT 0,

  -- Settings (from local AppSettings type)
  dark_mode BOOLEAN DEFAULT FALSE,
  default_note_color TEXT DEFAULT '#FFFFFF',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  labels TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#FFFFFF',
  design_id TEXT,
  active_design_label_id TEXT,
  background_override JSONB,
  typography_poster_uri TEXT,
  character_mascot_uri TEXT,
  images TEXT[] DEFAULT '{}',

  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LABELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  preset_id TEXT,
  custom_design_id TEXT,
  is_system_label BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- ============================================
-- DESIGNS TABLE (user-created designs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  source_image_uri TEXT,

  background JSONB NOT NULL,
  colors JSONB NOT NULL,
  typography JSONB NOT NULL,
  sticker JSONB,

  design_summary TEXT,
  vibe TEXT,
  is_lucky BOOLEAN DEFAULT FALSE,
  label_preset_id TEXT,
  is_label_preset BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  hashtag TEXT NOT NULL,
  custom_style JSONB,
  board_design_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, hashtag)
);

-- ============================================
-- PURCHASES TABLE (for audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  product_id TEXT NOT NULL,
  coins_granted INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  transaction_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  price_string TEXT,
  currency_code TEXT
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_not_deleted ON public.notes(user_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON public.labels(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON public.boards(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- NOTES: Users can only CRUD their own notes
CREATE POLICY "Users can CRUD own notes"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id);

-- LABELS: Users can only CRUD their own labels
CREATE POLICY "Users can CRUD own labels"
  ON public.labels FOR ALL
  USING (auth.uid() = user_id);

-- DESIGNS: Users can only CRUD their own designs
CREATE POLICY "Users can CRUD own designs"
  ON public.designs FOR ALL
  USING (auth.uid() = user_id);

-- BOARDS: Users can only CRUD their own boards
CREATE POLICY "Users can CRUD own boards"
  ON public.boards FOR ALL
  USING (auth.uid() = user_id);

-- PURCHASES: Users can only view/insert their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_boards_updated_at ON public.boards;
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ENABLE REALTIME
-- ============================================
-- Note: Run these separately if needed
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.labels;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.designs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
