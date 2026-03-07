import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // IDs of the two older duplicated collections
    const idsToDelete = [
        '339796fd-3535-4079-abcc-9b242f372577',
        'e4d13123-090a-44e6-bf1c-807e089eb42c'
    ];

    // Delete them
    const { error } = await supabase
        .from('hiring_collections')
        .delete()
        .in('id', idsToDelete);

    if (error) {
        console.error("Failed:", error);
    } else {
        console.log("Successfully deleted duplicate collections.");
    }
}
main();
