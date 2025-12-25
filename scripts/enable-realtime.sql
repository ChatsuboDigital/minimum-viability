-- Enable Realtime for instant updates
-- This allows the app to receive live updates when data changes

-- Enable realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime on workouts table
ALTER PUBLICATION supabase_realtime ADD TABLE workouts;

-- Enable realtime on goals table
ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- Verify realtime is enabled
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
