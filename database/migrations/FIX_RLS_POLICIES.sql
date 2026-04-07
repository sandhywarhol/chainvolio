-- FORCE FIX RLS POLICIES FOR CHAINVOLIO RECRUITMENT

-- 1. Ensure RLS is enabled on all relevant tables
ALTER TABLE hiring_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_submissions ENABLE ROW LEVEL SECURITY;
-- For profiles and receipts, we want public Read access for the recruiter
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to public/anon users (Critical for MVP)
GRANT ALL ON TABLE hiring_collections TO anon, authenticated, service_role;
GRANT ALL ON TABLE collection_submissions TO anon, authenticated, service_role;
GRANT ALL ON TABLE profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE receipts TO anon, authenticated, service_role;
GRANT ALL ON TABLE attestations TO anon, authenticated, service_role;

-- 3. Drop ALL existing policies (including the new ones if they partially exist)
DROP POLICY IF EXISTS "Enable all access for collections" ON hiring_collections;
DROP POLICY IF EXISTS "Enable all access for submissions" ON collection_submissions;
DROP POLICY IF EXISTS "Enable all access for profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for receipts" ON receipts;
DROP POLICY IF EXISTS "Enable all access for attestations" ON attestations;

-- 4. Re-create PERMISSIVE policies (Allow everything for MVP)

-- Collections: Anyone can read/create/update/delete
CREATE POLICY "Enable all access for collections" 
ON hiring_collections FOR ALL 
USING (true) 
WITH CHECK (true);

-- Submissions: Anyone can read/create/update/delete
CREATE POLICY "Enable all access for submissions" 
ON collection_submissions FOR ALL 
USING (true) 
WITH CHECK (true);

-- Profiles: Anyone can read/create (User updates their own technically, but allowing all for MVP simplicity/debug)
CREATE POLICY "Enable all access for profiles" 
ON profiles FOR ALL 
USING (true) 
WITH CHECK (true);

-- Receipts: Anyone can read (Recruiter needs to see candidate receipts!)
CREATE POLICY "Enable all access for receipts" 
ON receipts FOR ALL 
USING (true) 
WITH CHECK (true);

-- Attestations: Anyone can read
CREATE POLICY "Enable all access for attestations" 
ON attestations FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Helper: Fix potential missing columns in case previous migrations failed
ALTER TABLE collection_submissions ADD COLUMN IF NOT EXISTS primary_signal TEXT;
ALTER TABLE collection_submissions ADD COLUMN IF NOT EXISTS role_strength TEXT;
ALTER TABLE collection_submissions ADD COLUMN IF NOT EXISTS snapshot_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE hiring_collections ADD COLUMN IF NOT EXISTS eligibility_filters JSONB DEFAULT '{}'::jsonb;

-- 6. Verify table owners (Supabase needs postgres generic role sometimes if created by user)
ALTER TABLE hiring_collections OWNER TO postgres;
ALTER TABLE collection_submissions OWNER TO postgres;
ALTER TABLE profiles OWNER TO postgres;
ALTER TABLE receipts OWNER TO postgres;
ALTER TABLE attestations OWNER TO postgres;

-- 7. Grant sequence usage just in case
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
