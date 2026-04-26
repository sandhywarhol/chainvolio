import { calculateScore } from "@/lib/score";
import { supabaseServer } from "@/lib/supabase/server";
import { validateApiKey } from "@/lib/apiAuth";
import { corsJson, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(
    request: Request,
    { params }: { params: { address: string } }
) {
    try {
        const { address } = params;

        // Score data is public — allow unauthenticated access.
        // Validate API key when provided so external devs get usage tracked.
        const apiKey = request.headers.get("x-api-key");
        if (apiKey) {
            const auth = await validateApiKey(request);
            if (!auth.valid) {
                return corsJson({ error: auth.error }, { status: auth.status });
            }
        }

        if (!supabaseServer) {
            return corsJson({ error: "DB Error" }, { status: 500 });
        }

        // Attempt to get cached score first
        const { data: scoreRecord } = await supabaseServer
            .from("scores")
            .select("*")
            .eq("wallet_address", address)
            .single();

        if (scoreRecord) {
            const lastUpdated = new Date(scoreRecord.last_updated).getTime();
            const hoursDiff = (Date.now() - lastUpdated) / (1000 * 60 * 60);

            if (hoursDiff < 24) {
                return corsJson({
                    wallet: scoreRecord.wallet_address,
                    score: scoreRecord.total_score,
                    domain_scores: scoreRecord.domain_scores || {},
                    level: scoreRecord.level || "Beginner",
                    activity_status: scoreRecord.activity_status || "active",
                    confidence: scoreRecord.confidence || 0,
                    confidence_label: scoreRecord.confidence_label || "Low",
                    trust_score: scoreRecord.trust_score || 0,
                    reason: scoreRecord.reason || "Building reputation",
                    last_updated: scoreRecord.last_updated,
                    breakdown: {
                        experience: scoreRecord.experience_score,
                        verification: scoreRecord.verification_score,
                        consistency: scoreRecord.consistency_score,
                        skill: scoreRecord.skill_score,
                        activity: scoreRecord.activity_score,
                    },
                });
            }
        }

        // No cached score or stale — recompute
        const scoreData = await calculateScore(address);
        return corsJson(scoreData);

    } catch (error: any) {
        console.error("Error fetching score:", error);
        return corsJson({ error: error.message }, { status: 500 });
    }
}
