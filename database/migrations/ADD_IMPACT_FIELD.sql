-- Add impact field to receipts table for outcome/achievement tracking
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS impact JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN receipts.impact IS 'Array of impact statements (max 2), e.g., ["Launched MVP with 1,000+ users", "Open-sourced core contracts"]';
