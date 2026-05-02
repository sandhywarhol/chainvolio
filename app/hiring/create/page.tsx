"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase/client";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import { getHiringLimit } from "@/lib/paymentConfig";
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
    Filter,
    Building2,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    User,
    Mail,
    Send,
    Target
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { XIcon, LinkedInIcon, DiscordIcon } from "@/components/ui/SocialIcons";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function CreateCollection() {
    const { publicKey, signMessage } = useWallet();
    const [loading, setLoading] = useState(false);
    const [createdSlug, setCreatedSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    // Tier enforcement state
    const [userTier, setUserTier] = useState<string>("unverified");
    const [collectionCount, setCollectionCount] = useState<number>(0);
    const [tierLoading, setTierLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        roleType: "Full-time",
        workMode: "Remote",
        timezone: "UTC",
        experienceLevel: "Senior",
        compensationType: "Crypto + Equity",
        salary: "",
        recruiterName: "",
        recruiterRole: "",
        companyName: "",
        companyDescription: "",
        websiteUrl: "",
        twitterUrl: "",
        discordUrl: "",
        projectStage: "Early",
        companyEmail: "",
        telegramUrl: "",
        linkedinUrl: "",
        contactChannel: "",
        deadline: "",
        visibility: "public",
        focusAreas: [] as string[],
        customFocus: "",
        filters: {
            minReceiptsThreshold: 0,
            verifiedOnly: false
        }
    });

    // Fetch user tier + collection count on wallet connect
    useEffect(() => {
        if (!publicKey) { setUserTier("unverified"); setCollectionCount(0); return; }
        setTierLoading(true);
        fetch(`/api/user/me?wallet=${publicKey.toBase58()}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) setUserTier(data.verificationTier || "unverified");
            })
            .catch(() => {})
            .finally(async () => {
                // Count existing collections
                if (supabase && publicKey) {
                    const { count } = await supabase
                        .from("hiring_collections")
                        .select("*", { count: "exact", head: true })
                        .eq("owner_wallet", publicKey.toBase58());
                    setCollectionCount(count ?? 0);
                }
                setTierLoading(false);
            });
    }, [publicKey]);

    // Auto-populate profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!publicKey || !supabase) return;

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("display_name, headline, professional_role, organization, website, twitter")
                    .eq("wallet_address", publicKey.toBase58())
                    .single();

                if (data && !error) {
                    const baseRole = data.professional_role || data.headline || "";
                    const fullRole = (baseRole && data.organization) 
                        ? `${baseRole} @ ${data.organization}` 
                        : baseRole;

                    setFormData(prev => ({
                        ...prev,
                        recruiterName: prev.recruiterName || data.display_name || "",
                        recruiterRole: prev.recruiterRole || fullRole,
                        companyName: prev.companyName || data.organization || "",
                        websiteUrl: prev.websiteUrl || data.website || "",
                        twitterUrl: prev.twitterUrl || data.twitter || ""
                    }));
                    setIsAutoFilled(true);
                }
            } catch (err) {
                console.error("Error fetching recruiter profile:", err);
            }
        };

        fetchProfile();
    }, [publicKey]);

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
        if (!publicKey || !signMessage) {
            setToast({ message: "Please connect your wallet to sign this action.", type: "warning" });
            return;
        }
        setLoading(true);

        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "create_collection");

            if (!signedAction) {
                setLoading(false);
                return;
            }

            const res = await fetch("/api/hiring/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    ownerWallet: publicKey?.toBase58(),
                    ...signedAction
                }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                const errorCode = responseData?.error?.code;
                const errorMsg = responseData?.error?.message || "An error occurred while creating the collection.";
                if (errorCode === "ERR_HIRING_LIMIT_REACHED") {
                    setToast({ message: "You've reached your hiring limit. Upgrade for unlimited access.", type: "error" });
                    setCollectionCount(hiringLimit ?? 0); // reflect in UI immediately
                } else {
                    setToast({ message: errorMsg, type: "error" });
                }
                return;
            }

            const slug = responseData?.data?.slug || responseData?.slug;
            if (slug) {
                setCreatedSlug(slug);
                setCollectionCount(prev => prev + 1);
            } else {
                setToast({ message: "Creation failed: API did not return a valid collection link.", type: "error" });
            }
        } catch (err) {
            console.error(err);
            setToast({ message: "An error occurred while creating the collection.", type: "error" });
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

    // Derive hiring access state - delegates all tier logic to getHiringLimit() (single source of truth)
    const hiringLimit = getHiringLimit(userTier);        // null=unlimited, n=capped
    const remaining = hiringLimit === null ? Infinity : Math.max(0, hiringLimit - collectionCount);
    type HiringAccess = "loading" | "limit_reached" | "capped_available" | "unlimited";
    const getHiringAccess = (): HiringAccess => {
        if (tierLoading) return "loading";
        if (hiringLimit === null) return "unlimited";              // Community/DAO, Company/Org
        if (collectionCount >= hiringLimit) return "limit_reached"; // any capped tier exhausted
        return "capped_available";                                 // capped but still has slots
    };
    const hiringAccess = getHiringAccess();

    if (tierLoading) {
        return <LoadingScreen />;
    }

    return (
        <main className="min-h-screen text-white selection:bg-emerald-500/30 bg-black">
            <nav className="flex items-center justify-between px-4 md:px-6 py-4 max-w-5xl mx-auto border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 group-hover:scale-110 transition-transform grayscale hover:grayscale-0" />
                    <span className="text-xl font-bold tracking-tight">ChainVolio <span className="text-emerald-500">recruit</span></span>
                </Link>
                <WalletMultiButton />
            </nav>

            <section className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
                {!createdSlug ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-10 text-center">
                            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-white">Define Your Ideal Candidate</h1>
                            <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto">Customize what you want to evaluate. Collect verifiable on-chain portfolios tailored to your specific role.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Tier-based hiring gate */}
                        {hiringAccess === "limit_reached" ? (
                            // Limit reached: any capped tier exhausted
                            <div className="mb-8 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-rose-500/5 border border-rose-500/20 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-rose-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base font-bold text-white">You've reached your hiring limit.</h3>
                                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                        Upgrade for unlimited access and keep building your talent pipeline.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
                                    <span className="text-slate-400">Hiring Usage:</span>
                                    <span className="text-rose-400">{collectionCount} / {hiringLimit} used</span>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Upgrade Now
                                </Link>
                            </div>
                        ) : (
                            // Available: capped with slots remaining, or unlimited
                            <div className="mb-8 p-5 md:p-6 rounded-2xl md:rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-white">Verification Status</h4>                                        {hiringAccess === "capped_available" ? (
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[11px] md:text-xs text-slate-400">
                                                    {remaining === 0
                                                        ? <>Explore your <span className="text-emerald-400 font-bold">{hiringLimit} hiring opportunities.</span> Upgrade for unlimited talent access.</>
                                                        : <>You have <span className={`font-bold ${remaining <= Math.ceil((hiringLimit ?? 1) * 0.2) ? 'text-amber-400' : 'text-emerald-400'}`}>{remaining} hiring {remaining === 1 ? 'slot' : 'slots'} remaining.</span> Upgrade for unlimited access.</>}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                                    <span className="text-slate-500">Hiring Usage:</span>
                                                    <span className={`${remaining <= Math.ceil((hiringLimit ?? 1) * 0.2) ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {collectionCount} / {hiringLimit} used
                                                    </span>
                                                </div>
                                            </div>

                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-[11px] md:text-xs text-slate-400 max-w-md">Verify your organization to unlock <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] ml-1">Trusted Hiring Signal</span>.</p>
                                                <p className="text-[10px] text-slate-500">Upgrade to unlock unlimited hiring and better talent access.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="w-full md:w-auto px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20 text-center"
                                >
                                    {hiringAccess === "capped_available" ? "Upgrade for Unlimited" : "Get Verified"}
                                </Link>
                            </div>
                        )}

                            {/* Main Info Card */}
                            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Position</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Content Creator, Frontend Engineer"
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

                            {/* Recruiter Identity Card */}
                            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl space-y-8">
                                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Recruiter Identity</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest text-nowrap">Build trust with candidates</p>
                                            {isAutoFilled && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                    <p className="text-[10px] text-emerald-500/80 font-medium">Auto-filled from your ChainVolio profile</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Recruiter Name / Alias</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="e.g. Satoshi (Founder)"
                                                value={formData.recruiterName}
                                                onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                                                readOnly
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-sm text-slate-400 cursor-not-allowed"
                                            />
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Role</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CTO, Head of Talent"
                                            value={formData.recruiterRole}
                                            onChange={(e) => setFormData({ ...formData, recruiterRole: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Company / Project Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. ChainVolio"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Project Stage</label>
                                        <select
                                            value={formData.projectStage}
                                            onChange={(e) => setFormData({ ...formData, projectStage: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500/50 outline-none transition-all text-sm cursor-pointer appearance-none"
                                        >
                                            <option value="Stealth">Stealth</option>
                                            <option value="Early">Early Stage</option>
                                            <option value="Live">Mainnet / Live</option>
                                            <option value="Scaling">Scaling / Growth</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Project or Company Description</label>
                                    <input
                                        type="text"
                                        placeholder="Subtle, high-signal recruitment infrastructure for Web3."
                                        value={formData.companyDescription}
                                        onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-sm"
                                    />
                                </div>

                                {/* Official Links */}
                                <div className="pt-4 space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <LayoutGrid className="w-3 h-3" /> Official Presence <span className="text-slate-600 font-normal normal-case ml-1">(OPTIONAL)</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="text"
                                                placeholder="Website URL"
                                                value={formData.websiteUrl}
                                                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                                            />
                                        </div>
                                        <div className="relative">
                                            <XIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="text"
                                                placeholder="X / Twitter handle"
                                                value={formData.twitterUrl}
                                                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                                            />
                                        </div>
                                        <div className="relative">
                                            <DiscordIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="text"
                                                placeholder="Discord Link"
                                                value={formData.discordUrl}
                                                onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="email"
                                                placeholder="Company Email"
                                                value={formData.companyEmail}
                                                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="text"
                                                placeholder="Telegram Group / Channel"
                                                value={formData.telegramUrl}
                                                onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                                            />
                                        </div>
                                        <div className="relative">
                                            <LinkedInIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="text"
                                                placeholder="Company LinkedIn"
                                                value={formData.linkedinUrl}
                                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Preferred Contact Method <span className="text-slate-600 font-normal normal-case ml-1">(OPTIONAL)</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. DM on X, Discord Ticket, or Email"
                                            value={formData.contactChannel}
                                            onChange={(e) => setFormData({ ...formData, contactChannel: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Details Grid */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-500" /> Role Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                                                <option className="bg-[#121214] text-white">Internship</option>
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
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 group-focus-within:text-blue-400 text-xs text-nowrap">Comp. Model</label>
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
                                                <option className="bg-[#121214] text-white">Unpaid / Contributor</option>
                                            </select>
                                            <DollarSign className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="bg-[#121214] border border-white/5 rounded-xl px-4 py-3 group focus-within:border-blue-500/30 transition-colors">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 group-focus-within:text-blue-400 text-xs">Salary</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="e.g. $120k - $180k"
                                                value={formData.salary}
                                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-600"
                                            />
                                            <Plus className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                                        </div>
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

                                    {/* Custom Focus Box */}
                                    <div
                                        className={`
                                            p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                                            ${formData.customFocus
                                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                : 'bg-[#121214] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                                        `}
                                    >
                                        <div className="flex items-start gap-3 relative z-10">
                                            <div className={`
                                                p-2 rounded-lg transition-colors
                                                ${formData.customFocus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'}
                                            `}>
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Add Your Focus..."
                                                    value={formData.customFocus}
                                                    onChange={(e) => setFormData({ ...formData, customFocus: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-sm font-bold w-full placeholder:text-slate-600 text-white"
                                                />
                                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Write your specific priority</p>
                                            </div>
                                        </div>
                                        {formData.customFocus && (
                                            <div className="absolute top-2 right-2 text-emerald-500">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
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
                                            filters: { ...prev.filters, minReceiptsThreshold: prev.filters.minReceiptsThreshold === 5 ? 0 : 5 }
                                        }))}
                                        className={`
                                            cursor-pointer p-4 rounded-xl border transition-all duration-200 group relative
                                            ${formData.filters.minReceiptsThreshold === 5
                                                ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                                : 'bg-[#121214] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${formData.filters.minReceiptsThreshold === 5 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}>
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.filters.minReceiptsThreshold === 5 ? 'text-purple-100' : 'text-slate-300'}`}>Active Wallet Only</p>
                                                <p className="text-[10px] text-slate-500">Requires 5+ on-chain receipts/txs</p>
                                            </div>
                                        </div>
                                        {formData.filters.minReceiptsThreshold === 5 && <div className="absolute top-2 right-2 text-purple-500"><Check className="w-4 h-4" /></div>}
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
                                    disabled={loading || !formData.title || hiringAccess === "limit_reached"}
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

                        <h1 className="text-2xl md:text-4xl font-bold mb-4 text-white">Collection is Live!</h1>
                        <p className="text-slate-400 mb-10 max-w-md mx-auto text-sm md:text-lg leading-relaxed">
                            Your recruitment portal for <span className="text-emerald-400 font-bold">{formData.title}</span> is ready to accept verified CVs.
                        </p>

                        <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 mb-8 max-w-xl mx-auto shadow-2xl">
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

                        {/* Post-creation conversion trigger - all limit-reached users */}
                        {hiringAccess === "limit_reached" && (
                            <div className="mb-8 max-w-xl mx-auto p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-left space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="text-sm font-bold text-amber-400">You've reached your hiring limit.</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Upgrade now to create unlimited hiring collections and access high-quality on-chain candidates.
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Upgrade Now
                                </Link>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <Link
                                href={`/hiring/${createdSlug}/dashboard`}
                                className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl"
                            >
                                Open Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                            {hiringAccess !== "limit_reached" && (
                                <button
                                    onClick={() => setCreatedSlug(null)}
                                    className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
                                >
                                    Create Another
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}
