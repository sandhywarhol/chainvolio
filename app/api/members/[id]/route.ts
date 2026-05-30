import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// PATCH /api/members/[id] — change role
// Body: { recruiterWallet, role }
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const body = await request.json().catch(() => null);
    if (!body) return err("ERR_BODY", "Invalid request body");

    const { recruiterWallet, role } = body;
    if (!recruiterWallet) return err("ERR_AUTH", "recruiterWallet required");
    if (!["member", "admin"].includes(role)) return err("ERR_ROLE", "role must be member or admin");

    const { data, error } = await supabase
        .from("company_members")
        .update({ role })
        .eq("id", params.id)
        .eq("recruiter_wallet", recruiterWallet)
        .eq("status", "active")
        .select()
        .single();

    if (error || !data) return err("ERR_NOT_FOUND", "Member not found or unauthorized", 404);

    return NextResponse.json({ ok: true, data });
}

// DELETE /api/members/[id] — remove member
// Query: ?recruiterWallet=xxx  (recruiter removes)  OR  ?builderWallet=xxx  (builder leaves)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const recruiterWallet = searchParams.get("recruiterWallet");
    const builderWallet = searchParams.get("builderWallet");

    if (!recruiterWallet && !builderWallet) {
        return err("ERR_AUTH", "recruiterWallet or builderWallet required");
    }

    let query = supabase
        .from("company_members")
        .update({ status: "removed" })
        .eq("id", params.id)
        .eq("status", "active");

    if (recruiterWallet) {
        query = query.eq("recruiter_wallet", recruiterWallet);
    } else {
        query = query.eq("builder_wallet", builderWallet!);
    }

    const { data, error } = await query.select().single();

    if (error || !data) return err("ERR_NOT_FOUND", "Member not found or unauthorized", 404);

    return NextResponse.json({ ok: true });
}
