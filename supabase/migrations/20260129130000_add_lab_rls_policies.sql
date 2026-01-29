-- Migration: Add RLS policies for Lab/Admin read access to VBT tables
-- This allows the admin panel (using anon key) to read all VBT data for research

-- velocity_history: Allow public read for admin/research purposes
DROP POLICY IF EXISTS "Allow public read for velocity_history" ON velocity_history;
CREATE POLICY "Allow public read for velocity_history"
ON velocity_history
FOR SELECT
TO anon, authenticated
USING (true);

-- athlete_lvp_profiles: Allow public read for admin/research purposes
DROP POLICY IF EXISTS "Allow public read for athlete_lvp_profiles" ON athlete_lvp_profiles;
CREATE POLICY "Allow public read for athlete_lvp_profiles"
ON athlete_lvp_profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- workout_sessions: Ensure public can read (might already exist)
DROP POLICY IF EXISTS "Allow public read for workout_sessions" ON workout_sessions;
CREATE POLICY "Allow public read for workout_sessions"
ON workout_sessions
FOR SELECT
TO anon, authenticated
USING (true);

-- user_profiles: Ensure public can read basic info
DROP POLICY IF EXISTS "Allow public read for user_profiles" ON user_profiles;
CREATE POLICY "Allow public read for user_profiles"
ON user_profiles
FOR SELECT
TO anon, authenticated
USING (true);
