-- Run this in Supabase > SQL Editor

-- 1. Add avatar_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
-- We do NOT need to enable RLS on storage.objects as it is enabled by default and owned by the system.

-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Update" ON storage.objects;

-- Allow public read of avatars
CREATE POLICY "Avatar Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow public upload (MVP: authenticating via wallet signature separately, allowing upload here)
CREATE POLICY "Avatar Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' );

-- Allow public update
CREATE POLICY "Avatar Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' );
