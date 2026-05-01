"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Users, Building, Shield, ArrowLeft, Zap, Briefcase, Award, Loader2, Building2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import type { StripePlanName } from "@/lib/stripePlans";

const C = {
    slate: { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", bar: "bg-slate-500", glow: "shadow-slate-500/20", hex: "#64748b" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500", glow: "shadow-emerald-500/20", hex: "#10b981" },
    pink:    { text: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20",    bar: "bg-pink-500",    glow: "shadow-pink-500/20",    hex: "#ec4899" },
    blue:    { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    bar: "bg-blue-500",    glow: "shadow-blue-500/20",    hex: "#3b82f6" },
    amber:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   bar: "bg-amber-500",   glow: "shadow-amber-500/20",   hex: "#f59e0b" },
} as const;
type CK = keyof typeof C;

const TIERS = [
    {
        id: "free" as StripePlanName,
        colorKey: "slate" as CK,
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
        ],
    },
    {
        id: "community" as StripePlanName,
        colorKey: "blue" as CK,
        Icon: Users,
        label: "Community / DAO",
        desc: "For DAOs, Web3 communities, and decentralized groups hiring on-chain.",
        price: "$4.99",
        billing: "/ month",
        authority: "Collective Authority",
        attestationPower: 4,
        attestationsPerMonth: 20,
        hiringCollections: "Unlimited",
        benefits: [
            { label: "Unlimited hiring collections" },
            { label: "Verified Community Identity badge" },
            { label: "20 recognized attestations / month" },
            { label: "Jobs listed as Trusted Community Opportunity" },
            { label: "Candidates can verify your community is legit" },
        ],
    },
    {
        id: "company" as StripePlanName,
        colorKey: "amber" as CK,
        Icon: Building,
        label: "Company / Org",
        desc: "For startups, studios, and official organizations that hire at scale.",
        price: "$9.99",
        billing: "/ month",
        authority: "Institutional Authority",
        attestationPower: 5,
        attestationsPerMonth: 40,
        hiringCollections: "Unlimited",
        popular: true,
        benefits: [
            { label: "Unlimited hiring collections" },
            { label: "Verified Organization Badge for maximum institutional trust" },
            { label: "40 attestations / month" },
            { label: "Jobs appear as verified institutional hiring sources" },
            { label: "\"Institutional Trust\" signal visible to every candidate" },
        ],
    },
] as const;

const COMPARISON = [
    {
        category: "Pricing",
        rows: [
            { label: "Monthly price", values: ["Free", "$4.99", "$9.99"] },
            { label: "Yearly price", values: ["Free", "$49.90", "$99.90"] },
        ]
    },
    {
        category: "Hiring Tools",
        rows: [
            { label: "Hiring collections", values: ["1", "Unlimited", "Unlimited"] },
            { label: "Saved candidates", values: ["10", "Unlimited", "Unlimited"] },
            { label: "Job listed as trusted source", values: [false, true, true] },
        ]
    },
    {
        category: "Identity & Trust",
        rows: [
            { label: "Verified badge on profile", values: [false, true, true] },
            { label: "Badge type", values: ["-", "Community", "Company / Org"] },
            { label: "Institutional trust signal", values: [false, "Collective", "Institutional"] },
        ]
    },
    {
        category: "Attestations",
        rows: [
            { label: "Attestations / month", values: ["0", "20", "40"] },
            { label: "Attestation power", values: ["0 / 5", "4 / 5", "5 / 5"] },
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
    if (value === true) return <CheckCircle className={`w-4 h-4 ${col.text} mx-auto`} />;
    if (value === false) return <XCircle className="w-4 h-4 text-white/15 mx-auto" />;
    return <span className={`text-[11px] font-bold ${col.text}`}>{value}</span>;
}

export default function RecruiterPricingPage() {
    const router = useRouter();
    const { session, orgAccount, loading, signInWithGoogle } = useGoogleAuth();
    const [subscribing, setSubscribing] = useState<StripePlanName | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentPlan = (orgAccount?.plan_name ?? "free") as StripePlanName;

    const handleSubscribe = async (planKey: StripePlanName) => {
        if (planKey === "free") return;

        if (!session) {
            signInWithGoogle();
            return;
        }

        setSubscribing(planKey);
        setError(null);

        try {
            const res = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ planName: planKey }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error?.message || "Failed to start checkout");
            window.location.href = data.url;
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setSubscribing(null);
        }
    };

    const colKeys: CK[] = ["slate", "blue", "amber"];

    return (
        <main className="min-h-screen bg-[#09090b] text-white flex flex-col">
            <Navbar />
            
            {/* ── Background texture ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.05),transparent)]" />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full flex-1">
                
                {/* ── Hero ── */}
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
                        <Building2 className="w-3 h-3" />
                        For Organizations & Recruiters
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-none">
                        Get Your Organization{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                            Verified
                        </span>
                    </h1>
                    <p className="text-white/40 text-[15px] md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                        Get a verified badge, unlock unlimited hiring collections, and signal trust to every Web3 builder on ChainVolio.
                    </p>
                </div>

                {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* ── Tier cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
                    {TIERS.map((tier) => {
                        const col = C[tier.colorKey];
                        const isCurrent = currentPlan === tier.id;
                        const isLoading = subscribing === tier.id;
                        
                        return (
                            <div
                                key={tier.id}
                                className={`relative flex flex-col rounded-2xl bg-black/40 border overflow-hidden transition-all duration-300 group backdrop-blur-sm ${"popular" in tier && tier.popular ? `border-${tier.colorKey}-500/30` : "border-white/8 hover:border-white/15"}`}
                                style={{ boxShadow: "popular" in tier && tier.popular ? `0 0 40px ${col.hex}15, 0 0 0 1px ${col.hex}20` : undefined }}
                            >
                                {/* Ribbon */}
                                {"popular" in tier && tier.popular && !isCurrent && (
                                    <div className="absolute top-0 right-4 text-[8px] font-black uppercase tracking-widest text-black px-2.5 py-1.5 rounded-b-lg" style={{ background: col.hex }}>
                                        Most Popular
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute top-0 right-4 text-[8px] font-black uppercase tracking-widest text-white px-2.5 py-1.5 rounded-b-lg bg-emerald-500">
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
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-white/35 leading-relaxed font-medium">{tier.desc}</p>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    {/* Price */}
                                    <div>
                                        <div className="flex items-baseline gap-2">
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
                                        onClick={() => handleSubscribe(tier.id)}
                                        disabled={isCurrent || isLoading || loading}
                                        className={`w-full py-3 rounded-xl text-[12px] font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                                            isCurrent
                                                ? "bg-slate-800 text-slate-500 cursor-default border border-slate-700"
                                                : tier.id === "free"
                                                ? "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                                                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                        }`}
                                        style={(!isCurrent && tier.id !== "free") ? { background: col.hex, color: "black", border: "none" } : undefined}
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                        ) : isCurrent ? (
                                            "Current Plan"
                                        ) : tier.id === "free" ? (
                                            "Current Plan" // Assuming they are free initially or they can't downgrade to free from here
                                        ) : !session ? (
                                            <><Zap className="w-4 h-4" /> Sign In to Subscribe</>
                                        ) : (
                                            <><Zap className="w-4 h-4" /> Subscribe — {tier.price}{tier.billing}</>
                                        )}
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

                        {/* Comparison rows */}
                        {COMPARISON.map((section, si) => (
                            <div key={section.category}>
                                {/* Section header */}
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

            </div>
            
            <Footer />
        </main>
    );
}
