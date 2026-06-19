-- Add cv_pdf_url to store user's legacy/existing PDF resume
-- This is a secondary field — ChainVolio's attestation system remains primary
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS cv_pdf_url TEXT;

ALTER TABLE org_accounts
    ADD COLUMN IF NOT EXISTS cv_pdf_url TEXT;
