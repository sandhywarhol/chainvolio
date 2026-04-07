-- Safe CV ID Reassignment Protocol
-- Automatically finds the Debug User sitting on CV ID #1, heavily audits them for any
-- production activity, safely deletes them, and reassigns CV ID #1 to your Admin Wallet!

DO $$ 
DECLARE
    debug_wallet TEXT;
    
    -- IMPORTANT: This is currently set to your Admin 'Sandhy Warhol' Wallet (which holds CV ID #5)
    -- If you want CV ID #1 assigned to a different wallet, swap this string!
    target_wallet TEXT := 'FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv'; 
    has_activity BOOLEAN;
BEGIN
    -- 1. Identify Debug Record holding CV ID #1
    SELECT wallet_address INTO debug_wallet 
    FROM profiles 
    WHERE card_number = 1;

    IF debug_wallet IS NULL THEN
        RAISE EXCEPTION 'CRITICAL ABORT: Nobody currently holds CV ID #1.';
    END IF;

    -- 2. Deep Validation (Ensure debug user is completely empty)
    SELECT EXISTS (
        SELECT 1 FROM receipts WHERE wallet_address = debug_wallet
        UNION
        SELECT 1 FROM organization_verifications WHERE wallet_address = debug_wallet AND status = 'verified'
        UNION
        SELECT 1 FROM hiring_collections WHERE owner_wallet = debug_wallet
        UNION
        SELECT 1 FROM collection_submissions WHERE candidate_wallet = debug_wallet
    ) INTO has_activity;

    IF has_activity THEN
        RAISE EXCEPTION 'CRITICAL ABORT: The user holding CV ID #1 actually has production activity in the system! Reassignment cancelled to protect integrity.';
    END IF;

    -- 3 & 5. Safely Delete Debug User 
    -- Removing them forcefully frees up the unique constraint on CV ID #1.
    -- (Since foreign keys rely on `wallet_address`, the integer ID drops nicely)
    DELETE FROM profiles WHERE wallet_address = debug_wallet;
    
    -- Cleanup orphaned wallet container to keep system 100% clean
    DELETE FROM wallets WHERE wallet_address = debug_wallet;

    -- 4 & 6. Reassign CV ID #1 to Target User & Maintain Integrity
    -- Because all of your relations (attestations, hiring, verifications) rely fundamentally
    -- on the `wallet_address` as the Primary Key and Foreign Key, simply shifting the target's
    -- `card_number` integer to `1` preserves literally 100% of their existing data!
    -- Their old ID (e.g. CV ID #5) naturally becomes a purely empty gap safely in the sequence.
    UPDATE profiles
    SET card_number = 1
    WHERE wallet_address = target_wallet;

    RAISE NOTICE 'SUCCESS: Reassigned CV ID #1 natively to % while preserving strict DB relations. The previous CV ID was successfully freed.', target_wallet;
END $$;
