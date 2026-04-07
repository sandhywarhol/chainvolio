-- Add pending upgrade tracking to organization_verifications
-- This allows verified users to apply for higher tiers without losing current status.
ALTER TABLE organization_verifications 
ADD COLUMN IF NOT EXISTS pending_upgrade_type TEXT;

ALTER TABLE organization_verifications 
ADD COLUMN IF NOT EXISTS pending_upgrade_status TEXT; -- 'pending', 'rejected', NULL

COMMENT ON COLUMN organization_verifications.pending_upgrade_type IS 'The higher tier requested by an already verified user';
COMMENT ON COLUMN organization_verifications.pending_upgrade_status IS 'Status of the upgrade request (pending, rejected, NULL)';
