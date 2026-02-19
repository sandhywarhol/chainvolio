"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import {
    Loader2,
    Plus,
    Copy,
    Check,
    ArrowRight,
    CalendarDays,
    Globe,
    Lock,
    Eye,
    Briefcase,
    Clock,
    DollarSign,
    ShieldCheck,
    Github,
    Users,
    Code2,
    Palette,
    Filter
} from "lucide-react";

export default function CreateCollection() {
    const { publicKey } = useWallet();
    const [loading, setLoading] = useState(false);
    const [createdSlug, setCreatedSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        roleType: "Full-time",
        workMode: "Remote",
        timezone: "UTC",
        experienceLevel: "Senior",
        compensationType: "Crypto + Equity",
        deadline: "",
        visibility: "public",
        focusAreas: [] as string[],
        filters: {
            minTransactions: false,
            verifiedOnly: false
        }
    });

    const toggleFocus = (area: string) => {
        setFormData(prev => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(area)
                ? prev.focusAreas.filter(f => f !== area)
                : [...prev.focusAreas, area]
        }));
    };

    const focusOptions = [
        { id: "on_chain", label: "On-Chain History", icon: ShieldCheck, desc: "Verified txs & contracts" },
        { id: "github", label: "GitHub Code", icon: Github, desc: "Commits & PRs" },
        { id: "dao", label: "DAO Governance", icon: Users, desc: "Voting & Proposals" },
        { id: "hackathon", label: "Hackathons", icon: Code2, desc: "Project submisisons" },
        { id: "nft", label: "NFT Portfolio", icon: Palette, desc: "Created assets" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/hiring/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    ownerWallet: publicKey?.toBase58(),
                }),
            });

            const data = await res.json();
            if (data.slug) {
                setCreatedSlug(data.slug);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!createdSlug) return;
        const url = `${window.location.origin}/r/${createdSlug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen text-white selection:bg-emerald-500/30">
            <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto border-b border-white/5 bg-[#0a0a0b]/40 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/chainvolio logo.png" alt="Chainvolio Logo" className="w-8 h-8 group-hover:scale-110 transition-transform grayscale hover:grayscale-0" />
                    <span className="text-xl font-bold tracking-tight">Chainvolio <span className="text-emerald-500">recruit</span></span>
                </Link>
                <WalletMultiButton />
            </nav>

            <section className="max-w-3xl mx-auto px-6 py-12 relative z-10">
                {!createdSlug ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-10 text-center">
                            <h1 className="text-3xl font-bold mb-3 tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Define Your Ideal Candidate</h1>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto">Customize what you want to evaluate. Collect verifiable on-chain portfolios tailored to your specific role.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Main Info Card */}
                            <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Collection Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Senior Smart Contract Engineer - Q3 Hiring"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Description <span className="text-slate-600 font-normal normal-case">(Optional)</span></label>
                                        <textarea
                                            placeholder="Briefly describe the role, key responsibilities, or specific requirements..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all h-32 resize-none placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500/20 text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Evaluation Focus */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Evaluation Focus
                                    </h3>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Select areas to highlight (Optional)</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {focusOptions.map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() => toggleFocus(opt.id)}
                                            className={`
                        cursor-pointer p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                        ${formData.focusAreas.includes(opt.id)
                                                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                    : 'bg-[#121214] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                      `}
                                        >
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className={`
                          p-2 rounded-lg transition-colors
                          ${formData.focusAreas.includes(opt.id) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'}
                        `}>
                                                    <opt.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold mb-0.5 ${formData.focusAreas.includes(opt.id) ? 'text-emerald-100' : 'text-slate-300'}`}>{opt.label}</p>
                                                    <p className="text-[10px] text-slate-500 leading-tight">{opt.desc}</p>
                                                </div>
                                            </div>
                                            {formData.focusAreas.includes(opt.id) && (
                                                <div className="absolute top-2 right-2 text-emerald-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Role Details Grid */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-500" /> Role Details
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-[#121214] border border-white/5 rounded-xl px-4 py-3 group focus-within:border-blue-500/30 transition-colors">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 group-focus-within:text-blue-400 text-xs">Role Type</label>
                                        <div className="relative">
                                            <select
                                                value={formData.roleType}
                                                onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-sm appearance-none font-medium cursor-pointer"
                                            >
                                                <option className="bg-[#121214] text-white">Full-time</option>
                                                <option className="bg-[#121214] text-white">Contract</option>
                                                <option className="bg-[#121214] text-white">Freelance</option>
                                                <option className="bg-[#121214] text-white">Part-time</option>
                                            </select>
                                            <Briefcase className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="bg-[#121214] border border-white/5 rounded-xl px-4 py-3 group focus-within:border-blue-500/30 transition-colors">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 group-focus-within:text-blue-400 text-xs">Work Mode</label>
                                        <div className="relative">
                                            <select
                                                value={formData.workMode}
                                                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-sm appearance-none font-medium cursor-pointer"
                                            >
                                                <option className="bg-[#121214] text-white">Remote</option>
                                                <option className="bg-[#121214] text-white">Hybrid</option>
                                                <option className="bg-[#121214] text-white">On-site</option>
                                            </select>
                                            <Globe className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="bg-[#121214] border border-white/5 rounded-xl px-4 py-3 group focus-within:border-blue-500/30 transition-colors">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 group-focus-within:text-blue-400 text-xs">Timezone</label>
                                        <div className="relative">
                                            <select
                                                value={formData.timezone}
                                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-sm appearance-none font-medium cursor-pointer"
                                            >
                                                <option className="bg-[#121214] text-white">Any Timezone</option>
                                                <option className="bg-[#121214] text-white">Americas (UTC-5)</option>
                                                <option className="bg-[#121214] text-white">Europe (UTC+1)</option>
                                                <option className="bg-[#121214] text-white">Asia (UTC+8)</option>
                                            </select>
                                            <Clock className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="bg-[#121214] border border-white/5 rounded-xl px-4 py-3 group focus-within:border-blue-500/30 transition-colors">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 group-focus-within:text-blue-400 text-xs">Experience</label>
                                        <div className="relative">
                                            <select
                                                value={formData.experienceLevel}
                                                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-sm appearance-none font-medium cursor-pointer"
                                            >
                                                <option className="bg-[#121214] text-white">Senior</option>
                                                <option className="bg-[#121214] text-white">Mid-Level</option>
                                                <option className="bg-[#121214] text-white">Junior</option>
                                                <option className="bg-[#121214] text-white">Lead / Architect</option>
                                            </select>
                                            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none rotate-90" />
                                        </div>
                                    </div>

                                    <div className="bg-[#121214] border border-white/5 rounded-xl px-4 py-3 group focus-within:border-blue-500/30 transition-colors">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 group-focus-within:text-blue-400 text-xs">Comp. Model</label>
                                        <div className="relative">
                                            <select
                                                value={formData.compensationType}
                                                onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-sm appearance-none font-medium cursor-pointer"
                                            >
                                                <option className="bg-[#121214] text-white">Crypto + Equity</option>
                                                <option className="bg-[#121214] text-white">Fiat + Equity</option>
                                                <option className="bg-[#121214] text-white">Crypto Only</option>
                                                <option className="bg-[#121214] text-white">DAO Tokens</option>
                                            </select>
                                            <DollarSign className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4: Minimal Eligibility Filters */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-purple-500" /> Eligibility Filters
                                    </h3>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Reduce Spam (Optional)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, minTransactions: !prev.filters.minTransactions }
                                        }))}
                                        className={`
                                            cursor-pointer p-4 rounded-xl border transition-all duration-200 group relative
                                            ${formData.filters.minTransactions
                                                ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                                : 'bg-[#121214] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${formData.filters.minTransactions ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}>
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.filters.minTransactions ? 'text-purple-100' : 'text-slate-300'}`}>Active Wallet Only</p>
                                                <p className="text-[10px] text-slate-500">Requires 5+ on-chain receipts/txs</p>
                                            </div>
                                        </div>
                                        {formData.filters.minTransactions && <div className="absolute top-2 right-2 text-purple-500"><Check className="w-4 h-4" /></div>}
                                    </div>

                                    <div
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, verifiedOnly: !prev.filters.verifiedOnly }
                                        }))}
                                        className={`
                                            cursor-pointer p-4 rounded-xl border transition-all duration-200 group relative
                                            ${formData.filters.verifiedOnly
                                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                : 'bg-[#121214] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${formData.filters.verifiedOnly ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.filters.verifiedOnly ? 'text-emerald-100' : 'text-slate-300'}`}>Verified Profiles Only</p>
                                                <p className="text-[10px] text-slate-500">Must have at least 1 attestation</p>
                                            </div>
                                        </div>
                                        {formData.filters.verifiedOnly && <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-4 h-4" /></div>}
                                    </div>
                                </div>
                            </div>

                            {/* Config Row: Deadline & Visibility */}
                            <div className="pt-8 border-t border-white/5 relative">
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0b] px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Final Configuration</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Submission Deadline</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CalendarDays className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <input
                                                type="date"
                                                value={formData.deadline}
                                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                className="w-full bg-[#121214] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-white/20 outline-none transition-colors text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Collection Visibility</label>
                                        <div className="flex bg-[#121214] p-1 rounded-xl border border-white/5">
                                            {['public', 'unlisted', 'private'].map((vis) => (
                                                <button
                                                    key={vis}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, visibility: vis })}
                                                    className={`
                            flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all flex items-center justify-center gap-2
                            ${formData.visibility === vis ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                          `}
                                                >
                                                    {vis === 'public' && <Globe className="w-3 h-3" />}
                                                    {vis === 'unlisted' && <Eye className="w-3 h-3" />}
                                                    {vis === 'private' && <Lock className="w-3 h-3" />}
                                                    {vis}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading || !formData.title}
                                    className="w-full py-4 bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Generate Hiring Link</>}
                                </button>
                                <p className="text-center text-xs text-slate-600 mt-4">
                                    By creating this collection, you agree to handle rigorous candidate data with care.
                                </p>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500 py-12">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-50"></div>
                            <div className="relative w-full h-full bg-[#121214] border border-emerald-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <Check className="w-10 h-10 text-emerald-400" />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold mb-4 text-white">Collection is Live!</h1>
                        <p className="text-slate-400 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                            Your recruitment portal for <span className="text-emerald-400 font-bold">{formData.title}</span> is ready to accept verified CVs.
                        </p>

                        <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 mb-10 max-w-xl mx-auto shadow-2xl">
                            <div className="flex-1 w-full bg-black/40 rounded-lg px-4 py-3 font-mono text-sm text-emerald-500 truncate border border-emerald-500/10">
                                {`${window.location.origin}/r/${createdSlug}`}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white font-bold flex items-center justify-center gap-2"
                            >
                                {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <Link
                                href={`/hiring/${createdSlug}/dashboard`}
                                className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl"
                            >
                                Open Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => setCreatedSlug(null)}
                                className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
