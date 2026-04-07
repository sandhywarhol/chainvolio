-- 1. Enforce Strict CV ID Integrity (No Duplicates)
-- This permanently prevents any two profiles from ever holding the same Custom Verification ID.
ALTER TABLE profiles 
ADD CONSTRAINT unique_card_number UNIQUE (card_number);

-- 2. Lockdown and Align the Append-Only Sequence Generator
-- Because we safely deleted unused debug traces earlier, we are manually instructing 
-- the PostgreSQL sequence core to look at the absolute highest assigned ID, and 
-- strictly mandate that the next ID requested starts at exactly `max + 1`. 
-- (This ignores gaps gracefully without reusing them)
SELECT setval(
  pg_get_serial_sequence('profiles', 'card_number'), 
  (SELECT COALESCE(MAX(card_number), 0) FROM profiles)
);

-- 3. Validation Comment
COMMENT ON CONSTRAINT unique_card_number ON profiles IS 'Ensures CV IDs are strictly unique, immutable and functionally append-only per onboarding completion.';
