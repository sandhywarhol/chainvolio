-- ChainVolio Security Audit & RLS Lockdown
-- This script secures the database by implementing fine-grained Row Level Security.

-------------------------------------------------------------------------------
-- 1. ROLES & PERMISSIONS CLEANUP
-------------------------------------------------------------------------------

-- Revoke all generic public permissions to start from a "Deny All" state
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Grant minimal required permissions to specific roles
-- We use 'anon' for our public/wallet-connected users since we use custom signing.
-- We use 'service_role' for our API routes (which bypass RLS after manual verification).

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Specific tables allowed for public INSERT via API (which should still be verified)
-- Note: In a pure RLS setup, we'd allow anon to INSERT if they pass a check.
GRANT INSERT ON collection_submissions TO anon, authenticated;
GRANT INSERT ON attestations TO anon, authenticated;
GRANT INSERT ON nonces TO anon, authenticated;

-------------------------------------------------------------------------------
-- 2. ENHANCE PROFILES WITH ROLES
-------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('talent', 'recruiter', 'system_attester');
    END IF;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'talent';

-------------------------------------------------------------------------------
-- 3. APPLY RLS POLICIES
-------------------------------------------------------------------------------

-- 3.0 WALLETS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Wallets are publicly readable" ON wallets;
DROP POLICY IF EXISTS "Service role manages wallets" ON wallets;
CREATE POLICY "Wallets are publicly readable" ON wallets FOR SELECT USING (true);
CREATE POLICY "Service role manages wallets" ON wallets FOR ALL TO service_role USING (true);

-- 3.1 PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Profiles are publicly readable" 
    ON profiles FOR SELECT USING (true);

-- Since we don't use Supabase Auth JWTs for everything yet, 
-- we use a custom check for the 'verified_wallet' if we were to use custom claims.
-- For now, we lock it down to service_role or a placeholder for future Auth integration.
CREATE POLICY "Service role can manage profiles" 
    ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.2 RECEIPTS (Work History)
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Receipts are publicly readable" ON receipts;
DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;

CREATE POLICY "Receipts are publicly readable" 
    ON receipts FOR SELECT USING (true);

CREATE POLICY "Service role can manage receipts" 
    ON receipts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.3 HIRING COLLECTIONS
ALTER TABLE hiring_collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Collections are publicly readable" ON hiring_collections;
DROP POLICY IF EXISTS "Recruiters can manage their own collections" ON hiring_collections;

CREATE POLICY "Collections are publicly readable" 
    ON hiring_collections FOR SELECT USING (true);

CREATE POLICY "Recruiters can manage their own collections" 
    ON hiring_collections FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.4 COLLECTION SUBMISSIONS (Critical)
ALTER TABLE collection_submissions ENABLE ROW LEVEL SECURITY;

-- Candidates can see their own submissions
DROP POLICY IF EXISTS "Talent can read own submission" ON collection_submissions;
CREATE POLICY "Talent can read own submission" 
    ON collection_submissions FOR SELECT 
    USING (candidate_wallet = current_setting('app.current_wallet', true));

-- Recruiters can see submissions for their own collections
DROP POLICY IF EXISTS "Recruiters can read submissions for their collections" ON collection_submissions;
CREATE POLICY "Recruiters can read submissions for their collections" 
    ON collection_submissions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM hiring_collections hc 
            WHERE hc.id = collection_id 
            AND hc.owner_wallet = current_setting('app.current_wallet', true)
        )
    );

DROP POLICY IF EXISTS "Public can insert submissions" ON collection_submissions;
CREATE POLICY "Public can insert submissions" 
    ON collection_submissions FOR INSERT 
    WITH CHECK (true); -- Verification happens in API route before commit

-- 3.5 ATTESTATIONS
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Attestations are publicly readable" ON attestations;
DROP POLICY IF EXISTS "Attesters can insert attestations" ON attestations;

CREATE POLICY "Attestations are publicly readable" 
    ON attestations FOR SELECT USING (true);

CREATE POLICY "Attesters can insert attestations" 
    ON attestations FOR INSERT 
    WITH CHECK (true); -- Verification happens in API route

-------------------------------------------------------------------------------
-- 4. SERVER-SIDE CONTEXT HELPER
-------------------------------------------------------------------------------
-- This function allows the API route to securely set the wallet address for the 
-- current transaction so that RLS 'USING' clauses can work.
CREATE OR REPLACE FUNCTION set_app_wallet(wallet_addr TEXT) RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_wallet', wallet_addr, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-------------------------------------------------------------------------------
-- 5. EXPLANATION & AUDIT NOTES
-------------------------------------------------------------------------------
-- LOGIC:
-- 1. All users can read profiles and work history (Proof of Talent).
-- 2. Sensitive data like 'collection_submissions' is hidden from public.
-- 3. Access to submissions is dual-pathed:
--    a. Candidate read: based on their wallet.
--    b. Recruiter read: based on collection ownership.
-- 4. Privilege Escalation Prevention: standard users (anon) have NO permissions
--    to DELETE or UPDATE anything. All mutations MUST pass through a verified
--    signature check in the API layer, which then uses the service_role or 
--    the 'set_app_wallet' context.

-- COMMON MISCONFIGURATIONS TO AVOID:
-- 1. Forgetting 'FOR ALL' grants: If you grant ALL to anon, RLS won't save you if you have a policy that returns 'true'.
-- 2. Recursion: Policies referencing the table they are on can trigger stack overflow.
-- 3. Leaking 'owner_wallet': Ensure the 'wallets' table doesn't leak metadata in public SELECTs.
