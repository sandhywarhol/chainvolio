-- Migration: Add wallets table (for existing Supabase projects)
-- Run this if you already have profiles + receipts from the old schema

-- 1. Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  wallet_address TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Populate from existing profiles and receipts
INSERT INTO wallets (wallet_address)
SELECT DISTINCT wallet_address FROM profiles
ON CONFLICT (wallet_address) DO NOTHING;

INSERT INTO wallets (wallet_address)
SELECT DISTINCT wallet_address FROM receipts
WHERE wallet_address NOT IN (SELECT wallet_address FROM wallets)
ON CONFLICT (wallet_address) DO NOTHING;

-- 3. Add FKs (drop first if re-running)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_wallet_address_fkey;
ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_wallet_address_fkey;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_wallet_fk
  FOREIGN KEY (wallet_address) REFERENCES wallets(wallet_address) ON DELETE CASCADE;

ALTER TABLE receipts
  ADD CONSTRAINT receipts_wallet_fk
  FOREIGN KEY (wallet_address) REFERENCES wallets(wallet_address) ON DELETE CASCADE;
