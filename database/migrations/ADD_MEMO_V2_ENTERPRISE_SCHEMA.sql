-- Migration: Memo V2 — Enterprise Attestation Schema
-- Adds structured memo data, content hash, and classification to attestations table.

ALTER TABLE attestations
    ADD COLUMN IF NOT EXISTS memo_v2        JSONB,
    ADD COLUMN IF NOT EXISTS content_hash   TEXT,
    ADD COLUMN IF NOT EXISTS classification TEXT;

COMMENT ON COLUMN attestations.memo_v2 IS
    'Full structured Memo V2 JSON payload (enterprise schema). '
    'Contains issuer info, recipient, classification, content sections, performance ratings, and signature.';

COMMENT ON COLUMN attestations.content_hash IS
    'SHA-256 hex digest of the full memo_v2 JSON (stringified). '
    'This hash is embedded in the on-chain Solana Memo instruction for tamper-proof verification.';

COMMENT ON COLUMN attestations.classification IS
    'Memo classification type (e.g. Employment Verification, Professional Attestation, etc.)';
