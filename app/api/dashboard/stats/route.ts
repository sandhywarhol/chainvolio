import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { getAttestationQuota } from "@/lib/paymentConfig";
import { syncUserStatus } from "@/lib/sync";

export async function GET(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
        return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    try {
        // 1. Fetch Profile and Verification in Parallel
        const [profileRes, orgRes, collectionsRes, attestationsRes, certsRes, scoreRes] = await Promise.all([
            supabase
                .from("profiles")
                .select("display_name, bio, skills, website, discord, whatsapp, email, twitter, github, linkedin, instagram, telegram, avatar_url, country, timezone, card_number, professional_role, organization, is_test, attestation_used, attestation_reset_date")
                .eq("wallet_address", wallet)
                .maybeSingle(),
            supabase
                .from("organization_verifications")
                .select("id, status, type, expires_at, rejection_reason, verifier_tier, pending_upgrade_type, pending_upgrade_status, verification_source")
                .eq("wallet_address", wallet)
                .maybeSingle(),
            supabase
                .from("hiring_collections")
                .select("id, title, slug, created_at")
                .eq("owner_wallet", wallet)
                .order("created_at", { ascending: false }),
            supabase
                .from("attestations")
                .select("*", { count: 'exact', head: true })
                .eq("attester_wallet", wallet),
            supabase
                .from("user_certificates")
                .select("id, title, issuer_name, date_issued, file_url, file_type, created_at")
                .eq("wallet_address", wallet)
                .order("created_at", { ascending: false }),
            supabase
                .from("scores")
                .select("total_score, level")
                .eq("wallet_address", wallet)
                .maybeSingle(),
        ]);

        const profile = profileRes.data;
        const orgData = orgRes.data;

        // --- Identity & Completion Logic (Matching user/me) ---
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

        const verificationTier = isVerified ? orgData?.type : "unverified";
        
        const identity: any = {
            walletAddress: wallet,
            isVerified,
            verificationTier,
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
            isProfileComplete: completionScore === 100,
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
            isExpiringSoon,
            // Socials for modal prep
            twitter: profile?.twitter || null,
            github: profile?.github || null,
            linkedin: profile?.linkedin || null,
            instagram: profile?.instagram || null,
            telegram: profile?.telegram || null,
            website: profile?.website || null,
            discord: profile?.discord || null,
            email: profile?.email || null,
            whatsapp: profile?.whatsapp || null,
            // Attestation Quota (all users)
            attestationQuota: getAttestationQuota(verificationTier),
            attestationUsed: (profile?.attestation_reset_date && new Date(profile.attestation_reset_date) < new Date()) ? 0 : (profile?.attestation_used || 0),
            attestationResetDate: profile?.attestation_reset_date || null,
        };

        // Fire-and-forget: triggers expiry notifications and auto-builder checks
        syncUserStatus(wallet).catch(console.error);

        return NextResponse.json({
            profile: { ...identity, cvScore: scoreRes?.data?.total_score ?? null, cvLevel: scoreRes?.data?.level ?? null },
            collections: collectionsRes.data || [],
            attestationCount: attestationsRes.count || 0,
            certificates: certsRes.data || []
        });

    } catch (err: any) {
        console.error("Dashboard Stats API Error:", err);
        return NextResponse.json({ error: "Server error fetching stats" }, { status: 500 });
    }
}
