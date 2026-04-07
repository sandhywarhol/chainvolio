-- ============================================================
-- Subscription billing columns for organization_verifications
-- Run in Supabase SQL Editor ONCE (after PAYMENT_VERIFICATION_MIGRATION.sql)
-- ============================================================

-- How the user is billed: 'monthly', 'yearly', or NULL (one-time/free)
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS billing_cycle TEXT;

-- Set when admin approves the request
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- For subscription tiers: approved_at + 30 or 365 days
-- NULL for one-time / free tiers (lifetime badge)
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Verify columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'organization_verifications'
ORDER BY ordinal_position;
