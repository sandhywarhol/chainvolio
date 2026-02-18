-- ChainVolio Supabase Schema
-- Run in Supabase SQL Editor: Project > SQL Editor > New query

-- 1. Wallets (registered when user connects and creates profile)
CREATE TABLE IF NOT EXISTS wallets (
  wallet_address TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (linked to wallet)
CREATE TABLE IF NOT EXISTS profiles (
  wallet_address TEXT PRIMARY KEY REFERENCES wallets(wallet_address) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  skills TEXT,
  twitter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Receipts (Proof of Work, linked to wallet)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES wallets(wallet_address) ON DELETE CASCADE,
  role TEXT NOT NULL,
  org TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  work_type TEXT DEFAULT 'Full-time',
  compensation_type TEXT,
  evidence_hash TEXT,
  status TEXT DEFAULT 'Self-Declared',
  tx_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_wallet ON receipts(wallet_address);

-- RLS: Allow public read/write for MVP (wallet = identity, no Supabase Auth)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for wallets" ON wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for receipts" ON receipts FOR ALL USING (true) WITH CHECK (true);
