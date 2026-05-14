import { supabaseServer } from "@/lib/supabase/server";
import { computeOrgTrust } from "@/shared/logic/orgTrust";

const ORG_TYPES = ["Company / Organization", "Community / DAO"] as const;
type OrgType = typeof ORG_TYPES[number];

function isOrgType(type: string): type is OrgType {
    return ORG_TYPES.includes(type as OrgType);
}

function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() <= Date.now();
}

export async function calculateOrgTrust(wallet_address: string) {
    if (!supabaseServer) throw new Error("Supabase internal error");

    // ── Org verification (+ created_at for tenure) ────────────────────────
    const { data: orgVerif } = await supabaseServer
        .from("organization_verifications")
        .select("status, type, expires_at, verifier_tier, created_at")
        .eq("wallet_address", wallet_address)
        .single();

    if (!orgVerif || orgVerif.status !== "verified" || !isOrgType(orgVerif.type) || isExpired(orgVerif.expires_at)) {
        throw new Error("Wallet is not a verified organization");
    }

    const daysVerified = orgVerif.created_at
        ? Math.floor((Date.now() - new Date(orgVerif.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // ── Parallel: attestations, hiring, profile ────────────────────────────
    const [attestResult, hiringResult, profileResult] = await Promise.all([
        supabaseServer
            .from("attestations")
            .select("receipt_id")
            .eq("attester_wallet", wallet_address),
        supabaseServer
            .from("hiring_collections")
            .select("*", { count: "exact", head: true })
            .eq("owner_wallet", wallet_address),
        supabaseServer
            .from("profiles")
            .select("bio, website, twitter, discord, github, linkedin, skills, avatar_url")
            .eq("wallet_address", wallet_address)
            .single(),
    ]);

    const attestRows   = attestResult.data  || [];
    const hiringCount  = hiringResult.count || 0;
    const profile      = profileResult.data ?? null;

    // ── Unique endorsed: join attestation receipt_ids → receipts wallets ──
    let uniqueEndorsed = 0;
    const receiptIds = [...new Set(attestRows.map((a: any) => a.receipt_id).filter(Boolean))];
    if (receiptIds.length > 0) {
        const { data: walletRows } = await supabaseServer
            .from("receipts")
            .select("wallet_address")
            .in("id", receiptIds);
        uniqueEndorsed = new Set((walletRows || []).map((r: any) => r.wallet_address)).size;
    }

    const result = computeOrgTrust(profile, {
        type:               orgVerif.type,
        tier:               orgVerif.verifier_tier || 0,
        attestationsGiven:  attestRows.length,
        uniqueEndorsed,
        hiringCollections:  hiringCount,
        daysVerified,
    });

    // ── Persist to organization_scores ────────────────────────────────────
    const { error } = await supabaseServer
        .from("organization_scores")
        .upsert({
            wallet_address,
            trust_score:          result.trust_score,
            tier:                 result.tier,
            org_type:             result.org_type,
            base_score:           result.base_score,
            attestations_given:   result.attestations_given,
            unique_endorsed:      result.unique_endorsed,
            hiring_count:         result.hiring_count,
            profile_completeness: result.profile_completeness,
            level:                result.level,
            activity_status:      result.activity_status,
            last_updated:         new Date().toISOString(),
        }, { onConflict: "wallet_address" });

    if (error) {
        console.error("[orgScore] upsert failed:", error.message);
    }

    return { wallet: wallet_address, ...result };
}
