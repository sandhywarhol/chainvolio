import { calculateScore }    from "@/lib/score";
import { calculateOrgTrust } from "@/lib/orgScore";
import { supabaseServer }    from "@/lib/supabase/server";
import { validateApiKey }    from "@/lib/apiAuth";
import { corsJson, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
    return handleOptions();
}

const ORG_TYPES = ["Company / Organization", "Community / DAO"];
const CACHE_HOURS = 24;

function isStale(lastUpdated: string): boolean {
    return (Date.now() - new Date(lastUpdated).getTime()) >= CACHE_HOURS * 60 * 60 * 1000;
}

export async function GET(
    request: Request,
    { params }: { params: { address: string } }
) {
    try {
        const { address } = params;

        const apiKey = request.headers.get("x-api-key");
        if (apiKey) {
            const auth = await validateApiKey(request);
            if (!auth.valid) return corsJson({ error: auth.error }, { status: auth.status });
        }

        if (!supabaseServer) return corsJson({ error: "DB Error" }, { status: 500 });

        // ── Detect entity type ────────────────────────────────────────────
        const { data: orgVerif } = await supabaseServer
            .from("organization_verifications")
            .select("status, type, expires_at")
            .eq("wallet_address", address)
            .single();

        const isOrg =
            orgVerif?.status === "verified" &&
            ORG_TYPES.includes(orgVerif.type) &&
            (!orgVerif.expires_at || new Date(orgVerif.expires_at).getTime() > Date.now());

        // ── Organization: read from organization_scores ───────────────────
        if (isOrg) {
            const { data: cached } = await supabaseServer
                .from("organization_scores")
                .select("*")
                .eq("wallet_address", address)
                .single();

            if (cached && !isStale(cached.last_updated)) {
                return corsJson({
                    wallet:          cached.wallet_address,
                    entity_type:     "organization",
                    score:           cached.trust_score,
                    trust_score:     cached.trust_score,
                    tier:            cached.tier,
                    org_type:        cached.org_type,
                    level:           cached.level,
                    activity_status: cached.activity_status,
                    confidence:      1.0,
                    confidence_label:"High",
                    domain_scores:   { organization: cached.trust_score },
                    last_updated:    cached.last_updated,
                    breakdown: {
                        base:         cached.base_score,
                        attestations: cached.attestations_given,
                        hiring:       cached.hiring_count,
                        profile:      cached.profile_completeness,
                    },
                });
            }

            const freshData = await calculateOrgTrust(address);
            return corsJson({ ...freshData, entity_type: "organization" });
        }

        // ── Individual: read from scores ──────────────────────────────────
        const { data: cached } = await supabaseServer
            .from("scores")
            .select("*")
            .eq("wallet_address", address)
            .single();

        if (cached && !isStale(cached.last_updated)) {
            return corsJson({
                wallet:          cached.wallet_address,
                entity_type:     "individual",
                score:           cached.total_score,
                domain_scores:   cached.domain_scores || {},
                level:           cached.level         || "Beginner",
                activity_status: cached.activity_status || "active",
                confidence:      cached.confidence    || 0,
                confidence_label:cached.confidence_label || "Low",
                trust_score:     cached.trust_score   || 0,
                reason:          cached.reason        || "Building reputation",
                last_updated:    cached.last_updated,
                breakdown: {
                    experience:   cached.experience_score,
                    verification: cached.verification_score,
                    consistency:  cached.consistency_score,
                    skill:        cached.skill_score,
                    activity:     cached.activity_score,
                },
            });
        }

        const freshData = await calculateScore(address);
        return corsJson({ ...freshData, entity_type: "individual" });

    } catch (error: any) {
        console.error("[score API]", error);
        return corsJson({ error: error.message }, { status: 500 });
    }
}
