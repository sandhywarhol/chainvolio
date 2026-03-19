import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { 
    SERVER_PAYMENT_MODE, 
    TREASURY_WALLET, 
    USDC_MINT_MAINNET, 
    USDC_MINT_DEVNET,
    getSolTestLamports,
    getSolTestPrice,
    USDC_PROD_PRICES,
    USDC_PROD_DISPLAY
} from "@/lib/paymentConfig";

// Tier ID → display type label stored in DB
const TIER_TYPE_MAP: Record<string, string> = {
    Builder:   "Builder",
    Community: "Community / DAO",
    Company:   "Company / Organization",
};

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Server not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { walletAddress, tier, txSignature, billingCycle, profileName, website, socials } = body;

        console.log(`[TEST-MONITOR] Starting validation for ${walletAddress} - Tier: ${tier}, Cycle: ${billingCycle || 'N/A'}`);
        console.log(`[TEST-MONITOR] TX Signature: ${txSignature}`);

        const isSolTest = SERVER_PAYMENT_MODE === "SOL_TEST";

        // ── Basic validation ─────────────────────────────────────────────────
        if (!walletAddress || !tier || !txSignature) {
            return NextResponse.json(
                { error: "walletAddress, tier, and txSignature are required" },
                { status: 400 }
            );
        }

        // Validate billingCycle (optional, only for subscription tiers)
        const validCycles = ["monthly", "yearly", null, undefined];
        if (!validCycles.includes(billingCycle)) {
            return NextResponse.json({ error: "Invalid billingCycle value." }, { status: 400 });
        }

        const type = TIER_TYPE_MAP[tier];
        if (!type) {
            return NextResponse.json({ error: "Invalid tier for payment flow." }, { status: 400 });
        }

        // ── Determine expected amounts ───────────────────────────────────────
        let expectedAmountRaw: bigint | number = 0;
        let displayPrice: number = 0;

        if (isSolTest) {
            expectedAmountRaw = getSolTestLamports(tier, billingCycle);
            displayPrice      = getSolTestPrice(tier, billingCycle);
        } else {
            const prodPrices = USDC_PROD_PRICES[tier];
            const prodDisplay = USDC_PROD_DISPLAY[tier];
            
            if (billingCycle === "yearly") {
                expectedAmountRaw = prodPrices.yearly || BigInt(0);
                displayPrice      = prodDisplay.yearly || 0;
            } else if (billingCycle === "monthly") {
                expectedAmountRaw = prodPrices.monthly || BigInt(0);
                displayPrice      = prodDisplay.monthly || 0;
            } else {
                expectedAmountRaw = prodPrices.oneTime || BigInt(0);
                displayPrice      = prodDisplay.oneTime || 0;
            }
        }

        // Security: Minimum amount must be > 0
        if (Number(expectedAmountRaw) <= 0) {
            return NextResponse.json({ error: "Invalid payment configuration." }, { status: 500 });
        }

        // ── Security: prevent double-use of transaction ──────────────────────
        const { data: txAlreadyUsed } = await supabase
            .from("organization_verifications")
            .select("id")
            .eq("tx_signature", txSignature)
            .maybeSingle();

        if (txAlreadyUsed) {
            return NextResponse.json(
                { error: "This transaction signature has already been used for a verification request." },
                { status: 409 }
            );
        }

        // ── Check existing status for this wallet ────────────────────────────
        const { data: existing } = await supabase
            .from("organization_verifications")
            .select("id, status")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

        if (existing?.status === "verifying") {
            return NextResponse.json(
                { error: "Another payment verification is already in progress for this wallet. Please wait a moment." },
                { status: 429 }
            );
        }
        if (existing?.status === "pending") {
            return NextResponse.json(
                { error: "A verification request is already pending for this wallet." },
                { status: 409 }
            );
        }
        if (existing?.status === "verified") {
            return NextResponse.json(
                { error: "This wallet is already verified." },
                { status: 409 }
            );
        }

        // ── LOCK: Set status to 'verifying' ──────────────────────────────────
        // This prevents race conditions while we wait for Solana finalization.
        // By including the tx_signature here, the DB's UNIQUE index will block
        // any other wallet from using this signature immediately (fail-fast).
        let lockRecordId: string | null = existing?.id || null;
        if (existing) {
            const { error: lockErr } = await supabase
                .from("organization_verifications")
                .update({ 
                    status: "verifying", 
                    tx_signature: txSignature,
                    updated_at: new Date().toISOString() 
                })
                .eq("id", existing.id);
            
            if (lockErr) {
                return NextResponse.json(
                    { error: "This transaction is already being verified or has been used. Please check your transaction signature." },
                    { status: 409 }
                );
            }
        } else {
            const { data: newRec, error: lockErr } = await supabase
                .from("organization_verifications")
                .insert({
                    wallet_address: walletAddress,
                    name:           profileName || walletAddress,
                    type,
                    status:         "verifying",
                    tx_signature:   txSignature,
                })
                .select("id")
                .single();
            
            if (lockErr) {
                return NextResponse.json(
                    { error: "This transaction or wallet is already in the verification process. Please check your transaction signature." },
                    { status: 409 }
                );
            }
            lockRecordId = newRec?.id || null;
        }

        // ── Solana Evaluation ──
        try {
            // ── Fetch & validate Solana transaction ──────────────────────────────
            const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
            const connection = new Connection(rpcUrl, "finalized");

            let tx: Awaited<ReturnType<typeof connection.getParsedTransaction>> = null;
            let attempts = 0;
            const MAX_ATTEMPTS = 5;

            while (attempts < MAX_ATTEMPTS) {
                try {
                    tx = await connection.getParsedTransaction(txSignature, {
                        commitment: "finalized",
                        maxSupportedTransactionVersion: 0,
                    });
                    
                    if (tx) break; // Found it!
                } catch (rpcErr: any) {
                    console.error(`RPC error (attempt ${attempts + 1}):`, rpcErr);
                }

                attempts++;
                if (attempts < MAX_ATTEMPTS) {
                    console.log(`[TEST-MONITOR] Transaction not finalized yet, waiting 2s... (Attempt ${attempts})`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            if (!tx) {
                throw new Error("Transaction not found or not finalized yet. Please wait a moment and try again.");
            }

            if (!tx.meta) {
                throw new Error("Transaction metadata is unavailable. Please try again.");
            }

            if (tx.meta.err) {
                throw new Error("This transaction failed on-chain. Please use a successful transaction.");
            }

            console.log(`[TEST-MONITOR] Transaction ${txSignature} confirmed and finalized.`);

            // ── Extract Transaction Sender (Fee Payer) ───────────────────────────
            // accountKeys[0] is always the fee-payer and primary signer.
            const senderKey = tx.transaction.message.accountKeys[0]?.pubkey.toString();
            if (!senderKey) {
                throw new Error("Could not determine transaction sender.");
            }

            // ── Validate payment ─────────────────────────────────────────────────
            let validTransfer = false;

            if (isSolTest) {
                // ── SOL Validate ────────────────────────────────────────────────

                // 1. Verify the sender matches the wallet that submitted the request.
                if (senderKey !== walletAddress) {
                    console.warn(
                        `[validate-payment] Sender mismatch — tx sender: ${senderKey}, claimed wallet: ${walletAddress}, tx: ${txSignature}`
                    );
                    throw new Error("Sender wallet mismatch. The transaction was not sent from your connected wallet.");
                }

                // 2. Verify the treasury received the correct amount.
                const treasuryIndex = tx.transaction.message.accountKeys.findIndex(
                    (key) => key.pubkey.toString() === TREASURY_WALLET
                );

                if (treasuryIndex === -1) {
                    throw new Error("Treasury wallet was not involved in this transaction.");
                }

                const preBalance  = tx.meta.preBalances[treasuryIndex];
                const postBalance = tx.meta.postBalances[treasuryIndex];
                const received    = postBalance - preBalance;

                // Allow a tolerance of 0.00001 SOL (10_000 lamports) to absorb any rounding or
                // RPC precision differences without falsely rejecting a valid payment.
                //
                // We use a floor check (received >= expected - tolerance) rather than a symmetric
                // abs() window so that overpayments are still accepted — a user who accidentally
                // sends more than required should not be rejected.
                const TOLERANCE_LAMPORTS = 10_000; // 0.00001 SOL
                const minimumAccepted   = Number(expectedAmountRaw) - TOLERANCE_LAMPORTS;

                if (received > 0 && received >= minimumAccepted) {
                    validTransfer = true;
                    console.log(`[TEST-MONITOR] Payment validated: Received ${received} lamports (Target: ${expectedAmountRaw}, Tolerance: ${TOLERANCE_LAMPORTS})`);
                } else if (received > 0) {
                    const got  = (received         / 1_000_000_000).toFixed(7);
                    const need = (Number(expectedAmountRaw) / 1_000_000_000).toFixed(7);
                    const tol  = (TOLERANCE_LAMPORTS / 1_000_000_000).toFixed(7);
                    throw new Error(`Incorrect payment amount. Expected ${need} SOL (±${tol} tolerance) but received ${got} SOL.`);
                }
            } else {
                // ── USDC Validate ───────────────────────────────────────────────
                const ACCEPTED_MINTS = new Set([USDC_MINT_MAINNET, USDC_MINT_DEVNET]);
                const preTokenBalances  = tx.meta.preTokenBalances  || [];
                const postTokenBalances = tx.meta.postTokenBalances || [];
                let receivedUSDCAmount = BigInt(0);

                for (const post of postTokenBalances) {
                    if (!ACCEPTED_MINTS.has(post.mint)) continue;
                    if (post.owner !== TREASURY_WALLET) continue;

                    const pre       = preTokenBalances.find(p => p.accountIndex === post.accountIndex);
                    const preAmount  = BigInt(pre?.uiTokenAmount.amount  || "0");
                    const postAmount = BigInt(post.uiTokenAmount.amount || "0");
                    const received   = postAmount - preAmount;

                    if (received <= BigInt(0)) continue;
                    receivedUSDCAmount = received;

                    if (received >= (expectedAmountRaw as bigint)) {
                        validTransfer = true;
                        break;
                    }
                }

                if (!validTransfer && receivedUSDCAmount > BigInt(0)) {
                    const got  = (Number(receivedUSDCAmount) / 1_000_000).toFixed(2);
                    const need = (Number(expectedAmountRaw) / 1_000_000).toFixed(2);
                    throw new Error(`Incorrect payment amount. Expected ${need} USDC but found ${got} USDC paid to the treasury.`);
                }
            }

            if (!validTransfer) {
                const currency = isSolTest ? "SOL" : "USDC";
                throw new Error(`No ${currency} payment to the treasury wallet was found in this transaction.`);
            }

            // ── SUCCESS: Set status to 'pending' ─────────────────────────────────
            const now = new Date().toISOString();
            const { error: updateErr } = await supabase
                .from("organization_verifications")
                .update({
                    type,
                    name:             profileName || walletAddress,
                    website:          website  || null,
                    social_link:      socials  || null,
                    status:           "pending",
                    tx_signature:     txSignature,
                    sender_wallet:    senderKey,
                    amount_paid:      displayPrice,
                    billing_cycle:    billingCycle || null,
                    rejection_reason: null,
                    reviewed_at:      null,
                    updated_at:       now,
                })
                .eq("id", lockRecordId);

            if (updateErr) {
                throw new Error(`Database error: ${updateErr.message}`);
            }

            console.log(`[TEST-MONITOR] Validation SUCCESS. Record ${lockRecordId} set to 'pending'.`);

            return NextResponse.json({ ok: true });

        } catch (err: any) {
            console.error("[validate-payment] Validation failure:", err);

            // ── ROLLBACK: Revert the lock ──────────────────────────────────────
            if (existing) {
                // Return to previous status (likely 'rejected') and clear the failed signature lock
                await supabase
                    .from("organization_verifications")
                    .update({ 
                        status: existing.status, 
                        tx_signature: null,
                        updated_at: new Date().toISOString() 
                    })
                    .eq("id", existing.id);
            } else if (lockRecordId) {
                // New record that failed → delete the lock record entirely.
                await supabase
                    .from("organization_verifications")
                    .delete()
                    .eq("id", lockRecordId);
            }

            return NextResponse.json({ error: err.message || "Payment verification failed." }, { status: 400 });
        }

    } catch (err: any) {
        console.error("Payment validation error:", err);
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}

