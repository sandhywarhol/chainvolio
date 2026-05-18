import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// PATCH /api/messaging/conversations/[id]/status
// Body: { action: 'accept'|'decline'|'close', wallet?, authToken? }
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);

    const { id } = params;
    const body = await request.json();
    const { action, wallet, authToken } = body;

    if (!id) return err("ERR_VALIDATION", "Conversation ID required");
    if (!action || !["accept", "decline", "close"].includes(action)) {
        return err("ERR_VALIDATION", "action must be accept, decline, or close");
    }
    if (!wallet && !authToken) return err("ERR_AUTH", "Auth required", 401);

    try {
        const { data: conv, error: convErr } = await supabase
            .from("conversations")
            .select("id, status, candidate_wallet, recruiter_wallet, recruiter_auth_uid")
            .eq("id", id)
            .maybeSingle();

        if (convErr) return err("ERR_DB", convErr.message, 500);
        if (!conv) return err("ERR_NOT_FOUND", "Conversation not found", 404);

        // Auth check
        let role: "candidate" | "recruiter" | null = null;
        if (wallet) {
            if (conv.candidate_wallet === wallet) role = "candidate";
            else if (conv.recruiter_wallet === wallet) role = "recruiter";
        }
        if (authToken) {
            const { data: { user } } = await supabase.auth.getUser(authToken);
            if (user && conv.recruiter_auth_uid === user.id) role = "recruiter";
        }
        if (!role) return err("ERR_FORBIDDEN", "Not a participant", 403);

        // Business rules
        if ((action === "accept" || action === "decline") && role !== "candidate") {
            return err("ERR_FORBIDDEN", "Only candidate can accept or decline", 403);
        }
        if ((action === "accept" || action === "decline") && conv.status !== "pending") {
            return err("ERR_INVALID", `Cannot ${action} a conversation with status '${conv.status}'`, 400);
        }
        if (action === "close" && conv.status === "declined") {
            return err("ERR_INVALID", "Cannot close a declined conversation", 400);
        }

        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (action === "accept") {
            updates.status = "accepted";
            updates.accepted_at = new Date().toISOString();
        } else if (action === "decline") {
            updates.status = "declined";
            updates.declined_at = new Date().toISOString();
        } else {
            updates.status = "closed";
        }

        const { error: updateErr } = await supabase
            .from("conversations")
            .update(updates)
            .eq("id", id);

        if (updateErr) return err("ERR_DB", updateErr.message, 500);

        return NextResponse.json({ ok: true, status: updates.status });
    } catch (e: any) {
        return err("ERR_SERVER", e.message, 500);
    }
}
