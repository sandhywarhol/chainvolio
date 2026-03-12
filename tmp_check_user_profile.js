
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local for credentials
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
    console.log("Searching for profiles with wallet starting with FwHt and ending with GcMv...");
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('wallet_address', 'FwHt%GcMv');

    if (error) {
        console.error("Error fetching profile:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Found profile(s):");
        data.forEach(p => {
            console.log(`Wallet: ${p.wallet_address}`);
            console.log(`Display Name: ${p.display_name}`);
            console.log(`Headline (Current Role): ${p.headline}`);
            console.log(`Organization: ${p.organization}`);
            console.log("Full data:", JSON.stringify(p, null, 2));
        });
    } else {
        console.log("No profile found matching that wallet address pattern.");
    }
}

checkProfile();
