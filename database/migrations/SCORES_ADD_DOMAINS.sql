-- ADD DOMAINS TO SCORES TABLE
-- Support Domain-Based Scoring

ALTER TABLE scores
ADD COLUMN IF NOT EXISTS domain_scores JSONB DEFAULT '{}'::jsonb;
