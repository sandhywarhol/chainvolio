
const { createClient } = require('@supabase/supabase-client');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase
        .from('attestations')
        .select('id, tx_signature, attester_wallet')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    console.log('Latest Attestations:');
    console.table(data);
}

check();
