-- Stripe subscription fields for Google-login org accounts

ALTER TABLE org_accounts
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS plan_name TEXT NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS saved_candidates_count INT NOT NULL DEFAULT 0;

-- stripe_customer_id and subscription_status already exist on org_accounts

-- Idempotency table: one row per processed Stripe event
CREATE TABLE IF NOT EXISTS stripe_processed_events (
    stripe_event_id TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT now()
);
