import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const ADMIN_WALLET_ADDRESS = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

// Maps the stored type string → numeric verifier_tier
const TYPE_TO_TIER: Record<string, number> = {
    "Builder":               1,
    "Public Figure":         2,
    "Community / DAO":       3,
    "Company / Organization": 4,
};

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { id, action, reason, adminWallet, signature, nonce, timestamp } = body;

        console.log(`[TEST-MONITOR] Admin review started for ${id} with decision ${action}...`);

        const ALLOWED_ACTIONS = ["approve", "reject", "revoke", "reset", "expire", "delete"];

        if (adminWallet !== ADMIN_WALLET_ADDRESS) {
            return NextResponse.json({ error: "Unauthorized access. This page is restricted." }, { status: 403 });
        }

        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify) {
            if (!signature || !nonce || !timestamp) {
                return NextResponse.json({ error: "Authentication required." }, { status: 401 });
            }

            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                adminWallet,
                (action === "approve" ? "approve_org" : action === "reject" ? "reject_org" : `admin_${action}`) as any,
                nonce || "",
                timestamp || 0,
                signature || ""
            );

            if (!isValid) {
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
            }
        }

        if (!id || !ALLOWED_ACTIONS.includes(action)) {
            return NextResponse.json({ error: "Invalid request. Missing org ID or action." }, { status: 400 });
        }

        // 1. Fetch the verification record
        const { data: org, error: fetchError } = await supabase
            .from("organization_verifications")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !org) {
            return NextResponse.json({ error: "Verification request not found." }, { status: 404 });
        }

        const now = new Date();
        const nowIso = now.toISOString();

        // ── Handle Delete ────────────────────────────────────────────────────
        if (action === "delete") {
            const { error: deleteError } = await supabase
                .from("organization_verifications")
                .delete()
                .eq("id", id);

            if (deleteError) {
                return NextResponse.json({ error: deleteError.message }, { status: 500 });
            }

            // Audit log
            await supabase.from("admin_audit_logs").insert({
                organization_id: id,
                organization_name: org.name,
                action: "deleted",
                admin_wallet: adminWallet,
                notes: reason || "Record deleted by admin.",
                timestamp: nowIso,
            });

            return NextResponse.json({ ok: true });
        }

        // ── Handle State Updates ─────────────────────────────────────────────
        let updateData: any = {
            updated_at: nowIso,
        };

        let auditAction = "";
        let auditNote   = reason || "";

        if (action === "approve") {
            updateData.status = "verified";
            updateData.verifier_tier = TYPE_TO_TIER[org.type] ?? 1;
            updateData.reviewed_at = nowIso;
            updateData.approved_at = nowIso;
            updateData.rejection_reason = null;

            if (org.billing_cycle) {
                // Determine the base date for the new expiration.
                // If the user already has a future expiry (renewal), we extend FROM that date.
                // Otherwise (first time or expired), we start FROM now.
                let baseDate = now;
                let verificationState = "expired/new";
                let previousExpiresAt = null;

                if (org.expires_at) {
                    const existingExpiry = new Date(org.expires_at);
                    previousExpiresAt = existingExpiry.toISOString();
                    if (existingExpiry > now) {
                        baseDate = existingExpiry;
                        verificationState = "active";
                    }
                }
                console.log(`[TEST-MONITOR] Verification state: ${verificationState}, found previous expiresAt: ${previousExpiresAt}.`);

                const expiry = new Date(baseDate);
                if (org.billing_cycle === "monthly") expiry.setDate(expiry.getDate() + 30);
                else if (org.billing_cycle === "yearly") expiry.setDate(expiry.getDate() + 365);
                
                updateData.expires_at = expiry.toISOString();
                console.log(`[TEST-MONITOR] New expiration set to ${updateData.expires_at}.`);
            } else {
                updateData.expires_at = null;
            }
            auditAction = "approved";
            if (!auditNote) auditNote = "Approved by admin.";
            console.log("[TEST-MONITOR] Approval complete.");

        } else if (action === "reject") {
            updateData.status = "rejected";
            updateData.reviewed_at = nowIso;
            updateData.rejection_reason = reason || "No reason provided.";
            auditAction = "rejected";
            if (!auditNote) auditNote = `Rejected: ${updateData.rejection_reason}`;

        } else if (action === "revoke") {
            updateData.status = "revoked";
            updateData.expires_at = null;
            updateData.reviewed_at = nowIso;
            auditAction = "revoked";
            if (!auditNote) auditNote = "Verification revoked by admin.";

        } else if (action === "reset") {
            updateData.status = "pending";
            updateData.approved_at = null;
            updateData.expires_at = null;
            updateData.rejection_reason = null;
            updateData.reviewed_at = null;
            auditAction = "reset_to_pending";
            if (!auditNote) auditNote = "Reset to pending status by admin.";

        } else if (action === "expire") {
            updateData.status = "expired";
            updateData.expires_at = nowIso;
            auditAction = "forced_expire";
            if (!auditNote) auditNote = "Manually expired by admin.";
        }

        // 2. Perform Update
        const { error: updateError } = await supabase
            .from("organization_verifications")
            .update(updateData)
            .eq("id", id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 3. Audit log
        await supabase.from("admin_audit_logs").insert({
            organization_id: id,
            organization_name: org.name,
            action: auditAction,
            admin_wallet: adminWallet,
            notes: auditNote,
            timestamp: nowIso,
        });

        return NextResponse.json({ ok: true });

    } catch (err) {
        console.error("Admin review submission error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

