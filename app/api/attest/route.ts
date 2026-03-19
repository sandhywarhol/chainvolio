import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { Connection } from "@solana/web3.js";

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
            txSignature,
            comment,
            attesterName,
            attesterRole,
            attesterOrg,
            attesterEmail,
            attestationType,
            confidenceLevel,
            entityType,
            attestationId,
            nonce,
            timestamp,
            issuedAt,
            memoV2,
            contentHash,
            classification,
            isExternal,
        } = body;

        // Server-side ISO 8601 timestamp - use client-provided value if valid,
        // otherwise fall back to server time (safety net)
        const memoIssuedAt = issuedAt && /^\d{4}-\d{2}-\d{2}T/.test(issuedAt)
            ? issuedAt
            : new Date().toISOString();

        const cleanTxSignature = txSignature?.replace(/\s/g, '');
        const cleanSignature = signature?.replace(/\s/g, '');

        // --- Signature / Proof Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";

        // If we have an on-chain TX signature, that is our proof. 
        // Otherwise, we fall back to the message signature.
        if (!skipVerify && !cleanTxSignature && (!cleanSignature || !nonce || !timestamp)) {
            return NextResponse.json({ error: "On-chain transaction or signature required to attest work." }, { status: 401 });
        }

        if (!skipVerify && cleanSignature && !cleanTxSignature) {
            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                attesterWallet,
                "attest",
                nonce || "",
                timestamp || 0,
                cleanSignature || ""
            );

            if (!isValid) {
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
            }
        }

        // Verify the txSignature on-chain if provided
        if (!skipVerify && cleanTxSignature) {
            try {
                const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
                const connection = new Connection(rpcUrl, "confirmed");

                // Wait/Poll for the transaction to be visible and confirmed by the RPC
                let status = null;
                let attempts = 0;
                const MAX_ATTEMPTS = 15;

                while (attempts < MAX_ATTEMPTS) {
                    const statusRes = await connection.getSignatureStatus(cleanTxSignature, { searchTransactionHistory: true });
                    status = statusRes.value;

                    if (status && (status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized')) {
                        break;
                    }

                    attempts++;
                    if (attempts < MAX_ATTEMPTS) {
                        console.log(`[attestation-api] Waiting for tx confirmation... (Attempt ${attempts}, tx: ${cleanTxSignature})`);
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }

                if (!status) {
                    return NextResponse.json({
                        error: "On-chain record not found on the Solana network. It might be delayed, please wait 30 seconds and try again."
                    }, { status: 400 });
                }

                if (status.err) {
                    return NextResponse.json({
                        error: `Blockchain transaction reached consensus but FAILED: ${JSON.stringify(status.err)}. Your funds were likely returned (check Solscan for confirmation).`
                    }, { status: 400 });
                }
            } catch (err: any) {
                console.error("On-chain verification failed:", err);
                return NextResponse.json({ error: "Failed to verify transaction on-chain." }, { status: 500 });
            }
        }
        // ----------------------------

        // Set transaction context for RLS parity
        await supabase.rpc('set_app_wallet', { wallet_addr: attesterWallet });

        if (!receiptId || !attesterWallet || (!cleanSignature && !cleanTxSignature) || !attesterName || !attesterRole) {
            return NextResponse.json(
                { error: "Missing required fields: proof, name, and role are required." },
                { status: 400 }
            );
        }

        // --- Identity Integrity Enforcement ---
        let finalAttesterName = attesterName;
        let finalAttesterRole = attesterRole;
        let finalAttesterOrg = attesterOrg;

        if (isExternal === false) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name, headline, role, organization")
                .eq("wallet_address", attesterWallet)
                .single();

            if (profile) {
                finalAttesterName = profile.display_name;
                finalAttesterRole = profile.headline || profile.role || "ChainVolio Builder";
                finalAttesterOrg = profile.organization || null;
            }
        }
        // ----------------------------------------

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

        // 1. Check for Anti-Reciprocity (prevent A -> B if B -> A exists)
        // Find all receipts owned by attesterWallet
        const { data: attesterReceipts, error: arError } = await supabase
            .from("receipts")
            .select("id")
            .eq("wallet_address", attesterWallet);

        if (!arError && attesterReceipts && attesterReceipts.length > 0) {
            const attesterReceiptIds = attesterReceipts.map(r => r.id);
            // Check if receipt.wallet_address (the candidate) has attested any of attesterWallet's receipts
            const { data: reciprocalAttestations, error: raError } = await supabase
                .from("attestations")
                .select("id")
                .eq("attester_wallet", receipt.wallet_address)
                .in("receipt_id", attesterReceiptIds)
                .limit(1);

            if (!raError && reciprocalAttestations && reciprocalAttestations.length > 0) {
                return NextResponse.json({ 
                    error: "Reciprocal attestation (coworker-swap) is currently not allowed to maintain trust integrity across the network." 
                }, { status: 403 });
            }
        }

        // Insert attestation
        const { error } = await supabase.from("attestations").insert({
            id: attestationId, // Use the ID generated for the on-chain memo
            receipt_id: receiptId,
            attester_wallet: attesterWallet,
            signature: cleanSignature || cleanTxSignature, // Store the proof
            tx_signature: cleanTxSignature,
            memo_issued_at: memoIssuedAt,
            comment,
            attester_name: finalAttesterName,
            attester_role: finalAttesterRole,
            attester_org: finalAttesterOrg,
            attester_email: attesterEmail,
            attestation_type: attestationType,
            confidence_level: confidenceLevel,
            memo_v2: memoV2 || null,
            content_hash: contentHash || null,
            classification: classification || null,
            is_external: isExternal !== undefined ? isExternal : true,
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
