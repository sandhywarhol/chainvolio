import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const mode = searchParams.get("mode"); // 'builder' or 'recruiter'

    if (!wallet || !mode) {
        return NextResponse.json({ error: "Wallet and mode required" }, { status: 400 });
    }

    try {
        if (mode === 'builder') {
            // Run both queries in parallel for speed
            const [profileResult, orgResult] = await Promise.all([
                supabase.from("profiles").select("wallet_address").eq("wallet_address", wallet).maybeSingle(),
                supabase.from("organization_verifications").select("wallet_address").eq("wallet_address", wallet).eq("status", "verified").maybeSingle(),
            ]);

            // If the profiles query itself errors (e.g. RLS / permission), fail open — don't block
            if (profileResult.error) {
                return NextResponse.json({ allowed: true });
            }

            // Wallet already has a builder profile → always allow (returning builder)
            if (profileResult.data) {
                return NextResponse.json({ allowed: true, isNew: false });
            }

            // New wallet — only block if it's a verified org
            if (!orgResult.error && orgResult.data) {
                return NextResponse.json({
                    allowed: false,
                    reason: "This wallet is already registered as a Recruiter. You cannot use it to create a Builder profile."
                });
            }

            // Brand-new wallet with no profile and no org — allow and signal isNew
            return NextResponse.json({ allowed: true, isNew: true });
        } else if (mode === 'recruiter') {
            const { data: profileData, error: profileErr } = await supabase
                .from("profiles")
                .select("wallet_address")
                .eq("wallet_address", wallet)
                .maybeSingle();

            if (profileErr) throw profileErr;

            if (profileData) {
                return NextResponse.json({ 
                    allowed: false, 
                    reason: "This wallet is already registered as a Builder. You cannot use it to create a Recruiter account." 
                });
            }
        }

        return NextResponse.json({ allowed: true });
    } catch (err: any) {
        console.error("api/check-wallet error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
