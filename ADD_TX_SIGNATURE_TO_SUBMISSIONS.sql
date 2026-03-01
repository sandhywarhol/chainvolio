-- Add tx_signature to collection_submissions for recruiter reviews
ALTER TABLE collection_submissions ADD COLUMN IF NOT EXISTS tx_signature TEXT;
