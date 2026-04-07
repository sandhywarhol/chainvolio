-- ============================================================
-- Ensure organization_verifications has all required columns
-- for the new tier-based verification system.
-- Run this once in Supabase SQL Editor.
-- ============================================================

-- Add updated_at column if it doesn't already exist
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add reviewed_at column (may already exist from ADMIN_DASHBOARD_SETUP.sql)
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add rejection_reason column (may already exist)
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add verifier_tier column: 1=Builder, 2=PublicFigure, 3=Community, 4=Company
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS verifier_tier INTEGER DEFAULT 1;

-- Unique constraint: each wallet can only have one verification record
-- (resubmissions update the existing row)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'organization_verifications_wallet_address_key'
    ) THEN
        ALTER TABLE organization_verifications
            ADD CONSTRAINT organization_verifications_wallet_address_key
            UNIQUE (wallet_address);
    END IF;
END $$;

-- RLS: Allow service_role to update any row (admin approval/rejection)
-- The admin API uses service_role key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'organization_verifications'
          AND policyname = 'Service role can update all verifications'
    ) THEN
        EXECUTE '
            CREATE POLICY "Service role can update all verifications"
            ON organization_verifications FOR UPDATE
            TO service_role
            USING (true)
            WITH CHECK (true)
        ';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'organization_verifications'
ORDER BY ordinal_position;
