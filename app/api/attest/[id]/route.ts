import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { id } = params;

    // Get receipt details
    const { data: receipt, error } = await supabase
        .from("receipts")
        .select("*, wallets(wallet_address)") // Join to get owner wallet
        .eq("id", id)
        .single();

    if (error || !receipt) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Get existing attestations count
    const { count } = await supabase
        .from("attestations")
        .select("*", { count: "exact", head: true })
        .eq("receipt_id", id);

    return NextResponse.json({
        id: receipt.id,
        role: receipt.role,
        org: receipt.org,
        description: receipt.description,
        startDate: receipt.start_date,
        endDate: receipt.end_date,
        ownerWallet: receipt.wallet_address,
        attestationCount: count || 0,
    });
}
