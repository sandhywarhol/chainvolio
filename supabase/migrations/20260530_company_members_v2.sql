-- ============================================================
-- ChainVolio Company Membership System — v2 Migration
-- Run this in Supabase Dashboard > SQL Editor
--
-- Jika tabel sudah ada dari migration sebelumnya (dengan kolom
-- recruiter_auth_uid), migration ini akan drop dan recreate
-- dengan kolom recruiter_wallet yang benar.
-- ============================================================

-- Drop existing tables and dependencies (cascade handles triggers/indexes)
DROP TABLE IF EXISTS member_notes CASCADE;
DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS member_invitations CASCADE;

-- Drop old trigger function if exists
DROP FUNCTION IF EXISTS update_company_members_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_members_updated_at() CASCADE;

-- ============================================================
-- NOTE: recruiter_wallet stores the canonical owner identity,
-- matching the hiring_collections.owner_wallet convention:
--   • Wallet users  → actual wallet address  (e.g. "ABC123...")
--   • Google users  → "gauth:{auth_uid}"
-- ============================================================

-- 1. Member invitations (sent by recruiter to builder)
CREATE TABLE member_invitations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recruiter identity (canonical: wallet address or "gauth:{uid}")
    recruiter_wallet    TEXT NOT NULL,
    recruiter_company   TEXT NOT NULL,
    recruiter_avatar_url TEXT,

    -- How the recruiter looked up the builder
    lookup_value        TEXT NOT NULL,
    lookup_type         TEXT NOT NULL CHECK (lookup_type IN ('wallet', 'cv_id')),

    -- Resolved builder identity (always wallet-based)
    builder_wallet      TEXT,

    -- Role being offered
    role                TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),

    -- Status lifecycle
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'accepted', 'rejected', 'revoked')),

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',

    CONSTRAINT unique_active_invitation UNIQUE (recruiter_wallet, builder_wallet)
);

-- 2. Company members (active memberships)
CREATE TABLE company_members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recruiter identity (canonical: wallet address or "gauth:{uid}")
    recruiter_wallet    TEXT NOT NULL,
    company_name        TEXT NOT NULL,
    recruiter_avatar_url TEXT,

    -- Builder identity (always wallet-based)
    builder_wallet      TEXT NOT NULL,

    -- Role
    role                TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),

    -- Status
    status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),

    joined_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    invitation_id       UUID REFERENCES member_invitations(id),

    CONSTRAINT unique_membership UNIQUE (recruiter_wallet, builder_wallet)
);

-- 3. Member notes (admin member can add notes on hirings)
CREATE TABLE member_notes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           UUID NOT NULL REFERENCES company_members(id) ON DELETE CASCADE,
    hiring_id           TEXT NOT NULL,
    content             TEXT NOT NULL CHECK (char_length(content) <= 2000),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_member_invitations_builder_wallet
    ON member_invitations (builder_wallet) WHERE status = 'pending';

CREATE INDEX idx_member_invitations_recruiter
    ON member_invitations (recruiter_wallet);

CREATE INDEX idx_company_members_builder
    ON company_members (builder_wallet) WHERE status = 'active';

CREATE INDEX idx_company_members_recruiter
    ON company_members (recruiter_wallet) WHERE status = 'active';

CREATE INDEX idx_member_notes_hiring
    ON member_notes (hiring_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_company_members_updated_at
    BEFORE UPDATE ON company_members
    FOR EACH ROW EXECUTE FUNCTION update_members_updated_at();

CREATE TRIGGER trg_member_invitations_updated_at
    BEFORE UPDATE ON member_invitations
    FOR EACH ROW EXECUTE FUNCTION update_members_updated_at();
