-- ─── Pay-per-attestation migration ─────────────────────────────────────────
-- Enables users who have exceeded their monthly quota to pay for individual
-- extra attestations. Run in Supabase SQL Editor once.

-- 1. Track whether an attestation was paid for individually
ALTER TABLE attestations ADD COLUMN IF NOT EXISTS is_paid_attestation BOOLEAN DEFAULT FALSE;

-- 2. Enforce tx_signature uniqueness across all attestations.
--    This prevents a malicious actor from replaying a valid payment transaction
--    to obtain multiple free attestations after the quota is exceeded.
--    (A single on-chain payment tx can only be used for exactly one attestation.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_attestations_tx_signature_unique
    ON attestations(tx_signature)
    WHERE tx_signature IS NOT NULL;

-- Optional: index for analytics queries (paid vs free breakdown)
CREATE INDEX IF NOT EXISTS idx_attestations_is_paid ON attestations(is_paid_attestation)
    WHERE is_paid_attestation = TRUE;
