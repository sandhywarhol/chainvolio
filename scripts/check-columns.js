
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase
        .rpc('get_table_info', { table_name: 'hiring_collections' });

    // Fallback if rpc doesn't exist
    if (error) {
        const { data: cols, error: colError } = await supabase
            .from('hiring_collections')
            .select('*')
            .limit(1);

        if (colError) {
            console.error('Error:', colError);
        } else {
            console.log('Columns in hiring_collections:', Object.keys(cols[0] || {}));
        }
    } else {
        console.log('Table info:', data);
    }
}

checkColumns();
