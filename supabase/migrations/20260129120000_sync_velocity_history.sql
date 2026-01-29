-- Migration: Sync existing workout_sets velocity_metrics to velocity_history
-- Safe: Uses ON CONFLICT DO NOTHING to prevent duplicates
-- Idempotent: Can be run multiple times without side effects
-- Note: Skips records where user no longer exists in auth.users

-- Insert velocity data from workout_sets that have velocity_metrics
-- but are not yet in velocity_history
INSERT INTO velocity_history (
  user_id,
  exercise_id,
  load_kg,
  peak_velocity,
  mean_velocity,
  mpv,
  set_type,
  set_number,
  reps,
  rpe,
  velocity_drop,
  technique_score,
  session_id,
  workout_set_id,
  recorded_at,
  created_at
)
SELECT
  ws_session.user_id,
  ws.exercise_id,
  COALESCE(ws.actual_weight_kg, ws.weight_kg, 0) as load_kg,
  (ws.velocity_metrics->>'peak_velocity')::numeric(5,4) as peak_velocity,
  (ws.velocity_metrics->>'avg_velocity')::numeric(5,4) as mean_velocity,
  -- MPV: use avg_velocity as approximation if no specific mpv field
  COALESCE(
    (ws.velocity_metrics->>'mpv')::numeric(5,4),
    (ws.velocity_metrics->>'avg_velocity')::numeric(5,4)
  ) as mpv,
  COALESCE(ws.set_type, 'working') as set_type,
  ws.set_number,
  COALESCE(
    (ws.velocity_metrics->>'reps_detected')::integer,
    (ws.velocity_metrics->>'total_reps')::integer,
    ws.reps
  ) as reps,
  ws.rpe,
  (ws.velocity_metrics->>'velocity_drop')::numeric(5,2) as velocity_drop,
  (ws.velocity_metrics->>'technique_score')::numeric(5,2) as technique_score,
  ws.session_id,
  ws.id as workout_set_id,
  COALESCE(ws.completed_at, ws.created_at, now()) as recorded_at,
  now() as created_at
FROM workout_sets ws
JOIN workout_sessions ws_session ON ws_session.id = ws.session_id
-- Only include users that still exist in auth.users
JOIN auth.users au ON au.id = ws_session.user_id
WHERE
  ws.velocity_metrics IS NOT NULL
  AND ws_session.user_id IS NOT NULL
ON CONFLICT (workout_set_id) DO NOTHING;

-- Log how many records were synced
DO $$
DECLARE
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO synced_count FROM velocity_history;
  RAISE NOTICE 'Velocity history now contains % records', synced_count;
END $$;
