-- COMPREHENSIVE PERMISSIONS FIX FOR ALL TABLES
-- This ensures that the 'anon' role (used by the API when SERVICE_ROLE_KEY is missing) 
-- has full access to the core tables for the MVP.

-- List of all core tables
-- wallets, profiles, receipts, attestations, hiring_collections, collection_submissions, nonces

DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY['wallets', 'profiles', 'receipts', 'attestations', 'hiring_collections', 'collection_submissions', 'nonces'];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- 1. Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        
        -- 2. Grant permissions to anon, authenticated, and service_role
        EXECUTE format('GRANT ALL ON TABLE %I TO anon, authenticated, service_role', t);
        
        -- 3. Drop existing permissive policy if it exists
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Enable all access for ' || t, t);
        
        -- 4. Create a fresh permissive policy
        EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true)', 'Enable all access for ' || t, t);
        
        -- 5. Set owner to postgres
        EXECUTE format('ALTER TABLE %I OWNER TO postgres', t);
    END LOOP;
END $$;

-- Also grant sequence usage to prevent "permission denied for sequence" errors
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
