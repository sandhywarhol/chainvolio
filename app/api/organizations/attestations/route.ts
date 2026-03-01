import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) return NextResponse.json({ error: "Wallet required" }, { status: 400 });

    try {
        // Fetch attestations issued by this wallet
        const { data, error } = await supabase
            .from("attestations")
            .select(`
                *,
                receipt:receipts (
                    id,
                    role,
                    org,
                    wallet_address,
                    profile:profiles (
                        display_name,
                        avatar_url
                    )
                )
            `)
            .eq("attester_wallet", wallet)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ ok: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
