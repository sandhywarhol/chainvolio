import { supabaseServer as supabase } from "./supabase/server";

/**
 * syncUserStatus - Centralized logic for side-effects (auto-verification, notifications)
 * This should only be called from POST/PATCH/DELETE routes or dedicated sync triggers.
 */
export async function syncUserStatus(wallet: string) {
    if (!supabase) return { ok: false, error: "Supabase not configured" };

    try {
        // 1. Fetch Core Data
        const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, bio, skills, website, discord, whatsapp, email, twitter, github, linkedin, instagram, telegram, is_test")
            .eq("wallet_address", wallet)
            .maybeSingle();

        if (!profile || profile.is_test) return { ok: false, error: "Profile not found or test account" };

        const { data: orgData } = await supabase
            .from("organization_verifications")
            .select("id, status, type, expires_at")
            .eq("wallet_address", wallet)
            .maybeSingle();

        const { data: powEntries } = await supabase
            .from("receipts")
            .select("role")
            .eq("wallet_address", wallet)
            .not("role", "is", null)
            .neq("role", "");

        // 2. Computed Criteria
        const validPowEntries = powEntries?.filter((p: any) => (p.role?.trim().length || 0) > 2) || [];
        const powCount = validPowEntries.length;

        const hasBio = !!profile.bio;
        const hasSkills = !!profile.skills;
        const hasContact = !!(
            profile.website || profile.discord || profile.whatsapp || 
            profile.email || profile.twitter || profile.github ||
            profile.linkedin || profile.instagram || profile.telegram
        );
        let completionScore = 0;
        if (hasBio) completionScore += 33;
        if (hasSkills) completionScore += 33;
        if (hasContact) completionScore += 34;
        const isProfileComplete = completionScore === 100;

        // 3. Side Effect: Auto-Verification (Builder Tier)
        const meetsBuilderCriteria = !!profile.display_name && powCount >= 1;
        if (meetsBuilderCriteria) {
            const canAutoVerify = !orgData || (orgData.status !== 'verified' && orgData.type === 'Builder') || (!orgData.type && orgData.status !== 'verified');
            if (canAutoVerify) {
                const nowIso = new Date().toISOString();
                const upsertData = {
                    wallet_address: wallet,
                    type: 'Builder',
                    status: 'verified',
                    name: profile.display_name || wallet,
                    verification_source: 'auto_builder',
                    approved_at: nowIso,
                    updated_at: nowIso,
                };
                if (orgData?.id) {
                    await supabase.from("organization_verifications").update(upsertData).eq("id", orgData.id);
                } else {
                    await supabase.from("organization_verifications").insert(upsertData);
                }
                console.log(`[SYNC] User verified as Builder: ${wallet}`);

                // Notify user of auto-verification (deduplicated by related_id)
                const notifKey = `builder-auto-${wallet}`;
                const { data: existingNotif } = await supabase
                    .from("notifications")
                    .select("id")
                    .eq("wallet_address", wallet)
                    .eq("related_id", notifKey)
                    .maybeSingle();
                if (!existingNotif) {
                    await supabase.from("notifications").insert({
                        wallet_address: wallet,
                        title: "Builder Badge Earned",
                        message: "You are now a Verified Builder 🎉 Your profile meets all criteria.",
                        type: "verification",
                        related_id: notifKey,
                        link: "/dashboard#verification-status",
                        is_read: false,
                    });
                }
            }
        }

        // 4. Side Effect: Expiration Notifications
        const now = new Date();
        const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
        const isExpired = expiresAtDate ? now > expiresAtDate : false;
        const isExpiringSoon = expiresAtDate && !isExpired 
            ? (expiresAtDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) 
            : false;

        if (isExpiringSoon && (orgData?.status === 'verified')) {
            const expiryKey = `expiry-${wallet}-${expiresAtDate?.getTime()}`;
            const { data: existing } = await supabase
                .from("notifications")
                .select("id")
                .eq("wallet_address", wallet)
                .eq("related_id", expiryKey)
                .maybeSingle();

            if (!existing) {
                await supabase.from("notifications").insert({
                    wallet_address: wallet,
                    title: "Verification Expiring Soon",
                    message: "Your verification status will expire soon. Renew to maintain your official standing.",
                    type: 'verification_expiry',
                    related_id: expiryKey,
                    link: '/dashboard',
                    is_read: false
                });
            }
        }

        // 5. Side Effect: Completion Notifications
        if (isProfileComplete) {
            const completeKey = `prof-complete-${wallet}`;
            const { data: existing } = await supabase
                .from("notifications")
                .select("id")
                .eq("wallet_address", wallet)
                .eq("related_id", completeKey)
                .maybeSingle();

            if (!existing) {
                await supabase.from("notifications").insert({
                    wallet_address: wallet,
                    title: "Profile Complete 🎉",
                    message: "Your professional profile is now 100% complete and verified for quality.",
                    type: 'system',
                    related_id: completeKey,
                    link: '/dashboard',
                    is_read: false
                });
            }
        } else {
            const { data: existingIncomplete } = await supabase
                .from("notifications")
                .select("id")
                .eq("wallet_address", wallet)
                .eq("type", "profile_incomplete")
                .eq("is_read", false)
                .limit(1);

            if (!existingIncomplete || existingIncomplete.length === 0) {
                await supabase.from("notifications").insert({
                    wallet_address: wallet,
                    title: "Boost Your Visibility",
                    message: "Complete your profile to unlock higher trust matching and community features.",
                    type: 'profile_incomplete',
                    link: '/dashboard',
                    is_read: false
                });
            }
        }

        return { ok: true };
    } catch (err: any) {
        console.error(`[SYNC ERROR] for ${wallet}:`, err);
        return { ok: false, error: err.message };
    }
}
