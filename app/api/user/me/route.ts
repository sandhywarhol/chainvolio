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
            .maybeSingle();

        // 2. Fetch Verification Status
        const { data: orgData } = await supabase
            .from("organization_verifications")
            .select("status, type, expires_at, rejection_reason, verifier_tier")
            .eq("wallet_address", wallet)
            .maybeSingle();

        const now = new Date();
        const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
        const isExpired = expiresAtDate ? now > expiresAtDate : false;
        
        const isVerified = orgData?.status === 'verified' && !isExpired;

        // 3. Compute Source of Truth
        // Logic: Verified Tier (if active) -> (Builder, Figure, etc.), else "unverified"
        const verificationTier = isVerified ? orgData.type : "unverified";
        
        return NextResponse.json({
            walletAddress: wallet,
            isVerified,
            verificationTier,
            verificationStatus: orgData?.status || 'unverified',
            isExpired,
            verificationType: orgData?.type || null,
            rejectionReason: orgData?.rejection_reason || null,
            expiresAt: orgData?.expires_at || null,
            verifierTier: orgData?.verifier_tier || 1,
            // Profile fields flattened
            displayName: profile?.display_name || null,
            role: profile?.professional_role || null,
            organization: profile?.organization || null,
            avatarUrl: profile?.avatar_url || null,
            bio: profile?.bio || null,
            skills: profile?.skills || null,
            cardNumber: profile?.card_number || null,
            country: profile?.country || null,
            timezone: profile?.timezone || null,
            twitter: profile?.twitter || null,
            github: profile?.github || null,
            linkedin: profile?.linkedin || null,
            instagram: profile?.instagram || null,
            telegram: profile?.telegram || null,
            lens: profile?.lens || null,
            farcaster: profile?.farcaster || null,
            website: profile?.website || null,
            discord: profile?.discord || null,
            email: profile?.email || null,
            whatsapp: profile?.whatsapp || null,
            tags: profile?.tags || [],
            isExpiringSoon: expiresAtDate && !isExpired 
              ? (expiresAtDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) 
              : false,
        });
    } catch (err: any) {
        console.error("api/user/me error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
