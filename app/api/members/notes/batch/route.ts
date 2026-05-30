import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

// GET /api/members/notes/batch?recruiterWallet=xxx&hiringIds=id1,id2,id3
// Returns all member notes for a list of candidate submission IDs.
// Only callable by the recruiter who owns the collection (or admin members).
export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Database not configured", 503);

    const { searchParams } = new URL(request.url);
    const recruiterWallet = searchParams.get("recruiterWallet");
    const hiringIdsParam = searchParams.get("hiringIds");

    if (!recruiterWallet) return err("ERR_AUTH", "recruiterWallet required");
    if (!hiringIdsParam) return err("ERR_PARAMS", "hiringIds required");

    const hiringIds = hiringIdsParam.split(",").filter(Boolean);
    if (hiringIds.length === 0) return NextResponse.json({ ok: true, data: {} });

    // Fetch all notes for these hiring IDs, joined with member info
    const { data: notes, error } = await supabase
        .from("member_notes")
        .select(`
            id,
            hiring_id,
            content,
            created_at,
            member_id,
            company_members!inner(
                builder_wallet,
                recruiter_wallet,
                company_name
            )
        `)
        .in("hiring_id", hiringIds)
        .eq("company_members.recruiter_wallet", recruiterWallet)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Batch notes error:", error);
        return err("ERR_FETCH", "Failed to fetch notes", 500);
    }

    // Get builder display names
    const builderWallets = [...new Set((notes ?? []).map((n: any) => n.company_members?.builder_wallet).filter(Boolean))];
    let profileMap: Record<string, string> = {};

    if (builderWallets.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("wallet_address, display_name")
            .in("wallet_address", builderWallets);
        for (const p of profiles ?? []) {
            profileMap[p.wallet_address] = p.display_name ?? p.wallet_address.slice(0, 8) + "...";
        }
    }

    // Group notes by hiring_id
    const grouped: Record<string, { authorName: string; content: string; created_at: string }[]> = {};
    for (const note of notes ?? []) {
        const hid = (note as any).hiring_id;
        const wallet = (note as any).company_members?.builder_wallet ?? "";
        if (!grouped[hid]) grouped[hid] = [];
        grouped[hid].push({
            authorName: profileMap[wallet] ?? wallet.slice(0, 8) + "...",
            content: (note as any).content,
            created_at: (note as any).created_at,
        });
    }

    return NextResponse.json({ ok: true, data: grouped });
}
