-- Migration to add attestation quota fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS attestation_quota INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attestation_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attestation_reset_date TIMESTAMPTZ DEFAULT NOW();

-- Index for performance on resets
CREATE INDEX IF NOT EXISTS idx_profiles_reset_date ON profiles(attestation_reset_date);
