-- Safely mark any lingering debug users as 'is_test' to perfectly hide them from public view
-- Ensures no real user with genuine data gets caught
UPDATE profiles
SET is_test = true
WHERE 
  -- Match literal debug/test anomalies
  (display_name ILIKE '%Debug%' OR display_name ILIKE '%test%' OR wallet_address ILIKE '%test%')
  
  -- ALWAYS PROTECT VERIFIED USERS
  AND NOT EXISTS (
    SELECT 1 FROM organization_verifications ov 
    WHERE ov.wallet_address = profiles.wallet_address AND ov.status = 'verified'
  )
  
  -- ALWAYS PROTECT USERS WITH ACTIVITY
  AND NOT EXISTS (
    SELECT 1 FROM receipts r 
    WHERE r.wallet_address = profiles.wallet_address
  )
  AND NOT EXISTS (
    SELECT 1 FROM collection_submissions cs 
    WHERE cs.candidate_wallet = profiles.wallet_address
  );
