import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// POST /api/messaging/messages
// Body: { conversationId, content, senderWallet?, authToken? }
export async function POST(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);

    try {
        const body = await request.json();
        const { conversationId, content, senderWallet, authToken } = body;

        if (!conversationId) return err("ERR_VALIDATION", "conversationId is required");
        if (!content?.trim()) return err("ERR_VALIDATION", "content is required");
        if (content.length > 2000) return err("ERR_VALIDATION", "Message too long (max 2000 chars)");
        if (!senderWallet && !authToken) return err("ERR_AUTH", "Auth required", 401);

        // Resolve sender identity
        let senderAuthUid: string | undefined;
        if (authToken) {
            const { data: { user }, error: authErr } = await supabase.auth.getUser(authToken);
            if (authErr || !user) return err("ERR_AUTH", "Invalid token", 401);
            senderAuthUid = user.id;
        }

        // Fetch conversation
        const { data: conv, error: convErr } = await supabase
            .from("conversations")
            .select("id, status, candidate_wallet, recruiter_wallet, recruiter_auth_uid")
            .eq("id", conversationId)
            .maybeSingle();

        if (convErr) return err("ERR_DB", convErr.message, 500);
        if (!conv) return err("ERR_NOT_FOUND", "Conversation not found", 404);
        if (conv.status !== "accepted") {
            return err("ERR_INVALID", "Can only send messages in accepted conversations", 403);
        }

        // Determine sender role
        let senderType: "candidate" | "recruiter" | null = null;
        if (senderWallet) {
            if (conv.candidate_wallet === senderWallet) senderType = "candidate";
            else if (conv.recruiter_wallet === senderWallet) senderType = "recruiter";
        }
        if (senderAuthUid && conv.recruiter_auth_uid === senderAuthUid) {
            senderType = "recruiter";
        }
        if (!senderType) return err("ERR_FORBIDDEN", "Not a conversation participant", 403);

        // Rate limit: max 10 messages per minute per sender per conversation
        const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
        const rateQuery = supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conversationId)
            .eq("sender_type", senderType)
            .gte("created_at", oneMinuteAgo);

        const { count: recentCount } = senderWallet
            ? await rateQuery.eq("sender_wallet", senderWallet)
            : await rateQuery.eq("sender_auth_uid", senderAuthUid!);

        if ((recentCount ?? 0) >= 10) {
            return err("ERR_RATE_LIMIT", "Sending too fast. Please wait a moment.", 429);
        }

        const messagePayload: Record<string, any> = {
            conversation_id: conversationId,
            sender_type: senderType,
            content: content.trim(),
        };
        if (senderWallet) messagePayload.sender_wallet = senderWallet;
        if (senderAuthUid) messagePayload.sender_auth_uid = senderAuthUid;

        const { data: message, error: insertErr } = await supabase
            .from("messages")
            .insert(messagePayload)
            .select("id, sender_type, content, created_at")
            .single();

        if (insertErr) return err("ERR_DB", insertErr.message, 500);

        return NextResponse.json({ ok: true, data: message });
    } catch (e: any) {
        return err("ERR_SERVER", e.message, 500);
    }
}
