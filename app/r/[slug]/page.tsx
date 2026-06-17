"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import { 
    Loader2, 
    Send, 
    CheckCircle, 
    AlertCircle, 
    ShieldCheck, 
    Github, 
    Building2, 
    User, 
    BadgeCheck, 
    Clock, 
    DollarSign, 
    Briefcase, 
    Globe, 
    Filter, 
    Mail, 
    MapPin,
    Award,
    Users,
    Palette,
    Laptop,
    Cpu,
    Layers,
    Compass,
    Check
} from "lucide-react";
import { XIcon, LinkedInIcon, DiscordIcon } from "@/components/ui/SocialIcons";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { getVerificationLabel } from "@/lib/paymentConfig";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const SIGNAL_OPTIONS = [
    { id: "GitHub / Code", label: "GitHub / Code", desc: "Repositories, commits & PRs", icon: Github },
    { id: "On-chain activity", label: "On-chain activity", desc: "Verified txs & contracts", icon: ShieldCheck },
    { id: "Hackathon wins", label: "Hackathon wins", desc: "Submissions & project records", icon: Award },
    { id: "DAO governance", label: "DAO governance", desc: "Voting weight & proposals", icon: Users },
    { id: "NFT / Creative", label: "NFT / Creative", desc: "Digital art & collections", icon: Palette },
    { id: "DeFi / Trading", label: "DeFi / Trading", desc: "Liquidity & active volume", icon: DollarSign },
];

const ROLE_OPTIONS = [
    { id: "Frontend Engineer", label: "Frontend Engineer", desc: "UI development & web apps", icon: Laptop },
    { id: "Smart Contract Dev", label: "Smart Contract Dev", desc: "On-chain protocols & security", icon: Cpu },
    { id: "Fullstack", label: "Fullstack", desc: "End-to-end development", icon: Layers },
    { id: "Backend / Core", label: "Backend / Core", desc: "APIs, nodes & databases", icon: Cpu },
    { id: "Design / UI / UX", label: "Design / UI / UX", desc: "Figma, styles & brand identity", icon: Compass },
    { id: "Product / Management", label: "Product / Management", desc: "Roadmaps & operations", icon: Briefcase },
];

export default function CandidateSubmission({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const { publicKey, connected, signMessage } = useWallet();
    const { session: googleSession, orgAccount } = useGoogleAuth();
    const googleUid = !publicKey && googleSession?.user?.id ? googleSession.user.id : null;
    const isConnected = connected || !!googleUid;
    const [collection, setCollection] = useState<any>(null);
    const [ownerProfile, setOwnerProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [primarySignal, setPrimarySignal] = useState("");
    const [roleStrength, setRoleStrength] = useState("");
    const [applicantProfile, setApplicantProfile] = useState<any>(null);
    const [existingSubmission, setExistingSubmission] = useState<any>(null);
    const [checkingExisting, setCheckingExisting] = useState(false);

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

    useEffect(() => {
        if (!publicKey && !googleUid) {
            setApplicantProfile(null);
            setExistingSubmission(null);
            setCheckingExisting(false);
            return;
        }

        if (googleUid) {
            // Google user — profile comes from orgAccount hook, just check existing submission
            if (orgAccount) {
                setApplicantProfile({
                    displayName: orgAccount.org_name || googleSession?.user?.email || "Builder",
                    avatarUrl: orgAccount.avatar_url || googleSession?.user?.user_metadata?.avatar_url || null,
                    bio: orgAccount.bio || "",
                    isVerified: false,
                    attestedReceiptCount: 0,
                });
            }
            setCheckingExisting(true);
            fetch(`/api/hiring/submissions/check?slug=${slug}&auth_uid=${googleUid}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.submission) {
                        setExistingSubmission(data.submission);
                        setSubmitted(true);
                        setTimeout(() => {
                            const hash = window.location.hash;
                            if (hash === '#application-status') {
                                const el = document.getElementById('application-status');
                                if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('animate-highlight'); }
                            }
                        }, 1000);
                    }
                })
                .catch(() => {})
                .finally(() => setCheckingExisting(false));
            return;
        }

        // 1. Fetch Profile (wallet user)
        fetch(`/api/user/me?wallet=${publicKey!.toBase58()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => setApplicantProfile(data))
            .catch(() => setApplicantProfile(null));

        // 2. Fetch Existing Submission
        setCheckingExisting(true);
        fetch(`/api/hiring/submissions/check?slug=${slug}&wallet=${publicKey!.toBase58()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.submission) {
                    setExistingSubmission(data.submission);
                    setSubmitted(true);
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
            .catch(() => {})
            .finally(() => setCheckingExisting(false));
    }, [publicKey, googleUid, orgAccount, slug]);

    const handleSubmit = async () => {
        if (!publicKey && !googleUid) return;
        setSubmitting(true);
        setError(null);

        try {
            if (googleUid) {
                // Google user — authenticate via JWT, no wallet signature needed
                const token = googleSession?.access_token;
                if (!token) { setError("Session expired. Please sign in again."); setSubmitting(false); return; }

                const res = await fetch("/api/hiring/submissions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ collectionSlug: slug, authUid: googleUid, primarySignal, roleStrength }),
                });
                const data = await res.json();
                if (res.ok) {
                    const subRes = await fetch(`/api/hiring/submissions/check?slug=${slug}&auth_uid=${googleUid}`);
                    if (subRes.ok) {
                        const subData = await subRes.json();
                        if (subData?.submission) setExistingSubmission(subData.submission);
                    }
                    setSubmitted(true);
                } else {
                    setError(data.error?.message || data.error || "Submission failed.");
                }
                setSubmitting(false);
                return;
            }

            // Wallet user
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
                    walletAddress: publicKey!.toBase58(),
                    primarySignal,
                    roleStrength,
                    ...signedAction
                }),
            });

            const data = await res.json();
            if (res.ok) {
                const subRes = await fetch(`/api/hiring/submissions/check?slug=${slug}&wallet=${publicKey!.toBase58()}`);
                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData?.submission) setExistingSubmission(subData.submission);
                }
                setSubmitted(true);
            } else {
                setError(data.error?.message || data.error || "Submission failed.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main 
                className="min-h-screen text-white selection:bg-emerald-500/30 flex flex-col" 
                style={{ 
                    background: "linear-gradient(to bottom, #000000 0%, #2c2c30 100%)", 
                    backgroundAttachment: "scroll"
                }}
            >
                <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 grayscale" />
                        <span className="text-xl font-bold tracking-tight text-white">ChainVolio</span>
                    </Link>
                </nav>
                <div className="flex-1 flex items-center justify-center">
                    <LoadingScreen fullScreen={false} />
                </div>
            </main>
        );
    }

    if (error && !collection) {
        return (
            <main 
                className="min-h-screen text-white selection:bg-emerald-500/30 flex flex-col" 
                style={{ 
                    background: "linear-gradient(to bottom, #000000 0%, #2c2c30 100%)", 
                    backgroundAttachment: "scroll"
                }}
            >
                <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 grayscale" />
                        <span className="text-xl font-bold tracking-tight text-white">ChainVolio</span>
                    </Link>
                </nav>
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-[#0d0e11] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl" style={{ boxShadow: "0 40px 48px -20px rgba(0,0,0,0.98), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
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
            </main>
        );
    }

    return (
        <main 
            className="min-h-screen text-white selection:bg-emerald-500/30" 
            style={{ 
                background: "linear-gradient(to bottom, #000000 0%, #2c2c30 100%)", 
                backgroundAttachment: "scroll"
            }}
        >
            <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-55">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 group-hover:scale-110 transition-transform grayscale hover:grayscale-0" />
                    <span className="text-xl font-bold tracking-tight text-white font-sans">ChainVolio</span>
                </Link>
                <WalletMultiButton />
            </nav>

            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 relative z-10 animate-in fade-in duration-500">
                {checkingExisting ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <LoadingScreen fullScreen={false} />
                    </div>
                ) : (
                    <div className="w-full rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[680px] relative animate-in zoom-in-95 duration-300" style={{ background: "#0d0e11", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 48px -20px rgba(0,0,0,0.98), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
                        {/* Spotlight overlay */}
                        <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse 45% 28% at 50% -1%, rgba(255,255,255,0.07) 0%, transparent 80%)" }} />

                        {/* ── LEFT PANEL: JOB SPECS & INTEL (60% width) ── */}
                        <div className="w-full lg:w-3/5 p-6 md:p-8 flex flex-col h-full lg:max-h-[820px] overflow-y-auto custom-scrollbar border-r border-white/[0.06] z-10 bg-[#0a0b0e]">
                            <header className="mb-6 text-left">
                                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>ChainVolio Recruit</p>
                                <h1 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight leading-tight text-white font-sans">
                                    {collection.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 px-1">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/20 rounded-md text-emerald-400 text-[10px]">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Pool
                                    </span>
                                    <span className="flex items-center gap-1.5 font-sans text-[10px] text-slate-500">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" /> {collection.metadata?.roleType || "Active"}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-sans text-[10px]">
                                        <DollarSign className="w-3.5 h-3.5" /> {collection.metadata?.salary || "Competitive"}
                                    </span>
                                </div>
                                {collection.metadata?.isTrusted && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-4 max-w-fit">
                                        <BadgeCheck className="w-3.5 h-3.5" />
                                        <div className="flex flex-col text-left">
                                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                                {collection.metadata.verificationTier?.toLowerCase().includes("company") || collection.metadata.verificationTier?.toLowerCase().includes("organization") ? "Trusted Hiring Source" : "Trusted Opportunity"}
                                            </span>
                                            <span className="text-[7.5px] font-bold text-emerald-400/60 uppercase tracking-tighter mt-0.5 leading-none">{getVerificationLabel(collection.metadata.verificationTier)}</span>
                                        </div>
                                    </div>
                                )}
                            </header>

                            <div className="space-y-6 text-left">
                                {/* Recruiter Identity */}
                                {(collection.metadata?.recruiterName || collection.metadata?.companyName) && (
                                    <div className="rounded-xl p-5 relative overflow-hidden group/recruiter transition-all border border-white/[0.04] bg-white/[0.01]">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl opacity-35"></div>
                                        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 shadow-md overflow-hidden">
                                                {ownerProfile?.avatar_url ? (
                                                    <img src={ownerProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-6 h-6 text-teal-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-center sm:text-left space-y-3 w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                                            <span className="text-[8.5px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/10 px-1.5 py-0.5 rounded">Hiring Authority</span>
                                                            {ownerProfile?.isVerified && (
                                                                <div className="flex items-center gap-1">
                                                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shadow-sm" />
                                                                    <span className="text-[8.5px] font-black text-emerald-400/80 uppercase tracking-widest leading-none">
                                                                        {getVerificationLabel(ownerProfile?.verificationTier)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="text-base font-black text-white">{collection.metadata.recruiterName || "Lead Recruiter"}</h3>
                                                        <p className="text-xs font-bold text-slate-400 leading-tight">{collection.metadata.recruiterRole || "Recruitment Manager"}</p>
                                                    </div>
                                                    <div className="sm:text-right space-y-1">
                                                        {collection.metadata?.companyName && (
                                                            <div>
                                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5 font-sans">Company</p>
                                                                <p className="text-xs font-black text-emerald-400 leading-tight">{collection.metadata.companyName}</p>
                                                            </div>
                                                        )}
                                                        {collection.metadata?.projectStage && (
                                                            <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded inline-block">{collection.metadata.projectStage}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {collection.metadata.companyDescription && (
                                                    <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-white/5 pt-2.5">
                                                        "{collection.metadata.companyDescription}"
                                                    </p>
                                                )}

                                                {/* Links & Contact */}
                                                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {collection.metadata?.websiteUrl && (
                                                            <a href={collection.metadata.websiteUrl.startsWith('http') ? collection.metadata.websiteUrl : `https://${collection.metadata.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Website">
                                                                <Globe className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        {collection.metadata?.twitterUrl && (
                                                            <a href={collection.metadata.twitterUrl.startsWith('http') ? collection.metadata.twitterUrl : `https://x.com/${collection.metadata.twitterUrl.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Twitter / X">
                                                                <XIcon className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        {collection.metadata?.githubUrl && (
                                                            <a href={collection.metadata.githubUrl.startsWith('http') ? collection.metadata.githubUrl : `https://github.com/${collection.metadata.githubUrl}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="GitHub">
                                                                <Github className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        {collection.metadata?.discordUrl && (
                                                            <a href={collection.metadata.discordUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Discord">
                                                                <DiscordIcon className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        {collection.metadata?.telegramUrl && (
                                                            <a href={collection.metadata.telegramUrl.startsWith('http') ? collection.metadata.telegramUrl : `https://t.me/${collection.metadata.telegramUrl.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Telegram">
                                                                <Send className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        {collection.metadata?.companyEmail && (
                                                            <a href={`mailto:${collection.metadata.companyEmail}`} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="Email">
                                                                <Mail className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        {collection.metadata?.linkedinUrl && (
                                                            <a href={collection.metadata.linkedinUrl.startsWith('http') ? collection.metadata.linkedinUrl : `https://${collection.metadata.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5" title="LinkedIn">
                                                                <LinkedInIcon className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    {collection.metadata?.contactChannel && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
                                                            <Send className="w-3 h-3 text-indigo-400" />
                                                            <span className="text-[9px] font-bold">{collection.metadata.contactChannel}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Job Specs Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-sans">Role Type</p>
                                        <p className="text-xs font-bold text-white">{collection.metadata?.roleType || "Full-time"}</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-sans">Work Mode</p>
                                        <p className="text-xs font-bold text-white">{collection.metadata?.workMode || "Remote"}</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-sans">Timezone</p>
                                        <p className="text-xs font-bold text-white">{collection.metadata?.timezone || "Any"}</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-sans">Comp. Model</p>
                                        <p className="text-xs font-bold text-white">{collection.metadata?.compensationType || "Crypto + Equity"}</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-sans">Salary</p>
                                        <p className="text-xs font-bold text-white">{collection.metadata?.salary || "Competitive"}</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-sans">Experience</p>
                                        <p className="text-xs font-bold text-white">{collection.metadata?.experienceLevel || "Senior"}</p>
                                    </div>
                                </div>

                                {/* Job Details Card */}
                                <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.01] space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Job Summary</h3>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                                            {collection.description ? collection.description : "Apply to join the team and showcase your verified on-chain history as part of your application."}
                                        </p>
                                    </div>

                                    {collection.metadata?.keyResponsibilities && (
                                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                                                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Key Responsibilities</h3>
                                            </div>
                                            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                                                {collection.metadata.keyResponsibilities}
                                            </p>
                                        </div>
                                    )}

                                    {collection.metadata?.requirements && (
                                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                                                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Requirements</h3>
                                            </div>
                                            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                                                {collection.metadata.requirements}
                                            </p>
                                        </div>
                                    )}

                                    {collection.metadata?.whatWeOffer && (
                                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                                                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">What We Offer</h3>
                                            </div>
                                            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                                                {collection.metadata.whatWeOffer}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Evaluation & Eligibility Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Focus Areas */}
                                    {collection.metadata?.focusAreas && collection.metadata.focusAreas.length > 0 && (
                                        <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.01] space-y-3">
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Evaluation Focus</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {collection.metadata.focusAreas.map((area: string) => {
                                                    const labels: Record<string, string> = {
                                                        "on_chain": "On-Chain History",
                                                        "github": "GitHub Code",
                                                        "dao": "DAO Governance",
                                                        "hackathon": "Hackathons",
                                                        "nft": "NFT Portfolio"
                                                    };
                                                    return (
                                                        <span key={area} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold">
                                                            {labels[area] || area.replace(/_/g, ' ').toUpperCase()}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Deadline */}
                                    <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.01] space-y-1">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Deadline</p>
                                        <p className="text-sm font-black text-white">
                                            {collection.metadata?.deadline 
                                                ? new Date(collection.metadata.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : "Open/Rolling"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL: APPLICATION GATING & FORM SUBMISSION (40% width) ── */}
                        <div className="w-full lg:w-2/5 p-6 md:p-8 flex flex-col h-full lg:max-h-[820px] overflow-y-auto custom-scrollbar z-10 bg-[#111215]">
                            {!submitted ? (
                                <div className="space-y-6 text-left">
                                    <div className="pb-3 border-b border-white/5">
                                        <h2 className="text-lg font-bold text-white font-sans">Apply for Position</h2>
                                        <p className="text-[11px] text-slate-500 mt-1">Submit your verified work credentials to apply.</p>
                                    </div>

                                    {/* Eligibility Checklist */}
                                    <div className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #3b82f6" }}>
                                        <div className="flex items-center gap-2 mb-3 pb-2 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <Filter style={{ width: 13, height: 13, color: "#3b82f6" }} />
                                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Eligibility Criteria</span>
                                        </div>
                                        <div className="space-y-2">
                                            {collection.eligibility_filters?.activeWalletOnly ? (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-indigo-300">
                                                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-[10px] font-bold text-indigo-200">Active Wallet Required</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/10 opacity-40">
                                                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-500">Open to All Wallets</span>
                                                </div>
                                            )}
                                            {collection.eligibility_filters?.verifiedOnly ? (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-300">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-[10px] font-bold text-emerald-200">Verified Profiles Prioritized</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/10 opacity-40">
                                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-500">Unverified Profiles Accepted</span>
                                                </div>
                                            )}

                                            {/* Text Filters */}
                                            {collection.eligibility_filters?.regionRestriction && (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300">
                                                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                    <div className="flex flex-col text-left truncate">
                                                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Region / Member</span>
                                                        <span className="text-[10px] font-bold text-amber-100 truncate">{collection.eligibility_filters.regionRestriction}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {collection.eligibility_filters?.workPreference && (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-sky-500/5 border border-sky-500/20 text-sky-300">
                                                    <Briefcase className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                                    <div className="flex flex-col text-left truncate">
                                                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Work Preference</span>
                                                        <span className="text-[10px] font-bold text-sky-100 truncate">{collection.eligibility_filters.workPreference}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {collection.eligibility_filters?.languages && (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 text-purple-300">
                                                    <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                    <div className="flex flex-col text-left truncate">
                                                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Languages</span>
                                                        <span className="text-[10px] font-bold text-purple-100 truncate">{collection.eligibility_filters.languages}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {collection.eligibility_filters?.socialExposure && (
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-pink-500/5 border border-pink-500/20 text-pink-300">
                                                    <XIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                                    <div className="flex flex-col text-left truncate">
                                                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Social Exposure</span>
                                                        <span className="text-[10px] font-bold text-pink-100 truncate">{collection.eligibility_filters.socialExposure}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isConnected ? (
                                        <div className="text-center py-8 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                <User className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <h3 className="text-sm font-bold text-white mb-2">Sign In to Apply</h3>
                                            <p className="text-slate-400 mb-6 text-[11px] leading-relaxed max-w-[240px] mx-auto">Connect your wallet or sign in with Google to apply for this position.</p>
                                            <div className="flex justify-center scale-95">
                                                <WalletMultiButton />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Pre-flight warnings */}
                                            {collection.eligibility_filters?.verifiedOnly && applicantProfile && !applicantProfile.isVerified && (
                                                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/25 flex items-start gap-2.5 text-left">
                                                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[11px] font-bold text-amber-300">Verification Prioritized</p>
                                                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5">This role prioritizes verified builders. You can still apply, but your profile will be sorted to the bottom of the recruiter's list.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {collection.eligibility_filters?.activeWalletOnly && applicantProfile && applicantProfile.attestedReceiptCount < 1 && (
                                                <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/25 flex items-start gap-2.5 text-left">
                                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[11px] font-bold text-red-300">Active Wallet Required</p>
                                                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5">This opportunity requires at least 1 attested proof of work. You currently have 0 attested credentials.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Applicant Identity Card */}
                                            <div className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #10b981" }}>
                                                <div className="flex items-center gap-2 mb-3 pb-2 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <User style={{ width: 13, height: 13, color: "#10b981" }} />
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Applicant Identity</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 overflow-hidden shrink-0">
                                                            {applicantProfile?.avatarUrl ? (
                                                                <img src={applicantProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-5 h-5 text-emerald-400" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
                                                                {applicantProfile?.displayName || (googleUid ? googleSession?.user?.email : "Applicant Wallet")}
                                                            </p>
                                                            <p className="text-xs font-mono font-bold text-white truncate">
                                                                {googleUid
                                                                    ? (googleSession?.user?.email || "Google Builder")
                                                                    : `${publicKey?.toBase58().slice(0, 6)}...${publicKey?.toBase58().slice(-6)}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${
                                                        applicantProfile?.isVerified 
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                        : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                                                    }`}>
                                                        {applicantProfile?.isVerified ? "Verified" : "Unverified"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Strongest Proof of Work Signal */}
                                            <div className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #2dd4bf" }}>
                                                <div className="flex items-center gap-2 mb-3 pb-2 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <ShieldCheck style={{ width: 13, height: 13, color: "#2dd4bf" }} />
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Strongest Proof of Work</span>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-[11px] text-slate-400 leading-normal">
                                                        Select the category that represents your strongest on-chain or off-chain proof of work.
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans">
                                                    {SIGNAL_OPTIONS.map((opt) => {
                                                        const active = primarySignal === opt.id;
                                                        const Icon = opt.icon;
                                                        return (
                                                            <div
                                                                key={opt.id}
                                                                onClick={() => setPrimarySignal(opt.id)}
                                                                className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden text-left ${active ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'bg-white/[0.04] border-white/[0.1] hover:border-white/20 text-slate-400'}`}
                                                            >
                                                                <div className="flex items-start gap-2.5 relative z-10">
                                                                    <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}>
                                                                        <Icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-xs font-bold mb-0.5 truncate ${active ? 'text-emerald-100' : 'text-slate-300'}`}>{opt.label}</p>
                                                                        <p className="text-[9px] leading-tight text-slate-500 truncate">{opt.desc}</p>
                                                                    </div>
                                                                </div>
                                                                {active && (
                                                                    <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Role Focus */}
                                            <div className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #6366f1" }}>
                                                <div className="flex items-center gap-2 mb-3 pb-2 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <Briefcase style={{ width: 13, height: 13, color: "#6366f1" }} />
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Primary Role Focus</span>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-[11px] text-slate-400 leading-normal">
                                                        Identify your primary area of expertise or position format.
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans">
                                                    {ROLE_OPTIONS.map((opt) => {
                                                        const active = roleStrength === opt.id;
                                                        const Icon = opt.icon;
                                                        return (
                                                            <div
                                                                key={opt.id}
                                                                onClick={() => setRoleStrength(opt.id)}
                                                                className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden text-left ${active ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'bg-white/[0.04] border-white/[0.1] hover:border-white/20 text-slate-400'}`}
                                                            >
                                                                <div className="flex items-start gap-2.5 relative z-10">
                                                                    <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}>
                                                                        <Icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-xs font-bold mb-0.5 truncate ${active ? 'text-emerald-100' : 'text-slate-300'}`}>{opt.label}</p>
                                                                        <p className="text-[9px] leading-tight text-slate-500 truncate">{opt.desc}</p>
                                                                    </div>
                                                                </div>
                                                                {active && (
                                                                    <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {error && <p className="text-red-400 text-xs text-left py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</p>}

                                            {/* Submission Button */}
                                            <div className="pt-2">
                                                {collection.metadata?.deadline && new Date(collection.metadata.deadline) < new Date() ? (
                                                    <div className="w-full py-4 bg-slate-800/40 border border-slate-700 rounded-xl font-bold text-sm text-slate-500 text-center cursor-not-allowed select-none font-sans">
                                                        Applications Closed
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={handleSubmit}
                                                            disabled={submitting || !primarySignal || !roleStrength || (collection.eligibility_filters?.activeWalletOnly && (googleUid || (applicantProfile && applicantProfile.attestedReceiptCount < 1)))}
                                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-white font-sans"
                                                        >
                                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Verified Credentials <Send className="w-3.5 h-3.5" /></>}
                                                        </button>
                                                        {(!primarySignal || !roleStrength) && (
                                                            <p className="text-center text-[10px] text-slate-500 mt-2 font-sans">
                                                                {!primarySignal && !roleStrength
                                                                    ? "Select strongest proof of work and role focus to apply."
                                                                    : !primarySignal
                                                                        ? "Select strongest proof of work to apply."
                                                                        : "Select primary role focus to apply."}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Success State on Right Panel */
                                <div className="space-y-6 text-center py-10 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-450" />
                                    </div>
                                    <h2 className="text-xl font-black text-white font-sans">Submission Successful</h2>
                                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-sans">
                                        The hiring team at <span className="text-white font-bold">{collection.title}</span> has received your verified credentials.
                                    </p>

                                    {/* Status Snapshot */}
                                    <div id="application-status" className="rounded-xl p-4 text-left space-y-4 border border-white/[0.06] bg-white/[0.01]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-sans">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Live Status</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border transition-all font-sans ${
                                                existingSubmission?.recruiter_status === 'hired' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                existingSubmission?.recruiter_status === 'shortlisted' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                                existingSubmission?.recruiter_status === 'rejected' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                                "bg-slate-500/10 border-slate-500/20 text-slate-400"
                                            }`}>
                                                {existingSubmission?.recruiter_status || 'Pending'}
                                            </span>
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.06] space-y-2 font-sans">
                                                <div className="flex justify-between text-[10px] font-medium font-sans">
                                                    <span className="text-slate-500">Signal Area</span>
                                                    <span className="text-emerald-400 font-bold">{existingSubmission?.primary_signal || primarySignal || 'General'}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-medium font-sans">
                                                    <span className="text-slate-500">Role Focus</span>
                                                    <span className="text-white font-bold">{existingSubmission?.role_strength || roleStrength || 'Contributor'}</span>
                                                </div>
                                            </div>

                                            {existingSubmission?.recruiter_notes && (
                                                <div className="space-y-1.5 pt-1.5">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block font-sans">Recruiter Verdict</span>
                                                    <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-3">
                                                        "{existingSubmission.recruiter_notes}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
