"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    Connection, Transaction, TransactionInstruction,
    PublicKey, ComputeBudgetProgram,
} from "@solana/web3.js";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReceiptDetails = {
    id: string; role: string; org: string;
    description: string; startDate: string; endDate: string;
    ownerWallet: string; attestationCount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function sha256hex(text: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const MEMO_PID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// ─── Component ────────────────────────────────────────────────────────────────
export default function AttestPage() {
    const { id } = useParams();
    const { publicKey, sendTransaction } = useWallet();

    const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [attesting, setAttesting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [txHash, setTxHash] = useState("");
    const [memoId, setMemoId] = useState("");
    const [attesterProfile, setAttesterProfile] = useState<any>(null);
    const [isExternal, setIsExternal] = useState(true);

    // Form fields (same as original)
    const [attesterName, setAttesterName] = useState("");
    const [attesterRole, setAttesterRole] = useState("");
    const [attesterOrg, setAttesterOrg] = useState("");
    const [attesterEmail, setAttesterEmail] = useState("");
    const [entityType, setEntityType] = useState("Individual");
    const [attestationType, setAttestationType] = useState("Employment verification");
    const [confidenceLevel, setConfidenceLevel] = useState("Confirm");
    const [comment, setComment] = useState("");
    const [performance, setPerformance] = useState({
        reliability: 0,
        technical_skill: 0,
        communication: 0,
        leadership: 0,
        integrity: 0,
    });

    useEffect(() => {
        if (!id) return;
        fetch(`/api/attest/${id}`)
            .then(r => { if (!r.ok) throw new Error("Receipt not found"); return r.json(); })
            .then(setReceipt)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!publicKey) {
            setAttesterProfile(null);
            setIsExternal(true);
            return;
        }

        // Sync profile data if logged in
        // Sync profile data if logged in - Single Source of Truth
        fetch(`/api/user/me?wallet=${publicKey.toBase58()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.displayName) {
                    const baseRole = data.role || data.headline || "";
                    const fullRole = (baseRole && data.organization)
                        ? `${baseRole} @ ${data.organization}`
                        : baseRole;

                    setAttesterProfile(data);
                    setAttesterName(data.displayName || "");
                    setAttesterRole(fullRole || "ChainVolio Builder");
                    setAttesterOrg(data.organization || "");
                    setIsExternal(false);
                } else {
                    setAttesterProfile(null);
                    setIsExternal(true);
                }
            })
            .catch(() => {
                setAttesterProfile(null);
                setIsExternal(true);
            });
    }, [publicKey]);

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleAttest = async () => {
        if (!publicKey || !receipt) return;
        setError(""); setAttesting(true);

        try {
            // 1. Server-authoritative timestamp
            const tsRes = await fetch("/api/attest/timestamp");
            if (!tsRes.ok) throw new Error("Failed to obtain server timestamp.");
            const { issued_at } = await tsRes.json();

            // 2. Build Memo V2 payload (stored in DB)
            const attestationId = crypto.randomUUID();
            setMemoId(attestationId);

            const memoV2 = {
                version: "2.0",
                classification: attestationType,
                header: {
                    network: "Solana Mainnet",
                    issuer_wallet: publicKey.toBase58(),
                    issuer_org: attesterOrg || "-",
                    issuer_tier: "Public",
                    issued_at,
                },
                recipient: {
                    wallet: receipt.ownerWallet,
                    cv_id: receipt.id,
                    role: receipt.role,
                    engagement_start: receipt.startDate,
                    engagement_end: receipt.endDate,
                },
                content: {
                    executive_summary: comment,
                    scope_of_work: [],
                    performance: performance,
                    key_achievements: [],
                    final_statement: "",
                },
                signature: {
                    signatory_name: attesterName,
                    signatory_position: attesterRole,
                    signatory_org: attesterOrg,
                },
            };

            // 3. SHA-256 content hash (anchored on-chain)
            const memoJSON = JSON.stringify(memoV2);
            const contentHash = await sha256hex(memoJSON);

            // 4. Compact on-chain memo (under 566 bytes)
            const onChainMemo = JSON.stringify({
                protocol: "chainvolio",
                type: "attestation",
                description: "ChainVolio CV Verification",
                cv_id: receipt.id,
                memo_id: attestationId,
                issuer: publicKey.toBase58(),
                issued_at,
                content_hash: contentHash,
            });

            const memoBytes = new TextEncoder().encode(onChainMemo);
            if (memoBytes.length > 566) throw new Error(`Memo too large: ${memoBytes.length} bytes`);

            // 5. Build & send Solana transaction
            const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
            const conn = new Connection(rpcUrl, "confirmed");
            const tx = new Transaction();
            const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");

            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;
            tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 5000 }));
            tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }));
            tx.add(new TransactionInstruction({
                keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
                programId: MEMO_PID,
                data: Buffer.from(new TextEncoder().encode(onChainMemo)),
            }));

            const txSig = await sendTransaction(tx, conn, { skipPreflight: true, preflightCommitment: "confirmed", maxRetries: 5 });
            const signature = txSig.replace(/\s/g, "");

            // 6. Confirm with robust polling
            let confirmed = false;
            const startTime = Date.now();
            const TIMEOUT = 60000; // 60 seconds

            while (Date.now() - startTime < TIMEOUT) {
                const statusRes = await conn.getSignatureStatus(signature, { searchTransactionHistory: true });
                const status = statusRes && statusRes.value;

                if (status && (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized")) {
                    confirmed = true;
                    break;
                }

                if (status?.err) {
                    throw new Error(`Transaction failed on Solana: ${JSON.stringify(status.err)}`);
                }

                // Wait 2 seconds before polling again
                await new Promise(r => setTimeout(r, 2000));
            }

            if (!confirmed) {
                throw new Error("Transaction took too long to confirm. It might still be successful, please check your wallet.");
            }

            // 7. Record in database
            const res = await fetch("/api/attest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiptId: receipt.id,
                    attesterWallet: publicKey.toBase58(),
                    comment,
                    attesterName,
                    attesterRole,
                    attesterOrg,
                    attesterEmail,
                    attestationType,
                    confidenceLevel,
                    entityType,
                    attestationId,
                    txSignature: signature,
                    issuedAt: issued_at,
                    memoV2,
                    contentHash,
                    classification: attestationType,
                    isExternal,
                }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to record attestation");
            }

            setTxHash(signature);
            setSuccess(true);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Execution failed");
        } finally {
            setAttesting(false);
        }
    };

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error && !receipt) return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
            <p className="text-red-400">{error}</p>
            <Link href="/" className="text-slate-400 hover:text-white text-sm">Return Home</Link>
        </main>
    );

    // ─── Success ──────────────────────────────────────────────────────────────
    if (success) return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center gap-6 px-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl">✓</div>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Attestation Recorded On-Chain</h1>
                <p className="text-slate-400 max-w-sm text-sm">Your verification has been permanently anchored to the Solana blockchain.</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <a href={`https://solscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-center text-sm">
                    🔗 View on Solscan
                </a>
                <Link href={`/memo/${memoId}`}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-medium text-center text-sm">
                    📄 View Verification Memo
                </Link>
                {receipt && (
                    <Link href={`/cv/${receipt.ownerWallet}`}
                        className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 font-medium text-center text-sm">
                        View Updated Profile
                    </Link>
                )}
            </div>
        </main>
    );

    // ─── Main Form ────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen text-white">
            <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto relative z-[100]">
                <Link href="/" className="flex items-center gap-1.5 group">
                    <img src="/chainvolio%20logo.png" alt="ChainVolio" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold">ChainVolio</span>
                </Link>
                <WalletMultiButton />
            </nav>

            <section className="max-w-xl mx-auto px-6 pb-20 space-y-6">
                {/* Header */}
                <div className="mb-8 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        🔗 Identity-Linked Verification
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Verify Proof of Work</h1>
                    <p className="text-slate-400">Confirm a candidate's professional contributions on-chain.</p>
                </div>

                {/* Trust Signal Hint - Only for newcomers */}
                {!publicKey && (
                    <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                        <div className="space-y-2">
                            <p className="font-semibold text-white">No ChainVolio account required.</p>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                However, registered users and verified organizations provide stronger trust signals and help the candidate build a more credible professional reputation.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1">
                            <Link href="/verified-organization" className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/30 text-[11px] font-bold text-slate-300 hover:text-white transition-all duration-300">
                                Register your organization
                            </Link>
                        </div>
                    </div>
                )}

                {/* Work record */}
                {receipt && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Candidate Wallet</label>
                                <p className="font-mono text-emerald-400 text-sm truncate">{receipt.ownerWallet}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Role</label>
                                    <p className="font-semibold text-lg">{receipt.role}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Organization</label>
                                    <p className="font-semibold text-lg">{receipt.org}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Start Date</label>
                                    <p className="font-semibold">{receipt.startDate || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">End Date</label>
                                    <p className="font-semibold">{receipt.endDate || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Wallet gate */}
                {!publicKey ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                        <p className="text-slate-400 text-sm">Connect your wallet to submit this attestation.</p>
                        <div className="flex justify-center"><WalletMultiButton /></div>
                    </div>
                ) : publicKey.toBase58() === receipt?.ownerWallet ? (
                    <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
                        <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <span className="text-2xl">🛑</span>
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-red-500">Action Not Allowed</h2>
                        <p className="text-slate-400 text-sm">You cannot attest to your own work.</p>
                    </div>
                ) : (
                    <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 space-y-5">

                        {/* Verifier identity */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {isExternal ? "Attester Identity (External)" : "Attesting as"}
                                </h2>
                                {!isExternal && (
                                    <Link href="/create-profile" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider">
                                        Edit Profile
                                    </Link>
                                )}
                            </div>

                            {attesterProfile && !isExternal ? (
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                            {attesterProfile.avatarUrl ? (
                                                <img src={attesterProfile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                attesterProfile.displayName?.[0]
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{attesterProfile.displayName}</p>
                                            <p className="text-xs text-slate-400">{attesterProfile.headline || attesterProfile.role || "ChainVolio Builder"}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-1">
                                        {attesterProfile.organization && (
                                            <p className="text-[10px] text-slate-500">
                                                <span className="font-bold uppercase tracking-tighter">Organization:</span> {attesterProfile.organization}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-500">
                                            <span className="font-bold uppercase tracking-tighter">Wallet:</span> <span className="font-mono text-[9px]">{publicKey?.toBase58()}</span>
                                        </p>
                                    </div>
                                    <p className={`text-[9px] font-black px-2 py-1 rounded-md border transition-all ${
                                        attesterProfile.isVerified 
                                        ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10 shadow-sm" 
                                        : attesterProfile.isExpired
                                          ? "text-amber-500 bg-amber-500/5 border-amber-500/10"
                                          : "text-slate-500 bg-slate-500/5 border-slate-700/50"
                                    }`}>
                                        {attesterProfile.isVerified 
                                            ? `Verified ${attesterProfile.verificationTier}` 
                                            : attesterProfile.isExpired
                                              ? "Expired Verification"
                                              : "Unverified User"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Full Name *</label>
                                            <input value={attesterName} onChange={e => setAttesterName(e.target.value)}
                                                placeholder="Your full name"
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Role / Headline *</label>
                                            <input value={attesterRole} onChange={e => setAttesterRole(e.target.value)}
                                                placeholder="e.g. Smart Contract Dev"
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm transition-colors" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Organization (Optional)</label>
                                            <input value={attesterOrg} onChange={e => setAttesterOrg(e.target.value)}
                                                placeholder="Company or DAO"
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Work Email (Optional)</label>
                                            <input type="email" value={attesterEmail} onChange={e => setAttesterEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm transition-colors" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Entity Type</label>
                                        <select value={entityType} onChange={e => setEntityType(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm appearance-none cursor-pointer transition-colors">
                                            <option>Individual</option>
                                            <option>Company</option>
                                            <option>Organization / DAO</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-800" />

                        {/* Verification scope */}
                        <div>
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Scope</h2>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Attestation Type</label>
                                        <select value={attestationType} onChange={e => setAttestationType(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm appearance-none transition-colors">
                                            <option>Employment verification</option>
                                            <option>Professional Attestation</option>
                                            <option>Project Completion</option>
                                            <option>Recommendation Letter</option>
                                            <option>Performance Evaluation</option>
                                            <option>Partnership Confirmation</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Confidence Level</label>
                                        <select value={confidenceLevel} onChange={e => setConfidenceLevel(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm appearance-none transition-colors">
                                            <option>Strongly confirm</option>
                                            <option>Confirm</option>
                                            <option>Partial / limited confirmation</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Performance Ratings */}
                                <div className="pt-2 space-y-4">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Performance Ratings</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { key: "reliability", label: "Reliability" },
                                            { key: "technical_skill", label: "Technical Proficiency" },
                                            { key: "communication", label: "Communication" },
                                            { key: "leadership", label: "Leadership" },
                                            { key: "integrity", label: "Professional Integrity" },
                                        ].map(({ key, label }) => (
                                            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                                <span className="text-sm font-medium text-slate-300">{label}</span>
                                                <div className="flex gap-1">
                                                    {[0, 1, 2, 3, 4, 5].map((num) => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setPerformance(prev => ({ ...prev, [key]: num }))}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${performance[key as keyof typeof performance] === num
                                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                                                }`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Comment (Optional)</label>
                                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-sm resize-none h-24 transition-colors"
                                        placeholder="Add specific context about their performance..." />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-800" />

                        {/* On-chain notice */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <h2 className="text-sm font-bold text-white">Record Verification On-Chain</h2>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                By confirming this attestation, you will record a cryptographic proof of this verification on the blockchain.
                                This creates a permanent, tamper-resistant record that strengthens the credibility of this CV.
                            </p>
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <p className="text-xs font-bold text-amber-500 mb-0.5">⚠ Fee Notice</p>
                                <p className="text-xs text-slate-400">A small network fee is required to submit this record. The fee is paid to the blockchain network, not to ChainVolio.</p>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm">⚠ {error}</p>
                            </div>
                        )}

                        {/* Quota display */}
                        {attesterProfile && (() => {
                          const used = attesterProfile.attestationUsed ?? 0;
                          const quota = attesterProfile.attestationQuota ?? 2;
                          const remaining = Math.max(0, quota - used);
                          const pct = Math.min(100, (used / quota) * 100);
                          const isLimitReached = used >= quota;
                          const isNearLimit = !isLimitReached && pct >= 80;

                          if (isLimitReached) return (
                            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-rose-400">You've reached your limit.</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Attestation Usage: {used} / {quota} this month</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border bg-rose-500/10 border-rose-500/30 text-rose-400">Limit Reached</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full w-full" />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Upgrade for unlimited access and keep endorsing talent.</p>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Upgrade Now
                                </Link>
                            </div>
                          );

                          return (
                            <div className={`p-3 rounded-xl border space-y-2.5 ${
                              isNearLimit
                                ? "bg-amber-500/5 border-amber-500/20"
                                : "bg-slate-800/30 border-slate-700/50"
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attestation Usage</p>
                                        <p className="text-sm font-bold text-white">
                                            {used} <span className="text-slate-500">/</span> {quota}
                                            <span className="ml-2 text-xs font-medium text-slate-400">this month</span>
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                        isNearLimit
                                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                    }`}>
                                        {isNearLimit ? "Almost Full" : "Available"}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            isNearLimit ? "bg-amber-500" : "bg-emerald-500/60"
                                        }`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                {isNearLimit && (
                                    <p className="text-[11px] text-amber-400/80 font-medium">⚠ You're almost at your limit - {remaining} left this month</p>
                                )}
                            </div>
                          );
                        })()}

                        {/* Submit */}
                        <button onClick={handleAttest}
                            disabled={attesting || !attesterName.trim() || !attesterRole.trim() || (attesterProfile && attesterProfile.attestationUsed >= attesterProfile.attestationQuota)}
                            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all flex items-center justify-center gap-2">
                            {attesting ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                            ) : "Confirm Attestation On-Chain"}
                        </button>

                    </div>
                )}
            </section>
        </main>
    );
}
