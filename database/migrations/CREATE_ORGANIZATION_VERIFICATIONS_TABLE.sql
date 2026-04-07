-- Organization Verifications Table
CREATE TABLE IF NOT EXISTS organization_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Company', 'DAO', 'Community', 'Agency'
    website TEXT,
    social_link TEXT,
    proof TEXT, -- Flexible proof description or link
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE organization_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read verification status
CREATE POLICY "Public read for organization_verifications" 
ON organization_verifications FOR SELECT 
USING (true);

-- Allow anyone to apply (insert)
CREATE POLICY "Public create for organization_verifications" 
ON organization_verifications FOR INSERT 
WITH CHECK (true);

-- Allow owner to update their application if pending
-- Uses 'app.current_wallet' set by RPC 'set_app_wallet' in API routes
CREATE POLICY "Owner update for pending applications" 
ON organization_verifications FOR UPDATE 
USING (wallet_address = current_setting('app.current_wallet', true) AND status = 'pending');
