-- Fix role column collision by adding professional_role for job titles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_role TEXT;

-- Clear legacy data from the enum-based role column to ensure it doesn't interfere
-- Note: 'talent' is the default, so we keep it or let it be.
-- But for the professional field, we use the new column.
COMMENT ON COLUMN profiles.professional_role IS 'Current or primary job title (e.g. CEO, Developer)';
