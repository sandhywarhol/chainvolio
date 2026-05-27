import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/messaging/conversations/[id]
// Query: ?wallet=xxx&role=candidate|recruiter   (wallet-based)
// Header: Authorization: Bearer token           (Google OAuth)
export async function GET(request: Request, { params }: { params: { id: string } }) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const role = searchParams.get("role");
    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();

    if (!id) return err("ERR_VALIDATION", "Conversation ID required");
    if (!wallet && !token) return err("ERR_AUTH", "Auth required", 401);

    try {
        if (wallet) {
            const signature = searchParams.get("signature");
            const nonce = searchParams.get("nonce");
            const timestampStr = searchParams.get("timestamp");
            const timestamp = timestampStr ? parseInt(timestampStr, 10) : 0;

            if (!signature || !nonce || !timestampStr) {
                return err("ERR_SIGNATURE_REQUIRED", "Cryptographic signature is required for wallet verification", 401);
            }

            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                wallet,
                "view_thread",
                nonce,
                timestamp,
                signature
            );

            if (!isValid) {
                return err("ERR_SIGNATURE_INVALID", sigError || "Signature verification failed", 401);
            }
        }
        const { data: conv, error: convErr } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (convErr) return err("ERR_DB", convErr.message, 500);
        if (!conv) return err("ERR_NOT_FOUND", "Conversation not found", 404);

        // Auth check: requester must be a participant
        let isParticipant = false;
        let resolvedRole: "candidate" | "recruiter" = "candidate";

        if (wallet) {
            if (conv.candidate_wallet === wallet) { isParticipant = true; resolvedRole = "candidate"; }
            if (conv.recruiter_wallet === wallet) { isParticipant = true; resolvedRole = "recruiter"; }
        }
        if (token) {
            const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
            if (authErr || !user) return err("ERR_AUTH", "Invalid token", 401);
            if (conv.recruiter_auth_uid === user.id) { isParticipant = true; resolvedRole = "recruiter"; }
        }
        if (role) resolvedRole = role as "candidate" | "recruiter";
        if (!isParticipant) return err("ERR_FORBIDDEN", "Not a conversation participant", 403);

        // Fetch messages
        const { data: messages, error: msgErr } = await supabase
            .from("messages")
            .select("id, sender_type, sender_wallet, content, created_at, read_at")
            .eq("conversation_id", id)
            .order("created_at", { ascending: true });

        if (msgErr) return err("ERR_DB", msgErr.message, 500);

        // Mark unread messages from the other side as read
        const otherSenderType = resolvedRole === "candidate" ? "recruiter" : "candidate";
        const unreadIds = (messages || [])
            .filter((m: any) => m.sender_type === otherSenderType && !m.read_at)
            .map((m: any) => m.id);

        if (unreadIds.length > 0) {
            await supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .in("id", unreadIds);
        }

        return NextResponse.json({ ok: true, data: { conversation: conv, messages: messages || [] } });
    } catch (e: any) {
        return err("ERR_SERVER", e.message, 500);
    }
}
