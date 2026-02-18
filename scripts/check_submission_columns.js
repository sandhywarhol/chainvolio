
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local manually to ensure correct path
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables from .env.local');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log("Checking columns for 'collection_submissions'...");

    // Try to select the specific columns
    const { data, error } = await supabase
        .from('collection_submissions')
        .select('id, recruiter_status, recruiter_notes')
        .limit(1);

    if (error) {
        console.error("Error fetching columns:", error.message);
        console.log("Error details:", error);

        if (error.code === 'PGRST100') { // PostgREST error for unknown column often manifests as parsing error or similar
            console.log("This strongly suggests that 'recruiter_status' or 'recruiter_notes' columns do not exist.");
        }
    } else {
        console.log("Success! Columns exist.");
        console.log("Data sample:", data);
    }
}

checkColumns();
