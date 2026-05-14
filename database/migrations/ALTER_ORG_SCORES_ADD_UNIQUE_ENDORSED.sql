-- ALTER organization_scores: add unique_endorsed column
-- Run this once in your Supabase SQL editor after CREATE_ORG_SCORES_TABLE.sql

ALTER TABLE organization_scores
    ADD COLUMN IF NOT EXISTS unique_endorsed INTEGER DEFAULT 0;
