-- Create nonces table for signature verification
CREATE TABLE IF NOT EXISTS nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  UNIQUE(wallet_address, nonce)
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_nonces_expires ON nonces(expires_at);

-- RLS
ALTER TABLE nonces ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE nonces TO service_role;
-- Anon/Authenticated should only be able to view their own if needed, but usually this is server-managed.
CREATE POLICY "Server only access" ON nonces FOR ALL USING (false);
