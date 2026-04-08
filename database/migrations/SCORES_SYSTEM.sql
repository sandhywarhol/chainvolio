-- SCORES SYSTEM MIGRATION
-- Creates `scores` table to store "ChainVolio Score"

CREATE TABLE IF NOT EXISTS scores (
  wallet_address TEXT PRIMARY KEY REFERENCES wallets(wallet_address) ON DELETE CASCADE,
  total_score NUMERIC DEFAULT 0,
  experience_score NUMERIC DEFAULT 0,
  verification_score NUMERIC DEFAULT 0,
  consistency_score NUMERIC DEFAULT 0,
  skill_score NUMERIC DEFAULT 0,
  activity_score NUMERIC DEFAULT 0,
  level TEXT DEFAULT 'Beginner',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Allow service insert/update for scores" ON scores FOR ALL USING (true);
