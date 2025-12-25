-- Add Display Name Column
-- Allows users to set a friendly display name (e.g., first name) instead of showing email

-- Add display_name column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing users to use username as initial display_name
-- This provides a fallback until users set their own display name
UPDATE users
SET display_name = username
WHERE display_name IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.display_name IS 'User-friendly display name (e.g., first name). Falls back to username if not set.';
