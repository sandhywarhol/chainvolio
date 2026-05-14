import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { Connection, PublicKey } from "@solana/web3.js";

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
            .select("id, collection_id, candidate_wallet, role_strength, hiring_collections(owner_wallet, title, slug, description, metadata)")
            .eq("id", id)
            .single();

        if (fetchError || !submission) {
            return errorResponse("ERR_SUBMISSION_NOT_FOUND", "Submission not found", 404);
        }

        const ownerWallet = (submission as any).hiring_collections?.owner_wallet;

        // --- Signature / Proof Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";

        // Internal workflow actions like notes or shortlisted/rejected are off-chain and don't require signatures
        const isWorkflowAction = ["shortlisted", "rejected", "pending"].includes(status) || (typeof notes === 'string' && !status);

        if (!skipVerify && !cleanTxSignature && !isWorkflowAction && (!wallet || !cleanSignature || !nonce || !timestamp)) {
            return errorResponse("ERR_SIGNATURE_REQUIRED", "On-chain transaction or signature required for this action.", 401);
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

        // --- On-Chain Signer Verification ---
        if (!skipVerify && cleanTxSignature) {
            try {
                const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com");
                
                // Fetch transaction details
                const tx = await connection.getParsedTransaction(cleanTxSignature, {
                    maxSupportedTransactionVersion: 0,
                    commitment: 'confirmed'
                });

                if (tx) {
                    const signers = tx.transaction.message.accountKeys
                        .filter(a => a.signer)
                        .map(a => a.pubkey.toBase58());
                    
                    if (!signers.includes(ownerWallet)) {
                        console.error("On-chain verification failed: Owner wallet", ownerWallet, "not in signers", signers);
                        return errorResponse("ERR_INVALID_SIGNER", "The on-chain proof was not signed by the authorized recruiter.", 403);
                    }
                } else {
                    console.warn("Could not fetch transaction for verification yet. Proceeding with caution.");
                    // In a production environment, you might want to wait or fail if tx is missing after several retries
                }
            } catch (vErr) {
                console.warn("Transaction verification error:", vErr);
            }
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

        // --- 3.5 Trigger Notifications ---
        if (status && ['shortlisted', 'rejected', 'hired'].includes(status)) {
            try {
                const roleTitle = (submission as any).hiring_collections?.title || "Role";
                let notificationTitle = "Hiring Update";
                let notificationMessage = "";

                if (status === 'shortlisted') {
                    notificationMessage = `You’ve been shortlisted for ${roleTitle}`;
                } else if (status === 'rejected') {
                    notificationMessage = "Your application was not selected";
                } else if (status === 'hired') {
                    notificationTitle = "Selected 🎉";
                    notificationMessage = `You’ve been selected for ${roleTitle}`;
                }

                if (notificationMessage) {
                    const colSlug = (submission as any).hiring_collections?.slug;
                    await supabase.from("notifications").insert({
                        wallet_address: submission.candidate_wallet,
                        title: notificationTitle,
                        message: notificationMessage,
                        type: 'hiring',
                        related_id: id,
                        link: colSlug ? `/r/${colSlug}#application-status` : '/dashboard',
                        is_read: false
                    });
                }
            } catch (notifErr) {
                console.error("Failed to trigger notification:", notifErr);
                // Non-blocking
            }
        }

        // --- 4. Special Integration: Create Hiring Record on Success ---
        if (status === 'hired' && cleanTxSignature) {
            try {
                const hc = (submission as any).hiring_collections;
                const jobTitle = hc?.title || "Web3 Professional";
                const recruiterOrg = hc?.metadata?.companyName || jobTitle;
                const recruiterName = hc?.metadata?.recruiterName || "Verified Recruiter";
                const recruiterRole = hc?.metadata?.recruiterRole || jobTitle;
                const jobDescription = hc?.description || `Successfully hired for ${jobTitle} at ${recruiterOrg}.`;

                // Idempotency guard: skip if a receipt for this tx already exists
                const { data: existing } = await supabase
                    .from("receipts")
                    .select("id")
                    .eq("tx_signature", cleanTxSignature)
                    .maybeSingle();

                if (existing) {
                    console.log("[hiring] Receipt already exists for tx, skipping duplicate creation.");
                    return NextResponse.json({ ok: true });
                }

                // Create a verifiable work record (receipt) for the candidate
                const { data: receipt, error: receiptError } = await supabase
                    .from("receipts")
                    .insert({
                        wallet_address: submission.candidate_wallet,
                        role: jobTitle,
                        org: recruiterOrg,
                        description: jobDescription,
                        start_date: new Date().toISOString().split('T')[0],
                        end_date: null,
                        status: "Attested",
                        tx_signature: cleanTxSignature
                    })
                    .select()
                    .single();

                if (!receiptError && receipt) {

                    // Create the attestation record to link to the recruiter
                    await supabase.from("attestations").insert({
                        receipt_id: receipt.id,
                        attester_wallet: wallet,
                        signature: cleanTxSignature, // Required by DB schema
                        attester_name: recruiterName,
                        attester_role: recruiterRole,
                        attester_org: recruiterOrg,
                        attestation_type: "Hiring Proof",
                        tx_signature: cleanTxSignature,
                        confidence_level: "Confirmed",
                        comment: `Recruitment Decision Confirmed for ${jobTitle}`,
                        memo_issued_at: new Date().toISOString()
                    });
                }
            } catch (integrationErr) {
                console.error("Failed to create hiring receipt:", integrationErr);
                // We don't fail the whole request as the submission status IS updated
            }
        }

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
