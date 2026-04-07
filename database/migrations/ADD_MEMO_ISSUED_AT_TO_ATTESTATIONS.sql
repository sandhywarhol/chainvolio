-- Migration: Add memo_issued_at to attestations
-- This column stores the server-generated ISO 8601 UTC timestamp that was
-- embedded in the Solana Memo instruction for the attestation transaction.
-- It allows cross-referencing the database record with the on-chain memo payload.

ALTER TABLE attestations
    ADD COLUMN IF NOT EXISTS memo_issued_at TIMESTAMPTZ;

COMMENT ON COLUMN attestations.memo_issued_at IS
    'Server-generated ISO 8601 UTC timestamp embedded in the Solana Memo instruction. '
    'Matches the issued_at field in the on-chain memo JSON payload.';
