-- Add metadata fields to attestations table
ALTER TABLE attestations 
ADD COLUMN IF NOT EXISTS attester_name TEXT,
ADD COLUMN IF NOT EXISTS attester_role TEXT,
ADD COLUMN IF NOT EXISTS attester_org TEXT,
ADD COLUMN IF NOT EXISTS attester_email TEXT,
ADD COLUMN IF NOT EXISTS attestation_type TEXT,
ADD COLUMN IF NOT EXISTS confidence_level TEXT;

-- Update existing rows if any with dummy data (though likely none for now)
UPDATE attestations SET attester_name = 'Anonymous' WHERE attester_name IS NULL;
UPDATE attestations SET attester_role = 'Verifier' WHERE attester_role IS NULL;

-- Make them required for future inserts
-- ALTER TABLE attestations ALTER COLUMN attester_name SET NOT NULL;
-- ALTER TABLE attestations ALTER COLUMN attester_role SET NOT NULL;
