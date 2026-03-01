import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const {
            name,
            type,
            walletAddress,
            website,
            socialLink,
            proof
        } = body;

        if (!name || !type || !walletAddress) {
            return NextResponse.json(
                { error: "Missing required fields: Name, Type, and Wallet are required." },
                { status: 400 }
            );
        }

        // Set transaction context for RLS parity
        await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

        // Check if already verified - don't allow verified orgs to re-apply
        const { data: existing } = await supabase
            .from("organization_verifications")
            .select("status")
            .eq("wallet_address", walletAddress)
            .single();

        if (existing?.status === 'verified') {
            return NextResponse.json({ error: "This wallet is already a Verified Organization." }, { status: 409 });
        }

        // Upsert - insert or update if already pending/rejected
        const { data, error } = await supabase
            .from("organization_verifications")
            .upsert({
                name,
                type,
                wallet_address: walletAddress,
                website,
                social_link: socialLink,
                proof,
                status: 'pending',
                updated_at: new Date().toISOString()
            }, { onConflict: 'wallet_address' })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, data });
    } catch (err) {
        console.error("Organization verification submission error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
