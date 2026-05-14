import { supabaseServer } from "@/lib/supabase/server";
import { computeOrgTrust } from "@/shared/logic/orgTrust";

// Types for the verified org check
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

    // ── Fetch org verification ────────────────────────────────────────────
    const { data: orgVerif } = await supabaseServer
        .from("organization_verifications")
        .select("status, type, expires_at, verifier_tier")
        .eq("wallet_address", wallet_address)
        .single();

    if (!orgVerif || orgVerif.status !== "verified" || !isOrgType(orgVerif.type) || isExpired(orgVerif.expires_at)) {
        throw new Error("Wallet is not a verified organization");
    }

    // ── Fetch activity data ───────────────────────────────────────────────
    const [
        { count: attestationsCount },
        { count: hiringCount },
        { data: profile },
    ] = await Promise.all([
        supabaseServer
            .from("attestations")
            .select("*", { count: "exact", head: true })
            .eq("attester_wallet", wallet_address),
        supabaseServer
            .from("hiring_collections")
            .select("*", { count: "exact", head: true })
            .eq("owner_wallet", wallet_address),
        supabaseServer
            .from("profiles")
            .select("bio, website, twitter, discord, github, skills, avatar_url")
            .eq("wallet_address", wallet_address)
            .single()
            .then((r: any) => r),
    ]);

    const result = computeOrgTrust(profile?.data ?? null, {
        type:               orgVerif.type,
        tier:               orgVerif.verifier_tier || 0,
        attestationsGiven:  attestationsCount || 0,
        hiringCollections:  hiringCount       || 0,
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
