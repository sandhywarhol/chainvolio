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
            // Check if this wallet is already registered as an ORG
            const { data: orgData, error: orgErr } = await supabase
                .from("organization_verifications")
                .select("id")
                .eq("wallet_address", wallet)
                .maybeSingle();

            if (orgErr) throw orgErr;

            if (orgData) {
                return NextResponse.json({ 
                    allowed: false, 
                    reason: "This wallet is already registered as a Recruiter. You cannot use it to create a Builder profile." 
                });
            }
        } else if (mode === 'recruiter') {
            // Check if this wallet is already registered as a BUILDER
            const { data: profileData, error: profileErr } = await supabase
                .from("profiles")
                .select("id")
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
