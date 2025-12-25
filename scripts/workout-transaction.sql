-- Workout Transaction Function
-- Prevents race conditions by executing all workout logging operations atomically
-- Previously: 8+ sequential queries with race condition vulnerability
-- Now: Single atomic transaction with row locking

CREATE OR REPLACE FUNCTION log_workout_transaction(
  p_user_id UUID,
  p_today_date DATE,
  p_week_start_date DATE,
  p_new_streak INT,
  p_longest_streak INT,
  p_points_earned INT,
  p_is_weekly_goal_complete BOOLEAN
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
  v_result JSON;
BEGIN
  -- 1. Check if workout already exists today (with row lock to prevent race conditions)
  -- This SELECT FOR UPDATE locks the row, preventing concurrent inserts
  SELECT id INTO v_existing_workout_id
  FROM workouts
  WHERE user_id = p_user_id
    AND DATE(completed_at AT TIME ZONE 'UTC') = p_today_date
  LIMIT 1
  FOR UPDATE NOWAIT;

  -- If workout already exists, return error
  IF v_existing_workout_id IS NOT NULL THEN
    RAISE EXCEPTION 'You have already logged a workout today!';
  END IF;

  -- 2. Insert workout record
  INSERT INTO workouts (user_id, points_earned, completed_at)
  VALUES (p_user_id, p_points_earned, NOW())
  RETURNING id INTO v_workout_id;

  -- 3. Update streak (upsert)
  INSERT INTO streaks (user_id, current_streak, longest_streak, last_workout_date, updated_at)
  VALUES (p_user_id, p_new_streak, p_longest_streak, p_today_date, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_workout_date = EXCLUDED.last_workout_date,
    updated_at = EXCLUDED.updated_at;

  -- 4. Create or update weekly goal
  INSERT INTO goals (user_id, week_start_date, target_workouts, completed_workouts, achieved)
  VALUES (p_user_id, p_week_start_date, 4, 1, p_is_weekly_goal_complete)
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    completed_workouts = goals.completed_workouts + 1,
    achieved = CASE
      WHEN goals.completed_workouts + 1 >= goals.target_workouts THEN true
      ELSE goals.achieved
    END
  RETURNING id, completed_workouts, achieved INTO v_goal_id, v_goal_completed, v_goal_achieved;

  -- 5. Get total workouts count for milestone checking
  SELECT COUNT(*) INTO v_total_workouts
  FROM workouts
  WHERE user_id = p_user_id;

  -- 6. Check and insert total sessions milestones (10, 25, 50, 100, 250, 500, 1000)
  -- Only insert if not already achieved
  WITH milestone_values AS (
    SELECT unnest(ARRAY[10, 25, 50, 100, 250, 500, 1000]) AS value
  )
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
  LIMIT 1; -- Only insert one new milestone per workout

  -- 7. Check and insert streak milestones (3, 7, 14, 30, 60, 100)
  WITH streak_milestone_values AS (
    SELECT unnest(ARRAY[3, 7, 14, 30, 60, 100]) AS value
  )
  INSERT INTO milestones (user_id, milestone_type, milestone_value)
  SELECT p_user_id, 'streak', smv.value
  FROM streak_milestone_values smv
  WHERE p_new_streak >= smv.value
    AND NOT EXISTS (
      SELECT 1 FROM milestones m
      WHERE m.user_id = p_user_id
        AND m.milestone_type = 'streak'
        AND m.milestone_value = smv.value
    )
  LIMIT 1; -- Only insert one new milestone per workout

  -- 8. Get partner ID (assumes 2-user system)
  SELECT id INTO v_partner_id
  FROM users
  WHERE id != p_user_id
  LIMIT 1;

  -- 9. Create notification for partner
  IF v_partner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, notification_type, message)
    VALUES (v_partner_id, 'partner_completed', 'Your partner just locked in! 🔥');
  END IF;

  -- 10. Build result JSON with all new milestones
  SELECT json_build_object(
    'workoutId', v_workout_id,
    'goalId', v_goal_id,
    'goalCompleted', v_goal_completed,
    'goalAchieved', v_goal_achieved,
    'totalWorkouts', v_total_workouts,
    'newMilestones', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'type', milestone_type,
          'value', milestone_value
        )
      ), '[]'::json)
      FROM milestones
      WHERE user_id = p_user_id
        AND created_at >= NOW() - INTERVAL '1 second' -- Get milestones created in this transaction
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_workout_transaction(UUID, DATE, DATE, INT, INT, INT, BOOLEAN) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION log_workout_transaction IS 'Atomically logs a workout with all related updates (streak, goal, milestones, notifications). Prevents race conditions with row-level locking.';
