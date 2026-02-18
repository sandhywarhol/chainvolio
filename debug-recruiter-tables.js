require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-client');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking hiring_collections table...');
    const { data, error } = await supabase
        .from('hiring_collections')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error checking hiring_collections:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('\n!!! ACTION REQUIRED: You need to run the SQL in ADD_RECRUITER_FEATURE.sql inside your Supabase SQL Editor !!!');
        }
    } else {
        console.log('hiring_collections table exists.');
    }

    console.log('\nChecking collection_submissions table...');
    const { error: subError } = await supabase
        .from('collection_submissions')
        .select('count', { count: 'exact', head: true });

    if (subError) {
        console.error('Error checking collection_submissions:', subError.message);
    } else {
        console.log('collection_submissions table exists.');
    }
}

checkTables();
