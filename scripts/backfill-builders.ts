import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backfillBuilders() {
  console.log("🚀 Starting Builder status backfill script...");

  // 1. Fetch all profiles with display_name
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("wallet_address, display_name")
    .not("display_name", "is", null)
    .neq("display_name", "");

  if (pError) throw pError;
  console.log(`🔍 Scanned ${profiles.length} profiles with display names.`);

  // 2. Fetch all existing verifications
  const { data: verifications, error: vError } = await supabase
    .from("organization_verifications")
    .select("wallet_address, type, status");

  if (vError) throw vError;
  const verifMap = new Map(verifications.map(v => [v.wallet_address, v]));

  // 3. Fetch all receipts (proof of work)
  // Logic from api/user/me/route.ts: role must not be null/empty
  const { data: receipts, error: rError } = await supabase
    .from("receipts")
    .select("wallet_address, role")
    .not("role", "is", null)
    .neq("role", "");

  if (rError) throw rError;

  // Group receipts by wallet to count valid proof of work
  const powCounts = new Map<string, number>();
  receipts.forEach(r => {
    // Basic role validation: trim and length check if needed, 
    // but the prompt says role IS NOT NULL and role != ''
    if (r.role && r.role.trim().length > 0) {
      const current = powCounts.get(r.wallet_address) || 0;
      powCounts.set(r.wallet_address, current + 1);
    }
  });

  // Hierarchy as defined in application logic
  const TIER_RANK: Record<string, number> = { 
    "Builder": 1, 
    "Public Figure": 2, 
    "Community / DAO": 3, 
    "Company / Organization": 4 
  };
  const higherTiers = ["Public Figure", "Community / DAO", "Company / Organization", "Community", "Company", "Figure"];

  const eligibleUsers: any[] = [];
  let skippedAlreadyVerified = 0;
  let totalEligible = 0;

  for (const profile of profiles) {
    const wallet = profile.wallet_address;
    const powCount = powCounts.get(wallet) || 0;

    // Eligibility check: Name exists AND PoW count >= 1
    if (powCount >= 1) {
      totalEligible++;
      const current = verifMap.get(wallet);

      if (current) {
        const currentTier = current.type;
        const currentStatus = current.status;

        // Exclusion rules: 
        // 1. Skip if already verified at ANY tier (don't downgrade higher tiers, 
        //    don't re-process already verified builders)
        if (currentStatus === 'verified') {
           skippedAlreadyVerified++;
           continue; 
        }

        // 2. Skip if they have a pending higher tier request (safety)
        if (higherTiers.some(t => currentTier?.includes(t))) {
           skippedAlreadyVerified++;
           continue;
        }
      }

      eligibleUsers.push({
        wallet_address: wallet,
        name: profile.display_name,
        status: "verified",
        type: "Builder", 
        verification_source: "earned",
        approved_at: new Date().toISOString(),
        expires_at: null,
      });
    }
  }

  console.log(`✅ Total eligible users identified: ${totalEligible}`);
  console.log(`⏩ Skipped (already verified at builder or higher): ${skippedAlreadyVerified}`);
  console.log(`📝 Preparing to upsert ${eligibleUsers.length} records...`);

  if (eligibleUsers.length === 0) {
    console.log("No new users to verify. Backfill complete.");
  } else {
    // 4. Action: UPSERT into organization_verifications
    // Using wallet_address as the conflict key
    const { error: upsertError } = await supabase
      .from("organization_verifications")
      .upsert(eligibleUsers, { onConflict: "wallet_address" });

    if (upsertError) {
      console.error("❌ Bulk upsert failed:", upsertError);
    } else {
      console.log(`🎉 Successfully updated ${eligibleUsers.length} users to Verified Builder.`);
    }
  }

  console.log("\n📊 BACKFILL SUMMARY");
  console.log("-------------------");
  console.log(`Total users scanned: ${profiles.length}`);
  console.log(`Total eligible: ${totalEligible}`);
  console.log(`Total records updated: ${eligibleUsers.length}`);
  console.log(`Total skipped (already verified): ${skippedAlreadyVerified}`);
}

backfillBuilders().catch(err => {
  console.error("Fatal error during backfill execution:", err);
  process.exit(1);
});
