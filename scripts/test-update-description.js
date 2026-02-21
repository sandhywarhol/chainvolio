
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCollection() {
    const slug = 'web3-game-development-solana-15eyo';

    // First, try to add the column via RPC if possible, or just try to update
    // Since I can't run arbitrary SQL on Supabase easily without a direct connection 
    // or a pre-existing RPC, I'll just try to update the description.

    console.log('Updating description for:', slug);
    const { data, error } = await supabase
        .from('hiring_collections')
        .update({
            description: "Work with our core team to build the future of Web3 gaming on Solana. \n\nLooking for developers with experience in Anchor, React, and Game Engines."
        })
        .eq('slug', slug)
        .select();

    if (error) {
        console.error('Error updating:', error);
    } else {
        console.log('Update successful:', data);
    }
}

updateCollection();
