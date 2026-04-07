-- Add enhancement columns to collection_submissions
ALTER TABLE collection_submissions
ADD COLUMN IF NOT EXISTS primary_signal TEXT,
ADD COLUMN IF NOT EXISTS role_strength TEXT,
ADD COLUMN IF NOT EXISTS snapshot_data JSONB DEFAULT '{}'::jsonb;

-- Add filters to hiring_collections
ALTER TABLE hiring_collections
ADD COLUMN IF NOT EXISTS eligibility_filters JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN collection_submissions.primary_signal IS 'Candidate selected primary proof of work type';
COMMENT ON COLUMN collection_submissions.role_strength IS 'Candidate selected role type';
COMMENT ON COLUMN collection_submissions.snapshot_data IS 'Auto-generated summary and tags';
COMMENT ON COLUMN hiring_collections.eligibility_filters IS 'Recruiter defined eligibility criteria';
