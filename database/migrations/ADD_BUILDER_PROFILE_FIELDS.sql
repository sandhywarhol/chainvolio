-- Add builder-specific profile fields to org_accounts
-- These mirror the profile fields available to wallet users (/profile page)
ALTER TABLE org_accounts
    ADD COLUMN IF NOT EXISTS github TEXT,
    ADD COLUMN IF NOT EXISTS instagram TEXT,
    ADD COLUMN IF NOT EXISTS whatsapp TEXT,
    ADD COLUMN IF NOT EXISTS skills TEXT,
    ADD COLUMN IF NOT EXISTS role TEXT,
    ADD COLUMN IF NOT EXISTS timezone TEXT,
    ADD COLUMN IF NOT EXISTS looking_for TEXT,
    ADD COLUMN IF NOT EXISTS work_preference TEXT[];
