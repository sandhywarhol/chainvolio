-- CREATE ORGANIZATION SCORES TABLE
-- Separates org Trust Score from individual CV Score.
-- Run this migration once in your Supabase SQL editor.

CREATE TABLE IF NOT EXISTS organization_scores (
    wallet_address       TEXT PRIMARY KEY REFERENCES wallets(wallet_address) ON DELETE CASCADE,
    trust_score          NUMERIC  DEFAULT 0,      -- main Trust Score (0–100)
    tier                 INTEGER  DEFAULT 0,       -- verifier tier (1–4)
    org_type             TEXT     DEFAULT '',      -- 'Company / Organization' | 'Community / DAO'
    base_score           NUMERIC  DEFAULT 0,       -- tier-based starting points
    attestations_given   INTEGER  DEFAULT 0,       -- attestations this org has given
    hiring_count         INTEGER  DEFAULT 0,       -- number of hiring collections
    profile_completeness INTEGER  DEFAULT 0,       -- 0-20 profile completeness points
    level                TEXT     DEFAULT 'Verified Network', -- org-specific level label
    activity_status      TEXT     DEFAULT 'inactive',
    last_updated         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organization_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for organization_scores"
    ON organization_scores FOR SELECT USING (true);

CREATE POLICY "Allow service insert/update for organization_scores"
    ON organization_scores FOR ALL USING (true);
