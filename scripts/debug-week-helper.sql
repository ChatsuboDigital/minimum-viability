-- Debug helper to see what SQL calculates for week start
CREATE OR REPLACE FUNCTION debug_week_calculation()
RETURNS JSON AS $$
DECLARE
  current_week_start DATE;
  now_utc TIMESTAMPTZ;
BEGIN
  now_utc := NOW() AT TIME ZONE 'UTC';
  current_week_start := DATE_TRUNC('week', now_utc)::date;

  RETURN json_build_object(
    'now_utc', now_utc,
    'week_start', current_week_start,
    'calculation', 'DATE_TRUNC(''week'', NOW() AT TIME ZONE ''UTC'')::date'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION debug_week_calculation() TO authenticated;
