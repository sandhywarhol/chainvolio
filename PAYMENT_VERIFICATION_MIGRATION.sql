-- ============================================================
-- Payment verification columns for organization_verifications
-- Run this in Supabase SQL Editor ONCE.
-- ============================================================

-- Store the Solana transaction signature used for payment
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS tx_signature TEXT;

-- Store amount paid in USDC (numeric, e.g. 10.00, 30.00, 100.00)
ALTER TABLE organization_verifications
    ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0;

-- Prevent the same transaction signature from being used twice
-- (Only enforces on non-null values)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'organization_verifications'
          AND indexname = 'idx_org_verif_tx_signature_unique'
    ) THEN
        CREATE UNIQUE INDEX idx_org_verif_tx_signature_unique
        ON organization_verifications(tx_signature)
        WHERE tx_signature IS NOT NULL;
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'organization_verifications'
ORDER BY ordinal_position;
