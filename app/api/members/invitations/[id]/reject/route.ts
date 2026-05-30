import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// POST /api/members/invitations/[id]/reject
export async function POST(request: Request, { params }: { params: { id: string } }) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const body = await request.json().catch(() => null);
    const builderWallet = body?.builderWallet;
    if (!builderWallet) return err("ERR_WALLET", "builderWallet required");

    const { data, error } = await supabase
        .from("member_invitations")
        .update({ status: "rejected" })
        .eq("id", params.id)
        .eq("builder_wallet", builderWallet)
        .eq("status", "pending")
        .select()
        .single();

    if (error || !data) return err("ERR_NOT_FOUND", "Invitation not found or already processed", 404);

    return NextResponse.json({ ok: true });
}
