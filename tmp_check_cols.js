
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function checkColumns() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
    // If rpc doesn't exist, we can try a direct query to information_schema
    if (error) {
        const { data: cols, error: err2 } = await supabase.from('profiles').select('*').limit(1);
        if (err2) {
            console.error("Error:", err2);
        } else {
            console.log("Columns in profiles:", Object.keys(cols[0]));
        }
    } else {
        console.log("Columns:", data);
    }
}

checkColumns();
