ALTER TABLE public.app_projects
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS keywords text;
