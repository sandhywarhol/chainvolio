"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import { Loader2, Send, CheckCircle, ExternalLink, AlertCircle, ShieldCheck, CalendarDays, Twitter, Github, MessageSquare, Building2, User, BadgeCheck, Clock, DollarSign, Briefcase, Globe, Eye, Filter } from "lucide-react";
import { getVerificationLabel } from "@/lib/paymentConfig";


export default function CandidateSubmission({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const { publicKey, connected, signMessage } = useWallet();
    const [collection, setCollection] = useState<any>(null);
    const [ownerProfile, setOwnerProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [primarySignal, setPrimarySignal] = useState("");
    const [roleStrength, setRoleStrength] = useState("");
    const [applicantProfile, setApplicantProfile] = useState<any>(null);

    useEffect(() => {
        async function fetchCollection() {
            try {
                const res = await fetch(`/api/hiring/collections/${slug}`);
                const data = await res.json();
                if (data.collection) {
                    setCollection(data.collection);
                    setOwnerProfile(data.owner_profile);
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

    const [existingSubmission, setExistingSubmission] = useState<any>(null);

    useEffect(() => {
        if (!publicKey) {
            setApplicantProfile(null);
            setExistingSubmission(null);
            return;
        }

        // 1. Fetch Profile
        fetch(`/api/user/me?wallet=${publicKey.toBase58()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => setApplicantProfile(data))
            .catch(() => setApplicantProfile(null));

        // 2. Fetch Existing Submission
        fetch(`/api/hiring/submissions/check?slug=${slug}&wallet=${publicKey.toBase58()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.submission) {
                    setExistingSubmission(data.submission);
                    setSubmitted(true);

                    // Deep link highlight logic
                    setTimeout(() => {
                        const hash = window.location.hash;
                        if (hash === '#application-status') {
                            const el = document.getElementById('application-status');
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.classList.add('animate-highlight');
                            }
                        }
                    }, 1000);
                }
            })
            .catch(() => {});
    }, [publicKey, slug]);

    const handleSubmit = async () => {
        if (!publicKey || !signMessage) return;
        setSubmitting(true);
        setError(null);

        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "apply_job", slug);

            if (!signedAction) {
                setSubmitting(false);
                return;
            }

            const res = await fetch("/api/hiring/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    collectionSlug: slug,
                    walletAddress: publicKey.toBase58(),
                    primarySignal,
                    roleStrength,
                    ...signedAction
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
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
                        <header className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight leading-tight text-white">
                                {collection.title}
                            </h1>
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex flex-wrap items-center justify-center gap-3 gap-y-4 px-2">
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-md text-emerald-500/80 text-[10px] md:text-xs">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Pool
                                    </span>
                                    <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-800"></span>
                                    <span className="flex items-center gap-1.5 font-sans text-[10px] md:text-xs text-slate-500">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" /> {collection.metadata?.roleType || "Active"}
                                    </span>
                                    <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-800"></span>
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-sans text-[10px] md:text-xs">
                                        <DollarSign className="w-3.5 h-3.5" /> {collection.metadata?.salary || "Competitive"}
                                    </span>
                                </div>

                                {collection.metadata?.isTrusted && (
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group/trust relative overflow-hidden transition-all hover:bg-emerald-500/20 max-w-fit mx-auto">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/trust:translate-x-full transition-transform duration-1000"></div>
                                        <BadgeCheck className="w-4 h-4" />
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                {collection.metadata.verificationTier?.toLowerCase().includes("company") || collection.metadata.verificationTier?.toLowerCase().includes("organization") ? "Trusted Hiring Source" : "Trusted Opportunity"}
                                            </span>
                                            <span className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-tighter mt-0.5 leading-none">{getVerificationLabel(collection.metadata.verificationTier)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </header>

                        <div className="space-y-6">
                            {/* Group 1: Recruiter Identity (About Recruiter) */}
                            {(collection.metadata?.recruiterName || collection.metadata?.companyName) && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden group/recruiter transition-all">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl opacity-30"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                                        <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 shadow-lg overflow-hidden">
                                            {ownerProfile?.avatar_url ? (
                                                <img src={ownerProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-10 h-10 text-emerald-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-center md:text-left space-y-4 w-full">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/10 px-2 py-0.5 rounded">Hiring Authority</span>
                                                        {ownerProfile?.isVerified ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shadow-sm" />
                                                                <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest leading-none">
                                                                    {getVerificationLabel(ownerProfile?.verificationTier)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <AlertCircle className={`w-3.5 h-3.5 ${ownerProfile?.isExpired ? "text-amber-500" : "text-slate-500 opacity-50"}`} />
                                                                <span className={`text-[9px] font-black uppercase tracking-widest leading-none ${ownerProfile?.isExpired ? "text-amber-500" : "text-slate-500 opacity-50"}`}>
                                                                    {ownerProfile?.isExpired ? "Expired Verification" : "Unverified User"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-2xl font-black text-white">{collection.metadata.recruiterName || "Lead Recruiter"}</h3>
                                                    <p className="text-sm font-bold text-slate-400 leading-tight">{collection.metadata.recruiterRole || "Recruitment Manager"}</p>
                                                    

                                                </div>

                                                <div className="md:text-right space-y-2">
                                                    {collection.metadata?.companyName && (
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Company / Project Name</p>
                                                            <p className="text-lg font-black text-emerald-400 leading-tight">{collection.metadata.companyName}</p>
                                                        </div>
                                                    )}
                                                    {collection.metadata?.projectStage && (
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Project Stage</p>
                                                            <p className="text-xs font-bold text-white uppercase tracking-wider bg-white/5 px-2 py-1 rounded inline-block">{collection.metadata.projectStage}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {collection.metadata.companyDescription && (
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">One-line Project Description</p>
                                                    <p className="text-sm text-slate-300 leading-relaxed italic max-w-2xl">"{collection.metadata.companyDescription}"</p>
                                                </div>
                                            )}

                                            {/* Social Links & Contact */}
                                            <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {collection.metadata?.websiteUrl && (
                                                        <a href={collection.metadata.websiteUrl.startsWith('http') ? collection.metadata.websiteUrl : `https://${collection.metadata.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Website">
                                                            <Globe className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {collection.metadata?.twitterUrl && (
                                                        <a href={collection.metadata.twitterUrl.startsWith('http') ? collection.metadata.twitterUrl : `https://x.com/${collection.metadata.twitterUrl.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Twitter / X">
                                                            <Twitter className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {collection.metadata?.githubUrl && (
                                                        <a href={collection.metadata.githubUrl.startsWith('http') ? collection.metadata.githubUrl : `https://github.com/${collection.metadata.githubUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="GitHub">
                                                            <Github className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {collection.metadata?.discordUrl && (
                                                        <a href={collection.metadata.discordUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Discord">
                                                            <MessageSquare className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>

                                                {collection.metadata?.contactChannel && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
                                                        <Send className="w-3.5 h-3.5" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-widest leading-none text-indigo-500/60">Preferred Contact Method</span>
                                                            <span className="text-[10px] font-bold mt-0.5">{collection.metadata.contactChannel}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Group 2: Job Details (Role Overview) */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10">
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-bold">Job Details</h2>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                            <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Role Type</p>
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
                                                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {collection.description ? collection.description : "Apply to join the team and showcase your verified on-chain history as part of your application."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Group 3: Evaluation Criteria (Focus Areas) */}
                            {collection.metadata?.focusAreas && collection.metadata.focusAreas.length > 0 && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-bold">Evaluation Focus</h2>
                                        </div>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Selected evaluation areas to highlight</p>
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {collection.metadata.focusAreas.map((area: string) => {
                                                const labels: Record<string, string> = {
                                                    "on_chain": "On-Chain History",
                                                    "github": "GitHub Code",
                                                    "dao": "DAO Governance",
                                                    "hackathon": "Hackathons",
                                                    "nft": "NFT Portfolio"
                                                };
                                                return (
                                                    <div key={area} className="px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 text-sm font-bold flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                        {labels[area] || area.replace(/_/g, ' ').toUpperCase()}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Group 4: Requirements / Eligibility */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                                <Filter className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-bold">Eligibility Filters</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {collection.eligibility_filters?.minReceiptsThreshold > 0 ? (
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                                    <CheckCircle className="w-4 h-4 text-purple-400" />
                                                    <span className="text-xs font-bold text-slate-300">Active Wallet Only</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 opacity-50">
                                                    <Globe className="w-4 h-4 text-slate-500" />
                                                    <span className="text-xs font-bold text-slate-500">Open to All Wallets</span>
                                                </div>
                                            )}
                                            {collection.eligibility_filters?.verifiedOnly ? (
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-xs font-bold text-slate-300">Verified Profiles Only</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 opacity-50">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                    <span className="text-xs font-bold text-slate-500">Unverified Profiles Accepted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                                <CalendarDays className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-bold">Submission Deadline</h2>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-black/20 border border-white/5">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Date</p>
                                            <p className="text-lg font-black text-white">
                                                {collection.metadata?.deadline 
                                                    ? new Date(collection.metadata.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                    : "No Deadline Set"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
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
                                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                                                {applicantProfile?.avatarUrl ? (
                                                    <img src={applicantProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-6 h-6 text-emerald-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                                                    {applicantProfile?.displayName || "Applicant Wallet"}
                                                </p>
                                                <p className="text-sm font-mono font-bold text-white">
                                                    {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-6)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                            applicantProfile?.isVerified 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : applicantProfile?.isExpired
                                              ? "bg-amber-500/5 border-amber-500/10 text-amber-500"
                                              : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                                        }`}>
                                            {applicantProfile?.isVerified 
                                                ? getVerificationLabel(applicantProfile?.verificationTier)

                                                : applicantProfile?.isExpired
                                                  ? "Expired Verification"
                                                  : "Unverified User"
                                            }
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">Submission Successful</h1>
                        <p className="text-slate-400 mb-12 text-lg">
                            The hiring team at <span className="text-white font-bold">{collection.title}</span> has received your verified credentials.
                        </p>

                        {/* Application Status Snapshot */}
                        {existingSubmission && (
                            <div 
                              id="application-status"
                              className="bg-[#121214] border border-white/5 rounded-3xl p-8 text-left space-y-6 max-w-lg mx-auto scroll-mt-24 transition-all duration-1000"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Status</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        existingSubmission.recruiter_status === 'hired' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                        existingSubmission.recruiter_status === 'shortlisted' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                        existingSubmission.recruiter_status === 'rejected' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                        "bg-slate-500/10 border-slate-500/20 text-slate-400"
                                    }`}>
                                        {existingSubmission.recruiter_status || 'Pending'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white">Application Snapshot</h3>
                                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
                                        <div className="flex justify-between text-[11px] font-medium">
                                            <span className="text-slate-500">Signal Area</span>
                                            <span className="text-emerald-400">{existingSubmission.primary_signal || 'General'}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-medium">
                                            <span className="text-slate-500">Role Focus</span>
                                            <span className="text-white">{existingSubmission.role_strength || 'Contributor'}</span>
                                        </div>
                                    </div>

                                    {existingSubmission.recruiter_notes && (
                                        <div className="space-y-2 pt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recruiter Notes</span>
                                            <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4 py-1">
                                                "{existingSubmission.recruiter_notes}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
