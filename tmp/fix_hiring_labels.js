
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

async function fixDisplayLogic() {
  console.log("Fixing display logic for existing hiring proofs...");
  
  // 1. Find all hiring receipts
  const { data: receipts, error: receiptsError } = await supabase
    .from('receipts')
    .select('*, attestations(*)')
    .ilike('description', '%Official Verified Hiring Proof%');

  if (receiptsError) {
    console.error("Error fetching receipts:", receiptsError);
    return;
  }

  console.log(`Found ${receipts.length} hiring records to check.`);

  for (const receipt of receipts) {
    // Find the original submission to get the correct title and recruiter org
    const { data: submission } = await supabase
      .from('collection_submissions')
      .select('*, hiring_collections(owner_wallet, title)')
      .eq('tx_signature', receipt.tx_signature)
      .single();

    if (submission) {
      const jobTitle = submission.hiring_collections.title;
      const recruiterWallet = submission.hiring_collections.owner_wallet;

      const { data: recProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('wallet_address', recruiterWallet)
        .single();

      const recruiterOrg = recProfile?.organization || jobTitle; // Fallback

      console.log(`Updating record ${receipt.id}:`);
      console.log(`  Old: ${receipt.role} at ${receipt.org}`);
      console.log(`  New: ${jobTitle} at ${recruiterOrg}`);

      const { error: updateError } = await supabase
        .from('receipts')
        .update({
          role: jobTitle,
          org: recruiterOrg,
          description: `Official Verified Hiring Proof for ${jobTitle}. Recruiter Review anchored via ChainVolio Hirsch-Talent framework.`
        })
        .eq('id', receipt.id);

      if (updateError) {
        console.error(`  Failed to update receipt ${receipt.id}:`, updateError);
      } else {
        console.log(`  Successfully updated receipt ${receipt.id}!`);
      }

      // Also update the attestation comment if needed
      if (receipt.attestations && receipt.attestations.length > 0) {
        for (const att of receipt.attestations) {
           await supabase
            .from('attestations')
            .update({
              comment: `Recruitment Decision Confirmed for ${jobTitle}`
            })
            .eq('id', att.id);
        }
      }
    } else {
      console.log(`Could not find parent submission for receipt ${receipt.id}. Skipping.`);
    }
  }
}

fixDisplayLogic();
