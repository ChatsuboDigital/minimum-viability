-- Drop old app_config table
DROP TABLE IF EXISTS app_config CASCADE;

-- Create habit_modules table for modular habits
CREATE TABLE IF NOT EXISTS habit_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE habit_modules ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read modules
CREATE POLICY "Anyone can read habit modules"
ON habit_modules FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to manage modules
CREATE POLICY "Anyone can insert habit modules"
ON habit_modules FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can update habit modules"
ON habit_modules FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can delete habit modules"
ON habit_modules FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Insert default starter modules
INSERT INTO habit_modules (title, description, order_index, active)
VALUES
  ('Workout', 'Complete one workout session', 0, true),
  ('Track it', 'Log your session in the app', 1, true)
ON CONFLICT DO NOTHING;
