-- Org accounts for Google-login recruiters (no wallet required at sign-up)
CREATE TABLE IF NOT EXISTS org_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID UNIQUE NOT NULL,          -- Supabase Auth user.id (from Google OAuth)
    email TEXT NOT NULL,
    org_name TEXT,
    org_type TEXT,                          -- 'community' | 'company'
    account_type TEXT DEFAULT 'unverified_org',
    wallet_address TEXT,                    -- null until user connects wallet
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'free',
    onboarding_complete BOOLEAN DEFAULT FALSE,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_org_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_accounts_updated_at
    BEFORE UPDATE ON org_accounts
    FOR EACH ROW EXECUTE FUNCTION update_org_accounts_updated_at();

-- RLS
ALTER TABLE org_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own row (matched by Supabase Auth UID)
CREATE POLICY "org_accounts_select_own" ON org_accounts
    FOR SELECT USING (auth.uid() = auth_uid);

CREATE POLICY "org_accounts_insert_own" ON org_accounts
    FOR INSERT WITH CHECK (auth.uid() = auth_uid);

CREATE POLICY "org_accounts_update_own" ON org_accounts
    FOR UPDATE USING (auth.uid() = auth_uid);

-- Index for wallet lookups (used when connecting wallet post-signup)
CREATE INDEX IF NOT EXISTS org_accounts_wallet_address_idx ON org_accounts (wallet_address)
    WHERE wallet_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS org_accounts_auth_uid_idx ON org_accounts (auth_uid);
