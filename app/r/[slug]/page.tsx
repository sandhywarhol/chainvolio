"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import {
    Loader2,
    Send,
    CheckCircle,
    ExternalLink,
    AlertCircle,
    ShieldCheck,
    CalendarDays,
    Twitter,
    Github,
    MessageSquare,
    Building2,
    User,
    BadgeCheck,
    Clock,
    DollarSign,
    Briefcase,
    Globe
} from "lucide-react";

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
        <main className="min-h-screen text-white selection:bg-emerald-500/30">
            <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto border-b border-white/5 bg-[#0a0a0b]/40 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 group-hover:scale-110 transition-transform grayscale hover:grayscale-0" />
                    <span className="text-xl font-bold tracking-tight text-white">ChainVolio</span>
                </Link>
                <WalletMultiButton />
            </nav>

            <section className="max-w-3xl mx-auto px-6 py-12 relative z-10">
                {!submitted ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                                {collection.title}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-md text-emerald-500/80">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Pool
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {collection.metadata?.roleType || "Active"}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                <span className="flex items-center gap-1.5 text-emerald-400">
                                    <DollarSign className="w-3.5 h-3.5" /> {collection.metadata?.salary || "Competitive"}
                                </span>
                            </div>
                        </header>

                        {/* Section 1: Role Overview & Details */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl space-y-10">
                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-bold">Role Overview</h2>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                        <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Type</p>
                                            <p className="text-sm font-bold text-slate-300">{collection.metadata?.roleType || "Full-time"}</p>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Work Mode</p>
                                            <p className="text-sm font-bold text-slate-300">{collection.metadata?.workMode || "Remote"}</p>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Timezone</p>
                                            <p className="text-sm font-bold text-slate-300">{collection.metadata?.timezone || "Any"}</p>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Comp. Model</p>
                                            <p className="text-sm font-bold text-slate-300">{collection.metadata?.compensationType || "Crypto + Equity"}</p>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 border-emerald-500/10">
                                            <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-1">Salary</p>
                                            <p className="text-sm font-bold text-emerald-400">{collection.metadata?.salary || "Competitive"}</p>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Experience</p>
                                            <p className="text-sm font-bold text-slate-300">{collection.metadata?.experienceLevel || "Senior"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Description</h3>
                                        </div>
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">
                                                {collection.description ? collection.description : "Apply to join the team and showcase your verified on-chain history as part of your application."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Recruiter Identity */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <BadgeCheck className="w-8 h-8 text-slate-400" />
                            </div>

                            <div className="flex items-center gap-3 pb-8 border-b border-white/5 mb-8">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-tight">Hiring Context</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Verified Recruiter Details</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {collection.metadata?.recruiterName || "Collection Owner"}
                                        </h3>
                                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                                            {collection.metadata?.recruiterRole || "Lead Recruiter"}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <p className="text-xs font-bold text-white uppercase tracking-wide mb-2 flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-slate-500" /> {collection.metadata?.companyName || "Project Team"}
                                            </p>
                                            {collection.metadata?.companyDescription && (
                                                <p className="text-sm text-slate-400 leading-relaxed italic">{collection.metadata.companyDescription}</p>
                                            )}
                                        </div>

                                        {(collection.metadata?.websiteUrl || collection.metadata?.twitterUrl || collection.metadata?.githubUrl) && (
                                            <div className="flex flex-wrap gap-2">
                                                {collection.metadata.websiteUrl && (
                                                    <a href={collection.metadata.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all">
                                                        <Globe className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {collection.metadata.twitterUrl && (
                                                    <a href={`https://twitter.com/${collection.metadata.twitterUrl.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-400/50 hover:bg-blue-400/10 text-slate-400 hover:text-blue-400 transition-all">
                                                        <Twitter className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {collection.metadata.githubUrl && (
                                                    <a href={`https://github.com/${collection.metadata.githubUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/50 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                                        <Github className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:w-72 space-y-4">
                                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Project Stage</p>
                                        <p className="text-sm font-bold text-slate-300">{collection.metadata?.projectStage || "Early Stage"}</p>
                                    </div>
                                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Contact Channel</p>
                                        <p className="text-xs font-medium text-indigo-400">{collection.metadata?.contactChannel || "DM on X"}</p>
                                    </div>
                                    {collection.metadata?.focusAreas && collection.metadata.focusAreas.length > 0 && (
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                            <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-2">Target Signals</p>
                                            <div className="flex flex-wrap gap-2">
                                                {collection.metadata.focusAreas.slice(0, 3).map((area: string) => (
                                                    <span key={area} className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                                        {area.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submission Form */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl opacity-50"></div>

                            {!connected ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                        <User className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">Ready to Apply?</h3>
                                    <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Connect your wallet to share your verified work history and professional signals.</p>
                                    <div className="flex justify-center scale-110">
                                        <WalletMultiButton />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="flex items-center justify-between gap-4 p-5 bg-black/40 border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                                <User className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Applicant Wallet</p>
                                                <p className="text-sm font-mono font-bold text-white">
                                                    {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-6)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/10">
                                            Connected
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Strongest Proof of Work</label>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {["GitHub / Code", "On-chain activity", "Hackathon wins", "DAO governance", "NFT / Creative", "DeFi / Trading"].map((signal) => (
                                                    <button
                                                        key={signal}
                                                        onClick={() => setPrimarySignal(signal)}
                                                        className={`p-4 rounded-xl border text-xs font-bold transition-all ${primarySignal === signal
                                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                            : 'bg-black/40 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                                                            }`}
                                                    >
                                                        {signal}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Primary Role Focus</label>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {["Frontend Engineer", "Smart Contract Dev", "Fullstack", "Backend / Core", "Design / UI / UX", "Creative / Media", "Marketing / Growth", "Finance / Operations", "Product / Management", "Community / DAO"].map((role) => (
                                                    <button
                                                        key={role}
                                                        onClick={() => setRoleStrength(role)}
                                                        className={`p-4 rounded-xl border text-xs font-bold transition-all ${roleStrength === role
                                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                            : 'bg-black/40 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                                                            }`}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {error && <p className="text-red-400 text-sm py-4 px-6 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</p>}

                                        <div className="pt-4 space-y-4">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting || !primarySignal || !roleStrength}
                                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/40"
                                            >
                                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit Verified Credentials <Send className="w-5 h-5" /></>}
                                            </button>

                                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                                                Professional signals only • Keys never shared
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-700 py-12">
                        <div className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight bg-gradient-to-br from-white to-emerald-400 bg-clip-text text-transparent">Submission Successful</h1>
                        <p className="text-slate-400 mb-12 text-lg">
                            The hiring team at <span className="text-white font-bold">{collection.title}</span> has received your verified credentials.
                        </p>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <Link
                                href={`/cv/${publicKey?.toBase58()}`}
                                className="px-8 py-5 bg-white text-black rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                                View My Live CV <ExternalLink className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/"
                                className="px-8 py-5 bg-[#121214] border border-white/5 text-slate-300 rounded-2xl font-bold hover:bg-[#1a1a1c] hover:text-white transition-all shadow-xl"
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
