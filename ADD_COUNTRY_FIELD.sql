-- Add country field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country TEXT;
