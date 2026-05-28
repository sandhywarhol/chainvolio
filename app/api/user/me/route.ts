import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { getAttestationQuota } from "@/lib/paymentConfig";

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
        // 1. Fetch Profile (Optimized Payload)
        const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("display_name, bio, skills, website, discord, whatsapp, email, twitter, github, linkedin, instagram, telegram, avatar_url, country, timezone, card_number, professional_role, organization, is_test, attestation_used, attestation_reset_date")
            .eq("wallet_address", wallet)
            .maybeSingle();

        if (profileErr) {
            console.error("Supabase Profile Error:", profileErr);
            throw profileErr;
        }

        if (profile?.is_test) {
            return NextResponse.json({ error: "Profile hidden or not found." }, { status: 404 });
        }

        // 2. Fetch Verification Status
        let { data: orgData, error: orgErr } = await supabase
            .from("organization_verifications")
            .select("id, status, type, expires_at, rejection_reason, verifier_tier, pending_upgrade_type, pending_upgrade_status, verification_source")
            .eq("wallet_address", wallet)
            .maybeSingle();

        if (orgErr) {
            console.error("Supabase Org Error:", orgErr);
            throw orgErr;
        }

        // --- Merit-based Builder Calculation (READ-ONLY) ---
        const { data: powEntries, error: powErr } = await supabase
            .from("receipts")
            .select("role")
            .eq("wallet_address", wallet)
            .not("role", "is", null)
            .neq("role", "");

        const { count: attestedReceiptCount } = await supabase
            .from("receipts")
            .select("id", { count: "exact", head: true })
            .eq("wallet_address", wallet)
            .eq("status", "Attested");

        if (powErr) {
            console.error("Supabase PoW Error:", powErr);
            // Don't throw here, just treat as 0
        }

        
        const hasBio = !!profile?.bio;
        const hasSkills = !!profile?.skills;
        const hasContact = !!(
            profile?.website || profile?.discord || profile?.whatsapp || 
            profile?.email || profile?.twitter || profile?.github ||
            profile?.linkedin || profile?.instagram || profile?.telegram
        );
        let completionScore = 0;
        if (hasBio) completionScore += 33;
        if (hasSkills) completionScore += 33;
        if (hasContact) completionScore += 34;

        const isVerified = orgData?.status === 'verified' && (orgData.expires_at ? new Date(orgData.expires_at) > new Date() : true);
        const isExpired = orgData?.expires_at ? new Date(orgData.expires_at) < new Date() : false;
        const isExpiringSoon = orgData?.expires_at && !isExpired 
            ? (new Date(orgData.expires_at).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000) 
            : false;

        // ---------------------------------------------


        // 3. Compute Source of Truth
        const verificationTier = isVerified ? orgData?.type : "unverified";
        const isProfileComplete = completionScore === 100;

        const attestationQuota = getAttestationQuota(verificationTier);
        
        const responseData: any = {
            walletAddress: wallet,
            isVerified,
            verificationTier,
            attestedReceiptCount: attestedReceiptCount || 0,
            verificationStatus: (isVerified && orgData?.pending_upgrade_status === 'pending') ? 'pending' : (orgData?.status || 'unverified'),
            isExpired,
            verificationType: orgData?.type || null,
            pendingUpgradeType: orgData?.pending_upgrade_type || null,
            pendingUpgradeStatus: orgData?.pending_upgrade_status || null,
            rejectionReason: orgData?.rejection_reason || null,
            expiresAt: orgData?.expires_at || null,
            verifierTier: orgData?.verifier_tier || 1,
            // Profile metrics
            completionPercentage: completionScore,
            isProfileComplete: isProfileComplete,
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
            website: profile?.website || null,
            discord: profile?.discord || null,
            email: profile?.email || null,
            whatsapp: profile?.whatsapp || null,
            isExpiringSoon,
            // Attestation Quota
            attestationQuota,
            attestationUsed: (profile?.attestation_reset_date && new Date(profile.attestation_reset_date) < new Date()) ? 0 : (profile?.attestation_used || 0),
            attestationRemaining: Math.max(0, attestationQuota - ((profile?.attestation_reset_date && new Date(profile.attestation_reset_date) < new Date()) ? 0 : (profile?.attestation_used || 0))),
            attestationResetDate: profile?.attestation_reset_date || null,
            canAttest: ((profile?.attestation_reset_date && new Date(profile.attestation_reset_date) < new Date()) ? 0 : (profile?.attestation_used || 0)) < attestationQuota,
        };

        return NextResponse.json(responseData);
    } catch (err: any) {
        console.error("api/user/me error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
