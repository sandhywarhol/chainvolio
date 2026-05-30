import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/members/invitations?builderWallet=xxx
// List pending invitations for a builder (inbox)
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const builderWallet = searchParams.get("builderWallet");

    if (!builderWallet) return err("ERR_WALLET", "builderWallet required");

    const { data: invitations, error } = await supabase
        .from("member_invitations")
        .select("id, recruiter_wallet, recruiter_company, recruiter_avatar_url, role, status, created_at, expires_at")
        .eq("builder_wallet", builderWallet)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

    if (error) return err("ERR_FETCH", "Failed to fetch invitations", 500);

    return NextResponse.json({ ok: true, data: invitations ?? [] });
}
