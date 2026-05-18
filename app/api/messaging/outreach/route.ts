import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { isRecruiterTier } from "@/lib/paymentConfig";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

const FREE_LIMIT = 2;

async function isPremiumRecruiter(wallet?: string, authUid?: string): Promise<boolean> {
    if (!supabase) return false;
    if (wallet) {
        const { data } = await supabase
            .from("organization_verifications")
            .select("type, status, expires_at")
            .eq("wallet_address", wallet)
            .maybeSingle();
        const isExpired = data?.expires_at ? new Date(data.expires_at) < new Date() : false;
        return data?.status === "verified" && !isExpired && isRecruiterTier(data?.type ?? "");
    }
    if (authUid) {
        const { data } = await supabase
            .from("org_accounts")
            .select("plan_name, subscription_status, current_period_end")
            .eq("auth_uid", authUid)
            .maybeSingle();
        const periodExpired = data?.current_period_end
            ? new Date(data.current_period_end) < new Date() : false;
        return !!(
            data?.plan_name && data.plan_name !== "free" &&
            data.subscription_status === "active" && !periodExpired
        );
    }
    return false;
}

async function checkAndIncrementLimit(
    wallet?: string, authUid?: string
): Promise<{ allowed: boolean; used: number; remaining: number }> {
    if (!supabase) return { allowed: false, used: 0, remaining: 0 };

    const premium = await isPremiumRecruiter(wallet, authUid);
    if (premium) return { allowed: true, used: 0, remaining: Infinity };

    const monthYear = new Date().toISOString().slice(0, 7);
    const whereClause = wallet
        ? { recruiter_wallet: wallet, month_year: monthYear }
        : { recruiter_auth_uid: authUid, month_year: monthYear };

    const { data } = await supabase
        .from("recruiter_outreach_limits")
        .select("outreach_count")
        .match(whereClause)
        .maybeSingle();

    const used = data?.outreach_count ?? 0;
    if (used >= FREE_LIMIT) {
        return { allowed: false, used, remaining: 0 };
    }

    await supabase.from("recruiter_outreach_limits").upsert(
        { ...whereClause, outreach_count: used + 1, updated_at: new Date().toISOString() },
        { onConflict: wallet ? "recruiter_wallet,month_year" : "recruiter_auth_uid,month_year" }
    );

    return { allowed: true, used: used + 1, remaining: FREE_LIMIT - (used + 1) };
}

export async function POST(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);

    try {
        const body = await request.json();
        const {
            rolePosition, initialMessage, candidateWallet,
            proposedInterviewDate, meetingLink,
            // wallet recruiter
            recruiterWallet, signature, nonce, timestamp,
            // Google OAuth recruiter
            authToken,
        } = body;

        if (!rolePosition?.trim()) return err("ERR_VALIDATION", "rolePosition is required");
        if (!initialMessage?.trim()) return err("ERR_VALIDATION", "initialMessage is required");
        if (initialMessage.length > 1000) return err("ERR_VALIDATION", "Message too long (max 1000 chars)");
        if (rolePosition.length > 100) return err("ERR_VALIDATION", "Role too long (max 100 chars)");
        if (!candidateWallet) return err("ERR_VALIDATION", "candidateWallet is required");
        if (!recruiterWallet && !authToken) return err("ERR_AUTH", "Recruiter auth required", 401);

        // Validate meeting link
        if (meetingLink) {
            if (!meetingLink.startsWith("https://")) return err("ERR_VALIDATION", "meetingLink must start with https://");
            if (meetingLink.length > 500) return err("ERR_VALIDATION", "meetingLink too long");
        }

        let authUid: string | undefined;
        let recruiterName: string | null = null;
        let recruiterCompany: string | null = null;
        let recruiterAvatarUrl: string | null = null;

        // ── Auth: Google OAuth recruiter ───────────────────────────────────
        if (authToken) {
            const { data: { user }, error: authErr } = await supabase.auth.getUser(authToken);
            if (authErr || !user) return err("ERR_AUTH", "Invalid auth token", 401);
            authUid = user.id;

            const { data: orgAcc } = await supabase
                .from("org_accounts")
                .select("org_name, avatar_url, email")
                .eq("auth_uid", authUid)
                .maybeSingle();

            if (!orgAcc) return err("ERR_AUTH", "Org account not found", 401);
            recruiterName = orgAcc.org_name || orgAcc.email || "Recruiter";
            recruiterCompany = orgAcc.org_name || null;
            recruiterAvatarUrl = orgAcc.avatar_url || null;

            // Block self-contact (if wallet linked)
            const { data: linkedWallet } = await supabase
                .from("org_accounts")
                .select("wallet_address")
                .eq("auth_uid", authUid)
                .maybeSingle();
            if (linkedWallet?.wallet_address === candidateWallet) {
                return err("ERR_SELF_CONTACT", "Cannot contact yourself", 400);
            }
        }

        // ── Auth: Wallet-based recruiter ───────────────────────────────────
        if (recruiterWallet) {
            if (recruiterWallet === candidateWallet) {
                return err("ERR_SELF_CONTACT", "Cannot contact yourself", 400);
            }

            const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
            if (!skipVerify && (!signature || !nonce || !timestamp)) {
                return err("ERR_SIGNATURE_REQUIRED", "Signature required", 401);
            }
            if (!skipVerify) {
                const { verifySignature } = await import("@/lib/crypto");
                const { isValid, error: sigError } = await verifySignature(
                    recruiterWallet, "send_outreach", nonce, timestamp, signature
                );
                if (!isValid) return err("ERR_SIGNATURE", sigError || "Signature verification failed", 401);
            }

            // Verify the sender is a verified org/company/community account
            const { data: orgVerif } = await supabase
                .from("organization_verifications")
                .select("type, status, expires_at")
                .eq("wallet_address", recruiterWallet)
                .maybeSingle();

            const isExpired = orgVerif?.expires_at ? new Date(orgVerif.expires_at) < new Date() : false;
            const senderIsRecruiter = orgVerif?.status === "verified" && !isExpired && isRecruiterTier(orgVerif?.type ?? "");

            if (!senderIsRecruiter) {
                return err("ERR_FORBIDDEN", "Only verified organization accounts (company, community, DAO) can contact candidates.", 403);
            }

            // Fetch recruiter profile snapshot
            const { data: recProfile } = await supabase
                .from("profiles")
                .select("display_name, avatar_url, organization")
                .eq("wallet_address", recruiterWallet)
                .maybeSingle();

            recruiterName = recProfile?.display_name || orgVerif?.type || `${recruiterWallet.slice(0, 4)}...${recruiterWallet.slice(-4)}`;
            recruiterCompany = recProfile?.organization || null;
            recruiterAvatarUrl = recProfile?.avatar_url || null;
        }

        // Verify candidate exists
        const { data: candidateProfile } = await supabase
            .from("profiles")
            .select("wallet_address")
            .eq("wallet_address", candidateWallet)
            .maybeSingle();

        if (!candidateProfile) return err("ERR_NOT_FOUND", "Candidate not found", 404);

        // Check for existing conversation (return it instead of erroring)
        const existingQuery = supabase.from("conversations").select("id, status");
        const existing = recruiterWallet
            ? await existingQuery
                .eq("recruiter_wallet", recruiterWallet)
                .eq("candidate_wallet", candidateWallet)
                .maybeSingle()
            : await existingQuery
                .eq("recruiter_auth_uid", authUid!)
                .eq("candidate_wallet", candidateWallet)
                .maybeSingle();

        if (existing.data) {
            return NextResponse.json({
                ok: true,
                conversationId: existing.data.id,
                isExisting: true,
                status: existing.data.status,
            });
        }

        // Check & enforce monthly limit
        const limitResult = await checkAndIncrementLimit(recruiterWallet, authUid);
        if (!limitResult.allowed) {
            return err("ERR_LIMIT_REACHED", "Monthly outreach limit reached. Upgrade for unlimited access.", 403);
        }

        // Insert conversation
        const insertPayload: Record<string, any> = {
            candidate_wallet: candidateWallet,
            status: "pending",
            role_position: rolePosition.trim(),
            initial_message: initialMessage.trim(),
            proposed_interview_date: proposedInterviewDate || null,
            meeting_link: meetingLink || null,
            recruiter_name: recruiterName,
            recruiter_company: recruiterCompany,
            recruiter_avatar_url: recruiterAvatarUrl,
        };

        if (recruiterWallet) insertPayload.recruiter_wallet = recruiterWallet;
        if (authUid) insertPayload.recruiter_auth_uid = authUid;

        const { data: conversation, error: insertErr } = await supabase
            .from("conversations")
            .insert(insertPayload)
            .select("id")
            .single();

        if (insertErr) {
            console.error("[outreach] insert error:", insertErr);
            return err("ERR_DB", insertErr.message, 500);
        }

        return NextResponse.json({
            ok: true,
            conversationId: conversation.id,
            isExisting: false,
            limitRemaining: limitResult.remaining,
        });
    } catch (e: any) {
        console.error("[outreach] error:", e);
        return err("ERR_SERVER", e.message, 500);
    }
}
