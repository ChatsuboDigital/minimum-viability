-- Add DELETE policies for all tables
-- Run this in Supabase SQL Editor

-- Workouts: Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
ON workouts FOR DELETE
USING (auth.uid() = user_id);

-- Streaks: Users can delete their own streaks
CREATE POLICY "Users can delete own streaks"
ON streaks FOR DELETE
USING (auth.uid() = user_id);

-- Goals: Users can delete their own goals
CREATE POLICY "Users can delete own goals"
ON goals FOR DELETE
USING (auth.uid() = user_id);

-- Milestones: Users can delete their own milestones
CREATE POLICY "Users can delete own milestones"
ON milestones FOR DELETE
USING (auth.uid() = user_id);

-- Notifications: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);
