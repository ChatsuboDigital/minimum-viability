-- Create shared_tracks table for Spotify track sharing feature
CREATE TABLE IF NOT EXISTS shared_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  spotify_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_shared_tracks_created_at ON shared_tracks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_tracks_user_id ON shared_tracks(user_id);

-- Enable Row Level Security
ALTER TABLE shared_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Both users can read all tracks (shared feed)
DROP POLICY IF EXISTS "Users can read all tracks" ON shared_tracks;
CREATE POLICY "Users can read all tracks" ON shared_tracks
  FOR SELECT USING (true);

-- Only users can insert their own tracks
DROP POLICY IF EXISTS "Users can insert own tracks" ON shared_tracks;
CREATE POLICY "Users can insert own tracks" ON shared_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only users can delete their own tracks
DROP POLICY IF EXISTS "Users can delete own tracks" ON shared_tracks;
CREATE POLICY "Users can delete own tracks" ON shared_tracks
  FOR DELETE USING (auth.uid() = user_id);
