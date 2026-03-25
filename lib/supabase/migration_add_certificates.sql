-- Add User Certificates table
CREATE TABLE IF NOT EXISTS user_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  issuer_name TEXT,
  date_issued DATE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' or 'image'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for wallet lookup
CREATE INDEX IF NOT EXISTS idx_user_certificates_wallet ON user_certificates(wallet_address);

-- RLS: Allow all for now (matching existing patterns)
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for user_certificates" ON user_certificates FOR ALL USING (true) WITH CHECK (true);
