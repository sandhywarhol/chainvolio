"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import bs58 from "bs58"; // We need to install this: npm install bs58

type ReceiptDetails = {
    id: string;
    role: string;
    org: string;
    description: string;
    startDate: string;
    endDate: string;
    ownerWallet: string;
    attestationCount: number;
};

export default function AttestPage() {
    const { id } = useParams();
    const { publicKey, signMessage } = useWallet();
    const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [attesting, setAttesting] = useState(false);
    const [comment, setComment] = useState("");
    const [attesterName, setAttesterName] = useState("");
    const [attesterRole, setAttesterRole] = useState("");
    const [attesterOrg, setAttesterOrg] = useState("");
    const [attesterEmail, setAttesterEmail] = useState("");
    const [attestationType, setAttestationType] = useState("Employment verification");
    const [confidenceLevel, setConfidenceLevel] = useState("Confirm");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        fetch(`/api/attest/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Receipt not found");
                return res.json();
            })
            .then(setReceipt)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAttest = async () => {
        if (!publicKey || !signMessage || !receipt) return;
        setError("");
        setAttesting(true);

        try {
            // 1. Create message to sign
            const message = `I verify that I have worked with this person and this work history is accurate.\n\nReceipt ID: ${receipt.id}\nAttester: ${publicKey.toBase58()}\nDate: ${new Date().toISOString()}`;
            const encodedMessage = new TextEncoder().encode(message);

            // 2. Sign message
            const signatureBytes = await signMessage(encodedMessage);
            const signature = bs58.encode(signatureBytes);

            // 3. Submit to API
            const res = await fetch("/api/attest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiptId: receipt.id,
                    attesterWallet: publicKey.toBase58(),
                    signature,
                    comment,
                    attesterName,
                    attesterRole,
                    attesterOrg,
                    attesterEmail,
                    attestationType,
                    confidenceLevel
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to attest");
            }

            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error signing message");
        } finally {
            setAttesting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen text-white flex items-center justify-center">
                <p className="text-slate-400">Loading receipt details...</p>
            </main>
        );
    }

    if (error || !receipt) {
        return (
            <main className="min-h-screen text-white flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error || "Receipt not found"}</p>
                <Link href="/" className="text-slate-400 hover:text-white">
                    Return Home
                </Link>
            </main>
        );
    }

    if (success) {
        return (
            <main className="min-h-screen text-white flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
                    ✓
                </div>
                <h1 className="text-2xl font-bold text-center">Attestation Verified!</h1>
                <p className="text-slate-400 text-center max-w-sm">
                    Thank you for verifying this work history. Your cryptographic signature has been recorded.
                </p>
                <Link
                    href={`/cv/${receipt.ownerWallet}`}
                    className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-medium"
                >
                    View Updated Profile
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-white">
            <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto relative z-[100]">
                <Link href="/" className="flex items-center gap-1.5 group">
                    <img src="/chainvolio logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold">chainvolio</span>
                </Link>
                <WalletMultiButton />
            </nav>

            <section className="max-w-xl mx-auto px-6 py-12">
                <div className="mb-8 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        🛡 Identity-Linked Verification
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Verify Proof of Work</h1>
                        <p className="text-slate-400">
                            Confirm a candidate's professional contributions on-chain.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-left text-sm space-y-2">
                        <p className="font-semibold text-white text-base">No ChainVolio account required.</p>
                        <p className="text-slate-400 leading-relaxed">
                            Verifying this work helps the candidate build professional trust. Your name, role, and wallet signature will be cryptographically linked to this record.
                        </p>
                    </div>
                </div>

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
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Description</label>
                            <p className="text-slate-300 mt-1">{receipt.description}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
                            <span className="text-slate-400">
                                {receipt.startDate} – {receipt.endDate}
                            </span>
                            {receipt.attestationCount > 0 && (
                                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                    {receipt.attestationCount} existing verification(s)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {!publicKey ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                        <p className="text-slate-400">Connect your wallet to sign this verification.</p>
                        <div className="flex justify-center">
                            <WalletMultiButton />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Your Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                                    <input
                                        type="text"
                                        value={attesterName}
                                        onChange={(e) => setAttesterName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm"
                                        placeholder="Andi Wijaya"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Relationship *</label>
                                    <input
                                        type="text"
                                        value={attesterRole}
                                        onChange={(e) => setAttesterRole(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm"
                                        placeholder="e.g. Project Lead, Manager"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Organization (Optional)</label>
                                    <input
                                        type="text"
                                        value={attesterOrg}
                                        onChange={(e) => setAttesterOrg(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm"
                                        placeholder="Company or Group"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Work Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={attesterEmail}
                                        onChange={(e) => setAttesterEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Verification Scope</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Attestation Type</label>
                                    <select
                                        value={attestationType}
                                        onChange={(e) => setAttestationType(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm appearance-none"
                                    >
                                        <option value="Employment verification">Employment verification</option>
                                        <option value="Freelance / Contract work">Freelance / Contract work</option>
                                        <option value="Project collaboration">Project collaboration</option>
                                        <option value="Reference / Recommendation">Reference / Recommendation</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence Level</label>
                                    <select
                                        value={confidenceLevel}
                                        onChange={(e) => setConfidenceLevel(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm appearance-none"
                                    >
                                        <option value="Strongly confirm">Strongly confirm</option>
                                        <option value="Confirm">Confirm</option>
                                        <option value="Partial / limited confirmation">Partial confirmation</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Comment (Optional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none resize-none h-24 text-sm"
                                    placeholder="Add specific context about their performance..."
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleAttest}
                                disabled={attesting}
                                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {attesting ? "Processing..." : (
                                    <>
                                        <span>Confirm & Sign Verification</span>
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest font-bold">
                                🔒 Secure Wallet signature required
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
