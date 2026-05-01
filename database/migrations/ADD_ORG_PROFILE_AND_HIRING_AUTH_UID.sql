-- Add social/contact fields to org_accounts for profile editing
ALTER TABLE org_accounts
    ADD COLUMN IF NOT EXISTS twitter TEXT,
    ADD COLUMN IF NOT EXISTS linkedin TEXT,
    ADD COLUMN IF NOT EXISTS discord TEXT,
    ADD COLUMN IF NOT EXISTS telegram TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT;

-- Add owner_auth_uid to hiring_collections so Google users can own collections
ALTER TABLE hiring_collections
    ADD COLUMN IF NOT EXISTS owner_auth_uid UUID;

CREATE INDEX IF NOT EXISTS idx_hiring_collections_owner_auth_uid
    ON hiring_collections(owner_auth_uid)
    WHERE owner_auth_uid IS NOT NULL;
