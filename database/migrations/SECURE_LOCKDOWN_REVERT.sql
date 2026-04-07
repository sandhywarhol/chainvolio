-- ChainVolio Security Re-Lockdown
-- Reverts the permissive "anon all" policies and enforces server-authoritative RLS.

-- 1. REVOKE ALL Generic permissions from public roles
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- 2. GRANT ONLY SELECT to public/anon (Proof of Talent is public)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- 3. DROP THE PERMISSIVE POLICIES CREATED FOR DEBUGGING
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY['wallets', 'profiles', 'receipts', 'attestations', 'hiring_collections', 'collection_submissions', 'nonces'];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Enable all access for ' || t, t);
    END LOOP;
END $$;

-- 4. ENSURE REDUNDANT POLICIES FROM PREVIOUS FIXES ARE REMOVED
DROP POLICY IF EXISTS "Enable all access for collections" ON hiring_collections;
DROP POLICY IF EXISTS "Enable all access for submissions" ON collection_submissions;
DROP POLICY IF EXISTS "Enable all access for profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for receipts" ON receipts;
DROP POLICY IF EXISTS "Enable all access for attestations" ON attestations;
DROP POLICY IF EXISTS "Enable all access for wallets" ON wallets;

-- 5. RE-APPLY PRODUCTION POLICIES (From SECURITY_AUDIT_RLS.sql)
-- Note: Service role always has access.

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
DROP POLICY IF EXISTS "Service role manages profiles" ON profiles;
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Service role manages profiles" ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RECEIPTS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Receipts are publicly readable" ON receipts;
DROP POLICY IF EXISTS "Service role manages receipts" ON receipts;
CREATE POLICY "Receipts are publicly readable" ON receipts FOR SELECT USING (true);
CREATE POLICY "Service role manages receipts" ON receipts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- WALLETS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Wallets are publicly readable" ON wallets;
DROP POLICY IF EXISTS "Service role manages wallets" ON wallets;
CREATE POLICY "Wallets are publicly readable" ON wallets FOR SELECT USING (true);
CREATE POLICY "Service role manages wallets" ON wallets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- COLLECTIONS
ALTER TABLE hiring_collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Collections are publicly readable" ON hiring_collections;
DROP POLICY IF EXISTS "Service role manages collections" ON hiring_collections;
CREATE POLICY "Collections are publicly readable" ON hiring_collections FOR SELECT USING (true);
CREATE POLICY "Service role manages collections" ON hiring_collections FOR ALL TO service_role USING (true) WITH CHECK (true);

-- SUBMISSIONS (More restrictive)
ALTER TABLE collection_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Candidates can read own submission" ON collection_submissions;
DROP POLICY IF EXISTS "Service role manages submissions" ON collection_submissions;
CREATE POLICY "Candidates can read own submission" ON collection_submissions FOR SELECT USING (candidate_wallet = current_setting('app.current_wallet', true));
CREATE POLICY "Service role manages submissions" ON collection_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ATTESTATIONS
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Attestations are publicly readable" ON attestations;
DROP POLICY IF EXISTS "Service role manages attestations" ON attestations;
CREATE POLICY "Attestations are publicly readable" ON attestations FOR SELECT USING (true);
CREATE POLICY "Service role manages attestations" ON attestations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. RESET OWNERSHIP
ALTER TABLE wallets OWNER TO postgres;
ALTER TABLE profiles OWNER TO postgres;
ALTER TABLE receipts OWNER TO postgres;
ALTER TABLE attestations OWNER TO postgres;
ALTER TABLE hiring_collections OWNER TO postgres;
ALTER TABLE collection_submissions OWNER TO postgres;
ALTER TABLE nonces OWNER TO postgres;

-- 7. SEQUENCES
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

