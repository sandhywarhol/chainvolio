-- Hiring Collections Table
CREATE TABLE IF NOT EXISTS hiring_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    owner_wallet TEXT, -- Optional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Submissions Table
CREATE TABLE IF NOT EXISTS collection_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES hiring_collections(id) ON DELETE CASCADE,
    candidate_wallet TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recruiter_status TEXT DEFAULT 'pending', -- 'pending', 'shortlisted', 'rejected'
    recruiter_notes TEXT DEFAULT '',
    UNIQUE(collection_id, candidate_wallet)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_collection ON collection_submissions(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON hiring_collections(slug);

-- RLS (Row Level Security) - Enabling public read/write for now as per "no login required"
ALTER TABLE hiring_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for collections" ON hiring_collections FOR SELECT USING (true);
CREATE POLICY "Public create for collections" ON hiring_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read for submissions" ON collection_submissions FOR SELECT USING (true);
CREATE POLICY "Public create for submissions" ON collection_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update for submissions" ON collection_submissions FOR UPDATE USING (true);
