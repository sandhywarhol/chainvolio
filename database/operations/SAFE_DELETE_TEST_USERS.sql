-- 1. DELETE ONLY KNOWN `is_test = true` USERS
-- Safe Mode guarantees NO attestations, verifications, or hiring activity exists before wiping their profile.

DELETE FROM profiles
WHERE is_test = true
  
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
  
  -- ALWAYS PROTECT USERS WITH HIRING ACTIVITY (owners and applicants)
  AND NOT EXISTS (
    SELECT 1 FROM hiring_collections hc 
    WHERE hc.owner_wallet = profiles.wallet_address
  )
  AND NOT EXISTS (
    SELECT 1 FROM collection_submissions cs 
    WHERE cs.candidate_wallet = profiles.wallet_address
  );

-- Notice: Deleting a profile will cascade and drop the associated wallet from the `wallets` table 
-- because `profiles` schema defines `wallet_address TEXT PRIMARY KEY REFERENCES wallets(wallet_address) ON DELETE CASCADE`
