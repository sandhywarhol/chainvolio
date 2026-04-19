import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) return NextResponse.json({ error: "Wallet required" }, { status: 400 });

    try {
        // Fetch attestations issued by this wallet
        const { data: attestations, error } = await supabase
            .from("attestations")
            .select(`
                *,
                receipt:receipts (*)
            `)
            .eq("attester_wallet", wallet)
            .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (!attestations || attestations.length === 0) {
            return NextResponse.json({ ok: true, data: [] });
        }

        // Manual join for recipient profiles
        const recipientWallets = Array.from(new Set(
            attestations.map((a: any) => a.receipt?.wallet_address).filter(Boolean)
        ));

        let profileMap: Record<string, any> = {};

        if (recipientWallets.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("wallet_address, display_name, avatar_url")
                .in("wallet_address", recipientWallets);
                
            profiles?.forEach(p => { profileMap[p.wallet_address] = p; });
        }

        // Attach profile to each receipt
        const enrichedData = attestations.map((a: any) => {
            if (a.receipt) {
                a.receipt.profile = profileMap[a.receipt.wallet_address] || null;
            }
            return a;
        });

        return NextResponse.json({ ok: true, data: enrichedData });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
