import { supabaseServer } from "@/lib/supabase/server";
import { computeReputation } from "@/shared/logic/score";

export async function calculateScore(wallet_address: string, preFetchedData?: { profile?: any, receipts?: any[] }) {
  if (!supabaseServer) throw new Error("Supabase internal error");

  // Fetch data if not provided
  const profile = preFetchedData?.profile || (await supabaseServer
    .from("profiles")
    .select("*")
    .eq("wallet_address", wallet_address)
    .single()).data;

  const receipts = preFetchedData?.receipts || (await supabaseServer
    .from("receipts")
    .select("*")
    .eq("wallet_address", wallet_address)).data;

  // Use the shared PURE logic
  const result = computeReputation(profile, receipts || []);

  // Sync side-effects (Server-only)
  const { error } = await supabaseServer
    .from("scores")
    .upsert({
      wallet_address,
      total_score: result.score,
      experience_score: result.breakdown.experience,
      verification_score: result.breakdown.verification,
      consistency_score: result.breakdown.consistency,
      skill_score: result.breakdown.skill,
      activity_score: result.breakdown.activity,
      level: result.level,
      domain_scores: result.domains,
      top_domain: result.top_domain,
      activity_status: result.activity_status,
      confidence: result.confidence,
      confidence_label: result.confidence_label,
      trust_score: result.trust_score,
      reason: result.reason,
    }, { onConflict: "wallet_address" });
    
  if (error) {
     console.error("Score upsert failed (ignore if table missing):", error.message);
  }

  return {
    wallet: wallet_address,
    ...result
  };
}
