import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/members?recruiterWallet=xxx
// recruiterWallet = actual wallet address (wallet user) or "gauth:{uid}" (Google user)
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const recruiterWallet = searchParams.get("recruiterWallet");

    if (!recruiterWallet) return err("ERR_AUTH", "recruiterWallet required");

    const { data: members, error } = await supabase
        .from("company_members")
        .select("id, builder_wallet, role, status, joined_at")
        .eq("recruiter_wallet", recruiterWallet)
        .eq("status", "active")
        .order("joined_at", { ascending: false });

    if (error) return err("ERR_FETCH", "Failed to fetch members", 500);

    // Enrich with builder profile info
    const wallets = members?.map((m) => m.builder_wallet) ?? [];
    let profiles: Record<string, { display_name: string; avatar_url: string; card_number: number }> = {};

    if (wallets.length > 0) {
        const { data: profileRows } = await supabase
            .from("profiles")
            .select("wallet_address, display_name, avatar_url, card_number")
            .in("wallet_address", wallets);

        for (const p of profileRows ?? []) {
            profiles[p.wallet_address] = p;
        }
    }

    const enriched = (members ?? []).map((m) => ({
        ...m,
        profile: profiles[m.builder_wallet] ?? null,
    }));

    return NextResponse.json({ ok: true, data: enriched });
}
