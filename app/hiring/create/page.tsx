"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase/client";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { getHiringLimit, RETAIL_JOB_POST_USDC_DISPLAY } from "@/lib/paymentConfig";
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
    const { publicKey, signMessage, signTransaction } = useWallet();
    const { session, orgAccount: googleOrgAccount, loading: googleLoading } = useGoogleAuth();
    const isGoogleUser = !publicKey && !!session;
    const [loading, setLoading] = useState(false);
    const [createdSlug, setCreatedSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    // Tier enforcement state
    const [userTier, setUserTier] = useState<string>("unverified");
    const [collectionCount, setCollectionCount] = useState<number>(0);
    const [tierLoading, setTierLoading] = useState(false);

    // x402 payment state — set when server returns 402 + X-PAYMENT-RESPONSE
    const [x402Pending, setX402Pending] = useState<{
        paymentRequired: any;       // decoded PaymentRequired from X-PAYMENT-RESPONSE header
        requestBody: Record<string, any>; // original POST body to retry
    } | null>(null);
    const [x402PayLoading, setX402PayLoading] = useState(false);

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

    // Fetch user tier + collection count on wallet connect or Google session
    useEffect(() => {
        if (!publicKey && !session) { setUserTier("unverified"); setCollectionCount(0); return; }

        setTierLoading(true);

        if (publicKey) {
            const walletStr = publicKey.toBase58();
            fetch(`/api/user/me?wallet=${walletStr}`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data) setUserTier(data.verificationTier || "unverified");
                })
                .catch(() => {})
                .finally(async () => {
                    if (supabase) {
                        const { count } = await supabase
                            .from("hiring_collections")
                            .select("*", { count: "exact", head: true })
                            .eq("owner_wallet", walletStr);
                        setCollectionCount(count ?? 0);
                    }
                    setTierLoading(false);
                });
        } else if (session) {
            // Google user — derive tier from org subscription
            const authUid = session.user.id;
            const planName = googleOrgAccount?.plan_name || "free";
            const subStatus = googleOrgAccount?.subscription_status || "free";
            const periodEnd = googleOrgAccount?.current_period_end;
            const isActive = subStatus === "active" && planName !== "free" &&
                (!periodEnd || new Date(periodEnd) > new Date());
            setUserTier(isActive ? "Company / Organization" : "unverified");

            if (supabase) {
                void supabase.from("hiring_collections")
                    .select("*", { count: "exact", head: true })
                    .eq("owner_wallet", `gauth:${authUid}`)
                    .then(({ count }) => {
                        setCollectionCount(count ?? 0);
                        setTierLoading(false);
                    });
            } else {
                setTierLoading(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, session, googleOrgAccount]);

    // Auto-populate profile data from wallet profile or Google org account
    useEffect(() => {
        const fetchProfile = async () => {
            if (publicKey && supabase) {
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
            } else if (isGoogleUser && googleOrgAccount) {
                setFormData(prev => ({
                    ...prev,
                    recruiterName: prev.recruiterName || googleOrgAccount.org_name || "",
                    companyName: prev.companyName || googleOrgAccount.org_name || "",
                    websiteUrl: prev.websiteUrl || googleOrgAccount.website || "",
                    twitterUrl: prev.twitterUrl || googleOrgAccount.twitter || "",
                }));
                setIsAutoFilled(true);
            }
        };

        fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, isGoogleUser, googleOrgAccount]);

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
        if (!publicKey && !session) {
            setToast({ message: "Please connect your wallet or sign in with Google.", type: "warning" });
            return;
        }

        if (!formData.title.trim() || formData.title.trim().length < 5) {
            setToast({ message: "Job title must be at least 5 characters.", type: "error" });
            return;
        }

        // Normalize + validate URL fields before sending
        const normalizedForm = { ...formData };
        const urlFields: { key: keyof typeof formData; label: string; isTwitter?: boolean }[] = [
            { key: "websiteUrl",  label: "Website URL" },
            { key: "twitterUrl",  label: "Twitter/X",   isTwitter: true },
            { key: "linkedinUrl", label: "LinkedIn URL" },
            { key: "discordUrl",  label: "Discord URL" },
            { key: "telegramUrl", label: "Telegram URL" },
        ];
        for (const { key, label, isTwitter } of urlFields) {
            const raw = (normalizedForm[key] as string)?.trim();
            if (!raw) continue;

            let normalized = raw;

            if (isTwitter) {
                // Accept: @username  username  twitter.com/x  https://x.com/x
                const handle = raw.replace(/^@/, "").replace(/^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//, "").split("?")[0].split("/")[0].trim();
                if (!handle) continue;
                normalized = `https://x.com/${handle}`;
            } else if (!/^https?:\/\//i.test(raw)) {
                // No protocol — prepend https://
                normalized = `https://${raw}`;
            }

            // Final sanity check on the normalized value
            try {
                const parsed = new URL(normalized);
                if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                    setToast({ message: `${label} — invalid URL format.`, type: "error" });
                    return;
                }
            } catch {
                setToast({ message: `${label} — could not parse as a valid URL.`, type: "error" });
                return;
            }

            (normalizedForm as any)[key] = normalized;
        }

        setLoading(true);

        try {
            let requestBody: Record<string, any> = {
                ...normalizedForm,
            };

            if (isGoogleUser && session) {
                // Google user — no wallet signing, use gauth: identifier
                requestBody.ownerWallet = `gauth:${session.user.id}`;
                requestBody.auth_uid = session.user.id;
            } else if (publicKey && signMessage) {
                // Wallet user — sign the action on-chain
                const { signChainVolioAction } = await import("@/lib/wallet-utils");
                const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "create_collection");

                if (!signedAction) {
                    setLoading(false);
                    return;
                }
                requestBody.ownerWallet = publicKey.toBase58();
                Object.assign(requestBody, signedAction);
            } else {
                setToast({ message: "Please connect your wallet to sign this action.", type: "warning" });
                setLoading(false);
                return;
            }

            const res = await fetch("/api/hiring/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            // ── Handle x402 payment required ────────────────────────────────
            if (res.status === 402) {
                const xPaymentResponse = res.headers.get("X-PAYMENT-RESPONSE");
                if (xPaymentResponse && !isGoogleUser) {
                    try {
                        const { decodePaymentRequiredHeader } = await import("@x402/core/http");
                        const paymentRequired = decodePaymentRequiredHeader(xPaymentResponse);
                        setX402Pending({ paymentRequired, requestBody });
                        setCollectionCount(hiringLimit ?? 0);
                    } catch {
                        setToast({ message: "Payment required but could not decode payment details.", type: "error" });
                    }
                } else {
                    // Google user or no header — show upgrade prompt
                    setToast({ message: "Free job post limit reached. Upgrade for unlimited access.", type: "warning" });
                    setCollectionCount(hiringLimit ?? 0);
                }
                return;
            }

            const responseData = await res.json();

            if (!res.ok) {
                const errorMsg = responseData?.error?.message || "An error occurred while creating the collection.";
                setToast({ message: errorMsg, type: "error" });
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

    const copyToClipboard = async () => {
        if (!createdSlug) return;
        const url = `${window.location.origin}/r/${createdSlug}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // clipboard blocked — silent fail
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /**
     * x402 payment handler.
     * Called when the user confirms the $2 USDC payment in the overlay.
     * Builds a VersionedTransaction (USDC transfer to treasury), signs it WITHOUT
     * submitting, encodes it as ExactSvmPayloadV1, then retries the original POST
     * with the X-PAYMENT header so the server can verify + settle via Dexter.
     */
    const handleX402Pay = async () => {
        if (!x402Pending || !publicKey || !signTransaction) return;
        setX402PayLoading(true);
        try {
            const { Connection, PublicKey, TransactionMessage, VersionedTransaction } = await import("@solana/web3.js");
            const { getAssociatedTokenAddress, createTransferCheckedInstruction } = await import("@solana/spl-token");
            const { encodePaymentSignatureHeader } = await import("@x402/core/http");

            const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
            const conn = new Connection(rpcUrl, "confirmed");

            // Resolve token accounts
            const requirements = x402Pending.paymentRequired.accepts[0];
            const usdcMint = new PublicKey(requirements.asset);
            const treasury = new PublicKey(requirements.payTo);
            const fromATA = await getAssociatedTokenAddress(usdcMint, publicKey);
            const toATA = await getAssociatedTokenAddress(usdcMint, treasury);

            // USDC transfer instruction (6 decimals, 2 USDC = 2_000_000 base units)
            const transferIx = createTransferCheckedInstruction(
                fromATA,
                usdcMint,
                toATA,
                publicKey,
                BigInt(requirements.amount), // "2000000"
                6 // USDC decimals
            );

            // Build versioned transaction (required by x402 SVM scheme)
            const { blockhash } = await conn.getLatestBlockhash("confirmed");
            const message = new TransactionMessage({
                payerKey: publicKey,
                recentBlockhash: blockhash,
                instructions: [transferIx],
            }).compileToV0Message();
            const versionedTx = new VersionedTransaction(message);

            // Sign WITHOUT submitting
            const signedTx = await signTransaction(versionedTx as any);
            const base64Tx = Buffer.from((signedTx as any).serialize()).toString("base64");

            // Build PaymentPayload (x402 v2 format)
            const paymentPayload = {
                x402Version: 2,
                resource: x402Pending.paymentRequired.resource,
                accepted: requirements,
                payload: { transaction: base64Tx },
            };

            // Encode as X-PAYMENT header
            const xPaymentHeader = encodePaymentSignatureHeader(paymentPayload as any);

            // Retry the original POST with X-PAYMENT header
            const res = await fetch("/api/hiring/collections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-PAYMENT": xPaymentHeader,
                },
                body: JSON.stringify(x402Pending.requestBody),
            });

            const responseData = await res.json();

            if (!res.ok) {
                const errorMsg = responseData?.error?.message || "Payment failed. Please try again.";
                setToast({ message: errorMsg, type: "error" });
                setX402Pending(null);
                return;
            }

            // Success — clear payment state and show the created slug
            setX402Pending(null);
            const slug = responseData?.data?.slug || responseData?.slug;
            if (slug) {
                setCreatedSlug(slug);
                setCollectionCount(prev => prev + 1);
            } else {
                setToast({ message: "Job post created but no slug returned.", type: "error" });
            }
        } catch (err: any) {
            console.error("[x402pay]", err);
            setToast({ message: err?.message || "Payment failed. Please try again.", type: "error" });
        } finally {
            setX402PayLoading(false);
        }
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

    if (tierLoading || googleLoading) {
        return <LoadingScreen />;
    }

    if (!publicKey && !session) {
        return (
            <main className="min-h-screen text-white flex flex-col bg-black">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-bold text-white">Sign in to continue</h1>
                        <p className="text-slate-400 text-sm max-w-sm">Connect your wallet or sign in with Google to create a hiring collection.</p>
                    </div>
                    <WalletMultiButton />
                    <Link href="/" className="text-slate-400 hover:text-white text-sm">← Back</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-white selection:bg-emerald-500/30 bg-black theme-bg-page theme-aware">
            <Navbar />
            <div className="h-20" />{/* spacer for sticky navbar */}

            <section className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
                {!createdSlug ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-7">
                            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>ChainVolio Recruit</p>
                            <h1 className="text-xl font-bold text-white tracking-tight">Create Hiring Collection</h1>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Define criteria and collect verifiable on-chain portfolios from candidates.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Google-user notice — no on-chain record, no hiring dashboard */}
                        {isGoogleUser && (
                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Signed in with Google</p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Your collection will be saved to Supabase. Note: the hiring dashboard won&apos;t be available for Google-only accounts — connect a wallet later to unlock it.
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Tier-based hiring gate */}
                        {hiringAccess === "limit_reached" ? (
                            // Limit reached: any capped tier exhausted
                            <div className="mb-8 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-rose-500/5 border border-rose-500/20 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-rose-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base font-bold text-white">You've used your free job post.</h3>
                                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                        Fill the form and submit to pay <span className="text-violet-300 font-bold">${RETAIL_JOB_POST_USDC_DISPLAY.toFixed(2)} USDC</span> per additional post, or upgrade for unlimited access.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
                                    <span className="text-slate-400">Hiring Usage:</span>
                                    <span className="text-rose-400">{collectionCount} / {hiringLimit} used</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                    {!isGoogleUser && publicKey && (
                                        <p className="self-center text-[10px] text-violet-400 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 font-medium">
                                            ↓ Fill form below · pay ${RETAIL_JOB_POST_USDC_DISPLAY.toFixed(2)} USDC via x402
                                        </p>
                                    )}
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" /> Upgrade Now
                                    </Link>
                                </div>
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
                            {/* ── 1. Job Overview ── */}
                            <div className="rounded-xl p-4 bg-slate-900 border border-slate-800">
                                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <Briefcase style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Job Overview</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Position Title <span style={{ color: "rgba(255,255,255,0.18)", fontWeight: 400 }}>*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Content Creator, Frontend Engineer"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Description <span style={{ color: "rgba(255,255,255,0.15)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>optional</span></label>
                                        <textarea
                                            placeholder="Briefly describe the role, key responsibilities, or specific requirements..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all h-24 resize-none placeholder:text-slate-600 text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── 2. Recruiter Identity ── */}
                            <div className="rounded-xl p-4 bg-slate-900 border border-slate-800">
                                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <Building2 style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recruiter Identity</span>
                                    {isAutoFilled && (
                                        <span style={{ fontSize: 9, color: "rgba(52,211,153,0.7)", fontWeight: 600, marginLeft: "auto" }}>Auto-filled from profile</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Recruiter Name / Alias</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Satoshi (Founder)"
                                                    value={formData.recruiterName}
                                                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 pr-9 text-sm font-medium focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600"
                                                />
                                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Current Role</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. CTO, Head of Talent"
                                                value={formData.recruiterRole}
                                                onChange={(e) => setFormData({ ...formData, recruiterRole: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Company / Project Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. ChainVolio"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Project Stage</label>
                                            <select
                                                value={formData.projectStage}
                                                onChange={(e) => setFormData({ ...formData, projectStage: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all text-sm cursor-pointer appearance-none"
                                            >
                                                <option value="Stealth">Stealth</option>
                                                <option value="Early">Early Stage</option>
                                                <option value="Live">Mainnet / Live</option>
                                                <option value="Scaling">Scaling / Growth</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Company Description</label>
                                        <input
                                            type="text"
                                            placeholder="Subtle, high-signal recruitment infrastructure for Web3."
                                            value={formData.companyDescription}
                                            onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>

                                    {/* Official Links subsection */}
                                    <div className="pt-1">
                                        <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                            <LayoutGrid style={{ width: 11, height: 11, color: "rgba(255,255,255,0.25)" }} />
                                            <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Official Presence</span>
                                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", marginLeft: 4 }}>optional</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Website URL"
                                                    value={formData.websiteUrl}
                                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600 text-xs"
                                                />
                                            </div>
                                            <div className="relative">
                                                <XIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="X / Twitter handle"
                                                    value={formData.twitterUrl}
                                                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600 text-xs"
                                                />
                                            </div>
                                            <div className="relative">
                                                <DiscordIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Discord Link"
                                                    value={formData.discordUrl}
                                                    onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600 text-xs"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                                <input
                                                    type="email"
                                                    placeholder="Company Email"
                                                    value={formData.companyEmail}
                                                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600 text-xs"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Telegram Group / Channel"
                                                    value={formData.telegramUrl}
                                                    onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600 text-xs"
                                                />
                                            </div>
                                            <div className="relative">
                                                <LinkedInIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Company LinkedIn"
                                                    value={formData.linkedinUrl}
                                                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600 text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-2.5">
                                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Preferred Contact Method <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.15)" }}>optional</span></label>
                                            <input
                                                type="text"
                                                placeholder="e.g. DM on X, Discord Ticket, or Email"
                                                value={formData.contactChannel}
                                                onChange={(e) => setFormData({ ...formData, contactChannel: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 focus:border-emerald-500/60 outline-none transition-all placeholder:text-slate-600 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── 3. Role Details ── */}
                            <div className="rounded-xl p-4 bg-slate-900 border border-slate-800">
                                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <Briefcase style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Role Details</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                    <div className="rounded-lg px-3 py-2.5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Role Type</label>
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
                                    </div>

                                    <div className="rounded-lg px-3 py-2.5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Work Mode</label>
                                        <select
                                            value={formData.workMode}
                                            onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                            className="w-full bg-transparent border-none outline-none text-sm appearance-none font-medium cursor-pointer"
                                        >
                                            <option className="bg-[#121214] text-white">Remote</option>
                                            <option className="bg-[#121214] text-white">Hybrid</option>
                                            <option className="bg-[#121214] text-white">On-site</option>
                                        </select>
                                    </div>

                                    <div className="rounded-lg px-3 py-2.5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Timezone</label>
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
                                    </div>

                                    <div className="rounded-lg px-3 py-2.5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Experience</label>
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
                                    </div>

                                    <div className="rounded-lg px-3 py-2.5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Comp. Model</label>
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
                                    </div>

                                    <div className="rounded-lg px-3 py-2.5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Salary</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. $120k – $180k"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                            className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── 4. Evaluation Focus ── */}
                            <div className="rounded-xl p-4 bg-slate-900 border border-slate-800">
                                <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Evaluation Focus</span>
                                    </div>
                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>optional</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                    {focusOptions.map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() => toggleFocus(opt.id)}
                                            className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 group relative overflow-hidden ${formData.focusAreas.includes(opt.id) ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'}`}
                                        >
                                            <div className="flex items-start gap-2.5 relative z-10">
                                                <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${formData.focusAreas.includes(opt.id) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                                                    <opt.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-bold mb-0.5 ${formData.focusAreas.includes(opt.id) ? 'text-emerald-100' : 'text-slate-300'}`}>{opt.label}</p>
                                                    <p className="text-[10px] text-slate-600 leading-tight">{opt.desc}</p>
                                                </div>
                                            </div>
                                            {formData.focusAreas.includes(opt.id) && (
                                                <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Custom Focus Box */}
                                    <div className={`p-3.5 rounded-xl border transition-all duration-200 group relative overflow-hidden ${formData.customFocus ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'}`}>
                                        <div className="flex items-start gap-2.5 relative z-10">
                                            <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${formData.customFocus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Add Your Focus..."
                                                    value={formData.customFocus}
                                                    onChange={(e) => setFormData({ ...formData, customFocus: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:text-slate-500 text-white"
                                                />
                                                <p className="text-[10px] text-slate-600 leading-tight mt-0.5">Write your specific priority</p>
                                            </div>
                                        </div>
                                        {formData.customFocus && (
                                            <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* ── 5. Eligibility Filters ── */}
                            <div className="rounded-xl p-4 bg-slate-900 border border-slate-800">
                                <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="flex items-center gap-2">
                                        <Filter style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Eligibility Filters</span>
                                    </div>
                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Reduce Spam · optional</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    <div
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, minReceiptsThreshold: prev.filters.minReceiptsThreshold === 5 ? 0 : 5 }
                                        }))}
                                        className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 group relative ${formData.filters.minReceiptsThreshold === 5 ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${formData.filters.minReceiptsThreshold === 5 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500'}`}>
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${formData.filters.minReceiptsThreshold === 5 ? 'text-indigo-100' : 'text-slate-300'}`}>Active Wallet Only</p>
                                                <p className="text-[10px] text-slate-600">Requires 5+ on-chain receipts/txs</p>
                                            </div>
                                        </div>
                                        {formData.filters.minReceiptsThreshold === 5 && <div className="absolute top-2 right-2 text-indigo-500"><Check className="w-3.5 h-3.5" /></div>}
                                    </div>

                                    <div
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, verifiedOnly: !prev.filters.verifiedOnly }
                                        }))}
                                        className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 group relative ${formData.filters.verifiedOnly ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${formData.filters.verifiedOnly ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${formData.filters.verifiedOnly ? 'text-emerald-100' : 'text-slate-300'}`}>Verified Profiles Only</p>
                                                <p className="text-[10px] text-slate-600">Must have at least 1 attestation</p>
                                            </div>
                                        </div>
                                        {formData.filters.verifiedOnly && <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>}
                                    </div>
                                </div>
                            </div>

                            {/* ── 6. Final Configuration ── */}
                            <div className="rounded-xl p-4 bg-slate-900 border border-slate-800">
                                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <CalendarDays style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Final Configuration</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Submission Deadline <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.15)" }}>optional</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CalendarDays className="h-3.5 w-3.5 text-slate-700" />
                                            </div>
                                            <input
                                                type="date"
                                                value={formData.deadline}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-emerald-500/60 outline-none transition-colors text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Collection Visibility</label>
                                        <div className="flex p-1 rounded-lg" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                            {['public', 'unlisted', 'private'].map((vis) => (
                                                <button
                                                    key={vis}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, visibility: vis })}
                                                    className={`flex-1 py-1.5 rounded-md text-[11px] font-bold capitalize transition-all flex items-center justify-center gap-1.5 ${formData.visibility === vis ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.04]'}`}
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

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !formData.title || !!x402Pending}
                                    className="w-full py-3.5 bg-white text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Generate Hiring Link</>}
                                </button>
                                <p className="text-center text-[10px] mt-3" style={{ color: "rgba(255,255,255,0.15)" }}>
                                    By creating this collection, you agree to handle candidate data with care.
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
                                View Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                Back to Dashboard
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

            {/* ── x402 Payment Confirmation Modal ─────────────────────────────── */}
            {x402Pending && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 px-4">
                    <div className="w-full max-w-sm bg-[#0d0d0f] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
                        {/* Icon */}
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <DollarSign className="w-8 h-8 text-violet-400" />
                            </div>
                        </div>

                        {/* Title + amount */}
                        <div className="text-center space-y-2">
                            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">x402 Payment</p>
                            <h3 className="text-xl font-bold text-white">Post Additional Job</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                You&apos;ve used your 2 free job posts. Pay once to publish this additional position.
                            </p>
                        </div>

                        {/* Price badge */}
                        <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/8">
                            <span className="text-3xl font-black text-white">${RETAIL_JOB_POST_USDC_DISPLAY.toFixed(2)}</span>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-300">USDC</p>
                                <p className="text-[10px] text-slate-500">one-time · Solana mainnet</p>
                            </div>
                        </div>

                        {/* x402 badge */}
                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
                            Processed via x402 protocol · Dexter facilitator
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleX402Pay}
                                disabled={x402PayLoading}
                                className="w-full py-3.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
                            >
                                {x402PayLoading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing &amp; Verifying…</>
                                    : <><DollarSign className="w-4 h-4" /> Pay ${RETAIL_JOB_POST_USDC_DISPLAY.toFixed(2)} &amp; Post Job</>
                                }
                            </button>
                            <button
                                onClick={() => setX402Pending(null)}
                                disabled={x402PayLoading}
                                className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Upgrade hint */}
                        <p className="text-center text-[10px] text-slate-600">
                            Want unlimited posts?{" "}
                            <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                                Upgrade your plan
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
