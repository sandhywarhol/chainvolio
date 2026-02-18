-- Add recruiter-friendly fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS looking_for TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS work_preference TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lens TEXT,
ADD COLUMN IF NOT EXISTS farcaster TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN profiles.looking_for IS 'Intent signal (e.g. Open to remote roles)';
COMMENT ON COLUMN profiles.timezone IS 'Timezone (e.g. GMT+7)';
COMMENT ON COLUMN profiles.work_preference IS 'Array of work types (Full-time, Contract, etc.)';
COMMENT ON COLUMN profiles.tags IS 'Array of skills/tags for recruiter scanning';
