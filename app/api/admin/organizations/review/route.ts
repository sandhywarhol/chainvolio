import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const ADMIN_WALLET_ADDRESS = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { id, action, reason, adminWallet, signature, nonce, timestamp } = body;

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
                action === "approve" ? "approve_org" : "reject_org",
                nonce || "",
                timestamp || 0,
                signature || ""
            );

            if (!isValid) {
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
            }
        }

        if (!id || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid request. Missing org ID or action." }, { status: 400 });
        }

        // 1. Fetch the organization record first
        const { data: org, error: fetchError } = await supabase
            .from("organization_verifications")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !org) {
            return NextResponse.json({ error: "Organization not found." }, { status: 404 });
        }

        const status = action === "approve" ? "verified" : "rejected";
        const tier = action === "approve" ? 3 : 1;

        // 2. Perform updates
        const { error: updateError } = await supabase
            .from("organization_verifications")
            .update({
                status,
                verifier_tier: tier,
                rejection_reason: reason || null,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("id", id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 3. Update profile role if approved
        if (action === "approve") {
            await supabase
                .from("profiles")
                .update({ role: "system_attester" })
                .eq("wallet_address", org.wallet_address);
        }

        // 4. Create Audit Log
        await supabase
            .from("admin_audit_logs")
            .insert({
                organization_id: id,
                organization_name: org.name,
                action: action === "approve" ? "approved" : "rejected",
                admin_wallet: adminWallet,
                notes: reason || (action === "approve" ? "Approved by admin." : "Rejected by admin."),
                timestamp: new Date().toISOString()
            });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Admin review submission error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
