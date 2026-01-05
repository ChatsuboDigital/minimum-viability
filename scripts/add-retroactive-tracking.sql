-- Add retroactive tracking for accountability
-- This migration:
-- 1. Adds is_retroactive flag to workouts table
-- 2. Updates retroactive function to allow 7 days back (not just yesterday)
-- 3. Tracks retroactive workouts for transparency

-- Add is_retroactive column to workouts table
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS is_retroactive BOOLEAN DEFAULT FALSE;

-- Update the retroactive workout function to support 7-day window
CREATE OR REPLACE FUNCTION log_retroactive_workout_transaction(
  p_user_id UUID,
  p_workout_date DATE,
  p_week_start_date DATE,
  p_points_earned INT,
  p_target_workouts INT DEFAULT 4
)
RETURNS JSON AS $$
DECLARE
  v_existing_workout_id UUID;
  v_workout_id UUID;
  v_goal_id UUID;
  v_goal_completed INT;
  v_goal_achieved BOOLEAN;
  v_total_workouts INT;
  v_partner_id UUID;
  v_streak_result JSON;
  v_current_streak INT;
  v_longest_streak INT;
  v_last_workout_date DATE;
  v_today_date DATE;
  v_result JSON;
  v_new_milestones JSON;
BEGIN
  -- Get today's date in Sydney timezone
  v_today_date := DATE(NOW() AT TIME ZONE 'Australia/Sydney');

  -- 1. Validate date is within last 7 days (accountability window)
  IF p_workout_date > v_today_date THEN
    RAISE EXCEPTION 'Cannot log workouts for future dates';
  END IF;

  IF p_workout_date < (v_today_date - INTERVAL '7 days')::date THEN
    RAISE EXCEPTION 'Can only log workouts from the last 7 days';
  END IF;

  -- 2. Check if workout already exists for this date (with row lock)
  SELECT id INTO v_existing_workout_id
  FROM workouts
  WHERE user_id = p_user_id
    AND DATE(completed_at AT TIME ZONE 'Australia/Sydney') = p_workout_date
  LIMIT 1
  FOR UPDATE NOWAIT;

  IF v_existing_workout_id IS NOT NULL THEN
    RAISE EXCEPTION 'You already logged a workout for this date!';
  END IF;

  -- 3. Check weekly cap for that week
  SELECT completed_workouts INTO v_goal_completed
  FROM goals
  WHERE user_id = p_user_id
    AND week_start_date = p_week_start_date
  FOR UPDATE;

  IF v_goal_completed IS NOT NULL AND v_goal_completed >= p_target_workouts THEN
    RAISE EXCEPTION 'Weekly goal was already complete for that week!';
  END IF;

  -- 4. Insert workout with custom timestamp (retroactive)
  -- Use 23:59:00 to mark as logged at end of day
  -- Mark as retroactive for accountability tracking
  INSERT INTO workouts (user_id, points_earned, completed_at, is_retroactive)
  VALUES (
    p_user_id,
    p_points_earned,
    (p_workout_date || ' 23:59:00')::timestamp AT TIME ZONE 'Australia/Sydney',
    TRUE  -- Mark as retroactive for transparency
  )
  RETURNING id INTO v_workout_id;

  -- 5. RECALCULATE streak from scratch based on all workout history
  SELECT recalculate_user_streak(p_user_id) INTO v_streak_result;
  v_current_streak := (v_streak_result->>'current_streak')::int;
  v_longest_streak := (v_streak_result->>'longest_streak')::int;
  v_last_workout_date := (v_streak_result->>'last_workout_date')::date;

  -- 6. Update streak table with recalculated values
  -- IMPORTANT: Use v_last_workout_date from recalculation, not p_workout_date
  -- This handles the case where user logs yesterday AFTER logging today
  INSERT INTO streaks (user_id, current_streak, longest_streak, last_workout_date, updated_at)
  VALUES (p_user_id, v_current_streak, v_longest_streak, v_last_workout_date, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_workout_date = EXCLUDED.last_workout_date,
    updated_at = EXCLUDED.updated_at;

  -- 7. Update weekly goal for that specific week
  INSERT INTO goals (user_id, week_start_date, target_workouts, completed_workouts, achieved)
  VALUES (p_user_id, p_week_start_date, p_target_workouts, 1, (1 >= p_target_workouts))
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    completed_workouts = goals.completed_workouts + 1,
    achieved = CASE
      WHEN goals.completed_workouts + 1 >= goals.target_workouts THEN true
      ELSE goals.achieved
    END
  RETURNING id, completed_workouts, achieved INTO v_goal_id, v_goal_completed, v_goal_achieved;

  -- 8. Get total workouts
  SELECT COUNT(*) INTO v_total_workouts
  FROM workouts
  WHERE user_id = p_user_id;

  -- 9. Check milestones (total_sessions only - no retroactive streak milestones)
  WITH milestone_values AS (
    SELECT unnest(ARRAY[10, 25, 50, 100, 250, 500, 1000]) AS value
  ),
  inserted_milestones AS (
    INSERT INTO milestones (user_id, milestone_type, milestone_value)
    SELECT p_user_id, 'total_sessions', mv.value
    FROM milestone_values mv
    WHERE v_total_workouts >= mv.value
      AND NOT EXISTS (
        SELECT 1 FROM milestones m
        WHERE m.user_id = p_user_id
          AND m.milestone_type = 'total_sessions'
          AND m.milestone_value = mv.value
      )
    LIMIT 1
    RETURNING milestone_type, milestone_value
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'type', milestone_type,
      'value', milestone_value
    )
  ), '[]'::json)
  INTO v_new_milestones
  FROM inserted_milestones;

  -- 10. Get partner and create notification
  SELECT id INTO v_partner_id
  FROM users
  WHERE id != p_user_id
  LIMIT 1;

  IF v_partner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, notification_type, message)
    VALUES (v_partner_id, 'partner_completed', 'Your partner logged a past workout! 🔥');
  END IF;

  -- 11. Build result
  SELECT json_build_object(
    'workoutId', v_workout_id,
    'goalId', v_goal_id,
    'goalCompleted', v_goal_completed,
    'goalAchieved', v_goal_achieved,
    'totalWorkouts', v_total_workouts,
    'currentStreak', v_current_streak,
    'longestStreak', v_longest_streak,
    'newMilestones', v_new_milestones
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
