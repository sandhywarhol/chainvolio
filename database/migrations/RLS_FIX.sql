-- Run this in Supabase > SQL Editor

-- 1. Enable RLS (just in case)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all for wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all for profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all for receipts" ON receipts;

-- 3. Create permissive policies for MVP (allows insert/update/select for everyone)
CREATE POLICY "Allow all for wallets" ON wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for receipts" ON receipts FOR ALL USING (true) WITH CHECK (true);
