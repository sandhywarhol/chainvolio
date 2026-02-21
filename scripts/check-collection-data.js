
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCollection() {
    const slug = 'web3-game-development-solana-15eyo';
    const { data, error } = await supabase
        .from('hiring_collections')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching collection:', error);
    } else {
        console.log('Collection data:', JSON.stringify(data, null, 2));
    }
}

checkCollection();
