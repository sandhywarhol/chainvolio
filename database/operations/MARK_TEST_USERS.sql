-- 1. Add 'is_test' boolean flag to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;

-- 2. Safely mark debug/test accounts as 'is_test = true'
-- This query is strictly gated to guarantee it NEVER touches real users or verified profiles.
UPDATE profiles
SET is_test = true
WHERE 
  -- Match known test strings inputted during deployment
  (display_name ILIKE '%Smoke Test User%' OR display_name ILIKE '%test%')
  
  -- ALWAYS PROTECT VERIFIED USERS
  AND NOT EXISTS (
    SELECT 1 FROM organization_verifications ov 
    WHERE ov.wallet_address = profiles.wallet_address AND ov.status = 'verified'
  )
  
  -- ALWAYS PROTECT USERS WITH ATTESTATION/RECEIPT ACTIVITY
  AND NOT EXISTS (
    SELECT 1 FROM receipts r 
    WHERE r.wallet_address = profiles.wallet_address
  )
  
  -- ALWAYS PROTECT USERS WITH HIRING ACTIVITY (Both collection owners and applicants)
  AND NOT EXISTS (
    SELECT 1 FROM hiring_collections hc 
    WHERE hc.owner_wallet = profiles.wallet_address
  )
  AND NOT EXISTS (
    SELECT 1 FROM collection_submissions cs 
    WHERE cs.candidate_wallet = profiles.wallet_address
  );

-- 3. Document the new schema column for future integrations
COMMENT ON COLUMN profiles.is_test IS 'System flag identifying automated or manually-tagged debug accounts, intended to be excluded from public/admin dashboards and search by default.';
