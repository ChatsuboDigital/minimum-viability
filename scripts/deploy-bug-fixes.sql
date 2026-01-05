-- Deploy critical bug fixes for retroactive workouts
-- Run this script to update the database functions

-- 1. Fix retroactive workout validation to allow 7-day window (not just yesterday)
-- 2. Fix retroactive workout to cap weekly progress at target
\i scripts/retroactive-workout-transaction.sql

-- Verify function was updated
SELECT 'Retroactive workout function updated successfully' as status;
