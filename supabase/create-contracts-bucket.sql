-- ============================================
-- Create Contracts Storage Bucket
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create the contracts bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  true,  -- Public bucket for easy access
  10485760,  -- 10MB max file size
  ARRAY['application/pdf']::text[]  -- Only PDFs allowed
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- 2. Create RLS policies for the bucket

-- Allow authenticated users to upload contracts
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

-- Allow anyone to read contracts (public bucket)
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'contracts');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'contracts');

-- Allow authenticated users to delete contracts
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'contracts');

-- ============================================
-- Verify bucket was created
-- ============================================
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'contracts';
