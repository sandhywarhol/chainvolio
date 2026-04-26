import { supabaseServer } from "@/lib/supabase/server";
import { validateApiKey } from "@/lib/apiAuth";
import { calculateScore } from "@/lib/score";
import { corsJson, handleOptions } from "@/lib/cors";

const MAX_BATCH_SIZE = 50;

export async function OPTIONS() {
    return handleOptions();
}

export async function POST(request: Request) {
    try {
        const auth = await validateApiKey(request);
        if (!auth.valid) {
            return corsJson({ error: auth.error }, { status: auth.status });
        }

        const { wallets } = await request.json();

        if (!wallets || !Array.isArray(wallets)) {
            return corsJson(
                { error: "Invalid input. Expected { wallets: string[] }" },
                { status: 400 }
            );
        }

        if (wallets.length > MAX_BATCH_SIZE) {
            return corsJson(
                { error: `Batch size too large. Maximum is ${MAX_BATCH_SIZE} wallets per request.` },
                { status: 400 }
            );
        }

        if (!supabaseServer) {
            return corsJson({ error: "DB Error" }, { status: 500 });
        }

        // Fetch all cached scores in one query
        const { data: cached, error } = await supabaseServer
            .from("scores")
            .select("*")
            .in("wallet_address", wallets);

        if (error) {
            return corsJson({ error: error.message }, { status: 500 });
        }

        const now = Date.now();
        const cacheMap = new Map(
            (cached || [])
                .filter(s => (now - new Date(s.last_updated).getTime()) < 24 * 60 * 60 * 1000)
                .map(s => [s.wallet_address, s])
        );

        // Identify wallets with no valid cache — compute them concurrently
        const missing = wallets.filter(w => !cacheMap.has(w));
        if (missing.length > 0) {
            const computed = await Promise.allSettled(missing.map(w => calculateScore(w)));
            computed.forEach((result, i) => {
                if (result.status === "fulfilled" && result.value) {
                    // calculateScore returns a shaped object, store it under the wallet key
                    cacheMap.set(missing[i], { ...result.value, wallet_address: missing[i], _computed: true });
                }
            });
        }

        const result = wallets.map((address) => {
            const record = cacheMap.get(address);
            if (!record) return { wallet: address, error: "Score not found" };

            // Handle both DB record shape and calculateScore return shape
            const isComputed = (record as any)._computed;
            if (isComputed) {
                return record; // already shaped by calculateScore
            }

            return {
                wallet: record.wallet_address,
                score: record.total_score,
                level: record.level || "Beginner",
                domain_scores: record.domain_scores || {},
                activity_status: record.activity_status || "active",
                confidence: record.confidence || 0,
                confidence_label: record.confidence_label || "Low",
                trust_score: record.trust_score || 0,
                reason: record.reason || "Building reputation",
                last_updated: record.last_updated,
                breakdown: {
                    experience: record.experience_score,
                    verification: record.verification_score,
                    consistency: record.consistency_score,
                    skill: record.skill_score,
                    activity: record.activity_score,
                },
            };
        });

        return corsJson(result);

    } catch (error: any) {
        console.error("Batch score error:", error);
        return corsJson({ error: error.message }, { status: 500 });
    }
}
