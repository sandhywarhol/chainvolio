"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import Link from "next/link";
import { CheckCircle, XCircle, Users, Building, Building2, Briefcase, Award, Zap, Shield, ArrowLeft, ExternalLink, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VerificationRequestModal } from "@/components/profile/VerificationRequestModal";
import { Toast } from "@/components/ui/Toast";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import type { PlanName } from "@/lib/plans";

const C = {
    slate: { text: "text-white/35",     bg: "bg-white/[0.02]",     border: "border-white/[0.06]",  bar: "bg-white/20",     hex: "rgba(255,255,255,0.15)" },
    blue:  { text: "text-white/50",     bg: "bg-white/[0.03]",     border: "border-white/[0.08]",  bar: "bg-white/40",     hex: "rgba(255,255,255,0.2)" },
    amber: { text: "text-amber-200/80", bg: "bg-amber-200/[0.05]", border: "border-amber-200/15",  bar: "bg-amber-300/60", hex: "#f59e0b" },
} as const;
type CK = keyof typeof C;

const TIERS = [
    {
        id: "free" as PlanName,
        colorKey: "slate" as CK,
        verifyId: null as string | null,
        Icon: Building2,
        label: "Free",
        desc: "For exploring the platform and testing out hiring tools.",
        price: "Free",
        billing: "",
        authority: "None",
        attestationPower: 0,
        attestationsPerMonth: 0,
        hiringCollections: "1 collection",
        benefits: [
            { label: "1 hiring collection" },
            { label: "10 saved candidates" },
            { label: "Basic candidate browsing" },
            { label: "Shortlist candidates" },
            { label: "2 direct messages to candidates / month" },
        ],
    },
    {
        id: "community" as PlanName,
        colorKey: "blue" as CK,
        verifyId: "Community",
        Icon: Users,
        label: "Community / DAO",
        desc: "For DAOs, Web3 communities, and decentralized groups hiring on-chain.",
        price: "4.99 USDC",
        billing: "/ month",
        authority: "Collective Authority",
        attestationPower: 4,
        attestationsPerMonth: 20,
        hiringCollections: "Unlimited",
        anchorPrice: "9.99 USDC",
        benefits: [
            { label: "Unlimited hiring collections" },
            { label: "Verified Community Identity badge" },
            { label: "20 recognized attestations / month" },
            { label: "Hiring links marked as Trusted Community Opportunity" },
            { label: "Candidates can verify your community is legit" },
            { label: "Unlimited direct messages to candidates" },
        ],
    },
    {
        id: "company" as PlanName,
        colorKey: "amber" as CK,
        verifyId: "Company",
        Icon: Building,
        label: "Company / Org",
        desc: "For startups, studios, and official organizations that hire at scale.",
        price: "9.99 USDC",
        billing: "/ month",
        authority: "Institutional Authority",
        attestationPower: 5,
        attestationsPerMonth: 40,
        hiringCollections: "Unlimited",
        anchorPrice: "19.99 USDC",
        popular: true,
        benefits: [
            { label: "Unlimited hiring collections" },
            { label: "Verified Organization Badge for maximum institutional trust" },
            { label: "40 attestations / month" },
            { label: "Hiring links appear as verified institutional sources" },
            { label: "\"Institutional Trust\" signal visible to every candidate" },
            { label: "Unlimited direct messages to candidates" },
        ],
    },
] as const;

const COMPARISON = [
    {
        category: "Pricing",
        rows: [
            { label: "Monthly price", values: ["Free", "4.99 USDC", "9.99 USDC"] },
            { label: "Yearly price",  values: ["Free", "49.90 USDC", "99.90 USDC"] },
            { label: "How to get",    values: ["Default", "Payment", "Payment"] },
        ]
    },
    {
        category: "Hiring Tools",
        rows: [
            { label: "Hiring collections",          values: ["1", "Unlimited", "Unlimited"] },
            { label: "Saved candidates",             values: ["10", "Unlimited", "Unlimited"] },
            { label: "Hiring link as trusted source", values: [false, true, true] },
        ]
    },
    {
        category: "Identity & Trust",
        rows: [
            { label: "Verified badge on profile",  values: [false, true, true] },
            { label: "Badge type",                 values: ["-", "Community", "Company / Org"] },
            { label: "Institutional trust signal", values: [false, "Collective", "Institutional"] },
        ]
    },
    {
        category: "Candidate Outreach",
        rows: [
            { label: "Direct messages to candidates", values: ["2 / month", "Unlimited", "Unlimited"] },
            { label: "Interview request system",       values: [true, true, true] },
            { label: "Candidate can accept / decline", values: [true, true, true] },
        ]
    },
    {
        category: "Attestations",
        rows: [
            { label: "Attestations / month", values: ["0", "20", "40"] },
            { label: "Attestation power",    values: ["0 / 5", "4 / 5", "5 / 5"] },
        ]
    },
];

function PowerStrips({ count, colorKey }: { count: number; colorKey: CK }) {
    const col = C[colorKey];
    return (
        <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className={`h-[3px] rounded-full transition-all ${i < count ? `${col.bar} opacity-80` : "bg-white/8"}`}
                    style={{ width: i < count ? 14 : 9 }}
                />
            ))}
        </div>
    );
}

function Cell({ value, colKey }: { value: string | boolean; colKey: CK }) {
    const col = C[colKey];
    if (value === true)  return <CheckCircle className={`w-4 h-4 ${col.text} mx-auto`} />;
    if (value === false) return <XCircle className="w-4 h-4 text-white/15 mx-auto" />;
    return <span className={`text-[11px] font-bold ${col.text}`}>{value}</span>;
}

// ── Payment-only wallet picker ─────────────────────────────────────────────────
// This modal is shown when a Google-logged-in user needs to connect a Solana
// wallet purely for USDC payment. It does NOT create a wallet session or call
// check-wallet — the user's identity stays as their Google account.
function PaymentWalletPicker({
    onClose,
    onConnect,
}: {
    onClose: () => void;
    onConnect: (walletName: string) => void;
}) {
    const { wallets } = useWallet();
    const [isMobile, setIsMobile] = useState(false);
    const [phantomAvailable, setPhantomAvailable] = useState(false);
    const [solflareAvailable, setSolflareAvailable] = useState(false);
    const [connecting, setConnecting] = useState<string | null>(null);

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        const phantom  = wallets.find(w => w.adapter.name === "Phantom");
        const solflare = wallets.find(w => w.adapter.name === "Solflare");
        setPhantomAvailable(phantom?.readyState === "Installed" || !!(window as any).solana?.isPhantom || !!(window as any).phantom?.solana?.isPhantom);
        setSolflareAvailable(solflare?.readyState === "Installed" || !!(window as any).solflare);
    }, [wallets]);

    const walletOptions = [
        { name: "Phantom",  available: phantomAvailable,  icon: "/logos/phantom.svg",  downloadUrl: "https://phantom.app/download" },
        { name: "Solflare", available: solflareAvailable, icon: "/logos/solflare.svg", downloadUrl: "https://solflare.com/download" },
    ];

    const effectivelyAvailable = (available: boolean) => available || isMobile;

    const handleClick = (wallet: typeof walletOptions[number]) => {
        if (!effectivelyAvailable(wallet.available)) {
            window.open(wallet.downloadUrl, "_blank", "noopener,noreferrer");
            return;
        }
        setConnecting(wallet.name);
        onConnect(wallet.name);
    };

    return (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-sm bg-[#0d0d0f] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-white/5 flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-bold text-white">Connect Wallet to Pay</h2>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-[240px]">
                            Your wallet is used for USDC payment only — it won&apos;t replace your Google login.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white shrink-0 ml-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 sm:p-6 space-y-2.5">
                    {walletOptions.map(wallet => (
                        <div
                            key={wallet.name}
                            onClick={() => handleClick(wallet)}
                            className="group flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-[18px] hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-black/50 border border-white/5 p-1.5 flex items-center justify-center shrink-0">
                                    <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain rounded" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white">{wallet.name}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {effectivelyAvailable(wallet.available)
                                            ? (isMobile && !wallet.available ? "Tap to open app" : "Detected & Ready")
                                            : "Not installed"}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 ml-2">
                                {effectivelyAvailable(wallet.available) ? (
                                    <div className="px-3 py-1.5 bg-white/[0.08] group-hover:bg-white/[0.12] text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all min-w-[60px] flex items-center justify-center border border-white/[0.08]">
                                        {connecting === wallet.name
                                            ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : "Connect"}
                                    </div>
                                ) : (
                                    <div className="px-3 py-1.5 bg-white/5 text-white/50 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 flex items-center gap-1.5">
                                        Install <ExternalLink className="w-2.5 h-2.5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <p className="text-center text-[10px] text-white/20 pt-1 leading-relaxed">
                        🔒 Your Google account stays active. The wallet is only used to sign the USDC transaction.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function RecruiterPricingPage() {
    const { orgAccount } = useGoogleAuth();
    const { publicKey, connected } = useWallet();
    const { connectWallet, connectionError } = useWalletConnect();

    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showWalletPicker, setShowWalletPicker]           = useState(false);
    const [initialTier, setInitialTier]                     = useState<string | null>(null);
    const [pendingTierId, setPendingTierId]                 = useState<string | null>(null);
    const [walletConnecting, setWalletConnecting]           = useState<string | null>(null);
    const [isMobile, setIsMobile]                           = useState(false);
    const [toast, setToast]                                 = useState<string | null>(null);

    const currentPlan = (orgAccount?.plan_name ?? "free") as PlanName;
    const colKeys: CK[] = ["slate", "blue", "amber"];

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    // When wallet connects via payment picker → open verification modal
    useEffect(() => {
        if (connected && publicKey && pendingTierId && showWalletPicker) {
            setShowWalletPicker(false);
            setWalletConnecting(null);
            setInitialTier(pendingTierId);
            setPendingTierId(null);
            setShowVerificationModal(true);
        }
    }, [connected, publicKey, pendingTierId, showWalletPicker]);

    // Handle connection error from payment picker
    useEffect(() => {
        if (!connectionError || !walletConnecting) return;
        setWalletConnecting(null);
        if (connectionError !== "cancelled") {
            setToast("Wallet connection failed. Please try again.");
        }
    }, [connectionError, walletConnecting]);

    const handleSubscribeClick = (verifyId: string) => {
        if (publicKey) {
            // Wallet already connected — go straight to payment
            setInitialTier(verifyId);
            setShowVerificationModal(true);
        } else {
            // Need wallet for USDC payment — show picker
            setPendingTierId(verifyId);
            setShowWalletPicker(true);
        }
    };

    const handleWalletConnect = async (walletName: string) => {
        setWalletConnecting(walletName);
        await connectWallet(walletName, isMobile);
    };

    return (
        <main className="min-h-screen bg-black theme-bg-page theme-aware text-white flex flex-col">
            <Navbar />

            {/* Background texture */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.02),transparent)]" />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full flex-1">

                {/* Back link */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-[11px] font-bold text-white/30 hover:text-white/70 uppercase tracking-widest transition-colors mb-12">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Dashboard
                </Link>

                {/* Hero */}
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.08] text-amber-200/60 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
                        <Building2 className="w-3 h-3" />
                        For Organizations &amp; Recruiters
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-none">
                        Get Your Organization{" "}
                        <span className="text-amber-200/60">Verified</span>
                    </h1>
                    <p className="text-white/40 text-[15px] md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                        Get a verified badge, unlock unlimited hiring collections, and signal trust to every Web3 builder on ChainVolio.
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-6 text-[11px] font-bold text-white/25 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Wallet-native</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> On-chain anchored</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="flex items-center gap-1.5"><Award className="w-3 h-3" /> Cancel anytime</span>
                    </div>
                </div>

                {/* Tier cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
                    {TIERS.map((tier) => {
                        const col    = C[tier.colorKey];
                        const isCurrent = currentPlan === tier.id;
                        const isPaid    = tier.id !== "free";

                        return (
                            <div
                                key={tier.id}
                                className={`relative flex flex-col rounded-2xl bg-black/40 border overflow-hidden transition-all duration-300 backdrop-blur-sm ${"popular" in tier && tier.popular ? "border-amber-500/30" : "border-white/8 hover:border-white/15"}`}
                                style={{ boxShadow: "popular" in tier && tier.popular ? `0 0 40px ${col.hex}15, 0 0 0 1px ${col.hex}20` : undefined }}
                            >
                                {/* Ribbon */}
                                {"popular" in tier && tier.popular && !isCurrent && (
                                    <div className="absolute top-0 right-4 text-[8px] font-black uppercase tracking-widest text-black px-2.5 py-1.5 rounded-b-lg" style={{ background: col.hex }}>
                                        Most Popular
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute top-0 right-4 text-[8px] font-black uppercase tracking-widest text-black px-2.5 py-1.5 rounded-b-lg bg-white/60">
                                        Current Plan
                                    </div>
                                )}

                                {/* Top accent */}
                                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${col.hex}80, transparent)` }} />

                                <div className="flex flex-col flex-1 p-6 gap-5">
                                    {/* Header */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${col.bg} border ${col.border}`}>
                                                <tier.Icon className={`w-5 h-5 ${col.text}`} />
                                            </div>
                                            <div>
                                                <h3 className={`text-[15px] font-black leading-tight ${col.text}`}>{tier.label}</h3>
                                                {"popular" in tier && tier.popular && <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-widest">Recommended</span>}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-white/35 leading-relaxed font-medium">{tier.desc}</p>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    {/* Price */}
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            {"anchorPrice" in tier && (
                                                <span className="text-[13px] line-through text-white/20 font-medium">{tier.anchorPrice}</span>
                                            )}
                                            <span className="text-[28px] font-black leading-none text-white tracking-tight">{tier.price}</span>
                                        </div>
                                        {tier.billing && <p className="text-[10px] text-white/30 font-medium mt-1">{tier.billing}</p>}
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    {/* Benefits */}
                                    <div className="flex flex-col gap-2.5">
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.18em]">What you get</p>
                                        {tier.benefits.map((b, i) => (
                                            <div key={i} className="flex items-start gap-2.5">
                                                <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-px ${col.text} opacity-70`} />
                                                <span className="text-[11.5px] text-white/55 leading-snug font-medium">{b.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex-1" />
                                    <div className="h-px bg-white/5" />

                                    {/* Attestation authority (paid tiers only) */}
                                    {isPaid && (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.18em]">Attestation Authority</p>
                                            <div>
                                                <span className="text-[12px] font-black text-white">{tier.authority}</span>
                                                <p className="text-[10px] text-white/40 font-medium mt-0.5">{tier.attestationsPerMonth} attestations / month</p>
                                            </div>
                                            <PowerStrips count={tier.attestationPower} colorKey={tier.colorKey} />
                                        </div>
                                    )}

                                    {/* Quick stats */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`rounded-lg px-3 py-2 ${col.bg} border ${col.border}`}>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Briefcase className={`w-3 h-3 ${col.text}`} />
                                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Hiring</span>
                                            </div>
                                            <span className={`text-[11px] font-black ${col.text}`}>{tier.hiringCollections}</span>
                                        </div>
                                        <div className={`rounded-lg px-3 py-2 ${col.bg} border ${col.border}`}>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Award className={`w-3 h-3 ${col.text}`} />
                                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Attests</span>
                                            </div>
                                            <span className={`text-[11px] font-black ${col.text}`}>{tier.attestationsPerMonth}/mo</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    {isCurrent || !isPaid ? (
                                        <button disabled className="w-full py-3 rounded-xl text-[12px] font-bold tracking-wide flex items-center justify-center gap-2 bg-slate-800 text-slate-500 cursor-default border border-slate-700">
                                            {isCurrent ? "Current Plan" : "Free Plan"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribeClick(tier.verifyId!)}
                                            className={`w-full py-3 rounded-xl text-[12px] font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${"popular" in tier && tier.popular ? "text-black hover:opacity-90" : `border ${col.border} ${col.bg} ${col.text} hover:opacity-80`}`}
                                            style={"popular" in tier && tier.popular ? { background: col.hex } : undefined}
                                        >
                                            <Zap className="w-4 h-4" /> Get Started
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Comparison table */}
                <div className="mb-20">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Full Feature Comparison</h2>
                        <p className="text-white/30 text-sm font-medium">Every feature and every tier, side by side</p>
                    </div>

                    <div className="rounded-2xl border border-white/8 overflow-hidden bg-black/30 backdrop-blur-sm max-w-4xl mx-auto">
                        {/* Table header */}
                        <div className="grid grid-cols-4 border-b border-white/6">
                            <div className="p-4 md:p-5" />
                            {TIERS.map((t) => {
                                const col = C[t.colorKey];
                                return (
                                    <div key={t.id} className="p-4 md:p-5 text-center border-l border-white/4">
                                        <t.Icon className={`w-4 h-4 ${col.text} mx-auto mb-1.5`} />
                                        <span className={`text-[11px] font-black ${col.text} uppercase tracking-widest block`}>{t.label}</span>
                                        <span className="text-[10px] text-white/30 font-medium mt-0.5 block">{t.price}{t.billing}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {COMPARISON.map((section, si) => (
                            <div key={section.category}>
                                <div className="grid grid-cols-4 bg-white/[0.02]">
                                    <div className="col-span-4 px-4 md:px-5 py-2.5">
                                        <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em]">{section.category}</span>
                                    </div>
                                </div>
                                {section.rows.map((row, ri) => (
                                    <div
                                        key={row.label}
                                        className={`grid grid-cols-4 border-t border-white/[0.03] transition-colors hover:bg-white/[0.015] ${ri === section.rows.length - 1 && si < COMPARISON.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                                    >
                                        <div className="px-4 md:px-5 py-3.5 flex items-center">
                                            <span className="text-[11px] font-medium text-white/40">{row.label}</span>
                                        </div>
                                        {row.values.map((val, vi) => (
                                            <div key={vi} className="px-4 md:px-5 py-3.5 flex items-center justify-center border-l border-white/[0.03]">
                                                <Cell value={val} colKey={colKeys[vi]} />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust info */}
                <div className="grid md:grid-cols-3 gap-4 mb-20">
                    {[
                        { icon: Shield, title: "On-chain anchored", body: "Every verification event is anchored to the Solana blockchain. Cryptographically permanent and auditable by anyone." },
                        { icon: Zap,    title: "Cancel anytime",    body: "Paid tiers are month-to-month subscriptions. Cancel at any time and your badge remains active until the period ends." },
                        { icon: Award,  title: "Paid in USDC",      body: "Payments are processed on-chain via your Solana wallet (Phantom or Solflare) in USDC. No Stripe, no cards, no region limits." },
                    ].map(({ icon: Icon, title, body }) => (
                        <div key={title} className="rounded-xl bg-white/[0.02] border border-white/6 p-6">
                            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                                <Icon className="w-4 h-4 text-white/40" />
                            </div>
                            <h3 className="text-[13px] font-black text-white mb-2">{title}</h3>
                            <p className="text-[12px] text-white/35 leading-relaxed font-medium">{body}</p>
                        </div>
                    ))}
                </div>

                <p className="text-center text-[10px] text-white/15 font-medium">
                    Each request is reviewed by the ChainVolio team before approval. Prices reflect platform access fees paid in USDC on Solana.
                </p>
            </div>

            <Footer />

            {/* Payment wallet picker — shown only when no wallet is connected */}
            {showWalletPicker && (
                <PaymentWalletPicker
                    onClose={() => { setShowWalletPicker(false); setPendingTierId(null); setWalletConnecting(null); }}
                    onConnect={handleWalletConnect}
                />
            )}

            {/* Verification + payment modal (same flow as wallet pricing page) */}
            {showVerificationModal && publicKey && (
                <VerificationRequestModal
                    walletAddress={publicKey.toBase58()}
                    profileName={orgAccount?.org_name ?? ""}
                    currentStatus={null}
                    currentTier={null}
                    initialTierId={initialTier}
                    isOrg
                    onClose={() => { setShowVerificationModal(false); setInitialTier(null); }}
                    onSuccess={() => {
                        setShowVerificationModal(false);
                        setInitialTier(null);
                        setToast("Verification request submitted! Our team will review it shortly.");
                    }}
                />
            )}

            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </main>
    );
}
