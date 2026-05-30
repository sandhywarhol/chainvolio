import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// POST /api/members/invitations/[id]/accept
// Body: { builderWallet }
export async function POST(request: Request, { params }: { params: { id: string } }) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const body = await request.json().catch(() => null);
    const builderWallet = body?.builderWallet;
    if (!builderWallet) return err("ERR_WALLET", "builderWallet required");

    // Fetch and validate the invitation
    const { data: invitation } = await supabase
        .from("member_invitations")
        .select("*")
        .eq("id", params.id)
        .eq("builder_wallet", builderWallet)
        .eq("status", "pending")
        .maybeSingle();

    if (!invitation) return err("ERR_NOT_FOUND", "Invitation not found or already processed", 404);

    if (new Date(invitation.expires_at) < new Date()) {
        await supabase
            .from("member_invitations")
            .update({ status: "revoked" })
            .eq("id", params.id);
        return err("ERR_EXPIRED", "Invitation has expired", 410);
    }

    // Mark invitation as accepted
    await supabase
        .from("member_invitations")
        .update({ status: "accepted" })
        .eq("id", params.id);

    // Reactivate removed membership or create new one
    const { data: existing } = await supabase
        .from("company_members")
        .select("id, status")
        .eq("recruiter_wallet", invitation.recruiter_wallet)
        .eq("builder_wallet", builderWallet)
        .maybeSingle();

    if (existing) {
        await supabase
            .from("company_members")
            .update({ status: "active", role: invitation.role, joined_at: new Date().toISOString() })
            .eq("id", existing.id);
    } else {
        await supabase.from("company_members").insert({
            recruiter_wallet: invitation.recruiter_wallet,
            company_name: invitation.recruiter_company,
            recruiter_avatar_url: invitation.recruiter_avatar_url,
            builder_wallet: builderWallet,
            role: invitation.role,
            status: "active",
            invitation_id: invitation.id,
        });
    }

    return NextResponse.json({ ok: true });
}
