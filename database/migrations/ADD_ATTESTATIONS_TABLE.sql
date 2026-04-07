-- Create attestations table
CREATE TABLE IF NOT EXISTS attestations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  attester_wallet TEXT NOT NULL,
  signature TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique attestation per receipt per wallet
  UNIQUE(receipt_id, attester_wallet)
);

-- Enable RLS
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public read attestations" ON attestations
  FOR SELECT USING (true);

-- Allow authenticated (wallet) insert
CREATE POLICY "Public insert attestations" ON attestations
  FOR INSERT WITH CHECK (true); -- Ideally verify wallet owns 'attester_wallet', but MVP allows open insert
