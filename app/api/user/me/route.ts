import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

/**
 * GET /api/user/me?wallet=[wallet_address]
 * 
 * Returns the fresh computed verification state for a wallet.
 * This is the SINGLE SOURCE OF TRUTH for user verification/tiers.
 */
export async function GET(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
        return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
    }

    try {
        // 1. Fetch Profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("wallet_address", wallet)
            .single();

        // 2. Fetch Verification Status
        const { data: orgData } = await supabase
            .from("organization_verifications")
            .select("status, type, expires_at, rejection_reason")
            .eq("wallet_address", wallet)
            .maybeSingle();

        const now = new Date();
        const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
        const isExpired = expiresAtDate ? now > expiresAtDate : false;
        
        const isVerified = orgData?.status === 'verified' && !isExpired;

        // 3. Compute Source of Truth
        // Logic: Verified Tier (if active) -> Company/DAO/etc., else "Builder"
        const verificationTier = isVerified ? orgData.type : "Builder";
        
        return NextResponse.json({
            walletAddress: wallet,
            isVerified,
            verificationTier,
            verificationStatus: orgData?.status || 'unverified',
            verificationType: orgData?.type || null,
            rejectionReason: orgData?.rejection_reason || null,
            expiresAt: orgData?.expires_at || null,
            isExpired,
            profile: profile ? {
                displayName: profile.display_name,
                role: profile.professional_role,
                organization: profile.organization,
                avatarUrl: profile.avatar_url,
            } : null
        });
    } catch (err: any) {
        console.error("api/user/me error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
