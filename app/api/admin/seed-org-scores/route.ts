import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { calculateOrgTrust } from "@/lib/orgScore";

export const dynamic = "force-dynamic";

const ORG_TYPES = ["Company / Organization", "Community / DAO"];

export async function GET(req: NextRequest) {
    if (!supabaseServer) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const secret = req.nextUrl.searchParams.get("secret");
    if (secret !== "chainvolio-seed-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all active verified orgs
        const { data: verifiedOrgs, error } = await supabaseServer
            .from("organization_verifications")
            .select("wallet_address, type, verifier_tier, expires_at")
            .eq("status", "verified")
            .in("type", ORG_TYPES);

        if (error) throw error;
        if (!verifiedOrgs?.length) {
            return NextResponse.json({ ok: true, message: "No verified orgs found", processed: 0 });
        }

        // Filter out expired verifications
        const now = new Date();
        const activeOrgs = verifiedOrgs.filter(
            (v) => !v.expires_at || new Date(v.expires_at) > now
        );

        console.log(`[seed-org-scores] Processing ${activeOrgs.length} active verified orgs`);

        const results: { wallet: string; type: string; trust_score: number; level: string; error?: string }[] = [];

        for (const org of activeOrgs) {
            try {
                const result = await calculateOrgTrust(org.wallet_address);
                results.push({
                    wallet:      org.wallet_address,
                    type:        org.type,
                    trust_score: result.trust_score,
                    level:       result.level,
                });
                console.log(`[seed-org-scores] ✓ ${org.wallet_address.slice(0, 8)}… [${org.type}] → ${result.trust_score} (${result.level})`);
            } catch (err: any) {
                console.error(`[seed-org-scores] ✗ ${org.wallet_address.slice(0, 8)}: ${err.message}`);
                results.push({ wallet: org.wallet_address, type: org.type, trust_score: 0, level: "—", error: err.message });
            }
        }

        const succeeded = results.filter((r) => !r.error).length;
        const failed    = results.filter((r) =>  r.error).length;

        return NextResponse.json({
            ok: true,
            message: `Seeded ${succeeded} org trust scores (${failed} failed)`,
            processed: results.length,
            results,
        });

    } catch (err: any) {
        console.error("[seed-org-scores] Fatal:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
