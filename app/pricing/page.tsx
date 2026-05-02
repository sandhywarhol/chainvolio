"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { CheckCircle, XCircle, Code2, Star, Users, Building, Shield, ArrowLeft, Zap, Briefcase, Award } from "lucide-react";
import { VerificationRequestModal } from "@/components/profile/VerificationRequestModal";
import { Toast } from "@/components/ui/Toast";

// ─── Color palette (matches modal) ─────────────────────────────────────────
const C = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500", glow: "shadow-emerald-500/20", hex: "#10b981" },
    pink:    { text: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20",    bar: "bg-pink-500",    glow: "shadow-pink-500/20",    hex: "#ec4899" },
    blue:    { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    bar: "bg-blue-500",    glow: "shadow-blue-500/20",    hex: "#3b82f6" },
    amber:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   bar: "bg-amber-500",   glow: "shadow-amber-500/20",   hex: "#f59e0b" },
} as const;
type CK = keyof typeof C;

// ─── Tier data ───────────────────────────────────────────────────────────────
const TIERS = [
    {
        id: "Builder",
        colorKey: "emerald" as CK,
        Icon: Code2,
        label: "Builder",
        desc: "For developers and contributors who want a verified on-chain presence.",
        price: "Free",
        billing: "Auto-verified",
        authority: "Builder Contributor",
        attestationPower: 2,
        attestationsPerMonth: 5,
        hiringCollections: "5 collections",
        benefits: [
            { label: "Verified Builder Badge on public profile" },
            { label: "5 attestations/month to endorse other builders" },
            { label: "Up to 5 hiring collections" },
            { label: "Higher credibility when organizations view your work" },
            { label: "Trusted signal in the ChainVolio reputation network" },
            { label: "Auto-verified. No waiting, no manual review." },
        ],
    },
    {
        id: "Figure",
        colorKey: "pink" as CK,
        Icon: Star,
        label: "Public Figure",
        desc: "For founders, KOLs, and notable ecosystem individuals with proven influence.",
        price: "Free",
        billing: "Invite only",
        authority: "Elevated Influence",
        attestationPower: 3,
        attestationsPerMonth: 10,
        hiringCollections: "10 collections",
        benefits: [
            { label: "Verified Public Figure Badge for recognized KOLs and founders" },
            { label: "10 attestations/month with elevated authority" },
            { label: "Up to 10 hiring collections" },
            { label: "Endorsements carry more weight, backed by tier-based scoring" },
            { label: "Recognized identity across the ChainVolio network" },
            { label: "Invite-only credibility signal to collaborators" },
        ],
    },
    {
        id: "Community",
        colorKey: "blue" as CK,
        Icon: Users,
        label: "Community / DAO",
        desc: "For DAOs, Web3 communities, and decentralized groups hiring on-chain.",
        price: "4.99 USDC",
        billing: "/ month",
        anchorPrice: "9.99 USDC",
        authority: "Collective Authority",
        attestationPower: 4,
        attestationsPerMonth: 20,
        hiringCollections: "Unlimited",
        popular: false,
        benefits: [
            { label: "Verified Community Identity badge on all listings" },
            { label: "Job listings marked as Trusted Community Opportunity" },
            { label: "20 recognized attestations/month (4× more than Builder)" },
            { label: "Unlimited hiring collections with no cap on job postings" },
            { label: "Collective Authority (4/5 attestation power)" },
            { label: "Candidates can verify your community is legitimate" },
            { label: "Verified identity publicly auditable on Solana" },
        ],
    },
    {
        id: "Company",
        colorKey: "amber" as CK,
        Icon: Building,
        label: "Company / Org",
        desc: "For startups, studios, and official organizations that hire at scale.",
        price: "9.99 USDC",
        billing: "/ month",
        anchorPrice: "19.99 USDC",
        authority: "Institutional Authority",
        attestationPower: 5,
        attestationsPerMonth: 40,
        hiringCollections: "Unlimited",
        popular: true,
        benefits: [
            { label: "Verified Organization Badge for maximum institutional trust" },
            { label: "Job listings appear as verified institutional hiring sources" },
            { label: "40 attestations/month, highest quota on the platform" },
            { label: "Unlimited hiring collections" },
            { label: "Institutional Authority at 5/5 bars, maximum power" },
            { label: "\"Institutional Trust\" signal visible to every candidate" },
            { label: "Attestations carry full organizational credibility on-chain" },
            { label: "Organization identity anchored and verifiable by anyone" },
        ],
    },
] as const;

// ─── Feature comparison rows ─────────────────────────────────────────────────
const COMPARISON = [
    {
        category: "Pricing",
        rows: [
            { label: "Monthly price", values: ["Free", "Free", "4.99 USDC", "9.99 USDC"] },
            { label: "Yearly price", values: ["Free", "Free", "49.90 USDC", "99.90 USDC"] },
            { label: "How to get", values: ["Auto (profile complete)", "Manual review", "Payment", "Payment"] },
        ]
    },
    {
        category: "Attestations",
        rows: [
            { label: "Attestations / month", values: ["5", "10", "20", "40"] },
            { label: "Attestation power", values: ["2 / 5", "3 / 5", "4 / 5", "5 / 5"] },
            { label: "Anti-reciprocity protection", values: [true, true, true, true] },
        ]
    },
    {
        category: "Hiring",
        rows: [
            { label: "Hiring collections", values: ["5", "10", "Unlimited", "Unlimited"] },
            { label: "Job listed as trusted source", values: [false, false, true, true] },
            { label: "Trust badge on job listings", values: [false, false, true, true] },
        ]
    },
    {
        category: "Identity",
        rows: [
            { label: "Verified badge on profile", values: [true, true, true, true] },
            { label: "Badge type", values: ["Builder", "Public Figure", "Community", "Company / Org"] },
            { label: "Institutional trust signal", values: [false, false, "Collective", "Institutional"] },
            { label: "On-chain anchored identity", values: [true, true, true, true] },
        ]
    },
];

// ─── Power strips ─────────────────────────────────────────────────────────────
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

// ─── Comparison cell ─────────────────────────────────────────────────────────
function Cell({ value, colKey }: { value: string | boolean; colKey: CK }) {
    const col = C[colKey];
    if (value === true) return <CheckCircle className={`w-4 h-4 ${col.text} mx-auto`} />;
    if (value === false) return <XCircle className="w-4 h-4 text-white/15 mx-auto" />;
    return <span className={`text-[11px] font-bold ${col.text}`}>{value}</span>;
}

export default function PricingPage() {
    const { publicKey } = useWallet();
    const [profile, setProfile] = useState<any>(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [initialTier, setInitialTier] = useState<string | null>(null);

    useEffect(() => {
        if (publicKey) {
            fetch(`/api/user/me?wallet=${publicKey.toBase58()}`)
                .then(r => r.json())
                .then(data => setProfile(data))
                .catch(err => console.error("Error fetching profile:", err));
        }
    }, [publicKey]);

    const handleTierClick = (tierId: string) => {
        if (!publicKey) {
            setToastMessage("Please connect your wallet first");
            return;
        }
        setInitialTier(tierId);
        setShowVerificationModal(true);
    };

    const colKeys: CK[] = ["emerald", "pink", "blue", "amber"];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* ── Background texture ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.05),transparent)]" />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">

                {/* ── Back link ── */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-[11px] font-bold text-white/30 hover:text-white/70 uppercase tracking-widest transition-colors mb-12">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Dashboard
                </Link>

                {/* ── Hero ── */}
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
                        <Shield className="w-3 h-3" />
                        Verified Identity
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-none">
                        Build trust that{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                            can't be faked
                        </span>
                    </h1>
                    <p className="text-white/40 text-[15px] md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                        Unlock attestation authority, trusted hiring listings, and a verified badge across the Web3 ecosystem. All backed by on-chain proof.
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-6 text-[11px] font-bold text-white/25 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Wallet-native</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> On-chain anchored</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="flex items-center gap-1.5"><Award className="w-3 h-3" /> Cancel anytime</span>
                    </div>
                </div>

                {/* ── Tier cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-20">
                    {TIERS.map((tier) => {
                        const col = C[tier.colorKey];
                        return (
                            <div
                                key={tier.id}
                                className={`relative flex flex-col rounded-2xl bg-black/40 border overflow-hidden transition-all duration-300 group backdrop-blur-sm ${"popular" in tier && tier.popular ? `border-amber-500/30` : "border-white/8 hover:border-white/15"}`}
                                style={{ boxShadow: "popular" in tier && tier.popular ? `0 0 40px ${col.hex}15, 0 0 0 1px ${col.hex}20` : undefined }}
                            >
                                {/* Popular ribbon */}
                                {"popular" in tier && tier.popular && (
                                    <div className="absolute top-0 right-4 text-[8px] font-black uppercase tracking-widest text-black px-2.5 py-1.5 rounded-b-lg" style={{ background: col.hex }}>
                                        Most Trust
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
                                            {"anchorPrice" in tier && tier.anchorPrice && (
                                                <span className="text-[13px] line-through text-white/20 font-medium">{tier.anchorPrice}</span>
                                            )}
                                            <span className="text-[28px] font-black leading-none text-white tracking-tight">{tier.price}</span>
                                            {tier.id === "Figure" && (
                                                <span className="text-[10px] text-white/30 font-medium">(Invite only)</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-white/30 font-medium mt-1">{tier.billing}</p>
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

                                    {/* Attestation authority */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.18em]">Attestation Authority</p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[12px] font-black text-white">{tier.authority}</span>
                                                <p className="text-[10px] text-white/40 font-medium mt-0.5">{tier.attestationsPerMonth} attestations / month</p>
                                            </div>
                                        </div>
                                        <PowerStrips count={tier.attestationPower} colorKey={tier.colorKey} />
                                    </div>

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
                                    <button
                                        onClick={() => handleTierClick(tier.id)}
                                        className={`w-full py-3 rounded-xl text-[12px] font-bold tracking-wide transition-all text-center block ${"popular" in tier && tier.popular
                                            ? "text-black hover:opacity-90"
                                            : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"}`}
                                        style={"popular" in tier && tier.popular ? { background: col.hex } : undefined}
                                    >
                                        {tier.id === "Builder" ? "Earn Free Verification" : tier.id === "Figure" ? "Request Access" : "Get Started"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Comparison table ── */}
                <div className="mb-20">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Full Feature Comparison</h2>
                        <p className="text-white/30 text-sm font-medium">Every feature and every tier, side by side</p>
                    </div>

                    <div className="rounded-2xl border border-white/8 overflow-hidden bg-black/30 backdrop-blur-sm">
                        {/* Table header */}
                        <div className="grid grid-cols-5 border-b border-white/6">
                            <div className="p-4 md:p-5" />
                            {TIERS.map((t) => {
                                const col = C[t.colorKey];
                                return (
                                    <div key={t.id} className="p-4 md:p-5 text-center border-l border-white/4">
                                        <t.Icon className={`w-4 h-4 ${col.text} mx-auto mb-1.5`} />
                                        <span className={`text-[11px] font-black ${col.text} uppercase tracking-widest block`}>{t.label}</span>
                                        <span className="text-[10px] text-white/30 font-medium mt-0.5 block">{t.price}{t.billing !== "Auto-verified" && t.billing !== "Invite only" ? t.billing : ""}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Comparison rows */}
                        {COMPARISON.map((section, si) => (
                            <div key={section.category}>
                                {/* Section header */}
                                <div className="grid grid-cols-5 bg-white/[0.02]">
                                    <div className="col-span-5 px-4 md:px-5 py-2.5">
                                        <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em]">{section.category}</span>
                                    </div>
                                </div>

                                {section.rows.map((row, ri) => (
                                    <div
                                        key={row.label}
                                        className={`grid grid-cols-5 border-t border-white/[0.03] transition-colors hover:bg-white/[0.015] ${ri === section.rows.length - 1 && si < COMPARISON.length - 1 ? "border-b border-white/[0.06]" : ""}`}
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

                {/* ── FAQ / Trust ── */}
                <div className="grid md:grid-cols-3 gap-4 mb-20">
                    {[
                        {
                            icon: Shield,
                            title: "On-chain anchored",
                            body: "Every verification event and attestation is anchored to the Solana blockchain via a memo transaction. Cryptographically permanent and auditable by anyone."
                        },
                        {
                            icon: Zap,
                            title: "Cancel anytime",
                            body: "Paid tiers (Community / Company) are month-to-month subscriptions. Cancel at any time and your badge remains active until the period ends."
                        },
                        {
                            icon: Award,
                            title: "No fake credentials",
                            body: "Builder verification is merit-based: complete your profile and post at least one proof of work. No gaming the system. The chain doesn't lie."
                        },
                    ].map(({ icon: Icon, title, body }) => (
                        <div key={title} className="rounded-xl bg-white/[0.02] border border-white/6 p-6">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                <Icon className="w-4 h-4 text-emerald-400" />
                            </div>
                            <h3 className="text-[13px] font-black text-white mb-2">{title}</h3>
                            <p className="text-[12px] text-white/35 leading-relaxed font-medium">{body}</p>
                        </div>
                    ))}
                </div>

                {/* ── Bottom CTA ── */}
                <div className="text-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 md:p-14">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                        <Shield className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Start with Builder, for free</h2>
                    <p className="text-white/40 text-sm font-medium mb-7 max-w-md mx-auto leading-relaxed">
                        Complete your profile, add one proof of work, and get verified automatically. No payment, no waiting.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/dashboard" className="px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[13px] tracking-wide transition-all shadow-lg shadow-emerald-500/20">
                            Go to Dashboard
                        </Link>
                        <Link href="/create-profile" className="px-7 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold text-[13px] tracking-wide transition-all">
                            Create Profile
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[10px] text-white/15 font-medium mt-8">
                    Each request is reviewed by the ChainVolio team before approval. Prices reflect platform access fees.
                </p>
            </div>

            {showVerificationModal && publicKey && (
                <VerificationRequestModal
                    walletAddress={publicKey.toBase58()}
                    profileName={profile?.displayName || "Builder"}
                    website={profile?.website}
                    socials={`${profile?.twitter || ""} ${profile?.linkedin || ""}`.trim()}
                    currentStatus={profile?.verificationStatus || null}
                    currentTier={profile?.verificationTier || null}
                    initialTierId={initialTier}
                    onClose={() => setShowVerificationModal(false)}
                    onSuccess={() => {
                        setShowVerificationModal(false);
                        setToastMessage("Request submitted successfully!");
                        // Refetch profile
                        fetch(`/api/user/me?wallet=${publicKey.toBase58()}`)
                            .then(r => r.json())
                            .then(data => setProfile(data));
                    }}
                />
            )}

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
}
