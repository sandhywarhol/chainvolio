ALTER TABLE organization_verifications ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'paid';
