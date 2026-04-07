-- Add metadata column to hiring_collections to store extended role details
ALTER TABLE hiring_collections ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
