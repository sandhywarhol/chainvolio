-- Add is_external flag to attestations
ALTER TABLE attestations 
ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN attestations.is_external IS 'Whether the attestation was made by a user without a ChainVolio profile at the time of signing.';
