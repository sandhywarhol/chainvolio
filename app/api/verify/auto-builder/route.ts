import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

/**
 * POST /api/verify/auto-builder
 *
 * Auto-verifies a wallet as Builder tier when all criteria are met:
 * 1. Profile exists with a display name
 * 2. At least one contact channel is filled (social/email/website)
 * 3. At least one proof of work (receipt) exists
 *
 * No payment or admin review required — purely merit-based.
 */
export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { walletAddress } = body;

        if (!walletAddress) {
            return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
        }

        // 1. Check existing verification — block if already verified as Builder or higher
        const { data: existing } = await supabase
            .from("organization_verifications")
            .select("id, status, type, verifier_tier")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

        const TIER_RANK: Record<string, number> = {
            "Builder": 1,
            "Public Figure": 2,
            "Community / DAO": 3,
            "Company / Organization": 4,
        };

        if (existing?.status === "verified" && (TIER_RANK[existing.type] ?? 0) >= 1) {
            return NextResponse.json({
                ok: true,
                alreadyVerified: true,
                currentTier: existing.type,
            });
        }

        if (existing?.status === "pending" || existing?.status === "verifying") {
            return NextResponse.json({ error: "A verification request is already pending." }, { status: 409 });
        }

        // 2. Fetch profile to check criteria
        const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, website, discord, whatsapp, email, twitter, github, linkedin, instagram, telegram")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

        // 3. Fetch receipts count
        const { count: receiptCount } = await supabase
            .from("receipts")
            .select("id", { count: "exact", head: true })
            .eq("wallet_address", walletAddress);

        // 4. Evaluate criteria
        const missing: string[] = [];

        const hasDisplayName = !!profile?.display_name?.trim();
        if (!hasDisplayName) missing.push("display_name");

        const hasContact = !!(
            profile?.website || profile?.discord || profile?.whatsapp ||
            profile?.email || profile?.twitter || profile?.github ||
            profile?.linkedin || profile?.instagram || profile?.telegram
        );
        if (!hasContact) missing.push("contact");

        const hasReceipt = (receiptCount ?? 0) >= 1;
        if (!hasReceipt) missing.push("receipt");

        if (missing.length > 0) {
            return NextResponse.json({ ok: false, missing }, { status: 200 });
        }

        // 5. All criteria met — grant Builder tier automatically
        const nowIso = new Date().toISOString();

        if (existing) {
            // Update existing rejected/revoked/expired record
            const { error: updateErr } = await supabase
                .from("organization_verifications")
                .update({
                    type: "Builder",
                    status: "verified",
                    verifier_tier: 1,
                    name: profile?.display_name || walletAddress,
                    rejection_reason: null,
                    reviewed_at: nowIso,
                    approved_at: nowIso,
                    expires_at: null,
                    verification_source: "auto_builder",
                    updated_at: nowIso,
                })
                .eq("id", existing.id);

            if (updateErr) throw updateErr;
        } else {
            // Create new record
            const { error: insertErr } = await supabase
                .from("organization_verifications")
                .insert({
                    wallet_address: walletAddress,
                    name: profile?.display_name || walletAddress,
                    type: "Builder",
                    status: "verified",
                    verifier_tier: 1,
                    approved_at: nowIso,
                    expires_at: null,
                    verification_source: "auto_builder",
                });

            if (insertErr) throw insertErr;
        }

        // 6. Send notification
        try {
            await supabase.from("notifications").insert({
                wallet_address: walletAddress,
                title: "Builder Badge Earned",
                message: "You are now a Verified Builder 🎉 Your profile meets all criteria.",
                type: "verification",
                link: "/dashboard#verification-status",
                is_read: false,
            });
        } catch {
            // Non-critical — don't fail the request if notification fails
        }

        return NextResponse.json({ ok: true, granted: true });

    } catch (err: any) {
        console.error("[auto-builder] Error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
