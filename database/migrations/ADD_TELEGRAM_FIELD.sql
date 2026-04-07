-- Add telegram field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS telegram TEXT;

COMMENT ON COLUMN profiles.telegram IS 'Telegram username (@username)';
