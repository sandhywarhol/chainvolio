-- FIX PERMISSIONS FOR WALLETS TABLE
-- Allowing anon access because we are using the Anon Key as a fallback on the server.

-- 1. Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions
GRANT ALL ON TABLE wallets TO anon, authenticated, service_role;

-- 3. Drop existing policy if any
DROP POLICY IF EXISTS "Enable all access for wallets" ON wallets;

-- 4. Create permissive policy
CREATE POLICY "Enable all access for wallets" 
ON wallets FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Ensure ownership
ALTER TABLE wallets OWNER TO postgres;
