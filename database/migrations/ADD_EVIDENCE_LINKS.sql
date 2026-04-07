-- Run this in Supabase > SQL Editor

-- Add evidence_links JSONB column to receipts table
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS evidence_links JSONB DEFAULT '[]'::jsonb;
