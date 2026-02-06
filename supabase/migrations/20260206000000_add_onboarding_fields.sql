-- Add onboarding wizard fields to app_projects
-- These fields capture the full wizard data that was previously lost

ALTER TABLE public.app_projects
  ADD COLUMN IF NOT EXISTS tech_stack text,
  ADD COLUMN IF NOT EXISTS development_status text,
  ADD COLUMN IF NOT EXISTS has_published_before boolean,
  ADD COLUMN IF NOT EXISTS has_play_console boolean,
  ADD COLUMN IF NOT EXISTS has_apple_dev boolean,
  ADD COLUMN IF NOT EXISTS experience_level text;
