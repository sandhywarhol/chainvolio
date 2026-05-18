-- ============================================================
-- ChainVolio Recruitment Messaging — Database Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Monthly outreach limit tracker
CREATE TABLE IF NOT EXISTS recruiter_outreach_limits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_wallet    TEXT,
    recruiter_auth_uid  UUID,
    month_year          VARCHAR(7) NOT NULL,
    outreach_count      INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_wallet_per_month  UNIQUE (recruiter_wallet, month_year),
    CONSTRAINT one_authuid_per_month UNIQUE (recruiter_auth_uid, month_year),
    CONSTRAINT must_have_identity    CHECK (
        (recruiter_wallet IS NOT NULL) OR (recruiter_auth_uid IS NOT NULL)
    )
);

-- 2. Conversations (one per recruiter-candidate pair)
CREATE TABLE IF NOT EXISTS conversations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recruiter identity (exactly one set)
    recruiter_wallet        TEXT,
    recruiter_auth_uid      UUID,

    -- Candidate (always wallet-based)
    candidate_wallet        TEXT NOT NULL,

    -- Status lifecycle
    status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','accepted','declined','closed')),

    -- Initial outreach content
    role_position           TEXT NOT NULL,
    initial_message         TEXT NOT NULL CHECK (char_length(initial_message) <= 1000),
    proposed_interview_date DATE,
    meeting_link            TEXT CHECK (meeting_link IS NULL OR meeting_link ~ '^https://'),

    -- Recruiter snapshot (denormalized for fast inbox loads)
    recruiter_name          TEXT,
    recruiter_company       TEXT,
    recruiter_avatar_url    TEXT,

    -- Timestamps
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    accepted_at             TIMESTAMPTZ,
    declined_at             TIMESTAMPTZ,

    -- One conversation per recruiter-candidate pair
    CONSTRAINT unique_wallet_pair   UNIQUE (recruiter_wallet, candidate_wallet),
    CONSTRAINT unique_authuid_pair  UNIQUE (recruiter_auth_uid, candidate_wallet),
    CONSTRAINT must_have_recruiter  CHECK (
        (recruiter_wallet IS NOT NULL) OR (recruiter_auth_uid IS NOT NULL)
    )
);

-- 3. Messages (only in accepted conversations)
CREATE TABLE IF NOT EXISTS messages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Sender (one set)
    sender_wallet    TEXT,
    sender_auth_uid  UUID,
    sender_type      TEXT NOT NULL CHECK (sender_type IN ('recruiter','candidate')),

    content          TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    read_at          TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conv_candidate    ON conversations(candidate_wallet);
CREATE INDEX IF NOT EXISTS idx_conv_rec_wallet   ON conversations(recruiter_wallet);
CREATE INDEX IF NOT EXISTS idx_conv_rec_authuid  ON conversations(recruiter_auth_uid);
CREATE INDEX IF NOT EXISTS idx_conv_status       ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conv_updated      ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_conv_id       ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_created       ON messages(conversation_id, created_at ASC);

-- Auto-update updated_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_message_updates_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================================
-- RLS Policies (enable RLS on these tables in Supabase UI)
-- ============================================================

-- NOTE: These policies use the app.wallet session variable set by set_app_wallet().
-- For Google OAuth users, API routes use the service role key (bypasses RLS).

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_outreach_limits ENABLE ROW LEVEL SECURITY;

-- Candidates can read their own conversations
CREATE POLICY "candidate_read_conversations" ON conversations
    FOR SELECT USING (candidate_wallet = current_setting('app.wallet', true));

-- Wallet-based recruiters can read their own conversations
CREATE POLICY "recruiter_wallet_read_conversations" ON conversations
    FOR SELECT USING (recruiter_wallet = current_setting('app.wallet', true));

-- Messages: readable by conversation participants (candidate side)
CREATE POLICY "candidate_read_messages" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE candidate_wallet = current_setting('app.wallet', true)
        )
    );

-- Messages: readable by wallet recruiter
CREATE POLICY "recruiter_wallet_read_messages" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE recruiter_wallet = current_setting('app.wallet', true)
        )
    );
