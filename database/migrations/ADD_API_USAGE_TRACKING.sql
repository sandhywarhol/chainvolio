-- ADD USAGE TRACKING TO API KEYS
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Ensure it's not null
UPDATE api_keys SET usage_count = 0 WHERE usage_count IS NULL;

-- Atomic increment function
CREATE OR REPLACE FUNCTION increment_api_usage(key_str TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE key = key_str;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
