-- Add verification_source to organization_verifications for admin overrides
ALTER TABLE organization_verifications 
ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'user_application';

-- Recreate policies if needed to allow admin updates... But Service Role covers this via server.ts

COMMENT ON COLUMN organization_verifications.verification_source IS 'Source of verification, e.g. user_application or admin_override';
