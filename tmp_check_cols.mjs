import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: cols } = await supabase
        .from('hiring_collections')
        .select('id, title, slug, created_at')
        .order('created_at', { ascending: false });

    console.log("Found collections:");
    console.log(cols);
}

main();
