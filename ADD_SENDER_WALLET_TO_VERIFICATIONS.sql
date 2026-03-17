-- ============================================================
-- Add sender_wallet column to organization_verifications
-- Run this in Supabase SQL Editor ONCE.
-- ============================================================

ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS sender_wallet TEXT;

-- Index for future fraud analysis / lookups
CREATE INDEX IF NOT EXISTS idx_org_verif_sender_wallet 
ON organization_verifications(sender_wallet);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organization_verifications' 
  AND column_name = 'sender_wallet';
