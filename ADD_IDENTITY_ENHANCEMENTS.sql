-- Add identity fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.headline IS 'Short professional headline (e.g. Solana Smart Contract Developer)';
COMMENT ON COLUMN profiles.role IS 'Current or primary job title';
COMMENT ON COLUMN profiles.organization IS 'Current or primary organization';

-- Make role and organization optional in receipts
ALTER TABLE receipts ALTER COLUMN role DROP NOT NULL;
ALTER TABLE receipts ALTER COLUMN org DROP NOT NULL;

-- Clear legacy role/org data from profiles to ensure users start fresh with the new system
UPDATE profiles SET role = NULL, organization = NULL;

