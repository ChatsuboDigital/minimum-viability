-- Deploy Retroactive Workout Feature
-- Run this script in Supabase SQL Editor to deploy all retroactive workout functions
-- Order: recalculate-streak.sql -> retroactive-workout-transaction.sql -> user-stats-rpc.sql (update)

-- ============================================================================
-- STEP 1: Create Streak Recalculation Function
-- ============================================================================

-- Recalculate user's streak from all historical workout records
-- This function provides the source of truth for streak calculation
-- by analyzing all workout dates in chronological order

CREATE OR REPLACE FUNCTION recalculate_user_streak(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_workout_dates DATE[];
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
  v_temp_streak INT := 0;
  v_last_workout_date DATE;
  v_today_date DATE;
  v_prev_date DATE;
  v_current_date DATE;
  v_days_diff INT;
  i INT;
BEGIN
  -- Get today's date in Sydney timezone
  v_today_date := DATE(NOW() AT TIME ZONE 'Australia/Sydney');

  -- Get all workout dates for user, sorted chronologically
  -- Use DISTINCT to ensure one workout per day
  SELECT ARRAY_AGG(workout_date ORDER BY workout_date)
  INTO v_workout_dates
  FROM (
    SELECT DISTINCT DATE(completed_at AT TIME ZONE 'Australia/Sydney') as workout_date
    FROM workouts
    WHERE user_id = p_user_id
    ORDER BY workout_date
  ) dates;

  -- If no workouts, return zeros
  IF v_workout_dates IS NULL OR array_length(v_workout_dates, 1) = 0 THEN
    RETURN json_build_object(
      'current_streak', 0,
      'longest_streak', 0,
      'last_workout_date', NULL
    );
  END IF;

  -- Get last workout date
  v_last_workout_date := v_workout_dates[array_length(v_workout_dates, 1)];

  -- Calculate longest streak by iterating through all dates
  v_temp_streak := 1;  -- First workout starts a streak of 1
  v_longest_streak := 1;

  -- Only iterate if there's more than one workout
  IF array_length(v_workout_dates, 1) > 1 THEN
    FOR i IN 2..array_length(v_workout_dates, 1) LOOP
      v_prev_date := v_workout_dates[i-1];
      v_current_date := v_workout_dates[i];
      v_days_diff := v_current_date - v_prev_date;

      -- Continue streak if:
      -- - 1 day apart (consecutive)
      -- - 2 days apart (grace period - 1 rest day allowed)
      IF v_days_diff <= 2 THEN
        v_temp_streak := v_temp_streak + 1;
        v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
      ELSE
        -- Streak broken (3+ days apart)
        v_temp_streak := 1;
      END IF;
    END LOOP;
  END IF;

  -- Calculate CURRENT streak by checking if it's still active
  -- Streak is active if last workout was within grace period (2 days)
  v_days_diff := v_today_date - v_last_workout_date;

  -- Streak is broken if 3+ days since last workout
  IF v_days_diff >= 3 THEN
    v_current_streak := 0;
  ELSE
    -- Streak is active - work backwards to find current streak length
    v_current_streak := 1;

    -- Only iterate backwards if there's more than one workout
    IF array_length(v_workout_dates, 1) > 1 THEN
      FOR i IN REVERSE array_length(v_workout_dates, 1)-1..1 LOOP
        v_prev_date := v_workout_dates[i];
        v_current_date := v_workout_dates[i+1];
        v_days_diff := v_current_date - v_prev_date;

        -- Continue counting if within grace period
        IF v_days_diff <= 2 THEN
          v_current_streak := v_current_streak + 1;
        ELSE
          EXIT;  -- Stop counting when we hit a gap
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN json_build_object(
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'last_workout_date', v_last_workout_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Create Retroactive Workout Transaction Function
-- ============================================================================

-- Log a retroactive workout transaction
-- This allows users to log yesterday's workout if they forgot to mark it
-- Includes validations, streak recalculation, and weekly cap enforcement

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

  -- 1. Validate date is yesterday only
  IF p_workout_date != (v_today_date - INTERVAL '1 day')::date THEN
    RAISE EXCEPTION 'Can only log yesterday''s workout';
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
  INSERT INTO workouts (user_id, points_earned, completed_at)
  VALUES (
    p_user_id,
    p_points_earned,
    (p_workout_date || ' 23:59:00')::timestamp AT TIME ZONE 'Australia/Sydney'
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
    VALUES (v_partner_id, 'partner_completed', 'Your partner logged yesterday''s workout! 🔥');
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

-- ============================================================================
-- STEP 3: Update User Stats RPC to Include workedOutYesterday
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  current_week_start DATE;
  today_date DATE;
  result JSON;
BEGIN
  -- Calculate current week start (Monday) using Sydney time
  -- DATE_TRUNC('week') returns Monday by default (ISO 8601)
  current_week_start := DATE_TRUNC('week', NOW() AT TIME ZONE 'Australia/Sydney')::date;

  -- Get today's date in Sydney time
  today_date := DATE(NOW() AT TIME ZONE 'Australia/Sydney');

  SELECT json_build_object(
    'totalWorkouts', COALESCE(workout_stats.total, 0),
    'totalPoints', COALESCE(workout_stats.points, 0),
    'currentStreak', COALESCE(s.current_streak, 0),
    'longestStreak', COALESCE(s.longest_streak, 0),
    'weeklyGoal', json_build_object(
      'target', COALESCE(
        (SELECT weekly_target FROM user_preferences WHERE user_id = p_user_id),
        COALESCE(g.target_workouts, 4)
      ),
      'completed', COALESCE(g.completed_workouts, 0),
      'achieved', COALESCE(g.achieved, false)
    ),
    'workedOutToday', COALESCE(today_workout.exists, false),
    'workedOutYesterday', COALESCE(yesterday_workout.exists, false)
  )
  INTO result
  FROM (SELECT 1) dummy -- Dummy table to ensure we always get a row
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) as total,
      SUM(points_earned) as points
    FROM workouts w
    WHERE w.user_id = p_user_id
  ) workout_stats ON true
  LEFT JOIN streaks s ON s.user_id = p_user_id
  LEFT JOIN goals g ON g.user_id = p_user_id AND g.week_start_date = current_week_start
  LEFT JOIN LATERAL (
    SELECT EXISTS(
      SELECT 1
      FROM workouts w
      WHERE w.user_id = p_user_id
        AND DATE(w.completed_at AT TIME ZONE 'Australia/Sydney') = today_date
      LIMIT 1
    ) as exists
  ) today_workout ON true
  LEFT JOIN LATERAL (
    SELECT EXISTS(
      SELECT 1
      FROM workouts w
      WHERE w.user_id = p_user_id
        AND DATE(w.completed_at AT TIME ZONE 'Australia/Sydney') = today_date - INTERVAL '1 day'
      LIMIT 1
    ) as exists
  ) yesterday_workout ON true;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_retroactive_workout_transaction(UUID, DATE, DATE, INT, INT) TO authenticated;

-- Deployment complete!
-- The retroactive workout feature is now ready to use.
