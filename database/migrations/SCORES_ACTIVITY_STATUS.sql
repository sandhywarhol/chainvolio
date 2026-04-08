-- ADD ACTIVITY STATUS TO SCORES TABLE
-- Support Activity Decay Logic

ALTER TABLE scores
ADD COLUMN IF NOT EXISTS activity_status TEXT DEFAULT 'active';
