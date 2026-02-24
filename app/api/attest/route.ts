import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const {
            receiptId,
            attesterWallet,
            signature,
            comment,
            attesterName,
            attesterRole,
            attesterOrg,
            attesterEmail,
            attestationType,
            confidenceLevel,
            nonce,
            timestamp
        } = body;

        // --- Signature Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && (!signature || !nonce || !timestamp)) {
            return NextResponse.json({ error: "Signature required to attest work." }, { status: 401 });
        }


        const { verifySignature } = await import("@/lib/crypto");
        const { isValid, error: sigError } = await verifySignature(

            attesterWallet,
            "attest",
            nonce || "",
            timestamp || 0,
            signature || ""
        );


        if (!isValid) {
            return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
        }
        // ----------------------------

        // Set transaction context for RLS parity
        await supabase.rpc('set_app_wallet', { wallet_addr: attesterWallet });

        if (!receiptId || !attesterWallet || !signature || !attesterName || !attesterRole) {
            return NextResponse.json(
                { error: "Missing required fields: name and role are required." },
                { status: 400 }
            );
        }

        // 0. Verify Receipt state
        const { data: receipt, error: fetchError } = await supabase
            .from("receipts")
            .select("status, wallet_address")
            .eq("id", receiptId)
            .single();

        if (fetchError || !receipt) {
            return NextResponse.json({ error: "Work record not found." }, { status: 404 });
        }

        if (receipt.status === "Locked") {
            return NextResponse.json({ error: "Work record is archived and immutable." }, { status: 403 });
        }

        if (receipt.wallet_address === attesterWallet) {
            return NextResponse.json({ error: "You cannot attest your own work." }, { status: 403 });
        }

        // Insert attestation
        const { error } = await supabase.from("attestations").insert({
            receipt_id: receiptId,
            attester_wallet: attesterWallet,
            signature,
            comment,
            attester_name: attesterName,
            attester_role: attesterRole,
            attester_org: attesterOrg,
            attester_email: attesterEmail,
            attestation_type: attestationType,
            confidence_level: confidenceLevel,
        });

        if (error) {
            if (error.code === "23505") { // Unique violation
                return NextResponse.json({ error: "You have already attested this work." }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update receipt status to "Attested" (optional, but good for simple queries)
        await supabase
            .from("receipts")
            .update({ status: "Attested" })
            .eq("id", receiptId);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
