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
