"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
    ArrowLeft,
    ShieldCheck,
    Loader2,
    AlertCircle,
    Wallet,
    CheckCircle,
    Zap,
} from "lucide-react";
import {
    TREASURY_WALLET,
    USDC_MINT_MAINNET,
    USDC_DECIMALS,
    IS_SOL_TEST,
    getSolTestLamports,
} from "@/lib/paymentConfig";

// ─── Color palette (mirrors VerificationRequestModal) ──────────────────────
const C = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hex: "#10b981" },
    pink:    { text: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20",    hex: "#ec4899" },
    blue:    { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    hex: "#3b82f6" },
    amber:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   hex: "#f59e0b" },
} as const;
type CK = keyof typeof C;

// ─── Payment phases ─────────────────────────────────────────────────────────
type Phase =
    | "idle"               // ready for user to click Pay
    | "wallet_pending"     // wallet popup open, awaiting user approval
    | "network_pending"    // tx sent, waiting for Solana confirmation
    | "backend_verifying"  // backend validates + registers the request
    | "success"
    | "error";

const PHASE_LABELS: Record<Phase, string> = {
    idle:              "",
    wallet_pending:    "Approve in wallet…",
    network_pending:   "Finalizing on Solana…",
    backend_verifying: "Verifying payment…",
    success:           "Done!",
    error:             "",
};

// ─── Props ──────────────────────────────────────────────────────────────────
type PaymentModalProps = {
    tierId:        string;
    tierLabel:     string;
    price:         number;   // in USDC
    billingCycle?: "monthly" | "yearly"; // undefined = one-time (Builder)
    colorKey:      CK;
    walletAddress: string;
    profileName:   string;
    website?:      string;
    socials?:      string;
    onBack:    () => void;
    onSuccess: () => void;
};

export function PaymentModal({
    tierId, tierLabel, price, billingCycle, colorKey,
    walletAddress, profileName, website, socials,
    onBack, onSuccess,
}: PaymentModalProps) {
    const { connection }               = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [phase,    setPhase]    = useState<Phase>("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const col = C[colorKey];

    // Display helpers — adapt to payment mode
    const displayAmount   = IS_SOL_TEST ? getSolTestLamports(tierId, billingCycle) / LAMPORTS_PER_SOL : price;
    const displayCurrency = IS_SOL_TEST ? "SOL" : "USDC";
    const displayLabel    = IS_SOL_TEST
        ? `${displayAmount} SOL`
        : `${price} USDC`;

    const isProcessing = phase !== "idle" && phase !== "error" && phase !== "success";

    // Billing period label shown next to the price
    const billingLabel = billingCycle === "monthly" ? "/ month" : billingCycle === "yearly" ? "/ year" : "one-time";
    const billingNote  = billingCycle === "monthly" ? "Billed monthly · renews automatically"
                       : billingCycle === "yearly"  ? "Billed once yearly · best value"
                       : "One-time unlock · no renewal";

    const handlePay = useCallback(async () => {
        if (!publicKey || !sendTransaction) {
            setErrorMsg("Wallet not connected. Please connect a wallet first.");
            setPhase("error");
            return;
        }

        setPhase("wallet_pending");
        setErrorMsg("");

        try {
            let signature: string;
            const treasuryPubkey = new PublicKey(TREASURY_WALLET);
            const { blockhash } = await connection.getLatestBlockhash("confirmed");

            const tx = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey });

            if (IS_SOL_TEST) {
                // ── SOL_TEST: native SOL transfer (SystemProgram.transfer) ──
                const lamports = getSolTestLamports(tierId, billingCycle);
                if (!lamports) throw new Error("Invalid SOL_TEST price — check paymentConfig.");

                tx.add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey:   treasuryPubkey,
                        lamports,
                    })
                );
            } else {
                // ── USDC_PROD: SPL token transfer (transferChecked) ──────────
                const usdcMintPubkey = new PublicKey(USDC_MINT_MAINNET);

                // 1. Resolve ATAs
                const userAta      = await getAssociatedTokenAddress(usdcMintPubkey, publicKey);
                const treasuryAta  = await getAssociatedTokenAddress(usdcMintPubkey, treasuryPubkey);

                // Create treasury ATA if it doesn't exist yet
                const treasuryAtaInfo = await connection.getAccountInfo(treasuryAta);
                if (!treasuryAtaInfo) {
                    tx.add(
                        createAssociatedTokenAccountInstruction(
                            publicKey,
                            treasuryAta,
                            treasuryPubkey,
                            usdcMintPubkey
                        )
                    );
                }

                // 2. Add transferChecked instruction
                const usdcUnits = BigInt(Math.round(price * Math.pow(10, USDC_DECIMALS)));

                tx.add(
                    createTransferCheckedInstruction(
                        userAta,
                        usdcMintPubkey,
                        treasuryAta,
                        publicKey,
                        usdcUnits,
                        USDC_DECIMALS,
                        [],
                        TOKEN_PROGRAM_ID
                    )
                );
            }

            try {
                signature = await sendTransaction(tx, connection, { 
                    maxRetries: 5,
                    skipPreflight: false 
                });
            } catch (walletErr: any) {
                const msg = (walletErr?.message || "").toLowerCase();
                if (
                    msg.includes("user rejected") ||
                    msg.includes("cancelled")     ||
                    msg.includes("canceled")      ||
                    msg.includes("closed")
                ) {
                    setPhase("idle");
                    return;
                }
                throw walletErr;
            }

            setPhase("network_pending");

            let confirmed = false;
            const startTime = Date.now();
            const TIMEOUT = 60000;

            while (Date.now() - startTime < TIMEOUT) {
                const statusRes = await connection.getSignatureStatus(signature);
                const status = statusRes && statusRes.value;

                if (status && (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized")) {
                    confirmed = true;
                    break;
                }

                if (status?.err) {
                    setErrorMsg("Transaction failed on Solana. Please check your balance and try again.");
                    setPhase("error");
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (!confirmed) {
                throw new Error("Transaction took too long to confirm. It might still go through eventually, but please check your wallet before trying again.");
            }

            setPhase("backend_verifying");
            const res = await fetch("/api/verify/validate-payment", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletAddress,
                    tier:         tierId,
                    txSignature:  signature,
                    billingCycle: billingCycle || null,
                    profileName,
                    website:  website  || null,
                    socials:  socials  || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || "Payment verification failed. Please contact support.");
                setPhase("error");
                return;
            }

            setPhase("success");

        } catch (err: any) {
            console.error("[PaymentModal] Error:", err);
            let msg = err?.message || "An unexpected error occurred. Please try again.";
            
            if (msg.includes("block height exceeded") || msg.includes("expired")) {
                msg = "The transaction took too long to confirm on the Solana network. Your funds were likely not sent. Please try again.";
            } else if (msg.includes("insufficient funds") || msg.includes("0x1")) {
                msg = "Insufficient funds in your wallet to cover the payment and network fees.";
            }

            setErrorMsg(msg);
            setPhase("error");
        }
    }, [
        publicKey, sendTransaction, connection,
        tierId, billingCycle, walletAddress, profileName, website, socials,
        price,
    ]);

    // ── Success screen ─────────────────────────────────────────────────────
    if (phase === "success") {
        return (
            <div className="flex flex-col items-center justify-center gap-6 p-10 text-center min-h-[400px]">
                <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${col.bg} border ${col.border}`}
                    style={{ boxShadow: `0 0 50px ${col.hex}35` }}
                >
                    <ShieldCheck className={`w-10 h-10 ${col.text}`} />
                </div>

                <div>
                    <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Payment Successful</h3>
                    <p className="text-[13px] text-white/50 font-medium mb-1">Verification Request Submitted</p>
                    <p className="text-white/30 text-sm leading-relaxed max-w-xs mx-auto">
                        Your <span className={`${col.text} font-bold`}>{tierLabel}</span> request is now
                        awaiting admin review. Your badge will appear once approved.
                    </p>
                </div>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest ${col.bg} ${col.border} ${col.text}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    Status: Pending Admin Review
                </div>

                <button
                    onClick={onSuccess}
                    className="mt-2 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
                >
                    Got it, close
                </button>
            </div>
        );
    }

    // ── Payment form ───────────────────────────────────────────────────────
    return (
        <div className="flex flex-col">

            {/* Sub-header: back + tier badge */}
            <div className="px-6 py-3 flex items-center gap-3 border-b border-white/5">
                <button
                    onClick={onBack}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-white/30 hover:text-white/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to tiers
                </button>
                <div className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${col.bg} ${col.border} ${col.text}`}>
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {tierLabel}
                </div>
            </div>

            {/* Two-column layout: info left, payment right */}
            <div className="p-6 grid md:grid-cols-2 gap-6">

                {/* ── Left: price + what you get ──────────────────────────── */}
                <div className="flex flex-col gap-5">

                    {/* Price card */}
                    <div
                        className="flex items-center justify-between p-5 rounded-2xl bg-black/30 border border-white/8"
                        style={{ boxShadow: `0 0 40px ${col.hex}08` }}
                    >
                        <div>
                            <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.18em] mb-1">
                                {tierLabel} Verification
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[40px] font-black text-white leading-none">{displayAmount}</span>
                                <span className="text-[18px] font-bold text-white/40">{displayCurrency}</span>
                                {billingCycle && (
                                    <span className="text-[12px] font-bold text-white/25">{billingLabel}</span>
                                )}
                            </div>
                            <p className="text-[10px] text-white/20 mt-1">{billingNote}</p>
                        </div>
                        {/* Currency logo */}
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-[11px] font-black bg-[#2775CA]/10 border border-[#2775CA]/20 text-[#2775CA]">
                            $
                        </div>
                    </div>

                    {/* What you get after approval */}
                    <div className={`p-4 rounded-xl ${col.bg} border ${col.border} space-y-2.5`}>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.14em]">After Approval You Receive</p>
                        {[
                            `Verified ${tierLabel} badge on your profile`,
                            `Higher attestation authority in the network`,
                            `Increased trust signal across ChainVolio`,
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <CheckCircle className={`w-3 h-3 flex-shrink-0 mt-px ${col.text} opacity-60`} />
                                <p className="text-[11px] text-white/50 leading-snug">{item}</p>
                            </div>
                        ))}
                    </div>

                    {/* Network badge */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-[#9945FF]/10 border border-[#9945FF]/20 flex items-center justify-center text-[12px]">
                            ⬡
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Payment Network</p>
                            <p className="text-[11px] text-white/55 font-medium">
                                Solana · USDC SPL Token
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Right: wallet pay button + live status ──────────────────── */}
                <div className="flex flex-col gap-4 justify-center">

                    {/* Connected wallet info */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-0.5">Connected Wallet</p>
                            <p className="font-mono text-[11px] text-white/60 truncate">
                                {walletAddress.slice(0, 8)}…{walletAddress.slice(-8)}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-emerald-400 font-bold">Ready</span>
                        </div>
                    </div>

                    {/* Live transaction flow - highlights the active step */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-1.5">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-2.5">Transaction Flow</p>
                        {([
                            { label: "You pay",          value: displayLabel,          activeOn: ["wallet_pending"] },
                            { label: "Solana network",   value: "Broadcasting tx",      activeOn: ["network_pending"] },
                            { label: "ChainVolio",       value: "Verifying payment",    activeOn: ["backend_verifying"] },
                            { label: "Admin review",     value: "Pending",              activeOn: ["success"] },
                        ] as { label: string; value: string; activeOn: Phase[] }[]).map((row, i) => {
                            const active = row.activeOn.includes(phase);
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-all duration-300 ${
                                        active ? `${col.bg} border ${col.border}` : ""
                                    }`}
                                >
                                    <span className="text-[10px] text-white/30 font-medium">{row.label}</span>
                                    <div className="flex items-center gap-1.5">
                                        {active && <Loader2 className={`w-2.5 h-2.5 animate-spin ${col.text}`} />}
                                        <span className={`text-[11px] font-bold ${active ? col.text : "text-white/30"}`}>
                                            {row.value}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Error banner */}
                    {phase === "error" && errorMsg && (
                        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium flex items-start gap-2 leading-relaxed">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Phase status line when processing */}
                    {isProcessing && (
                        <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${col.bg} ${col.border}`}>
                            <Loader2 className={`w-4 h-4 animate-spin flex-shrink-0 ${col.text}`} />
                            <span className="text-[12px] text-white/60 font-medium">
                                {PHASE_LABELS[phase]}
                            </span>
                        </div>
                    )}

                    {/* Main pay button */}
                    <button
                        onClick={handlePay}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 ${
                            isProcessing
                                ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {PHASE_LABELS[phase]}
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Pay {displayLabel}
                            </>
                        )}
                    </button>

                    {/* Security note */}
                    <p className="text-center text-[10px] text-white/15 leading-relaxed">
                        🔒 Processed on-chain via your wallet. Badge appears only after admin approval.
                    </p>
                </div>
            </div>
        </div>
    );
}
