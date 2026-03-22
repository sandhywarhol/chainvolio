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

        if (profile?.is_test) {
            return NextResponse.json({ error: "Profile hidden or not found." }, { status: 404 });
        }

        // 2. Fetch Verification Status
        const { data: orgData } = await supabase
            .from("organization_verifications")
            .select("id, status, type, expires_at, rejection_reason, verifier_tier")
            .eq("wallet_address", wallet)
            .maybeSingle();

        const now = new Date();
        const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
        const isExpired = expiresAtDate ? now > expiresAtDate : false;
        
        const isVerified = orgData?.status === 'verified' && !isExpired;
        
        // 3 days threshold for in-app alert
        const isExpiringSoon = expiresAtDate && !isExpired 
            ? (expiresAtDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) 
            : false;

        // --- 2.5 Trigger Expiration Notification (Auto-sync) ---
        if (isExpiringSoon && (orgData?.type?.includes("Company") || orgData?.type?.includes("Community") || orgData?.type?.includes("DAO"))) {
             try {
                // Unique key for THIS specific expiry cycle to avoid duplicates
                const expiryCycleKey = `expiry-${wallet}-${expiresAtDate?.getTime()}`;
                
                const { data: existingNotif } = await supabase
                    .from("notifications")
                    .select("id")
                    .eq("wallet_address", wallet)
                    .eq("related_id", expiryCycleKey)
                    .limit(1);

                if (!existingNotif || existingNotif.length === 0) {
                     await supabase.from("notifications").insert({
                        wallet_address: wallet,
                        title: "Verification Expiring Soon",
                        message: "Your verification will expire soon. Renew to keep your verified status.",
                        type: 'verification_expiry',
                        related_id: expiryCycleKey,
                        link: '/dashboard',
                        is_read: false
                    });
                }
            } catch (notifErr) {
                console.error("Failed to trigger expiration notification:", notifErr);
            }
        }

        // 3. Compute Completeness & Notifications
        const hasBio = !!profile?.bio;
        const hasSkills = !!profile?.skills;
        const hasContact = !!(
            profile?.email || profile?.twitter || profile?.github || 
            profile?.linkedin || profile?.instagram || profile?.telegram || 
            profile?.website || profile?.discord || profile?.whatsapp || 
            profile?.lens || profile?.farcaster
        );

        let completionScore = 0;
        if (hasBio) completionScore += 33;
        if (hasSkills) completionScore += 33;
        if (hasContact) completionScore += 34;
        const isComplete = completionScore === 100;

        // --- 2.6 Trigger Profile Status Notifications ---
        try {
            if (isComplete) {
                // Notify "Profile Complete" ONCE
                const completeKey = `prof-complete-${wallet}`;
                const { data: existingNotif } = await supabase
                    .from("notifications")
                    .select("id")
                    .eq("wallet_address", wallet)
                    .eq("related_id", completeKey)
                    .limit(1);

                if (!existingNotif || existingNotif.length === 0) {
                     await supabase.from("notifications").insert({
                        wallet_address: wallet,
                        title: "Profile Complete 🎉",
                        message: "Your profile is now complete and optimized for recruiter visibility.",
                        type: 'system',
                        related_id: completeKey,
                        link: '/dashboard',
                        is_read: false
                    });
                }
            } else {
                 // Notify Incomplete once every 7 days if they log in
                 const incompleteKey = `prof-incomplete-${wallet}-${new Date().toISOString().split('T')[0].slice(0, 7)}`; // Monthly/Weekly key? 
                 // Let's use a simpler check: if any unread 'incomplete' exists, don't spam.
                 const { data: existingIncomplete } = await supabase
                    .from("notifications")
                    .select("id")
                    .eq("wallet_address", wallet)
                    .eq("type", "profile_incomplete")
                    .eq("is_read", false)
                    .limit(1);

                 if (!existingIncomplete || existingIncomplete.length === 0) {
                     // Only insert if no recent unread notification exists
                     await supabase.from("notifications").insert({
                        wallet_address: wallet,
                        title: "Your profile is incomplete",
                        message: "Add contact details to increase your visibility and trust among recruiters.",
                        type: 'profile_incomplete',
                        link: '/dashboard',
                        is_read: false
                    });
                 }
            }
        } catch (notifErr) {
            console.error("Failed to sync profile status notification:", notifErr);
        }

        // 3. Compute Source of Truth
        // Logic: Verified Tier (if active) -> (Builder, Figure, etc.), else "unverified"
        const verificationTier = isVerified ? orgData?.type : "unverified";
        
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
            // Profile metrics
            completionPercentage: completionScore,
            isProfileComplete: isComplete,
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
            isExpiringSoon,
        });
    } catch (err: any) {
        console.error("api/user/me error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
