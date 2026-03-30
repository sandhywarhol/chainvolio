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
        let { data: orgData } = await supabase
            .from("organization_verifications")
            .select("id, status, type, expires_at, rejection_reason, verifier_tier, pending_upgrade_type, pending_upgrade_status, verification_source")
            .eq("wallet_address", wallet)
            .maybeSingle();

        // --- Merit-based Builder Auto-Verification ---
        const { searchParams } = new URL(request.url);
        const isDebug = searchParams.get("debug") === "true";

        // 1. Proof of work count (valid entries only)
        const powQuery = supabase
            .from("receipts")
            .select("role")
            .eq("wallet_address", wallet)
            .not("role", "is", null)
            .neq("role", "");

        const { data: powEntries, error: powError } = await powQuery;
        const validPowEntries = powEntries?.filter((p: any) => (p.role?.trim().length || 0) > 2) || [];
        const powCount = validPowEntries.length;
        
        // 2. Profile completion criteria
        // Note: isProfileCompleteNow is computed below, but let's move it up to use it for criteria.
        const hasBio = !!profile?.bio;
        const hasSkills = !!profile?.skills;
        const hasContact = !!(
            profile?.website || profile?.discord || profile?.whatsapp || 
            profile?.email || profile?.twitter || profile?.github ||
            profile?.linkedin || profile?.instagram || profile?.telegram
        );
        let completionScoreNow = 0;
        if (hasBio) completionScoreNow += 33;
        if (hasSkills) completionScoreNow += 33;
        if (hasContact) completionScoreNow += 34;
        const isProfileCompleteNow = completionScoreNow === 100;

        const hasRequiredProfile = !!profile?.display_name;
        // Require name and AT LEAST one valid proof of work entry 
        // to meet automatic Builder criteria. 
        const meetsBuilderCriteria = hasRequiredProfile && powCount >= 1;

        if (isDebug) {
            console.log(`[DEBUG] Auto-Verification Check for ${wallet}`);
            console.log(`- display_name: "${profile?.display_name || 'null'}"`);
            console.log(`- profile_completed (full): ${isProfileCompleteNow}`);
            console.log(`- powCount (valid role entries > 2 chars): ${powCount}`);
            console.log(`- meetsBuilderCriteria (normalized): ${meetsBuilderCriteria}`);
            if (powCount > 0) {
                 console.log(`- raw pow entries roles:`, validPowEntries.map((p: any) => p.role));
            }
            if (powError) console.error(`- powQuery error:`, powError);
        }

        let debugInfo: any = {
            profile_completed: isProfileCompleteNow,
            display_name: profile?.display_name || null,
            proof_of_work_count: powCount,
            eligible: meetsBuilderCriteria,
            verification_exists: !!orgData,
            upsert_triggered: false,
            upsert_success: false,
            errors: []
        };

        // 3. Auto-verify if they meet criteria AND are not already verified in another tier
        if (meetsBuilderCriteria) {
            const isAlreadyVerified = orgData?.status === 'verified';
            const canAutoVerify = !orgData || (orgData.status !== 'verified' && orgData.type === 'Builder') || (!orgData.type && orgData.status !== 'verified');
            
            if (isDebug) {
                console.log(`- isAlreadyVerified Status: ${isAlreadyVerified}`);
                console.log(`- canAutoVerify: ${canAutoVerify} (orgData Type: ${orgData?.type || 'none'}, Status: ${orgData?.status || 'none'})`);
            }

            if (canAutoVerify) {
                debugInfo.upsert_triggered = true;
                const upsertData = {
                    wallet_address: wallet,
                    type: 'Builder',
                    status: 'verified',
                    name: profile?.display_name || wallet,
                };
                
                try {
                    let result;
                    if (orgData?.id) {
                        result = await supabase.from("organization_verifications").update(upsertData).eq("id", orgData.id);
                    } else {
                        result = await supabase.from("organization_verifications").insert(upsertData);
                    }
                    
                    if (result.error) {
                         debugInfo.errors.push(result.error.message);
                         if (isDebug) console.error(`- Upsert Error:`, result.error.message);
                    } else {
                        debugInfo.upsert_success = true;
                        if (isDebug) console.log(`- Upsert Success! Verified as Builder.`);
                    }
                } catch (upsertErr: any) {
                    debugInfo.errors.push(upsertErr.message);
                    if (isDebug) console.error(`- Upsert Exception:`, upsertErr);
                }
                
                // Re-fetch to apply immediately in this response
                const { data: newOrgData } = await supabase
                    .from("organization_verifications")
                    .select("id, status, type, expires_at, rejection_reason, verifier_tier")
                    .eq("wallet_address", wallet)
                    .maybeSingle();
                    
                orgData = newOrgData;
                debugInfo.verification_exists = !!orgData;
            }
        } else if (isDebug && !meetsBuilderCriteria) {
             console.log(`- Skipping auto-verify: Criteria not met.`);
             if (!hasRequiredProfile) console.log(`  > Missing display_name`);
             if ((powCount || 0) < 1) console.log(`  > Missing proof of work (current count: ${powCount || 0})`);
        }
        // ---------------------------------------------

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
        // (Moved some computation up for debug purposes, using results here)
        const isComplete = isProfileCompleteNow;

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
        
        const responseData: any = {
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
            completionPercentage: completionScoreNow,
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
            website: profile?.website || null,
            discord: profile?.discord || null,
            email: profile?.email || null,
            whatsapp: profile?.whatsapp || null,
            isExpiringSoon,
        };

        if (isDebug) {
            responseData._debug = debugInfo;
        }

        return NextResponse.json(responseData);
    } catch (err: any) {
        console.error("api/user/me error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
