-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Hiring Tables (if they don't exist)
CREATE TABLE IF NOT EXISTS hiring_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    owner_wallet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES hiring_collections(id) ON DELETE CASCADE,
    candidate_wallet TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recruiter_status TEXT DEFAULT 'pending',
    recruiter_notes TEXT DEFAULT '',
    UNIQUE(collection_id, candidate_wallet)
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_collection ON collection_submissions(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON hiring_collections(slug);

-- 4. Enable RLS
ALTER TABLE hiring_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Grant Permissions (for public access MVP)
GRANT ALL ON TABLE hiring_collections TO anon, authenticated, service_role;
GRANT ALL ON TABLE collection_submissions TO anon, authenticated, service_role;

-- 6. Create Policies (Drop first to avoid conflicts)
DROP POLICY IF EXISTS "Public read for collections" ON hiring_collections;
DROP POLICY IF EXISTS "Public create for collections" ON hiring_collections;
DROP POLICY IF EXISTS "Public read for submissions" ON collection_submissions;
DROP POLICY IF EXISTS "Public create for submissions" ON collection_submissions;
DROP POLICY IF EXISTS "Public update for submissions" ON collection_submissions;

CREATE POLICY "Public read for collections" ON hiring_collections FOR SELECT USING (true);
CREATE POLICY "Public create for collections" ON hiring_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read for submissions" ON collection_submissions FOR SELECT USING (true);
CREATE POLICY "Public create for submissions" ON collection_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update for submissions" ON collection_submissions FOR UPDATE USING (true);

-- 7. Add Enhancement Columns (Idempotent)
ALTER TABLE collection_submissions
ADD COLUMN IF NOT EXISTS primary_signal TEXT,
ADD COLUMN IF NOT EXISTS role_strength TEXT,
ADD COLUMN IF NOT EXISTS snapshot_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE hiring_collections
ADD COLUMN IF NOT EXISTS eligibility_filters JSONB DEFAULT '{}'::jsonb;

-- 8. Add Documentation Comments
COMMENT ON COLUMN collection_submissions.primary_signal IS 'Candidate selected primary proof of work type';
COMMENT ON COLUMN collection_submissions.role_strength IS 'Candidate selected role type';
COMMENT ON COLUMN collection_submissions.snapshot_data IS 'Auto-generated summary and tags';
COMMENT ON COLUMN hiring_collections.eligibility_filters IS 'Recruiter defined eligibility criteria';
