-- Tie API keys to the wallet that generated them
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Index for fast lookup by wallet (one key per wallet pattern)
CREATE INDEX IF NOT EXISTS api_keys_wallet_idx ON api_keys (wallet_address);
