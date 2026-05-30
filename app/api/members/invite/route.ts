import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// POST /api/members/invite
// Body: { recruiterWallet, companyName, avatarUrl?, lookupValue, lookupType, role }
//
// recruiterWallet is the canonical owner identity (same as hiring_collections.owner_wallet):
//   - Wallet user  → actual wallet address
//   - Google user  → "gauth:{auth_uid}"
export async function POST(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const body = await request.json().catch(() => null);
    if (!body) return err("ERR_BODY", "Invalid request body");

    const { recruiterWallet, companyName, avatarUrl, lookupValue, lookupType, role = "member" } = body;

    if (!recruiterWallet?.trim()) return err("ERR_AUTH", "recruiterWallet required");
    if (!companyName?.trim()) return err("ERR_COMPANY", "companyName required");
    if (!lookupValue?.trim()) return err("ERR_LOOKUP", "lookupValue required");
    if (!["wallet", "cv_id"].includes(lookupType)) return err("ERR_LOOKUP_TYPE", "lookupType must be wallet or cv_id");
    if (!["member", "admin"].includes(role)) return err("ERR_ROLE", "role must be member or admin");

    // Resolve builder wallet from lookup
    let builderWallet: string | null = null;

    if (lookupType === "wallet") {
        builderWallet = lookupValue.trim();
        const { data: builder } = await supabase
            .from("profiles")
            .select("wallet_address")
            .eq("wallet_address", builderWallet)
            .maybeSingle();
        if (!builder) return err("ERR_BUILDER_NOT_FOUND", "No builder found with that wallet address", 404);
    } else {
        const cvId = parseInt(lookupValue.trim(), 10);
        if (isNaN(cvId)) return err("ERR_CV_ID", "CV ID must be a number");
        const { data: builder } = await supabase
            .from("profiles")
            .select("wallet_address")
            .eq("card_number", cvId)
            .maybeSingle();
        if (!builder) return err("ERR_BUILDER_NOT_FOUND", "No builder found with that CV ID", 404);
        builderWallet = builder.wallet_address;
    }

    // Prevent recruiter from inviting themselves
    if (builderWallet === recruiterWallet) {
        return err("ERR_SELF_INVITE", "Cannot invite yourself");
    }

    // Check if already an active member
    const { data: existingMember } = await supabase
        .from("company_members")
        .select("id, status")
        .eq("recruiter_wallet", recruiterWallet)
        .eq("builder_wallet", builderWallet)
        .maybeSingle();

    if (existingMember?.status === "active") {
        return err("ERR_ALREADY_MEMBER", "This user is already a member of your company");
    }

    // Check if a PENDING invitation already exists
    const { data: existingPending } = await supabase
        .from("member_invitations")
        .select("id")
        .eq("recruiter_wallet", recruiterWallet)
        .eq("builder_wallet", builderWallet)
        .eq("status", "pending")
        .maybeSingle();

    if (existingPending) {
        return err("ERR_INVITE_EXISTS", "A pending invitation already exists for this user");
    }

    // If previously removed member, delete old member record
    if (existingMember?.status === "removed") {
        await supabase.from("company_members").delete().eq("id", existingMember.id);
    }

    // Delete any old non-pending invitations (accepted/rejected/revoked)
    // so partial unique index on pending doesn't conflict
    await supabase
        .from("member_invitations")
        .delete()
        .eq("recruiter_wallet", recruiterWallet)
        .eq("builder_wallet", builderWallet)
        .neq("status", "pending");

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
        .from("member_invitations")
        .insert({
            recruiter_wallet: recruiterWallet,
            recruiter_company: companyName.trim(),
            recruiter_avatar_url: avatarUrl ?? null,
            lookup_value: lookupValue.trim(),
            lookup_type: lookupType,
            builder_wallet: builderWallet,
            role,
            status: "pending",
        })
        .select()
        .single();

    if (inviteError) {
        console.error("Invite insert error:", inviteError);
        return err("ERR_CREATE", "Failed to create invitation", 500);
    }

    // Insert notification for the builder
    try {
        await supabase.from("notifications").insert({
            wallet_address: builderWallet,
            title: "Company Membership Invitation",
            message: `${companyName.trim()} has invited you to join as ${role === "admin" ? "an Admin Member" : "a Member"}. Check your Inbox to accept or decline.`,
            type: "member_invitation",
            related_id: invitation.id,
            link: `/dashboard#inbox`,
            is_read: false,
        });
    } catch (notifErr) {
        console.error("Failed to insert member invitation notification:", notifErr);
        // Non-blocking — invitation still created
    }

    return NextResponse.json({ ok: true, data: invitation });
}
