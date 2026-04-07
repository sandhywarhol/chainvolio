-- HARDEN HIRING LINKS: ANTI-ABUSE & RATE LIMITING
-- This script adds infrastructure for server-side rate limiting and abuse prevention.

-- 1. Create Submission Activity Log (Semi-anonymous IP tracking)
CREATE TABLE IF NOT EXISTS submission_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_hash TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    action TEXT NOT NULL, -- 'apply_job'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast rate-limit lookups
CREATE INDEX IF NOT EXISTS idx_activity_ip_action ON submission_activity_logs(ip_hash, action, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_wallet_action ON submission_activity_logs(wallet_address, action, created_at);

-- 2. Add Unique Constraint on Submissions (already exists but emphasizing for clarity)
-- UNIQUE(collection_id, candidate_wallet) exists in collection_submissions.

-- 3. Function to check rate limits
CREATE OR REPLACE FUNCTION check_submission_rate_limit(
    p_ip_hash TEXT,
    p_wallet TEXT,
    p_action TEXT,
    p_ip_limit INT,
    p_wallet_limit INT,
    p_interval INTERVAL
) RETURNS BOOLEAN AS $$
DECLARE
    v_ip_count INT;
    v_wallet_count INT;
BEGIN
    -- Check IP limit
    SELECT count(*) INTO v_ip_count 
    FROM submission_activity_logs 
    WHERE ip_hash = p_ip_hash 
      AND action = p_action 
      AND created_at > (NOW() - p_interval);
      
    IF v_ip_count >= p_ip_limit THEN
        RETURN FALSE;
    END IF;

    -- Check Wallet limit
    SELECT count(*) INTO v_wallet_count 
    FROM submission_activity_logs 
    WHERE wallet_address = p_wallet 
      AND action = p_action 
      AND created_at > (NOW() - p_interval);

    IF v_wallet_count >= p_wallet_limit THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Secure the logs
ALTER TABLE submission_activity_logs ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON submission_activity_logs TO anon, authenticated, service_role;
GRANT SELECT ON submission_activity_logs TO service_role; -- Only server can read audit logs

-- Policy: Anyone can insert (the API does this), nobody can read/update (except service role)
CREATE POLICY "Server can record activity" ON submission_activity_logs FOR INSERT WITH CHECK (true);
