-- =============================================================================
-- Asset Studio - Storage & Database Extensions
-- Enables managing app store assets (screenshots, icons, feature graphics)
-- =============================================================================

-- =============================================================================
-- 1. STORAGE BUCKET FOR APP ASSETS
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-assets',
  'app-assets',
  true,
  52428800,  -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']::text[]
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. STORAGE RLS POLICIES
-- =============================================================================

-- Allow authenticated users to manage their organization's assets
CREATE POLICY "app_assets_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'app-assets');

CREATE POLICY "app_assets_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-assets');

CREATE POLICY "app_assets_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-assets');

CREATE POLICY "app_assets_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-assets');

-- =============================================================================
-- 3. EXTEND PROJECT_ASSETS TABLE
-- =============================================================================

-- Add sort_order for ordering assets within a category
ALTER TABLE public.project_assets
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Add locale for localized screenshots
ALTER TABLE public.project_assets
  ADD COLUMN IF NOT EXISTS locale text DEFAULT 'en';

-- Add source_asset_id for tracking derived assets (e.g., resized versions)
ALTER TABLE public.project_assets
  ADD COLUMN IF NOT EXISTS source_asset_id uuid REFERENCES public.project_assets(id) ON DELETE SET NULL;

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_assets_sort_order ON public.project_assets(project_id, asset_type, sort_order);

-- Index for locale queries
CREATE INDEX IF NOT EXISTS idx_assets_locale ON public.project_assets(project_id, locale);
