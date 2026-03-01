import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const errorResponse = (code: string, message: string, status: number = 400) => {
    return NextResponse.json({
        ok: false,
        error: { code, message }
    }, { status });
};

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!supabase) return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);

    try {
        const { id } = params;
        const body = await request.json();
        const { status, notes, wallet, signature, txSignature, nonce, timestamp } = body;

        const cleanTxSignature = txSignature?.replace(/\s/g, '');
        const cleanSignature = signature?.replace(/\s/g, '');

        if (!id) return errorResponse("ERR_INVALID_REQUEST", "Submission ID required", 400);

        // 1. Get the submission and its parent collection to check ownership
        const { data: submission, error: fetchError } = await supabase
            .from("collection_submissions")
            .select("id, collection_id, hiring_collections(owner_wallet)")
            .eq("id", id)
            .single();

        if (fetchError || !submission) {
            return errorResponse("ERR_SUBMISSION_NOT_FOUND", "Submission not found", 404);
        }

        const ownerWallet = (submission as any).hiring_collections?.owner_wallet;

        // --- Signature / Proof Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && !cleanTxSignature && (!wallet || !cleanSignature || !nonce || !timestamp)) {
            return errorResponse("ERR_SIGNATURE_REQUIRED", "On-chain transaction or signature required to review submission.", 401);
        }

        if (!skipVerify && cleanSignature && !cleanTxSignature) {
            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                wallet || "",
                "review_submission",
                nonce || "",
                Number(timestamp) || 0,
                cleanSignature || ""
            );

            if (!isValid) return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed.", 401);
        }

        // Verify that the signer is the collection owner
        if (wallet !== ownerWallet) {
            return errorResponse("ERR_UNAUTHORIZED_OWNER", "Unauthorized. You do not own the parent collection.", 403);
        }

        // Set transaction context for RLS
        await supabase.rpc('set_app_wallet', { wallet_addr: wallet });

        const updates: any = {};
        if (status) updates.recruiter_status = status;
        if (typeof notes === 'string') updates.recruiter_notes = notes;
        if (cleanTxSignature) updates.tx_signature = cleanTxSignature;

        const { error: updateError } = await supabase
            .from("collection_submissions")
            .update(updates)
            .eq("id", id);

        if (updateError) return errorResponse("ERR_DATABASE_ERROR", updateError.message, 500);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("PATCH Submission Error:", err);
        return errorResponse("ERR_SERVER_ERROR", err.message || "Server Error", 500);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!supabase) return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);

    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get("wallet");
        const signature = searchParams.get("signature");
        const nonce = searchParams.get("nonce");
        const timestamp = searchParams.get("timestamp");
        const txSignatureRaw = searchParams.get("txSignature");

        const cleanTxSignature = txSignatureRaw?.replace(/\s/g, '');
        const cleanSignature = signature?.replace(/\s/g, '');

        if (!id) return errorResponse("ERR_INVALID_REQUEST", "ID required", 400);

        // 1. Get ownership info
        const { data: submission, error: fetchError } = await supabase
            .from("collection_submissions")
            .select("collection_id, hiring_collections(owner_wallet)")
            .eq("id", id)
            .single();

        if (fetchError || !submission) return errorResponse("ERR_SUBMISSION_NOT_FOUND", "Submission not found", 404);

        const ownerWallet = (submission as any).hiring_collections?.owner_wallet;

        // --- Signature / Proof Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && !cleanTxSignature && (!wallet || !cleanSignature || !nonce || !timestamp)) {
            return errorResponse("ERR_SIGNATURE_REQUIRED", "On-chain transaction or signature required to delete submission.", 401);
        }

        if (!skipVerify && cleanSignature && !cleanTxSignature) {
            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                wallet || "",
                "review_submission",
                nonce || "",
                Number(timestamp) || 0,
                cleanSignature || ""
            );

            if (!isValid) return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed.", 401);
        }

        if (wallet !== ownerWallet) return errorResponse("ERR_UNAUTHORIZED_OWNER", "Unauthorized. You do not own the parent collection.", 403);

        // Set transaction context for RLS
        await supabase.rpc('set_app_wallet', { wallet_addr: wallet });

        const { error } = await supabase
            .from("collection_submissions")
            .delete()
            .eq("id", id);

        if (error) return errorResponse("ERR_DATABASE_ERROR", error.message, 500);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return errorResponse("ERR_SERVER_ERROR", err.message, 500);
    }
}
