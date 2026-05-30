-- ============================================================
-- Fix: ganti unique constraint member_invitations
-- agar hanya satu invitation PENDING per pasangan,
-- tapi boleh re-invite setelah accepted/rejected/revoked
-- ============================================================

-- Hapus constraint lama yang terlalu ketat
ALTER TABLE member_invitations
    DROP CONSTRAINT IF EXISTS unique_active_invitation;

-- Ganti dengan partial unique index: hanya berlaku saat status = 'pending'
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_invitations_unique_pending
    ON member_invitations (recruiter_wallet, builder_wallet)
    WHERE status = 'pending';
