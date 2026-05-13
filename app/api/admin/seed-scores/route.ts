import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { calculateScore } from "@/lib/score";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    if (!supabaseServer) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const secret = req.nextUrl.searchParams.get("secret");
    if (secret !== "chainvolio-seed-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get all non-test profiles
        const { data: profiles } = await supabaseServer
            .from("profiles")
            .select("wallet_address, display_name")
            .eq("is_test", false);

        const walletsToScore = [...new Set((profiles || []).map((p: any) => p.wallet_address))];
        console.log(`[seed-scores] Processing ${walletsToScore.length} total profiles`);

        const nameMap = new Map((profiles || []).map((p: any) => [p.wallet_address, p.display_name]));

        // Calculate real scores for ALL wallets using the platform's calculateScore
        const results: { wallet: string; name?: string; score: number; level?: string; error?: string }[] = [];

        for (const wallet of walletsToScore) {
            try {
                const result = await calculateScore(wallet);
                results.push({ wallet, name: nameMap.get(wallet), score: result.score, level: result.level });
                console.log(`[seed-scores] ✓ ${nameMap.get(wallet) || wallet.toString().slice(0,8)} → ${result.score} (${result.level})`);
            } catch (err: any) {
                console.error(`[seed-scores] ✗ ${wallet.toString().slice(0,8)}: ${err.message}`);
                results.push({ wallet: wallet.toString(), score: 0, error: err.message });
            }
        }

        return NextResponse.json({ ok: true, processed: results.length, results });
    } catch (error: any) {
        console.error("[seed-scores] Fatal error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
