-- Increase file size limit on certificates bucket to support PDF resume uploads (max 5 MB)
-- Previously may have been set low (for certificate images only)
UPDATE storage.buckets
SET file_size_limit = 5242880  -- 5 MB in bytes
WHERE id = 'certificates';
