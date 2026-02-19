"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import { Loader2, Send, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";

export default function CandidateSubmission({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const { publicKey, connected } = useWallet();
    const [collection, setCollection] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [primarySignal, setPrimarySignal] = useState("");
    const [roleStrength, setRoleStrength] = useState("");

    useEffect(() => {
        async function fetchCollection() {
            try {
                const res = await fetch(`/api/hiring/collections/${slug}/candidates`); // Reusing dashboard API for collection info
                const data = await res.json();
                if (data.collection) {
                    setCollection(data.collection);
                } else {
                    setError("Collection not found or has been closed.");
                }
            } catch (err) {
                setError("Failed to load collection details.");
            } finally {
                setLoading(false);
            }
        }
        fetchCollection();
    }, [slug]);

    const handleSubmit = async () => {
        if (!publicKey) return;
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/hiring/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    collectionSlug: slug,
                    walletAddress: publicKey.toBase58(),
                    primarySignal,
                    roleStrength,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || "Submission failed.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error && !collection) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] text-white p-6">
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Oops!</h1>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <Link href="/" className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all w-full block">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }



    return (
        <main className="min-h-screen text-white">
            <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-1.5 group">
                    <img src="/chainvolio logo.png" alt="Chainvolio Logo" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold">Chainvolio</span>
                </Link>
                <WalletMultiButton />
            </nav>

            <section className="max-w-2xl mx-auto px-6 py-16 text-center relative z-10">
                {!submitted ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
                        <p className="text-slate-400 mb-12 text-lg">
                            {collection.description || "Submit your on-chain CV for review by the hiring team."}
                        </p>

                        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-left">
                            {!connected ? (
                                <div className="space-y-6 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h2 className="text-xl font-bold">Ready to apply?</h2>
                                    <p className="text-slate-400 mb-6">Connect your wallet to share your verified work history.</p>
                                    <div className="flex justify-center">
                                        <WalletMultiButton />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                                            <span className="text-lg font-mono text-emerald-400 font-bold">CV</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Submitting as</p>
                                            <p className="text-emerald-400 font-mono text-sm">{publicKey?.toBase58()}</p>
                                        </div>
                                    </div>

                                    {/* Feature 1: Primary Evaluation Signal */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                                            Strongest Proof of Work <span className="text-red-400">*</span>
                                        </label>
                                        <p className="text-xs text-slate-500 font-medium mb-3 mt-1">
                                            Select the single strongest, verifiable signal recruiters should evaluate first.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {["GitHub / Code", "On-chain activity", "Hackathon wins", "DAO governance", "NFT / Creative"].map((sig) => (
                                                <button
                                                    key={sig}
                                                    onClick={() => setPrimarySignal(sig)}
                                                    className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${primarySignal === sig
                                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                        : "bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                                        }`}
                                                >
                                                    {sig}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Feature 5: Self-Declared Role Strength */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                                            Primary Role <span className="text-red-400">*</span>
                                        </label>
                                        <p className="text-xs text-slate-500 font-medium mb-3 mt-1">
                                            Select the role closest to how you actually contribute in Web3.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {["Builder / Engineer", "Game Developer", "Researcher", "Designer / Creative", "Operator / Growth", "Hybrid"].map((role) => (
                                                <button
                                                    key={role}
                                                    onClick={() => setRoleStrength(role)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${roleStrength === role
                                                        ? "bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                        : "bg-black/20 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                                                        }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {error && <p className="text-red-400 text-sm py-2 px-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4 text-center">{error}</p>}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !primarySignal || !roleStrength}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 group mt-4"
                                    >
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit On-Chain CV <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                                    </button>

                                    <div className="text-center space-y-2 pt-2">
                                        <p className="text-xs text-slate-500">
                                            Recruiters only see a summarized on-chain profile. Your full wallet history remains private.
                                        </p>
                                        <p className="text-[10px] text-slate-600">
                                            Most applications are reviewed within 2–5 days.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Submission Successful!</h1>
                        <p className="text-slate-400 mb-10 text-lg">
                            The hiring team at <span className="text-white font-bold">{collection.title}</span> has received your CV.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <Link
                                href={`/cv/${publicKey?.toBase58()}`}
                                className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                View My Live CV <ExternalLink className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/"
                                className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
