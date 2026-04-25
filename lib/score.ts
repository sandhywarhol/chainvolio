import { supabaseServer } from "@/lib/supabase/server";
import { computeReputation, AttestationTierBreakdown } from "@/shared/logic/score";

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

  // Fetch attestation tiers for weighted verification scoring
  let attestationWeights: Map<string, number> | undefined;
  let tierBreakdown: AttestationTierBreakdown | undefined;

  const receiptIds = (receipts || []).map((r: any) => r.id).filter(Boolean);
  if (receiptIds.length > 0) {
    const { data: attestations } = await supabaseServer
      .from("attestations")
      .select("receipt_id, attester_wallet")
      .in("receipt_id", receiptIds);

    if (attestations && attestations.length > 0) {
      const attesterWallets = [...new Set(
        attestations.map((a: any) => a.attester_wallet).filter(Boolean)
      )] as string[];

      const attesterTierMap = new Map<string, string>();
      if (attesterWallets.length > 0) {
        const { data: attesterVerifs } = await supabaseServer
          .from("organization_verifications")
          .select("wallet_address, type, status, expires_at")
          .in("wallet_address", attesterWallets);

        const nowMs = Date.now();
        attesterVerifs?.forEach((v: any) => {
          const active = v.status === "verified" && (!v.expires_at || new Date(v.expires_at).getTime() > nowMs);
          attesterTierMap.set(v.wallet_address, active ? v.type : "unverified");
        });
      }

      attestationWeights = new Map<string, number>();
      tierBreakdown = { company: 0, community: 0, figure: 0, builder: 0, unverified: 0 };

      attestations.forEach((a: any) => {
        const tier = (attesterTierMap.get(a.attester_wallet) || "unverified").toLowerCase();
        let weight = 12;
        if (tier.includes("company") || tier.includes("org"))           { weight = 30; tierBreakdown!.company++; }
        else if (tier.includes("community") || tier.includes("dao"))    { weight = 25; tierBreakdown!.community++; }
        else if (tier.includes("figure") || tier.includes("public"))    { weight = 22; tierBreakdown!.figure++; }
        else if (tier.includes("builder"))                               { weight = 20; tierBreakdown!.builder++; }
        else                                                             { tierBreakdown!.unverified++; }
        attestationWeights!.set(a.receipt_id, weight);
      });
    }
  }

  // Use the shared PURE logic
  const result = computeReputation(profile, receipts || [], attestationWeights, tierBreakdown);

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
