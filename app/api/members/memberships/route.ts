import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/members/memberships?builderWallet=xxx
// Returns all active memberships for a builder (used for badges and shared-hiring context)
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const builderWallet = searchParams.get("builderWallet");

    if (!builderWallet) return err("ERR_WALLET", "builderWallet required");

    const { data, error } = await supabase
        .from("company_members")
        .select("id, recruiter_wallet, company_name, role, joined_at, recruiter_avatar_url")
        .eq("builder_wallet", builderWallet)
        .eq("status", "active")
        .order("joined_at", { ascending: true });

    if (error) return err("ERR_FETCH", "Failed to fetch memberships", 500);

    return NextResponse.json({ ok: true, data: data ?? [] });
}
