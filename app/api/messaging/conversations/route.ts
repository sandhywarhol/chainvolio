import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/messaging/conversations
// ?role=candidate&wallet=xxx
// ?role=recruiter&wallet=xxx   (wallet-based recruiter)
// ?role=recruiter              (Google OAuth recruiter, pass Authorization header)
// Signature not required — inbox contains non-sensitive interview invitations only.
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // 'candidate' | 'recruiter'
    const wallet = searchParams.get("wallet");
    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();

    if (!role) return err("ERR_VALIDATION", "role is required");

    try {
        let conversations: any[] = [];

        if (role === "candidate") {
            if (!wallet) return err("ERR_VALIDATION", "wallet is required for candidate role");

            const { data, error } = await supabase
                .from("conversations")
                .select("id, status, role_position, initial_message, proposed_interview_date, meeting_link, recruiter_name, recruiter_company, recruiter_avatar_url, recruiter_wallet, recruiter_auth_uid, created_at, updated_at, accepted_at, declined_at")
                .eq("candidate_wallet", wallet)
                .order("updated_at", { ascending: false });

            if (error) return err("ERR_DB", error.message, 500);
            conversations = data || [];
        } else if (role === "recruiter") {
            if (token) {
                const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
                if (authErr || !user) return err("ERR_AUTH", "Invalid token", 401);

                const { data, error } = await supabase
                    .from("conversations")
                    .select("id, status, role_position, initial_message, candidate_wallet, created_at, updated_at, accepted_at")
                    .eq("recruiter_auth_uid", user.id)
                    .order("updated_at", { ascending: false });

                if (error) return err("ERR_DB", error.message, 500);
                conversations = data || [];
            } else if (wallet) {
                const { data, error } = await supabase
                    .from("conversations")
                    .select("id, status, role_position, initial_message, candidate_wallet, created_at, updated_at, accepted_at")
                    .eq("recruiter_wallet", wallet)
                    .order("updated_at", { ascending: false });

                if (error) return err("ERR_DB", error.message, 500);
                conversations = data || [];
            } else {
                return err("ERR_AUTH", "wallet or Authorization required for recruiter role", 401);
            }
        } else {
            return err("ERR_VALIDATION", "role must be candidate or recruiter");
        }

        // Attach unread message count for each conversation
        const conversationIds = conversations.map((c) => c.id);
        let unreadMap: Record<string, number> = {};

        if (conversationIds.length > 0) {
            const senderType = role === "candidate" ? "recruiter" : "candidate";
            const { data: unreadRows } = await supabase
                .from("messages")
                .select("conversation_id")
                .in("conversation_id", conversationIds)
                .eq("sender_type", senderType)
                .is("read_at", null);

            (unreadRows || []).forEach((row: any) => {
                unreadMap[row.conversation_id] = (unreadMap[row.conversation_id] || 0) + 1;
            });
        }

        const enriched = conversations.map((c) => ({
            ...c,
            unreadCount: unreadMap[c.id] || 0,
        }));

        return NextResponse.json({ ok: true, data: enriched });
    } catch (e: any) {
        return err("ERR_SERVER", e.message, 500);
    }
}
