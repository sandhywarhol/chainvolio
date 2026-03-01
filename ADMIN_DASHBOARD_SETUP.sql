-- Enhance Organization Verifications Table
ALTER TABLE organization_verifications 
ADD COLUMN IF NOT EXISTS verifier_tier INTEGER DEFAULT 1, -- 1 = Default, 2 = Verified Org
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Admin Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization_verifications(id) ON DELETE SET NULL,
    organization_name TEXT,
    action TEXT NOT NULL, -- 'approved', 'rejected'
    admin_wallet TEXT NOT NULL,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Audit Logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins (service_role) can read or write logs for now
CREATE POLICY "Admin only log access" 
ON admin_audit_logs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
