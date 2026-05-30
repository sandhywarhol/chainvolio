import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/members/notes?hiringId=xxx&builderWallet=xxx
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const hiringId = searchParams.get("hiringId");
    const builderWallet = searchParams.get("builderWallet");

    if (!hiringId || !builderWallet) return err("ERR_PARAMS", "hiringId and builderWallet required");

    // Verify caller is an active member with admin role
    const { data: member } = await supabase
        .from("company_members")
        .select("id, role")
        .eq("builder_wallet", builderWallet)
        .eq("status", "active")
        .maybeSingle();

    if (!member) return err("ERR_UNAUTHORIZED", "Not an active member", 403);

    const { data: notes, error } = await supabase
        .from("member_notes")
        .select("id, content, created_at, updated_at, member_id")
        .eq("hiring_id", hiringId)
        .eq("member_id", member.id)
        .order("created_at", { ascending: false });

    if (error) return err("ERR_FETCH", "Failed to fetch notes", 500);

    return NextResponse.json({ ok: true, data: notes ?? [] });
}

// POST /api/members/notes
export async function POST(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const body = await request.json().catch(() => null);
    if (!body) return err("ERR_BODY", "Invalid request body");

    const { builderWallet, hiringId, content } = body;

    if (!builderWallet || !hiringId || !content?.trim()) {
        return err("ERR_PARAMS", "builderWallet, hiringId, and content are required");
    }

    if (content.trim().length > 2000) {
        return err("ERR_CONTENT", "Note must be 2000 characters or less");
    }

    // Verify caller is an admin member
    const { data: member } = await supabase
        .from("company_members")
        .select("id, role")
        .eq("builder_wallet", builderWallet)
        .eq("status", "active")
        .eq("role", "admin")
        .maybeSingle();

    if (!member) return err("ERR_UNAUTHORIZED", "Only admin members can add notes", 403);

    const { data: note, error } = await supabase
        .from("member_notes")
        .insert({ member_id: member.id, hiring_id: hiringId, content: content.trim() })
        .select()
        .single();

    if (error) return err("ERR_CREATE", "Failed to create note", 500);

    return NextResponse.json({ ok: true, data: note });
}

// PATCH /api/members/notes — update a note
export async function PATCH(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const body = await request.json().catch(() => null);
    if (!body) return err("ERR_BODY", "Invalid request body");

    const { noteId, builderWallet, content } = body;
    if (!noteId || !builderWallet || !content?.trim()) {
        return err("ERR_PARAMS", "noteId, builderWallet, and content are required");
    }

    if (content.trim().length > 2000) {
        return err("ERR_CONTENT", "Note must be 2000 characters or less");
    }

    const { data: member } = await supabase
        .from("company_members")
        .select("id")
        .eq("builder_wallet", builderWallet)
        .eq("status", "active")
        .maybeSingle();

    if (!member) return err("ERR_UNAUTHORIZED", "Not an active member", 403);

    const { data, error } = await supabase
        .from("member_notes")
        .update({ content: content.trim() })
        .eq("id", noteId)
        .eq("member_id", member.id)
        .select()
        .single();

    if (error || !data) return err("ERR_NOT_FOUND", "Note not found or unauthorized", 404);

    return NextResponse.json({ ok: true, data });
}
