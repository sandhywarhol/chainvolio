import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, message: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status });

async function verifyGoogleToken(request: Request, ownerAuthUid: string) {
    if (!supabase) return false;
    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return false;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return !error && user?.id === ownerAuthUid;
}

export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const authUid = searchParams.get("auth_uid");
    if (!wallet && !authUid) return err("ERR_INVALID_REQUEST", "wallet or auth_uid required");

    const query = supabase.from("org_projects").select("*").order("created_at", { ascending: false });
    const { data, error } = wallet
        ? await query.eq("owner_wallet", wallet)
        : await query.eq("owner_auth_uid", authUid!);

    if (error) return err("ERR_DATABASE", error.message, 500);
    return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);
    const body = await request.json();
    const { ownerWallet, ownerAuthUid, title, description, projectType, projectUrl, startDate, endDate, isOngoing, tags, status } = body;

    if (!ownerWallet && !ownerAuthUid) return err("ERR_INVALID_REQUEST", "ownerWallet or ownerAuthUid required");
    if (!title?.trim()) return err("ERR_INVALID_REQUEST", "title is required");

    if (ownerAuthUid) {
        const valid = await verifyGoogleToken(request, ownerAuthUid);
        if (!valid) return err("ERR_UNAUTHORIZED", "Invalid or mismatched auth token", 401);
    }

    if (ownerWallet) {
        await supabase.rpc("set_app_wallet", { wallet_addr: ownerWallet });
    }

    const row: Record<string, unknown> = {
        title: title.trim(),
        description: description?.trim() || null,
        project_type: projectType || null,
        project_url: projectUrl?.trim() || null,
        start_date: startDate || null,
        end_date: isOngoing ? null : (endDate || null),
        is_ongoing: isOngoing ?? false,
        tags: Array.isArray(tags) ? tags : [],
        status: status || "active",
    };
    if (ownerWallet) row.owner_wallet = ownerWallet;
    if (ownerAuthUid) row.owner_auth_uid = ownerAuthUid;

    const { data, error } = await supabase.from("org_projects").insert(row).select().single();
    if (error) return err("ERR_DATABASE", error.message, 500);
    return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const wallet = searchParams.get("wallet");
    const authUid = searchParams.get("auth_uid");

    if (!id) return err("ERR_INVALID_REQUEST", "id required");
    if (!wallet && !authUid) return err("ERR_INVALID_REQUEST", "wallet or auth_uid required");

    if (authUid) {
        const valid = await verifyGoogleToken(request, authUid);
        if (!valid) return err("ERR_UNAUTHORIZED", "Invalid or mismatched auth token", 401);
    }
    if (wallet) {
        await supabase.rpc("set_app_wallet", { wallet_addr: wallet });
    }

    const query = supabase.from("org_projects").delete().eq("id", id);
    const { error } = wallet
        ? await query.eq("owner_wallet", wallet)
        : await query.eq("owner_auth_uid", authUid!);

    if (error) return err("ERR_DATABASE", error.message, 500);
    return NextResponse.json({ ok: true });
}
