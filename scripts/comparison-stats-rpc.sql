-- Comparison Stats RPC Function
-- Optimizes the N+1 query problem by doing server-side joins
-- Previously: 8 queries (4 per user for 2 users)
-- Now: 1 query with joins

CREATE OR REPLACE FUNCTION get_comparison_stats()
RETURNS JSON AS $$
DECLARE
  current_week_start DATE;
BEGIN
  -- Calculate current week start (Monday)
  current_week_start := DATE_TRUNC('week', (NOW() AT TIME ZONE 'UTC')::date + INTERVAL '1 day') - INTERVAL '1 day';

  RETURN (
    SELECT json_agg(
      json_build_object(
        'userId', u.id,
        'username', COALESCE(u.display_name, u.username),
        'avatarColor', u.avatar_color,
        'totalWorkouts', COALESCE(workout_counts.total, 0),
        'totalPoints', COALESCE(workout_counts.points, 0),
        'currentStreak', COALESCE(s.current_streak, 0),
        'weekCompleted', COALESCE(g.completed_workouts, 0),
        'weeklyStreak', COALESCE(weekly_streak.consecutive, 0)
      )
    )
    FROM users u
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) as total,
        SUM(points_earned) as points
      FROM workouts w
      WHERE w.user_id = u.id
    ) workout_counts ON true
    LEFT JOIN streaks s ON s.user_id = u.id
    LEFT JOIN goals g ON g.user_id = u.id AND g.week_start_date = current_week_start
    LEFT JOIN LATERAL (
      -- Calculate consecutive weeks achieved
      WITH achieved_weeks AS (
        SELECT week_start_date
        FROM goals
        WHERE user_id = u.id AND achieved = true
        ORDER BY week_start_date DESC
      ),
      numbered_weeks AS (
        SELECT
          week_start_date,
          week_start_date - (ROW_NUMBER() OVER (ORDER BY week_start_date DESC) * INTERVAL '7 days') as group_date
        FROM achieved_weeks
      )
      SELECT COUNT(*) as consecutive
      FROM numbered_weeks
      WHERE group_date = (SELECT group_date FROM numbered_weeks LIMIT 1)
    ) weekly_streak ON true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_comparison_stats() TO authenticated;
