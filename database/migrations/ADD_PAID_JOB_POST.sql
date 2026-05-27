-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: ADD_PAID_JOB_POST
-- Adds tracking for job posts paid via the x402 HTTP 402 payment protocol.
-- Non-subscribed users who exceed their 2 free posts can pay $2 USDC per post.
-- ─────────────────────────────────────────────────────────────────────────────

-- Mark whether this collection was created via x402 payment (paid post)
ALTER TABLE hiring_collections
    ADD COLUMN IF NOT EXISTS is_paid_job_post BOOLEAN DEFAULT FALSE;

-- Index for analytics / billing queries on paid posts
CREATE INDEX IF NOT EXISTS idx_hiring_collections_is_paid
    ON hiring_collections(is_paid_job_post)
    WHERE is_paid_job_post = TRUE;
