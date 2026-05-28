"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase/client";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getHiringLimit, RETAIL_JOB_POST_USDC_DISPLAY, RETAIL_JOB_POST_USDC, USDC_MINT_MAINNET, TREASURY_WALLET } from "@/lib/paymentConfig";
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
    Target,
    FolderOpen,
    Activity,
    Inbox,
    ExternalLink,
    Share2,
    CheckCircle2,
    MapPin
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
    const [activeSection, setActiveSection] = useState("recruiter-identity");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const handleSectionClick = (id: string) => {
        setActiveSection(id);
        const container = document.getElementById("form-scroll-container");
        const target = document.getElementById(id);
        if (container && target) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const scrollOffset = targetRect.top - containerRect.top + container.scrollTop;
            container.scrollTo({
                top: scrollOffset - 10,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        const container = document.getElementById("form-scroll-container");
        if (!container) return;

        const handleScroll = () => {
            const sections = [
                "recruiter-identity",
                "job-description",
                "job-details",
                "evaluation-focus",
                "eligibility-filters",
                "final-configuration"
            ];

            const containerRect = container.getBoundingClientRect();
            let activeId = "recruiter-identity";

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const relativeTop = rect.top - containerRect.top;
                    const relativeBottom = rect.bottom - containerRect.top;

                    // If the top of the element is near or above the top of the container view,
                    // and its bottom is still below the top offset, it's the active one.
                    if (relativeTop <= 120 && relativeBottom > 40) {
                        activeId = sectionId;
                    }
                }
            }
            setActiveSection(activeId);
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

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
        description: "", // maps to Job Summary
        keyResponsibilities: "",
        requirements: "",
        whatWeOffer: "",
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
            verifiedOnly: false,
            activeWalletOnly: false,
            regionRestriction: "",
            workPreference: "",
            languages: "",
            socialExposure: ""
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
                        .select("display_name, headline, professional_role, organization, website, twitter, avatar_url")
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
                        setAvatarUrl(data.avatar_url || null);
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
                setAvatarUrl(googleOrgAccount.avatar_url || null);
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

            // ── Handle payment required ────────────────────────────────
            if (res.status === 402) {
                let errorCode = "ERR_PAYMENT_REQUIRED";
                try { const d = await res.json(); errorCode = d.error?.code || errorCode; } catch {}
                if (errorCode === "ERR_PAYMENT_REQUIRED" && !isGoogleUser) {
                    setX402Pending({
                        paymentRequired: {
                            accepts: [{ asset: USDC_MINT_MAINNET, payTo: TREASURY_WALLET, amount: RETAIL_JOB_POST_USDC }],
                            resource: { url: "/api/hiring/collections" },
                        },
                        requestBody,
                    });
                    setCollectionCount(hiringLimit ?? 0);
                } else {
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
     * Payment handler — submits a USDC transfer to the treasury on-chain,
     * then retries the POST with the confirmed tx signature so the server
     * can verify payment directly via Solana RPC (no external facilitator).
     */
    const handleX402Pay = async () => {
        if (!x402Pending || !publicKey || !signTransaction) return;
        setX402PayLoading(true);
        try {
            const { Connection, PublicKey, TransactionMessage, VersionedTransaction } = await import("@solana/web3.js");
            const {
                getAssociatedTokenAddress,
                createTransferCheckedInstruction,
                createAssociatedTokenAccountIdempotentInstruction,
            } = await import("@solana/spl-token");

            const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
            const conn = new Connection(rpcUrl, "confirmed");

            const requirements = x402Pending.paymentRequired.accepts[0];
            const usdcMint = new PublicKey(requirements.asset);
            const treasury = new PublicKey(requirements.payTo);
            const fromATA = await getAssociatedTokenAddress(usdcMint, publicKey);
            const toATA = await getAssociatedTokenAddress(usdcMint, treasury);

            // Ensure treasury USDC ATA exists (no-op if already created)
            const createToATAIx = createAssociatedTokenAccountIdempotentInstruction(
                publicKey, toATA, treasury, usdcMint
            );

            // USDC transfer instruction (6 decimals)
            const transferIx = createTransferCheckedInstruction(
                fromATA, usdcMint, toATA, publicKey,
                BigInt(requirements.amount), 6
            );

            // Build + sign the versioned transaction
            const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
            const message = new TransactionMessage({
                payerKey: publicKey,
                recentBlockhash: blockhash,
                instructions: [createToATAIx, transferIx],
            }).compileToV0Message();
            const versionedTx = new VersionedTransaction(message);
            const signedTx = await signTransaction(versionedTx as any);

            // Submit to Solana and wait for confirmation
            const txSignature = await conn.sendRawTransaction((signedTx as any).serialize(), {
                skipPreflight: false,
            });
            try {
                await conn.confirmTransaction(
                    { signature: txSignature, blockhash, lastValidBlockHeight },
                    "confirmed"
                );
            } catch (confirmErr: any) {
                // Blockhash can expire if wallet approval took too long — check if
                // the tx was actually included in a block before declaring failure.
                if (confirmErr?.name === "TransactionExpiredBlockHeightExceededError") {
                    const status = await conn.getSignatureStatus(txSignature);
                    const cs = status?.value?.confirmationStatus;
                    if (cs !== "confirmed" && cs !== "finalized") {
                        throw new Error("Transaction expired. Please try again (click Pay & Post Job once more).");
                    }
                    // Transaction was confirmed despite timeout — continue normally
                } else {
                    throw confirmErr;
                }
            }

            // Retry the original POST — server verifies the tx on-chain
            const res = await fetch("/api/hiring/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...x402Pending.requestBody, x_payment_txsig: txSignature }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                const errorMsg = responseData?.error?.message || "Payment failed. Please try again.";
                setToast({ message: errorMsg, type: "error" });
                setX402Pending(null);
                return;
            }

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
        <main className="min-h-screen text-white selection:bg-emerald-500/30 theme-bg-page theme-aware" style={{ background: "#0d0d0f" }}>
            <div className="w-full min-h-screen" style={{ background: "linear-gradient(to bottom, #000000 0%, #2c2c30 100%)" }}>
                <Navbar />
                <div className="h-20" />{/* spacer for sticky navbar */}

                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 relative z-10">
                    <div className="w-full rounded-2xl overflow-hidden flex min-h-[750px] relative" style={{ background: "#0d0e11", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 48px -20px rgba(0,0,0,0.98), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
                        {/* Spotlight — thin cone from top-center */}
                        <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse 45% 28% at 50% -1%, rgba(255,255,255,0.07) 0%, transparent 80%)" }} />

                        {/* ── LEFT SIDEBAR ── */}
                        <div className="hidden lg:flex w-[210px] flex-shrink-0 flex-col h-full self-stretch" style={{ background: "#111215", borderRight: "1px solid rgba(255,255,255,0.06)", minHeight: "750px" }}>
                            {/* Logo */}
                            <div className="flex items-center px-4 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <img src="/chainvolio%20logo.png" alt="chainvolio" style={{ height: 20, width: "auto", objectFit: "contain" }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginLeft: 6, letterSpacing: "-0.01em" }}>chainvolio</span>
                            </div>
                            {/* Nav items */}
                            <div className="px-2 py-3 flex-1 space-y-0.5">
                                {([
                                    { icon: Building2,    label: "Recruiter Identity",id: "recruiter-identity" },
                                    { icon: Target,       label: "Job Description",   id: "job-description" },
                                    { icon: Clock,        label: "Job Details",       id: "job-details" },
                                    { icon: ShieldCheck,  label: "Evaluation Focus",  id: "evaluation-focus" },
                                    { icon: Filter,       label: "Eligibility Filters",id: "eligibility-filters" },
                                    { icon: CalendarDays, label: "Final Configuration",id: "final-configuration" },
                                ] as Array<{ icon: React.ElementType; label: string; id: string }>).map(({ icon: Icon, label, id }) => {
                                    const active = activeSection === id;
                                    return (
                                        <div key={id} 
                                            onClick={() => handleSectionClick(id)}
                                            className={`flex items-center gap-2.5 px-3 py-[7px] rounded-md relative transition-all duration-300 cursor-pointer ${active ? "" : "hover:bg-white/[0.03]"}`} 
                                            style={active ? { background: "rgba(255,255,255,0.07)" } : {}}
                                        >
                                            {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />}
                                            <Icon style={{ width: 13, height: 13, flexShrink: 0, color: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }} />
                                            <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)" }}>{label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Recruiter info at bottom of sidebar */}
                            <div className="px-3 py-3.5 flex items-center gap-2 hover:bg-white/[0.03] transition-colors cursor-default" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-3.5 h-3.5 text-white/50" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1 }} className="truncate">
                                        {formData.recruiterName || (publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "Recruiter")}
                                    </p>
                                    <p style={{ fontSize: 8.5, color: "#4ade80", fontWeight: 600, marginTop: 2, letterSpacing: "0.03em" }}>ACTIVE</p>
                                </div>
                            </div>
                        </div>

                        {/* ── CENTER PANEL ── */}
                        <div className="flex-1 flex flex-col min-w-0 self-stretch z-10" style={{ background: "#0a0b0e" }}>
                            {/* Top bar */}
                            <div className="flex items-center justify-between px-6 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>
                                        {!createdSlug ? "Create Hiring Link" : "Hiring Link Live"}
                                    </p>
                                </div>

                                {/* ── Hiring Status Indicator ── */}
                                {!createdSlug && (
                                    <div className="flex items-center gap-2">
                                        {hiringAccess === "unlimited" ? (
                                            /* Unlimited tier — show tier name with glow */
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)" }}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", letterSpacing: "0.04em" }}>
                                                    {userTier === "Company / Organization" ? "Company / Org" : userTier} · Unlimited
                                                </span>
                                            </div>
                                        ) : hiringAccess === "capped_available" ? (
                                            /* Has slots remaining */
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                                    <Briefcase style={{ width: 10, height: 10, color: "rgba(165,180,252,0.8)" }} />
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(165,180,252,0.9)", letterSpacing: "0.03em" }}>
                                                        {collectionCount} / {hiringLimit} used
                                                    </span>
                                                    {remaining <= 1 && (
                                                        <span style={{ fontSize: 9, fontWeight: 700, color: "#fb923c", letterSpacing: "0.04em" }}>· {remaining} left</span>
                                                    )}
                                                </div>
                                                <Link href="/dashboard" className="flex items-center gap-1 px-2 py-1 rounded-md transition-all hover:opacity-80" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.18)", fontSize: 9, fontWeight: 700, color: "#2dd4bf", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                                    Upgrade
                                                </Link>
                                            </div>
                                        ) : hiringAccess === "limit_reached" ? (
                                            /* Limit reached — suggest upgrade or pay-per-post */
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                                    <Lock style={{ width: 9, height: 9, color: "#f87171" }} />
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", letterSpacing: "0.03em" }}>
                                                        {collectionCount} / {hiringLimit} · Limit Reached
                                                    </span>
                                                </div>
                                                {!isGoogleUser && publicKey && (
                                                    <span style={{ fontSize: 9, color: "rgba(167,139,250,0.85)", fontWeight: 600 }}>
                                                        Pay ${RETAIL_JOB_POST_USDC_DISPLAY.toFixed(0)} USDC ↓
                                                    </span>
                                                )}
                                                <Link href="/dashboard" className="flex items-center gap-1 px-2 py-1 rounded-md transition-all hover:opacity-80" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.18)", fontSize: 9, fontWeight: 700, color: "#2dd4bf", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                                    Upgrade
                                                </Link>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {/* Scrollable body content */}
                            <div id="form-scroll-container" className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar max-h-[750px] relative">
                                {/* Capped usage info inside center panel on mobile only */}
                                <div className="block xl:hidden mb-6">
                                    {hiringAccess === "limit_reached" ? (
                                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 text-center space-y-3">
                                            <div className="w-10 h-10 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
                                                <Lock className="w-5 h-5 text-rose-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-bold text-white">You've used your free job post.</h3>
                                                <p className="text-xs text-slate-400">
                                                    Pay <span className="text-violet-300 font-bold">${RETAIL_JOB_POST_USDC_DISPLAY.toFixed(2)} USDC</span> per additional post, or upgrade for unlimited access.
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
                                                <span>Usage:</span>
                                                <span className="text-rose-400">{collectionCount} / {hiringLimit} used</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                                                {!isGoogleUser && publicKey && (
                                                    <p className="self-center text-[10px] text-violet-400 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 font-medium">
                                                        ↓ Fill form below · pay ${RETAIL_JOB_POST_USDC_DISPLAY.toFixed(2)} USDC per additional post
                                                    </p>
                                                )}
                                                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-widest transition-all">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> Upgrade Now
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-xs font-bold text-white">Verification Status</h4>
                                                    {hiringAccess === "capped_available" ? (
                                                        <p className="text-[10px] text-slate-400">
                                                            Usage: <span className="font-bold text-emerald-400">{collectionCount} / {hiringLimit} used</span>. {remaining} remaining.
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-slate-400">Verify your organization for unlimited hiring.</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Link href="/dashboard" className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border border-indigo-500/20">
                                                {hiringAccess === "capped_available" ? "Upgrade" : "Verify"}
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {!createdSlug ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <header className="mb-7">
                                            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>ChainVolio Recruit</p>
                                            <h1 className="text-xl font-bold text-white tracking-tight">Create <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Hiring Collection</span></h1>
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

                            {/* ── 1. Recruiter Identity ── */}
                            <div id="recruiter-identity" className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #2dd4bf" }}>
                                <div className="flex items-center gap-2 mb-4 pb-3 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />
                                    <Building2 style={{ width: 13, height: 13, color: "#2dd4bf" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recruiter Identity</span>
                                    {isAutoFilled && (
                                        <span style={{ fontSize: 9, color: "rgba(52,211,153,0.7)", fontWeight: 600, marginLeft: "auto" }}>Auto-filled from profile</span>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Information about the recruiter or your project/company to provide transparency to candidates.
                                    </p>
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
                                                    className={`w-full rounded-lg px-3 py-2.5 pr-9 text-sm font-medium outline-none transition-all placeholder:text-slate-600 ${formData.recruiterName ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                                />
                                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Current Role</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. CTO, Head of Talent"
                                                value={formData.recruiterRole}
                                                onChange={(e) => setFormData({ ...formData, recruiterRole: e.target.value })}
                                                className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-slate-600 ${formData.recruiterRole ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
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
                                                className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-slate-600 ${formData.companyName ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Project Stage</label>
                                            <select
                                                value={formData.projectStage}
                                                onChange={(e) => setFormData({ ...formData, projectStage: e.target.value })}
                                                className={`w-full rounded-lg px-3 py-2.5 outline-none transition-all text-sm cursor-pointer appearance-none ${formData.projectStage ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-emerald-400 font-bold focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                            >
                                                <option value="Stealth" className="bg-[#0e0f12] text-white">Stealth</option>
                                                <option value="Early" className="bg-[#0e0f12] text-white">Early Stage</option>
                                                <option value="Live" className="bg-[#0e0f12] text-white">Mainnet / Live</option>
                                                <option value="Scaling" className="bg-[#0e0f12] text-white">Scaling / Growth</option>
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
                                            className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-slate-600 ${formData.companyDescription ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
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
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                                <input
                                                    type="text"
                                                    placeholder="Website URL"
                                                    value={formData.websiteUrl}
                                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                                    className={`w-full rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder:text-slate-600 text-xs ${formData.websiteUrl ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                                />
                                            </div>
                                            <div className="relative">
                                                <XIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                                <input
                                                    type="text"
                                                    placeholder="X / Twitter handle"
                                                    value={formData.twitterUrl}
                                                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                                                    className={`w-full rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder:text-slate-600 text-xs ${formData.twitterUrl ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                                />
                                            </div>
                                            <div className="relative">
                                                <DiscordIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                                <input
                                                    type="text"
                                                    placeholder="Discord Link"
                                                    value={formData.discordUrl}
                                                    onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                                                    className={`w-full rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder:text-slate-600 text-xs ${formData.discordUrl ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                                <input
                                                    type="email"
                                                    placeholder="Company Email"
                                                    value={formData.companyEmail}
                                                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                                    className={`w-full rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder:text-slate-600 text-xs ${formData.companyEmail ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                                <input
                                                    type="text"
                                                    placeholder="Telegram Group / Channel"
                                                    value={formData.telegramUrl}
                                                    onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                                                    className={`w-full rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder:text-slate-600 text-xs ${formData.telegramUrl ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                                />
                                            </div>
                                            <div className="relative">
                                                <LinkedInIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                                <input
                                                    type="text"
                                                    placeholder="Company LinkedIn"
                                                    value={formData.linkedinUrl}
                                                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                                    className={`w-full rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder:text-slate-600 text-xs ${formData.linkedinUrl ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
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
                                                className={`w-full rounded-lg px-3 py-2.5 outline-none transition-all placeholder:text-slate-600 text-xs ${formData.contactChannel ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── 2. Job Description ── */}
                            <div id="job-description" className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #10b981" }}>
                                <div className="flex items-center gap-2 mb-4 pb-3 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />
                                    <Target style={{ width: 13, height: 13, color: "#34d399" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Job Description</span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Define the job role details including summary, key responsibilities, requirements, and what you offer.
                                    </p>
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
                                            className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-slate-600 ${formData.title ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Job Summary</label>
                                        <textarea
                                            placeholder="Briefly describe the role, key responsibilities, or specific requirements..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className={`w-full rounded-lg px-3 py-2.5 outline-none transition-all h-24 resize-none placeholder:text-slate-600 text-sm leading-relaxed ${formData.description ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Key Responsibilities</label>
                                        <textarea
                                            placeholder="Describe the day-to-day duties and core focus..."
                                            value={formData.keyResponsibilities}
                                            onChange={(e) => setFormData({ ...formData, keyResponsibilities: e.target.value })}
                                            className={`w-full rounded-lg px-3 py-2.5 outline-none transition-all h-24 resize-none placeholder:text-slate-600 text-sm leading-relaxed ${formData.keyResponsibilities ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Requirements</label>
                                        <textarea
                                            placeholder="Skills, years of experience, tools, stack, and certifications..."
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            className={`w-full rounded-lg px-3 py-2.5 outline-none transition-all h-24 resize-none placeholder:text-slate-600 text-sm leading-relaxed ${formData.requirements ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>What We Offer</label>
                                        <textarea
                                            placeholder="Compensation, benefits, remote setup, tokens, team offsites, etc..."
                                            value={formData.whatWeOffer}
                                            onChange={(e) => setFormData({ ...formData, whatWeOffer: e.target.value })}
                                            className={`w-full rounded-lg px-3 py-2.5 outline-none transition-all h-24 resize-none placeholder:text-slate-600 text-sm leading-relaxed ${formData.whatWeOffer ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── 3. Role Details ── */}
                            <div id="job-details" className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #60a5fa" }}>
                                <div className="flex items-center gap-2 mb-4 pb-3 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />
                                    <Briefcase style={{ width: 13, height: 13, color: "#60a5fa" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Role Details</span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Configure technical specifications such as role type, work mode, timezone, experience level, compensation model, and salary.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                    <div className={`rounded-lg px-3 py-2.5 transition-all focus-within:border-emerald-500/50 ${formData.roleType ? 'bg-emerald-500/[0.02] border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.1]'}`}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Role Type</label>
                                        <select
                                            value={formData.roleType}
                                            onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                                            className={`w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer ${formData.roleType ? 'text-emerald-400 font-bold' : 'text-white font-medium'}`}
                                        >
                                            <option className="bg-[#0e0f12] text-white">Full-time</option>
                                            <option className="bg-[#0e0f12] text-white">Contract</option>
                                            <option className="bg-[#0e0f12] text-white">Freelance</option>
                                            <option className="bg-[#0e0f12] text-white">Part-time</option>
                                            <option className="bg-[#0e0f12] text-white">Internship</option>
                                        </select>
                                    </div>

                                    <div className={`rounded-lg px-3 py-2.5 transition-all focus-within:border-emerald-500/50 ${formData.workMode ? 'bg-emerald-500/[0.02] border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.1]'}`}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Work Mode</label>
                                        <select
                                            value={formData.workMode}
                                            onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                            className={`w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer ${formData.workMode ? 'text-emerald-400 font-bold' : 'text-white font-medium'}`}
                                        >
                                            <option className="bg-[#0e0f12] text-white">Remote</option>
                                            <option className="bg-[#0e0f12] text-white">Hybrid</option>
                                            <option className="bg-[#0e0f12] text-white">On-site</option>
                                        </select>
                                    </div>

                                    <div className={`rounded-lg px-3 py-2.5 transition-all focus-within:border-emerald-500/50 ${formData.timezone ? 'bg-emerald-500/[0.02] border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.1]'}`}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Timezone</label>
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                            className={`w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer ${formData.timezone ? 'text-emerald-400 font-bold' : 'text-white font-medium'}`}
                                        >
                                            <option className="bg-[#0e0f12] text-white">Any Timezone</option>
                                            <option className="bg-[#0e0f12] text-white">Americas (UTC-5)</option>
                                            <option className="bg-[#0e0f12] text-white">Europe (UTC+1)</option>
                                            <option className="bg-[#0e0f12] text-white">Asia (UTC+8)</option>
                                        </select>
                                    </div>

                                    <div className={`rounded-lg px-3 py-2.5 transition-all focus-within:border-emerald-500/50 ${formData.experienceLevel ? 'bg-emerald-500/[0.02] border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.1]'}`}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Experience</label>
                                        <select
                                            value={formData.experienceLevel}
                                            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                                            className={`w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer ${formData.experienceLevel ? 'text-emerald-400 font-bold' : 'text-white font-medium'}`}
                                        >
                                            <option className="bg-[#0e0f12] text-white">Senior</option>
                                            <option className="bg-[#0e0f12] text-white">Mid-Level</option>
                                            <option className="bg-[#0e0f12] text-white">Junior</option>
                                            <option className="bg-[#0e0f12] text-white">Lead / Architect</option>
                                        </select>
                                    </div>

                                    <div className={`rounded-lg px-3 py-2.5 transition-all focus-within:border-emerald-500/50 ${formData.compensationType ? 'bg-emerald-500/[0.02] border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.1]'}`}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Comp. Model</label>
                                        <select
                                            value={formData.compensationType}
                                            onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
                                            className={`w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer ${formData.compensationType ? 'text-emerald-400 font-bold' : 'text-white font-medium'}`}
                                        >
                                            <option className="bg-[#0e0f12] text-white">Crypto + Equity</option>
                                            <option className="bg-[#0e0f12] text-white">Fiat + Equity</option>
                                            <option className="bg-[#0e0f12] text-white">Base Salary Only</option>
                                            <option className="bg-[#0e0f12] text-white">Crypto Only</option>
                                            <option className="bg-[#0e0f12] text-white">DAO Tokens</option>
                                            <option className="bg-[#0e0f12] text-white">Unpaid / Contributor</option>
                                        </select>
                                    </div>

                                    <div className={`rounded-lg px-3 py-2.5 transition-all focus-within:border-emerald-500/50 ${formData.salary ? 'bg-emerald-500/[0.02] border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.1]'}`}>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Salary</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. $10k/month"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                            className={`w-full bg-transparent border-none outline-none text-sm placeholder:text-slate-600 ${formData.salary ? 'text-emerald-400 font-bold' : 'text-white font-medium'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── 4. Evaluation Focus ── */}
                            <div id="evaluation-focus" className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #a78bfa" }}>
                                <div className="flex items-center justify-between mb-4 pb-3 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck style={{ width: 13, height: 13, color: "#a78bfa" }} />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Evaluation Focus</span>
                                    </div>
                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>optional</span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Specify how you will evaluate or assign extra points to candidates.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                    {focusOptions.map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() => toggleFocus(opt.id)}
                                            className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 group relative overflow-hidden ${formData.focusAreas.includes(opt.id) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.1] hover:border-white/20 text-slate-400'}`}
                                        >
                                            <div className="flex items-start gap-2.5 relative z-10">
                                                <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${formData.focusAreas.includes(opt.id) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}>
                                                    <opt.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-bold mb-0.5 ${formData.focusAreas.includes(opt.id) ? 'text-emerald-100' : 'text-slate-300'}`}>{opt.label}</p>
                                                    <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.22)" }}>{opt.desc}</p>
                                                </div>
                                            </div>
                                            {formData.focusAreas.includes(opt.id) && (
                                                <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Custom Focus Box */}
                                    <div className={`p-3.5 rounded-xl border transition-all duration-200 group relative overflow-hidden ${formData.customFocus ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.1] hover:border-white/20 text-slate-400'}`}>
                                        <div className="flex items-start gap-2.5 relative z-10">
                                            <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${formData.customFocus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}>
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Add Your Focus..."
                                                    value={formData.customFocus}
                                                    onChange={(e) => setFormData({ ...formData, customFocus: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:text-slate-600 text-white"
                                                />
                                                <p className="text-[10px] leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>Write your specific priority</p>
                                            </div>
                                        </div>
                                        {formData.customFocus && (
                                            <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── 5. Eligibility Filters ── */}
                            <div id="eligibility-filters" className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #fbbf24" }}>
                                <div className="flex items-center justify-between mb-4 pb-3 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />
                                    <div className="flex items-center gap-2">
                                         <Filter style={{ width: 13, height: 13, color: "#fbbf24" }} />
                                         <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Eligibility Filters</span>
                                    </div>
                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Reduce Spam · optional</span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Additional filters to screen and reduce spam from bots or candidates who are less active on-chain.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    <div
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, activeWalletOnly: !prev.filters.activeWalletOnly }
                                        }))}
                                        className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 group relative ${formData.filters.activeWalletOnly ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-white/[0.04] border-white/[0.1] hover:border-white/20 text-slate-400'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${formData.filters.activeWalletOnly ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/30'}`}>
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${formData.filters.activeWalletOnly ? 'text-indigo-100' : 'text-slate-300'}`}>Active Wallet Only</p>
                                                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>Must have at least 1 attested proof of work</p>
                                            </div>
                                        </div>
                                        {formData.filters.activeWalletOnly && <div className="absolute top-2 right-2 text-indigo-500"><Check className="w-3.5 h-3.5" /></div>}
                                    </div>

                                    <div
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            filters: { ...prev.filters, verifiedOnly: !prev.filters.verifiedOnly }
                                        }))}
                                        className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 group relative ${formData.filters.verifiedOnly ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.1] hover:border-white/20 text-slate-400'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${formData.filters.verifiedOnly ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${formData.filters.verifiedOnly ? 'text-emerald-100' : 'text-slate-300'}`}>Verified Profiles Only</p>
                                                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>Prioritize verified profiles; unverified profiles will sink to bottom</p>
                                            </div>
                                        </div>
                                        {formData.filters.verifiedOnly && <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3.5 h-3.5" /></div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Region / Membership Restriction</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Superteam Member Canada only"
                                            value={formData.filters.regionRestriction || ""}
                                            onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, regionRestriction: e.target.value } })}
                                            className={`w-full rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-slate-600 ${formData.filters.regionRestriction ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Work Preference Restriction</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Hybrid / Office / Remote immediate"
                                            value={formData.filters.workPreference || ""}
                                            onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, workPreference: e.target.value } })}
                                            className={`w-full rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-slate-600 ${formData.filters.workPreference ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Language Restriction</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Speak English + Mandarin only"
                                            value={formData.filters.languages || ""}
                                            onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, languages: e.target.value } })}
                                            className={`w-full rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-slate-600 ${formData.filters.languages ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Social Exposure Requirement</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Twitter/X min 10k followers"
                                            value={formData.filters.socialExposure || ""}
                                            onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, socialExposure: e.target.value } })}
                                            className={`w-full rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-slate-600 ${formData.filters.socialExposure ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-white focus:border-emerald-500' : 'bg-white/[0.04] border border-white/[0.1] text-white focus:border-emerald-500/50'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── 6. Final Configuration ── */}
                            <div id="final-configuration" className="rounded-xl p-4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #f87171" }}>
                                <div className="flex items-center gap-2 mb-4 pb-3 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />
                                    <CalendarDays style={{ width: 13, height: 13, color: "#f87171" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Final Configuration</span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Set the deadline for CV submission and the visibility of your hiring link.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Submission Deadline <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.15)" }}>optional</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                                            </div>
                                            <input
                                                type="date"
                                                value={formData.deadline}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                className={`w-full rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors ${formData.deadline ? 'bg-emerald-500/[0.02] border border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/[0.04] border border-white/[0.1] text-white/70 focus:border-emerald-500/50'}`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>Collection Visibility</label>
                                        <div className={`flex p-1 rounded-lg transition-all ${formData.visibility ? 'bg-emerald-500/[0.02] border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.1]'}`}>
                                            {['public', 'unlisted', 'private'].map((vis) => (
                                                <button
                                                    key={vis}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, visibility: vis })}
                                                    className={`flex-1 py-1.5 rounded-md text-[11px] font-bold capitalize transition-all flex items-center justify-center gap-1.5 ${formData.visibility === vis ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/25 hover:text-white/50 hover:bg-white/[0.04] border border-transparent'}`}
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
                            </div>
                        </div>

                        {/* ── RIGHT PANEL ── */}
                        <div className="hidden xl:flex w-[280px] flex-shrink-0 flex-col h-full self-stretch" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0e" }}>
                            {/* Top bar */}
                            <div className="flex items-center px-4 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Status & Preview</span>
                            </div>

                            <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar flex-1 max-h-[750px]">
                                {/* Capped usage / Upgrade info */}
                                <div className="space-y-2.5">
                                    <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Hiring Usage</p>
                                    
                                    {hiringAccess === "limit_reached" ? (
                                        <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2.5">
                                            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                                                <Lock className="w-3.5 h-3.5" /> Limit Reached
                                            </div>
                                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                                                You have used your free job post. Submit form to pay per post, or upgrade below.
                                            </p>
                                            <Link href="/dashboard" className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-wider hover:bg-teal-500/20 transition-all">
                                                Upgrade Now
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2.5">
                                            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                                                <ShieldCheck className="w-3.5 h-3.5" /> {userTier === "Company / Organization" ? "Verified Org" : "Standard"}
                                            </div>
                                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                                                {hiringLimit === null 
                                                    ? "You have unlimited hiring collections." 
                                                    : `Usage: ${collectionCount} / ${hiringLimit} used. (${remaining} remaining)`
                                                }
                                            </p>
                                            {hiringLimit !== null && (
                                                <Link href="/dashboard" className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-500/20 transition-all">
                                                    Upgrade Plan
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Live preview card */}
                                <div className="space-y-3.5">
                                    <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Live Preview</p>
                                    
                                    <div className="p-4 rounded-xl border relative overflow-hidden flex flex-col gap-3.5 transition-all duration-300 max-h-[500px] overflow-y-auto custom-scrollbar font-sans text-left"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.02)",
                                            borderColor: "rgba(255, 255, 255, 0.08)",
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="px-2 py-0.5 text-[8.5px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded uppercase tracking-wider">
                                                {formData.roleType || "Full-time"}
                                            </span>
                                            <span className="text-[9px] text-white/40 font-mono">
                                                {formData.workMode || "Remote"}
                                            </span>
                                        </div>

                                        {/* Recruiter Identity Preview */}
                                        {(formData.recruiterName || formData.companyName || formData.recruiterRole || formData.companyDescription || formData.websiteUrl || formData.twitterUrl || formData.discordUrl || formData.companyEmail || formData.telegramUrl || formData.linkedinUrl) && (
                                            <div className="p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04] space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center">
                                                        {avatarUrl ? (
                                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-white/40" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] font-bold text-white/80 truncate leading-none">
                                                            {formData.recruiterName || "Recruiter"}
                                                        </p>
                                                        <p className="text-[8.5px] text-slate-400 truncate mt-0.5 leading-none">
                                                            {formData.recruiterRole || "Hiring Manager"} {formData.companyName && `@ ${formData.companyName}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Company Description */}
                                                {formData.companyDescription && (
                                                    <p className="text-[9.5px] text-white/60 leading-relaxed italic border-t border-white/[0.03] pt-1.5 whitespace-pre-wrap">
                                                        {formData.companyDescription}
                                                    </p>
                                                )}

                                                {/* Official Presence Links */}
                                                {(formData.websiteUrl || formData.twitterUrl || formData.discordUrl || formData.companyEmail || formData.telegramUrl || formData.linkedinUrl) && (
                                                    <div className="flex flex-col gap-1 border-t border-white/[0.03] pt-1.5 text-[9px] text-slate-400">
                                                        {formData.websiteUrl && (
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Globe className="w-3 h-3 flex-shrink-0 text-white/30" />
                                                                <span className="truncate">{formData.websiteUrl}</span>
                                                            </div>
                                                        )}
                                                        {formData.twitterUrl && (
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <XIcon className="w-3 h-3 flex-shrink-0 text-white/30" />
                                                                <span className="truncate">{formData.twitterUrl}</span>
                                                            </div>
                                                        )}
                                                        {formData.discordUrl && (
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <DiscordIcon className="w-3 h-3 flex-shrink-0 text-white/30" />
                                                                <span className="truncate">{formData.discordUrl}</span>
                                                            </div>
                                                        )}
                                                        {formData.companyEmail && (
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Mail className="w-3 h-3 flex-shrink-0 text-white/30" />
                                                                <span className="truncate">{formData.companyEmail}</span>
                                                            </div>
                                                        )}
                                                        {formData.telegramUrl && (
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Send className="w-3 h-3 flex-shrink-0 text-white/30" />
                                                                <span className="truncate">{formData.telegramUrl}</span>
                                                            </div>
                                                        )}
                                                        {formData.linkedinUrl && (
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <LinkedInIcon className="w-3 h-3 flex-shrink-0 text-white/30" />
                                                                <span className="truncate">{formData.linkedinUrl}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-bold text-white leading-tight truncate">
                                                {formData.title || "Position Title"}
                                            </h4>
                                            {formData.companyName && (
                                                <p className="text-xs text-white/50 font-medium truncate mt-0.5">
                                                    {formData.companyName}
                                                    {formData.projectStage && (
                                                        <span className="ml-1.5 px-1 py-0.5 text-[7px] text-amber-400 bg-amber-400/10 rounded uppercase">
                                                            {formData.projectStage}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description & Subfields */}
                                        {(formData.description || formData.keyResponsibilities || formData.requirements || formData.whatWeOffer) && (
                                            <div className="space-y-2 mt-1">
                                                {formData.description && (
                                                    <div>
                                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-wider mb-0.5">Summary</p>
                                                        <p className="text-[9.5px] text-white/50 leading-relaxed whitespace-pre-wrap line-clamp-3">{formData.description}</p>
                                                    </div>
                                                )}
                                                {formData.keyResponsibilities && (
                                                    <div>
                                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-wider mb-0.5">Responsibilities</p>
                                                        <p className="text-[9.5px] text-white/50 leading-relaxed whitespace-pre-wrap line-clamp-3">{formData.keyResponsibilities}</p>
                                                    </div>
                                                )}
                                                {formData.requirements && (
                                                    <div>
                                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-wider mb-0.5">Requirements</p>
                                                        <p className="text-[9.5px] text-white/50 leading-relaxed whitespace-pre-wrap line-clamp-3">{formData.requirements}</p>
                                                    </div>
                                                )}
                                                {formData.whatWeOffer && (
                                                    <div>
                                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-wider mb-0.5">What We Offer</p>
                                                        <p className="text-[9.5px] text-white/50 leading-relaxed whitespace-pre-wrap line-clamp-3">{formData.whatWeOffer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

                                        <div className="flex flex-col gap-1.5 text-[9.5px]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/30">Experience</span>
                                                <span className="text-white/70 font-semibold">{formData.experienceLevel || "Senior"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/30">Salary</span>
                                                <span className="text-emerald-400 font-bold">{formData.salary || "Negotiable"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/30">Timezone</span>
                                                <span className="text-white/70 font-medium truncate max-w-[90px]" title={formData.timezone}>{formData.timezone || "Any"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/30">Comp Model</span>
                                                <span className="text-white/70 font-medium truncate max-w-[90px]" title={formData.compensationType}>{formData.compensationType || "Standard"}</span>
                                            </div>
                                        </div>

                                        {/* Focus areas */}
                                        {(formData.focusAreas.length > 0 || formData.customFocus) && (
                                            <div className="space-y-1.5 mt-1">
                                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-wider">Evaluation Focus</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {formData.focusAreas.map((area) => (
                                                        <span key={area} className="px-1.5 py-0.5 text-[8.5px] text-white/60 bg-white/5 rounded border border-white/5 capitalize">
                                                            {area.replace("_", " ")}
                                                        </span>
                                                    ))}
                                                    {formData.customFocus && (
                                                        <span className="px-1.5 py-0.5 text-[8.5px] text-white/60 bg-white/5 rounded border border-white/5 truncate max-w-[120px]">
                                                            {formData.customFocus}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Eligibility Filters */}
                                        {(formData.filters.activeWalletOnly || formData.filters.verifiedOnly || formData.filters.regionRestriction || formData.filters.workPreference || formData.filters.languages || formData.filters.socialExposure) && (
                                            <div className="space-y-1 mt-1">
                                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-wider">Eligibility Filters</p>
                                                <div className="flex flex-col gap-1">
                                                    {formData.filters.activeWalletOnly && (
                                                        <span className="text-[9px] text-indigo-300 font-medium flex items-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" /> Active Wallet (At least 1 attested)
                                                        </span>
                                                    )}
                                                    {formData.filters.verifiedOnly && (
                                                        <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                                                            <ShieldCheck className="w-2.5 h-2.5" /> Prioritize Verified Profiles
                                                        </span>
                                                    )}
                                                    {formData.filters.regionRestriction && (
                                                        <span className="text-[9px] text-amber-400 font-medium flex items-center gap-1">
                                                            <MapPin className="w-2.5 h-2.5 text-amber-400" /> {formData.filters.regionRestriction}
                                                        </span>
                                                    )}
                                                    {formData.filters.workPreference && (
                                                        <span className="text-[9px] text-sky-400 font-medium flex items-center gap-1">
                                                            <Briefcase className="w-2.5 h-2.5 text-sky-400" /> {formData.filters.workPreference}
                                                        </span>
                                                    )}
                                                    {formData.filters.languages && (
                                                        <span className="text-[9px] text-purple-400 font-medium flex items-center gap-1">
                                                            <Globe className="w-2.5 h-2.5 text-purple-400" /> {formData.filters.languages}
                                                        </span>
                                                    )}
                                                    {formData.filters.socialExposure && (
                                                        <span className="text-[9px] text-pink-400 font-medium flex items-center gap-1">
                                                            <XIcon className="w-2.5 h-2.5 text-pink-400" /> {formData.filters.socialExposure}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Configuration details */}
                                        {(formData.deadline || formData.visibility) && (
                                            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] text-white/40">
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="w-2.5 h-2.5" /> {formData.deadline ? `Till ${formData.deadline}` : "No deadline"}
                                                </span>
                                                <span className="capitalize px-1.5 py-0.5 bg-white/5 rounded">
                                                    {formData.visibility}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">USDC Payment</p>
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

                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
                            Verified on-chain · Solana mainnet
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
            <Footer className="bg-[#0d0d0f]" />
            </div>
        </main>
    );
}
