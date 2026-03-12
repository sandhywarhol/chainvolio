
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixOrphans() {
  console.log("Checking for 'syncing' hiring memos...");
  
  // 1. Find receipts with the specific hiring description that don't have an attestation
  const { data: receipts, error: receiptsError } = await supabase
    .from('receipts')
    .select('id, wallet_address, tx_signature, role, org, description')
    .ilike('description', '%Official Verified Hiring Proof%');

  if (receiptsError) {
    console.error("Error fetching receipts:", receiptsError);
    return;
  }

  console.log(`Found ${receipts.length} hiring receipts. Checking for missing attestations...`);

  for (const receipt of receipts) {
    const { data: attestation, error: attDataError } = await supabase
      .from('attestations')
      .select('id')
      .eq('receipt_id', receipt.id)
      .single();

    if (attDataError && attDataError.code === 'PGRST116') { // Not found
      console.log(`Found orphan receipt: ${receipt.id} (${receipt.role} at ${receipt.org})`);
      
      // We need to know who the recruiter was.
      // Usually the recruiter is the one who signed the tx_signature.
      // But we can try to find the submission to get the recruiter.
      
      const { data: submission } = await supabase
        .from('collection_submissions')
        .select('*, hiring_collections(owner_wallet, title)')
        .eq('tx_signature', receipt.tx_signature)
        .single();

      if (submission) {
        const recruiterWallet = submission.hiring_collections.owner_wallet;
        console.log(`Found matching submission. Recruiter: ${recruiterWallet}`);

        const { data: recProfile } = await supabase
          .from('profiles')
          .select('display_name, headline, organization')
          .eq('wallet_address', recruiterWallet)
          .single();

        const { error: insertError } = await supabase
          .from('attestations')
          .insert({
            receipt_id: receipt.id,
            attester_wallet: recruiterWallet,
            signature: receipt.tx_signature,
            attester_name: recProfile?.display_name || "Verified Recruiter",
            attester_role: recProfile?.headline || "Hiring Lead",
            attester_org: recProfile?.organization || submission.hiring_collections.title || "On-chain Organization",
            attestation_type: "Hiring Proof",
            tx_signature: receipt.tx_signature,
            confidence_level: "Confirmed",
            comment: `Recruitment Decision Confirmed for ${receipt.role}`,
            memo_issued_at: receipt.created_at || new Date().toISOString()
          });

        if (insertError) {
          console.error(`Failed to fix receipt ${receipt.id}:`, insertError);
        } else {
          console.log(`Successfully fixed receipt ${receipt.id}!`);
        }
      } else {
        console.log(`Could not find submission for ${receipt.tx_signature}. Skipping.`);
      }
    }
  }
}

fixOrphans();
