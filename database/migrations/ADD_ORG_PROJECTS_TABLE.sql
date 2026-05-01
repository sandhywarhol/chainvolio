-- Organization projects/programs portfolio
-- Linked to org by either wallet address (Solana) or auth_uid (Google OAuth)

CREATE TABLE IF NOT EXISTS org_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_wallet TEXT,
    owner_auth_uid UUID,
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT,
    project_url TEXT,
    start_date TEXT,
    end_date TEXT,
    is_ongoing BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_projects_owner_wallet
    ON org_projects(owner_wallet)
    WHERE owner_wallet IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_projects_owner_auth_uid
    ON org_projects(owner_auth_uid)
    WHERE owner_auth_uid IS NOT NULL;

ALTER TABLE org_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_projects_public_read" ON org_projects
    FOR SELECT USING (true);

CREATE POLICY "org_projects_wallet_write" ON org_projects
    FOR ALL USING (
        owner_wallet IS NOT NULL
        AND owner_wallet = current_setting('app.wallet', true)
    );

CREATE POLICY "org_projects_auth_write" ON org_projects
    FOR ALL USING (
        owner_auth_uid IS NOT NULL
        AND owner_auth_uid = auth.uid()
    );
