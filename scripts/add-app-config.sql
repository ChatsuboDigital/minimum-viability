-- Create app_config table for shared settings
CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read config
CREATE POLICY "Anyone can read app config"
ON app_config FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to update config (both partners can edit)
CREATE POLICY "Anyone can update app config"
ON app_config FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Allow insert for initial setup
CREATE POLICY "Anyone can insert app config"
ON app_config FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default focus
INSERT INTO app_config (key, value)
VALUES ('current_focus', '4 workouts per week')
ON CONFLICT (key) DO NOTHING;
