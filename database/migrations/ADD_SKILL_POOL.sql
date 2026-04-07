-- Migration: Improve Skills System
-- Adds a persistent skill pool to track custom vs bank skills

CREATE TABLE IF NOT EXISTS skill_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0
);

-- Index for fast lookup by name
CREATE INDEX IF NOT EXISTS idx_skill_pool_name ON skill_pool(name);

-- RLS: Public read, but no public write (managed by API)
ALTER TABLE skill_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read for skill pool" ON skill_pool FOR SELECT USING (true);

-- Function to safely increment skill usage
CREATE OR REPLACE FUNCTION increment_skill_usage(s_name TEXT, s_custom BOOLEAN)
RETURNS void AS $$
BEGIN
    INSERT INTO skill_pool (name, is_custom, usage_count)
    VALUES (s_name, s_custom, 1)
    ON CONFLICT (name) 
    DO UPDATE SET usage_count = skill_pool.usage_count + 1;
END;
$$ LANGUAGE plpgsql;

