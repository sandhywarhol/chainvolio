import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/members/shared-hirings?builderWallet=xxx
// Returns all hiring collections from companies where this builder is an active member.
// recruiter_wallet in company_members matches owner_wallet in hiring_collections
// (both use the same canonical format: actual wallet or "gauth:{uid}")
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const builderWallet = searchParams.get("builderWallet");

    if (!builderWallet) return err("ERR_WALLET", "builderWallet required");

    // Get all companies this builder is an active member of
    const { data: memberships } = await supabase
        .from("company_members")
        .select("recruiter_wallet, company_name, role, recruiter_avatar_url")
        .eq("builder_wallet", builderWallet)
        .eq("status", "active");

    if (!memberships || memberships.length === 0) {
        return NextResponse.json({ ok: true, data: [] });
    }

    // recruiter_wallet === hiring_collections.owner_wallet (same canonical format)
    const ownerWallets = memberships.map((m) => m.recruiter_wallet);

    const { data: collections, error } = await supabase
        .from("hiring_collections")
        .select("id, title, slug, created_at, metadata, owner_wallet")
        .in("owner_wallet", ownerWallets)
        .order("created_at", { ascending: false });

    if (error) return err("ERR_FETCH", "Failed to fetch shared hirings", 500);

    // Attach company membership info to each collection
    const membershipMap = Object.fromEntries(
        memberships.map((m) => [m.recruiter_wallet, m])
    );

    const enriched = (collections ?? []).map((c) => ({
        ...c,
        company: membershipMap[c.owner_wallet] ?? null,
    }));

    return NextResponse.json({ ok: true, data: enriched });
}
