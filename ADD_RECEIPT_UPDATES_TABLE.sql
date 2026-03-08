-- Create receipt_updates table
CREATE TABLE IF NOT EXISTS receipt_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signature TEXT NOT NULL,
  nonce TEXT NOT NULL
);

-- Note: In this system, wallet verify is done in API routes, so wallet_address acts as owner

-- Enable row level security
ALTER TABLE receipt_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Updates are publicly readable" 
  ON receipt_updates FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role can manage updates" 
  ON receipt_updates FOR ALL TO service_role USING (true) WITH CHECK (true);
