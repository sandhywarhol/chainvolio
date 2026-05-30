import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/members/public?recruiterWallet=xxx
// Returns public-safe member list (name, avatar, card_number only) for public org page
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const recruiterWallet = searchParams.get("recruiterWallet");

    if (!recruiterWallet) return err("ERR_WALLET", "recruiterWallet required");

    const { data: members, error } = await supabase
        .from("company_members")
        .select("id, builder_wallet, role, joined_at")
        .eq("recruiter_wallet", recruiterWallet)
        .eq("status", "active")
        .order("joined_at", { ascending: true });

    if (error) return err("ERR_FETCH", "Failed to fetch members", 500);

    if (!members || members.length === 0) {
        return NextResponse.json({ ok: true, data: [] });
    }

    // Enrich with public profile info only
    const wallets = members.map((m) => m.builder_wallet);
    const { data: profiles } = await supabase
        .from("profiles")
        .select("wallet_address, display_name, avatar_url, card_number")
        .in("wallet_address", wallets);

    const profileMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.wallet_address, p])
    );

    const enriched = members.map((m) => ({
        id: m.id,
        role: m.role,
        joined_at: m.joined_at,
        display_name: profileMap[m.builder_wallet]?.display_name ?? null,
        avatar_url: profileMap[m.builder_wallet]?.avatar_url ?? null,
        card_number: profileMap[m.builder_wallet]?.card_number ?? null,
        wallet_address: m.builder_wallet,
    }));

    return NextResponse.json({ ok: true, data: enriched });
}
