-- Add tx_signature to attestations to store the on-chain proof
ALTER TABLE attestations ADD COLUMN IF NOT EXISTS tx_signature TEXT;
