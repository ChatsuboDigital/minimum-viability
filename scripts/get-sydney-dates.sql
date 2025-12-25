-- Helper function to get current dates in Sydney timezone
-- Returns today's date and week start date for Sydney time
CREATE OR REPLACE FUNCTION get_sydney_dates()
RETURNS JSON AS $$
DECLARE
  sydney_now TIMESTAMPTZ;
  today_date DATE;
  week_start DATE;
BEGIN
  -- Get current time in Sydney
  sydney_now := NOW() AT TIME ZONE 'Australia/Sydney';

  -- Get today's date in Sydney
  today_date := sydney_now::date;

  -- Get week start (Monday) in Sydney
  week_start := DATE_TRUNC('week', sydney_now)::date;

  RETURN json_build_object(
    'today', today_date,
    'weekStart', week_start,
    'sydneyNow', sydney_now
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_sydney_dates() TO authenticated;
