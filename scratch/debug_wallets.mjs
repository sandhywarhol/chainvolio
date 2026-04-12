import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tlbxjzruyytontxwvwtl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYnhqenJ1eXl0b250eHd2d3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODA3NjUsImV4cCI6MjA4Njc1Njc2NX0.MqFR-Iivn9IevHNY7yvEEVQ1boqwbDb3-NniOXgn3aI';

const supabase = createClient(supabaseUrl, supabaseKey);

const attester = '9XfsmXfYvB7JxNqTcfdp2xMNhY1J1sDbSEX7Macdtjn8';
const candidate = '9uDbCp3Fjro7TS5Jx3VMJ1v34vU5Noae9YqaDUy1DByx';

async function debug() {
    console.log(`\n=== DEBUGGING WALLETS ===\n`);
    console.log(`Attester: ${attester}`);
    console.log(`Candidate: ${candidate}\n`);

    // 1. Check Attester Verification
    const { data: orgData, error: orgError } = await supabase
        .from('organization_verifications')
        .select('*')
        .eq('wallet_address', attester)
        .maybeSingle();

    if (orgError) console.error('Error fetching orgData:', orgError);
    console.log('Attester Verification:', orgData ? JSON.stringify(orgData, null, 2) : 'None found');

    // 2. Check Attester Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('attestation_used, attestation_reset_date, is_verified')
        .eq('wallet_address', attester)
        .maybeSingle();

    if (profileError) console.error('Error fetching profile:', profileError);
    console.log('Attester Profile:', profile ? JSON.stringify(profile, null, 2) : 'None found');

    // 3. Check for Reciprocity
    // First, find all receipts of attester
    const { data: attesterReceipts } = await supabase
        .from('receipts')
        .select('id')
        .eq('wallet_address', attester);

    if (attesterReceipts && attesterReceipts.length > 0) {
        const ids = attesterReceipts.map(r => r.id);
        const { data: reciprocal } = await supabase
            .from('attestations')
            .select('id, receipt_id')
            .eq('attester_wallet', candidate)
            .in('receipt_id', ids);
        
        console.log('Reciprocal Attestations (Candidate -> Attester):', reciprocal && reciprocal.length > 0 ? JSON.stringify(reciprocal, null, 2) : 'None');
    } else {
        console.log('Attester has no receipts, reciprocity check skipped.');
    }
}

debug();
