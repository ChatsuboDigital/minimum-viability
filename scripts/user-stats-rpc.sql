-- User Stats RPC Function
-- Optimizes stats fetching by doing all queries in one database call
-- Previously: 6+ sequential queries
-- Now: 1 query with joins and aggregations

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
    'workedOutToday', COALESCE(today_workout.exists, false)
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
  ) today_workout ON true;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
