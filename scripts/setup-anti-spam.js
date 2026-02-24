require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials (SUPABASE_SERVICE_ROLE_KEY is required for setup)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    console.log("Setting up Anti-Abuse Infrastructure...");

    const sql = `
    CREATE TABLE IF NOT EXISTS submission_activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ip_hash TEXT NOT NULL,
        wallet_address TEXT NOT NULL,
        action TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_activity_ip_action ON submission_activity_logs(ip_hash, action, created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_wallet_action ON submission_activity_logs(wallet_address, action, created_at);

    ALTER TABLE submission_activity_logs ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Server can record activity" ON submission_activity_logs;
    
    CREATE POLICY "Server can record activity" ON submission_activity_logs FOR INSERT WITH CHECK (true);
    
    GRANT INSERT ON submission_activity_logs TO anon, authenticated, service_role;
    GRANT SELECT ON submission_activity_logs TO service_role;
    `;

    console.log("Please run the following SQL in your Supabase SQL Editor:");
    console.log("---------------------------------------------------------");
    console.log(sql);
    console.log("---------------------------------------------------------");

    // Attempting to run via RPC if a generic 'exec_sql' exists (unlikely by default)
    // Most people just use the dashboard.
}

setup();
