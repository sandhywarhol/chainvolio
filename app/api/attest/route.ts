import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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
            confidenceLevel
        } = body;

        if (!receiptId || !attesterWallet || !signature || !attesterName || !attesterRole) {
            return NextResponse.json(
                { error: "Missing required fields: name and role are required." },
                { status: 400 }
            );
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
