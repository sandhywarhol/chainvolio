-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL REFERENCES wallets(wallet_address) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'hiring', -- e.g. 'hiring', 'system'
    related_id TEXT, -- Links to submission_id, collection_id, or custom key
    link TEXT, -- Direct link to open on click (e.g. /r/slug or /dashboard)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for fast retrieval by user
CREATE INDEX IF NOT EXISTS idx_notifications_wallet ON notifications(wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(wallet_address) WHERE is_read = false;

-- 3. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Grant Permissions
GRANT ALL ON TABLE notifications TO anon, authenticated, service_role;

-- 5. Create Policies
DROP POLICY IF EXISTS "Allow all for notifications" ON notifications;
CREATE POLICY "Allow all for notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- 6. Add Documentation Comment
COMMENT ON TABLE notifications IS 'In-app notifications for hiring updates and system alerts.';
