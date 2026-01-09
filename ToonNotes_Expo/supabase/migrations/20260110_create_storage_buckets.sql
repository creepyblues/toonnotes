-- Create storage buckets for cross-platform image sync
-- Images are stored with user_id as the root folder for RLS

-- Create bucket for note images (attachments, AI-generated posters, mascots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-images',
  'note-images',
  false,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for design assets (stickers, source images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'design-assets',
  'design-assets',
  false,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can manage their own note images
-- Files are stored as: {user_id}/{note_id}/{filename}
CREATE POLICY "Users can upload own note images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'note-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own note images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'note-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own note images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'note-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own note images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'note-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can manage their own design assets
-- Files are stored as: {user_id}/stickers/{filename} or {user_id}/sources/{filename}
CREATE POLICY "Users can upload own design assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'design-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own design assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'design-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own design assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'design-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own design assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'design-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
