-- Add workout deletion functionality with accountability safeguards
-- Allows deleting workouts from last 7 days only
-- Recalculates streaks and updates weekly goals after deletion

-- Add RLS policy for deleting own workouts
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Create delete workout transaction function
CREATE OR REPLACE FUNCTION delete_workout_transaction(
  p_user_id UUID,
  p_workout_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_workout_date DATE;
  v_workout_week_start DATE;
  v_today_date DATE;
  v_streak_result JSON;
  v_current_streak INT;
  v_longest_streak INT;
  v_last_workout_date DATE;
  v_goal_id UUID;
  v_result JSON;
BEGIN
  -- Get today's date in Sydney timezone
  v_today_date := DATE(NOW() AT TIME ZONE 'Australia/Sydney');

  -- Get workout details and verify ownership
  SELECT
    DATE(completed_at AT TIME ZONE 'Australia/Sydney')
  INTO v_workout_date
  FROM workouts
  WHERE id = p_workout_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF v_workout_date IS NULL THEN
    RAISE EXCEPTION 'Workout not found or you do not have permission to delete it';
  END IF;

  -- Validate workout is within last 7 days (accountability window)
  IF v_workout_date < (v_today_date - INTERVAL '7 days')::date THEN
    RAISE EXCEPTION 'Can only delete workouts from the last 7 days';
  END IF;

  -- Calculate week start for the workout's week (Monday)
  -- DATE_TRUNC('week') already returns Monday, don't add 1!
  v_workout_week_start := DATE_TRUNC('week', v_workout_date::timestamp)::date;

  -- Delete the workout
  DELETE FROM workouts
  WHERE id = p_workout_id
    AND user_id = p_user_id;

  -- Recalculate streak from scratch
  SELECT recalculate_user_streak(p_user_id) INTO v_streak_result;
  v_current_streak := COALESCE((v_streak_result->>'current_streak')::int, 0);
  v_longest_streak := COALESCE((v_streak_result->>'longest_streak')::int, 0);
  v_last_workout_date := (v_streak_result->>'last_workout_date')::date;

  -- Update streak table
  INSERT INTO streaks (user_id, current_streak, longest_streak, last_workout_date, updated_at)
  VALUES (p_user_id, v_current_streak, v_longest_streak, v_last_workout_date, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_workout_date = EXCLUDED.last_workout_date,
    updated_at = EXCLUDED.updated_at;

  -- Recalculate weekly goal for that week
  -- Count actual workouts for that week
  WITH week_workout_count AS (
    SELECT COUNT(*) as total
    FROM workouts
    WHERE user_id = p_user_id
      AND DATE(completed_at AT TIME ZONE 'Australia/Sydney') >= v_workout_week_start
      AND DATE(completed_at AT TIME ZONE 'Australia/Sydney') < v_workout_week_start + INTERVAL '7 days'
  )
  UPDATE goals
  SET
    completed_workouts = (SELECT total FROM week_workout_count),
    achieved = CASE
      WHEN (SELECT total FROM week_workout_count) >= target_workouts THEN true
      ELSE false
    END
  WHERE user_id = p_user_id
    AND week_start_date = v_workout_week_start
  RETURNING id INTO v_goal_id;

  -- Build result
  SELECT json_build_object(
    'success', true,
    'currentStreak', v_current_streak,
    'longestStreak', v_longest_streak,
    'message', 'Workout deleted and stats recalculated'
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
