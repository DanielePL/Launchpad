-- Migration: Add RLS policies for Lab/Admin read access to VBT tables
-- This allows the admin panel (using anon key) to read all VBT data for research
-- Note: Skips tables that don't exist

DO $$
BEGIN
  -- velocity_history: Allow public read for admin/research purposes
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'velocity_history') THEN
    DROP POLICY IF EXISTS "Allow public read for velocity_history" ON velocity_history;
    CREATE POLICY "Allow public read for velocity_history"
    ON velocity_history
    FOR SELECT
    TO anon, authenticated
    USING (true);
    RAISE NOTICE 'Created RLS policy for velocity_history';
  END IF;

  -- athlete_lvp_profiles: Allow public read for admin/research purposes
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'athlete_lvp_profiles') THEN
    DROP POLICY IF EXISTS "Allow public read for athlete_lvp_profiles" ON athlete_lvp_profiles;
    CREATE POLICY "Allow public read for athlete_lvp_profiles"
    ON athlete_lvp_profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);
    RAISE NOTICE 'Created RLS policy for athlete_lvp_profiles';
  END IF;

  -- workout_sessions: Ensure public can read (might already exist)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workout_sessions') THEN
    DROP POLICY IF EXISTS "Allow public read for workout_sessions" ON workout_sessions;
    CREATE POLICY "Allow public read for workout_sessions"
    ON workout_sessions
    FOR SELECT
    TO anon, authenticated
    USING (true);
    RAISE NOTICE 'Created RLS policy for workout_sessions';
  END IF;

  -- user_profiles: Ensure public can read basic info
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    DROP POLICY IF EXISTS "Allow public read for user_profiles" ON user_profiles;
    CREATE POLICY "Allow public read for user_profiles"
    ON user_profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);
    RAISE NOTICE 'Created RLS policy for user_profiles';
  END IF;
END $$;
