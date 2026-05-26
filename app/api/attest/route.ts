import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { Connection } from "@solana/web3.js";
import { calculateScore } from "@/lib/score";
import { getAttestationQuota, getVerificationLabel } from "@/lib/paymentConfig";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const receiptId = searchParams.get("receiptId");
    const attesterWallet = searchParams.get("attesterWallet");

    if (!supabase || !receiptId || !attesterWallet) {
        return NextResponse.json({ blocked: false });
    }

    try {
        const { data: receipt } = await supabase
            .from("receipts")
            .select("wallet_address")
            .eq("id", receiptId)
            .single();

        if (!receipt) return NextResponse.json({ blocked: false });

        const { data: attesterReceipts } = await supabase
            .from("receipts")
            .select("id")
            .eq("wallet_address", attesterWallet);

        if (!attesterReceipts || attesterReceipts.length === 0) {
            return NextResponse.json({ blocked: false });
        }

        const ids = attesterReceipts.map((r: any) => r.id);
        const { data: reciprocal } = await supabase
            .from("attestations")
            .select("id")
            .eq("attester_wallet", receipt.wallet_address)
            .in("receipt_id", ids)
            .limit(1);

        return NextResponse.json({ blocked: !!(reciprocal && reciprocal.length > 0) });
    } catch {
        return NextResponse.json({ blocked: false });
    }
}

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
                const rpcUrl = process.env.SOLANA_RPC || process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
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

                // Verify the fee payer of the TX matches the claimed attesterWallet
                try {
                    const txDetails = await connection.getParsedTransaction(cleanTxSignature, {
                        maxSupportedTransactionVersion: 0,
                        commitment: "confirmed",
                    });
                    const feePayer = txDetails?.transaction?.message?.accountKeys?.[0]?.pubkey?.toString();
                    if (feePayer && feePayer !== attesterWallet) {
                        return NextResponse.json({
                            error: "Transaction signer does not match attester wallet."
                        }, { status: 403 });
                    }
                } catch (parseErr) {
                    // Non-fatal: if we can't fetch TX details, skip signer check rather than blocking valid attestations
                    console.warn("[attestation-api] Could not verify TX signer:", parseErr);
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

        // --- Receipt Verification ---
        const { data: receipt, error: fetchError } = await supabase
            .from("receipts")
            .select("status, wallet_address, role, org")
            .eq("id", receiptId)
            .single();

        if (fetchError || !receipt) {
            return NextResponse.json({ error: "Work record not found." }, { status: 404 });
        }

        if ((receipt as any).status === "Locked") {
            return NextResponse.json({ error: "Work record is archived and immutable." }, { status: 403 });
        }

        if ((receipt as any).wallet_address === attesterWallet) {
            return NextResponse.json({ error: "You cannot attest your own work." }, { status: 403 });
        }

        // --- Identity & Quota Enforcement ---
        let finalAttesterName = attesterName;
        let finalAttesterRole = attesterRole;
        let finalAttesterOrg = attesterOrg;
        let verificationTier = "unverified";

        // Fetch profile and verification status to determine identity and quota
        const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, headline, professional_role, organization, attestation_used, attestation_reset_date")
            .eq("wallet_address", attesterWallet)
            .single();

        const { data: orgData } = await supabase
            .from("organization_verifications")
            .select("status, type, expires_at")
            .eq("wallet_address", attesterWallet)
            .maybeSingle();

        // Check if attester wallet belongs to a Google org (Stripe subscriber)
        const { data: googleOrgData } = await supabase
            .from("org_accounts")
            .select("auth_uid, org_name, plan_name, subscription_status, current_period_end")
            .eq("wallet_address", attesterWallet)
            .maybeSingle();

        const now = new Date();
        const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
        const isExpired = expiresAtDate ? now > expiresAtDate : false;
        const isVerified = orgData?.status === 'verified' && !isExpired;

        const googleOrgPeriodExpired = googleOrgData?.current_period_end
            ? new Date(googleOrgData.current_period_end) < now
            : false;
        const isGoogleOrgActive = !!(
            googleOrgData?.subscription_status === 'active' &&
            !googleOrgPeriodExpired &&
            googleOrgData?.plan_name &&
            googleOrgData.plan_name !== 'free'
        );

        if (isVerified && orgData?.type) {
            verificationTier = orgData.type;
        } else if (isGoogleOrgActive && googleOrgData?.plan_name) {
            verificationTier = googleOrgData.plan_name; // 'community' or 'company'
        }

        // 1. Resolve Identity
        if (isGoogleOrgActive && googleOrgData) {
            // Google Stripe org: use org name as the attester identity
            finalAttesterName = googleOrgData.org_name || finalAttesterName;
            finalAttesterOrg = googleOrgData.org_name || null;
            finalAttesterRole = getVerificationLabel(verificationTier);
        } else if (profile && isExternal === false) {
            finalAttesterName = profile.display_name;
            finalAttesterOrg = profile.organization || null;
            if (isVerified) {
                finalAttesterRole = getVerificationLabel(verificationTier);
            } else {
                finalAttesterRole = profile.headline || profile.professional_role || "Builder";
            }
        } else if (!isVerified && !isGoogleOrgActive) {
            // Unverified users or those without a profile get the "Regular" label
            verificationTier = "unverified";
            // If they provided a name/role manually, we keep it but it will be labeled as "Regular" in the UI
        }

        // 2. Attestation Quota Check
        const quota = getAttestationQuota(verificationTier);
        console.log(`[attest-api] wallet=${attesterWallet} tier=${verificationTier} quota=${quota} used=${profile?.attestation_used ?? 0}`);

        // a. Per-Target Monthly Limit Check for Unverified Users
        if (verificationTier === "unverified") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Check if this attester has attested to ANY of this candidate's receipts in the last 30 days
            const { data: existingTargetAttests } = await supabase
                .from("attestations")
                .select("id, receipts!inner(wallet_address)")
                .eq("attester_wallet", attesterWallet)
                .eq("receipts.wallet_address", (receipt as any).wallet_address)
                .gte("memo_issued_at", thirtyDaysAgo.toISOString())
                .limit(1);

            if (existingTargetAttests && existingTargetAttests.length > 0) {
                return NextResponse.json({ 
                    error: "Unverified wallets are limited to 1 attestation per candidate every 30 days. Please upgrade your account for higher limits." 
                }, { status: 429 });
            }
        }

        // b. Total Monthly Quota Check
        // trackedUsed is hoisted so the counter update at the end of the handler is correct
        // even after a monthly reset (where the in-block `used` would be 0).
        let trackedUsed = 0;
        if (profile) {
            let used = profile.attestation_used || 0;
            let resetDate = profile.attestation_reset_date ? new Date(profile.attestation_reset_date) : new Date(0);
            // Monthly Reset Logic
            if (now > resetDate) {
                used = 0;
                resetDate = new Date();
                resetDate.setDate(resetDate.getDate() + 30);

                // Update reset date in DB immediately
                await supabase
                    .from("profiles")
                    .update({
                        attestation_used: 0,
                        attestation_reset_date: resetDate.toISOString()
                    })
                    .eq("wallet_address", attesterWallet);
            }

            trackedUsed = used;

            // enforcement
            if (used >= quota) {
                return NextResponse.json({
                    error: `Monthly attestation limit reached for ${verificationTier} tier (${used}/${quota}). Please upgrade your verification tier to increase your quota.`
                }, { status: 403 });
            }
        } else {
            // Check quota for users without a profile
            if (quota <= 0) {
                return NextResponse.json({ 
                    error: `Verification is required to give attestations. Your current tier is detected as: ${verificationTier}` 
                }, { status: 403 });
            }
            
            // For users without a profile, we also check their global history to enforce the quota of 1
            const { count } = await supabase
                .from("attestations")
                .select("id", { count: 'exact', head: true })
                .eq("attester_wallet", attesterWallet)
                .gte("memo_issued_at", new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());

            if ((count || 0) >= quota) {
                 return NextResponse.json({ 
                    error: `Unverified wallets are limited to ${quota} total attestation per 30 days. Register a profile to increase your quota.` 
                }, { status: 403 });
            }
        }
        // ----------------------------------------


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
                    error: `Reciprocal attestation (coworker-swap) detected. The candidate has previously attested your work, so you cannot attest them back to maintain trust integrity.` 
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

        // --- 3. Trigger Notification for Candidate ---
        try {
            const verifierLabel = finalAttesterOrg || finalAttesterName;
            const projectTitle = (receipt as any).role || "Work Record";
            const notificationTitle = "New Attestation";
            const notificationMessage = `Your work as ${projectTitle} has been attested by ${verifierLabel}`;

            await supabase.from("notifications").insert({
                wallet_address: receipt.wallet_address,
                title: notificationTitle,
                message: notificationMessage,
                type: 'attestation',
                related_id: receiptId,
                link: `/dashboard#receipt-${receiptId}`,
                is_read: false
            });
        } catch (notifErr) {
            console.error("Failed to trigger attestation notification:", notifErr);
            // Non-blocking
        }

        // Update user attestation count atomically by re-reading current value right before update
        if (profile) {
            const { data: freshProfile } = await supabase
                .from("profiles")
                .select("attestation_used")
                .eq("wallet_address", attesterWallet)
                .single();
            const freshUsed = freshProfile?.attestation_used ?? trackedUsed;
            await supabase
                .from("profiles")
                .update({ attestation_used: freshUsed + 1 })
                .eq("wallet_address", attesterWallet);
        } else {
            const resetDate = new Date();
            resetDate.setDate(resetDate.getDate() + 30);
            await supabase.from("profiles").upsert({
                wallet_address: attesterWallet,
                display_name: finalAttesterName,
                professional_role: finalAttesterRole,
                organization: finalAttesterOrg,
                attestation_used: 1,
                attestation_reset_date: resetDate.toISOString()
            }, { onConflict: 'wallet_address' });
        }

        // Trigger score recalculation for candidate
        calculateScore(receipt.wallet_address).catch(console.error);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
