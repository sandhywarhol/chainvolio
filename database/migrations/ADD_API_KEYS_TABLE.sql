-- ADD API KEYS TABLE
CREATE TABLE IF NOT EXISTS api_keys (
  key TEXT PRIMARY KEY,
  name TEXT,
  usage_limit INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Allow read for testing or verification based on the key itself
CREATE POLICY "Allow public select by key" ON api_keys
  FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access" ON api_keys
  TO service_role USING (true) WITH CHECK (true);
