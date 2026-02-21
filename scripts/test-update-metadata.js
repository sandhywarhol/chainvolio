
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMetadata() {
    const slug = 'web3-game-development-solana-15eyo';

    console.log('Updating metadata for:', slug);
    const { data, error } = await supabase
        .from('hiring_collections')
        .update({
            metadata: {
                roleType: "Full-time",
                workMode: "Remote",
                experienceLevel: "Senior",
                compensationType: "Crypto + Equity",
                focusAreas: ["on_chain", "github", "dao"]
            }
        })
        .eq('slug', slug)
        .select();

    if (error) {
        console.error('Error updating:', error);
    } else {
        console.log('Update successful:', JSON.stringify(data, null, 2));
    }
}

updateMetadata();
