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

const ADMIN_WALLET = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

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
                { error: "This transaction signature has already been used." },
                { status: 409 }
            );
        }

        // ── Check existing status for this wallet ────────────────────────────
        const { data: existing } = await supabase
            .from("organization_verifications")
            .select("id, status, type, pending_upgrade_status")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

        const TIER_RANK: Record<string, number> = { "Builder": 1, "Public Figure": 2, "Community / DAO": 3, "Company / Organization": 4 };
        const currentRank = TIER_RANK[existing?.type || ""] || 0;
        const targetRank = TIER_RANK[type] || 0;

        if (existing?.status === "verifying" || (existing?.status === "verified" && existing?.pending_upgrade_status === "verifying")) {
            return NextResponse.json({ error: "Another payment verification is already in progress." }, { status: 429 });
        }
        if (existing?.status === "pending" || (existing?.status === "verified" && existing?.pending_upgrade_status === "pending")) {
            return NextResponse.json({ error: "A verification request is already pending." }, { status: 409 });
        }
        if (existing?.status === "verified" && targetRank <= currentRank) {
            return NextResponse.json({ error: `You are already verified as ${existing.type}.` }, { status: 409 });
        }

        // ── LOCK: Set status to 'verifying' ──────────────────────────────────
        let lockRecordId: string | null = existing?.id || null;
        if (existing) {
            const updateProps: any = { 
                tx_signature: txSignature,
                updated_at: new Date().toISOString() 
            };
            if (existing.status === "verified") {
                updateProps.pending_upgrade_status = "verifying";
                updateProps.pending_upgrade_type = type;
            } else {
                updateProps.status = "verifying";
            }

            const { error: lockErr } = await supabase
                .from("organization_verifications")
                .update(updateProps)
                .eq("id", existing.id);
            
            if (lockErr) {
                return NextResponse.json({ error: "Failed to lock for verification." }, { status: 409 });
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
                return NextResponse.json({ error: "Failed to create verification lock." }, { status: 409 });
            }
            lockRecordId = newRec?.id || null;
        }

        // ── Solana Evaluation ──
        try {
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
                    if (tx) break;
                } catch (rpcErr) {
                    console.error(`RPC error (attempt ${attempts + 1}):`, rpcErr);
                }
                attempts++;
                if (attempts < MAX_ATTEMPTS) await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (!tx) throw new Error("Transaction not found or not finalized yet.");
            if (!tx.meta) throw new Error("Transaction metadata is unavailable.");
            if (tx.meta.err) throw new Error("This transaction failed on-chain.");

            const senderKey = tx.transaction.message.accountKeys[0]?.pubkey.toString();
            if (!senderKey) throw new Error("Could not determine transaction sender.");

            let validTransfer = false;
            if (isSolTest) {
                if (senderKey !== walletAddress) throw new Error("Sender wallet mismatch.");
                const treasuryIndex = tx.transaction.message.accountKeys.findIndex(k => k.pubkey.toString() === TREASURY_WALLET);
                if (treasuryIndex === -1) throw new Error("Treasury wallet was not involved.");
                const preBalance  = tx.meta.preBalances[treasuryIndex];
                const postBalance = tx.meta.postBalances[treasuryIndex];
                const received    = postBalance - preBalance;
                const TOLERANCE_LAMPORTS = 10_000;
                const minimumAccepted   = Number(expectedAmountRaw) - TOLERANCE_LAMPORTS;
                if (received >= minimumAccepted) validTransfer = true;
            } else {
                const ACCEPTED_MINTS = new Set([USDC_MINT_MAINNET, USDC_MINT_DEVNET]);
                const preTokenBalances  = tx.meta.preTokenBalances  || [];
                const postTokenBalances = tx.meta.postTokenBalances || [];
                let treasuryReceived = BigInt(0);
                let senderPaid       = BigInt(0);

                for (const post of postTokenBalances) {
                    if (!ACCEPTED_MINTS.has(post.mint)) continue;
                    if (post.owner !== TREASURY_WALLET) continue;
                    const pre = preTokenBalances.find(p => p.accountIndex === post.accountIndex);
                    const diff = BigInt(post.uiTokenAmount.amount || "0") - BigInt(pre?.uiTokenAmount.amount || "0");
                    if (diff > 0) treasuryReceived += diff;
                }
                for (const pre of preTokenBalances) {
                    if (!ACCEPTED_MINTS.has(pre.mint)) continue;
                    if (pre.owner !== walletAddress) continue;
                    const post = postTokenBalances.find(p => p.accountIndex === pre.accountIndex);
                    const diff = BigInt(pre.uiTokenAmount.amount || "0") - BigInt(post?.uiTokenAmount.amount || "0");
                    if (diff > 0) senderPaid += diff;
                }
                const expected = expectedAmountRaw as bigint;
                if (treasuryReceived >= expected && senderPaid >= expected) validTransfer = true;
            }

            if (!validTransfer) throw new Error("Payment not found or insufficient.");

            const updateData: any = {
                name:             profileName || walletAddress,
                website:          website  || null,
                social_link:      socials  || null,
                tx_signature:     txSignature,
                sender_wallet:    senderKey,
                amount_paid:      displayPrice,
                billing_cycle:    billingCycle || null,
                rejection_reason: null,
                reviewed_at:      null,
                updated_at:       new Date().toISOString(),
            };

            if (existing?.status === "verified") {
                updateData.pending_upgrade_status = "pending";
                updateData.pending_upgrade_type = type;
            } else {
                updateData.type = type;
                updateData.status = "pending";
            }

            const { error: finalError } = await supabase
                .from("organization_verifications")
                .update(updateData)
                .eq("id", lockRecordId);

            if (finalError) throw new Error(`Database error: ${finalError.message}`);

            const cycleLabel = billingCycle === "yearly" ? "yearly" : billingCycle === "monthly" ? "monthly" : "";
            const isUpgradeNotif = existing?.status === "verified";

            // ── Notify user: payment received, pending admin review ──────────
            try {
                await supabase.from("notifications").insert({
                    wallet_address: walletAddress,
                    title: "Payment Received – Pending Review",
                    message: `Your ${type} verification payment (${displayPrice} USDC${cycleLabel ? ` / ${cycleLabel}` : ""}) has been received. Your badge will appear after admin review.`,
                    type: "verification",
                    related_id: lockRecordId,
                    link: "/dashboard#verification-status",
                    is_read: false,
                });
            } catch (notifErr) {
                console.error("[validate-payment] Failed to send user notification:", notifErr);
            }

            // ── Notify admin: new verification payment waiting for review ────
            try {
                await supabase.from("notifications").insert({
                    wallet_address: ADMIN_WALLET,
                    title: isUpgradeNotif ? "New Upgrade Request" : "New Verification Payment",
                    message: `${profileName || walletAddress} paid ${displayPrice} USDC for ${type}${cycleLabel ? ` (${cycleLabel})` : ""}. Awaiting your review.`,
                    type: "admin_payment",
                    related_id: lockRecordId,
                    link: "/admin/organization-verification",
                    is_read: false,
                });
            } catch (notifErr) {
                console.error("[validate-payment] Failed to send admin notification:", notifErr);
            }

            return NextResponse.json({ ok: true });

        } catch (err: any) {
            console.error("[validate-payment] Validation failure:", err);
            if (existing) {
                const rollbackProps: any = { 
                    tx_signature: null,
                    updated_at: new Date().toISOString() 
                };
                if (existing.status === "verified") rollbackProps.pending_upgrade_status = null;
                else rollbackProps.status = existing.status;

                await supabase.from("organization_verifications").update(rollbackProps).eq("id", existing.id);
            } else if (lockRecordId) {
                await supabase.from("organization_verifications").delete().eq("id", lockRecordId);
            }
            return NextResponse.json({ error: err.message || "Payment verification failed." }, { status: 400 });
        }
    } catch (err: any) {
        console.error("Payment validation error:", err);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}
