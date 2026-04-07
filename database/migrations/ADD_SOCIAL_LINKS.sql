-- Add social link columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS discord TEXT;
