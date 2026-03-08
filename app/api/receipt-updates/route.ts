import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { receiptId, walletAddress, message, signature, nonce, timestamp } = body;

        if (!receiptId || !walletAddress || !message) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // --- Signature Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && (!signature || !nonce || !timestamp)) {
            return NextResponse.json({ error: "Signature required for this action." }, { status: 401 });
        }

        const { verifySignature } = await import("@/lib/crypto");
        const { isValid, error: sigError } = await verifySignature(
            walletAddress,
            "update_work",
            nonce || "",
            timestamp || 0,
            signature || ""
        );

        if (!isValid) {
            return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
        }

        // 1. Verify that the receipt exists and belongs to the wallet
        const { data: existing, error: fetchError } = await supabase
            .from("receipts")
            .select("wallet_address")
            .eq("id", receiptId)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
        }

        if (existing.wallet_address !== walletAddress) {
            return NextResponse.json({ error: "Unauthorized: You do not own this receipt." }, { status: 403 });
        }

        // 2. Insert update
        const { error: insertError } = await supabase.from("receipt_updates").insert({
            receipt_id: receiptId,
            wallet_address: walletAddress,
            message,
            signature: signature || "skipped",
            nonce: nonce || "skipped"
        });

        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
