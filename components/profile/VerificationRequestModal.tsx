"use client";

import { useState } from "react";
import { X, CheckCircle, Clock, ShieldCheck, Users, Building, Code2, Star, Lock, Shield } from "lucide-react";

type VerificationRequestModalProps = {
    walletAddress: string;
    onClose: () => void;
    onSuccess: () => void;
    currentStatus: string | null;
    profileName: string;
    website?: string;
    socials?: string;
};

// ─── Tier color palette ────────────────────────────────────────────────────
const C = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500", hex: "#10b981" },
    pink:    { text: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20",    bar: "bg-pink-500",    hex: "#ec4899" },
    blue:    { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    bar: "bg-blue-500",    hex: "#3b82f6" },
    amber:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   bar: "bg-amber-500",   hex: "#f59e0b" },
} as const;
type CK = keyof typeof C;

// ─── Tier definitions ──────────────────────────────────────────────────────
const TIERS = [
    {
        id: "Builder",
        colorKey: "emerald" as CK,
        Icon: Code2,
        label: "Builder",
        desc: "Developers, designers & Web3 contributors.",
        price: "$10",
        billing: "One-time unlock",
        authority: "Builder Contributor",
        attestationLimit: 10,
        button: "Unlock Verification",
        attestationPower: 1,
        popular: true,
        benefits: [
            "Verified Builder Badge",
            "Profile becomes more trusted by organizations",
            "Higher credibility in the reputation network",
        ],
    },
    {
        id: "Figure",
        colorKey: "pink" as CK,
        Icon: Star,
        label: "Public Figure",
        desc: "Founders, KOLs & notable ecosystem individuals.",
        price: "Free",
        billing: "Manual review",
        authority: "High Influence",
        attestationLimit: 20,
        button: "Request Verification",
        attestationPower: 2,
        benefits: [
            "Verified Public Figure Badge",
            "Higher credibility when giving attestations",
            "Trusted & Recognized identity in the ecosystem",
        ],
    },
    {
        id: "Community",
        colorKey: "blue" as CK,
        Icon: Users,
        label: "Community / DAO",
        desc: "DAOs, Web3 communities & decentralized groups.",
        price: "$30",
        billing: "/ month",
        authority: "Collective Authority",
        attestationLimit: 40,
        button: "Start Verification",
        attestationPower: 3,
        benefits: [
            "Verified Community Identity",
            "Community jobs are marked as trusted opportunities",
            "Ability to give recognized attestations",
        ],
    },
    {
        id: "Company",
        colorKey: "amber" as CK,
        Icon: Building,
        label: "Company / Org",
        desc: "Startups, agencies, studios & official organizations.",
        price: "$100",
        billing: "/ month",
        authority: "Institutional Authority",
        attestationLimit: 80,
        button: "Start Verification",
        attestationPower: 4,
        popular: true,
        benefits: [
            "Verified Organization Badge",
            "Job listings appear as trusted hiring sources",
            "Attestations carry organizational credibility",
        ],
    },
] as const;

// ─── Attestation power strips ──────────────────────────────────────────────
function PowerStrips({ count, colorKey }: { count: number; colorKey: CK }) {
    const col = C[colorKey];
    return (
        <div className="flex items-center gap-[3px]">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className={`h-[3px] rounded-full transition-all duration-300 ${i < count ? `${col.bar} opacity-80` : "bg-white/8"}`}
                    style={{ width: i < count ? 13 : 8 }}
                />
            ))}
        </div>
    );
}

// ─── Individual tier card ──────────────────────────────────────────────────
function TierCard({ tier }: { tier: (typeof TIERS)[number] }) {
    const col = C[tier.colorKey];
    const hex = col.hex;

    return (
        <div
            className="relative flex flex-col rounded-2xl bg-black/30 border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-black/40 group backdrop-blur-sm"
            style={{ boxShadow: `0 1px 32px ${hex}08` }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 32px ${hex}20, 0 0 0 1px ${hex}18`; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 1px 32px ${hex}08`; }}
        >
            {/* Popular ribbon */}
            {"popular" in tier && tier.popular && (
                <div
                    className="absolute top-0 right-4 text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded-b-lg"
                    style={{ background: hex }}
                >
                    {tier.id === "Builder" ? "Popular" : "Most Trust"}
                </div>
            )}

            {/* Top accent bar */}
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${hex}80, transparent)` }} />

            <div className="flex flex-col flex-1 p-6 gap-4">

                {/* Header: icon + title + desc */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${col.bg} border ${col.border}`}>
                            <tier.Icon className={`w-5 h-5 ${col.text}`} />
                        </div>
                        <h3 className={`text-[15px] font-black leading-tight tracking-tight ${col.text}`}>{tier.label}</h3>
                    </div>
                    <p className="text-[11px] text-white/35 leading-relaxed font-medium">{tier.desc}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/6" />

                {/* Key benefits */}
                <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.18em]">Key Benefits</p>
                    {tier.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <CheckCircle className={`w-3 h-3 flex-shrink-0 mt-px ${col.text} opacity-60`} />
                            <span className="text-[11.5px] text-white/60 leading-snug font-medium">{b}</span>
                        </div>
                    ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Price */}
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[24px] font-black leading-none text-white tracking-tight">{tier.price}</span>
                        {tier.id === "Figure" && (
                            <span className="text-[10px] text-white/40 font-medium">(Invite only)</span>
                        )}
                    </div>
                    <p className="text-[10px] text-white/35 font-medium mt-1">{tier.billing}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/6" />

                {/* Attestation authority — same label style as Key Benefits */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.18em]">Attestation Authority</p>
                    {/* Authority + limit on one line */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11.5px] font-black text-white leading-tight">{tier.authority}</span>
                        <span className="text-[10px] text-white/30 font-medium">—</span>
                        <span className="text-[10px] text-white/50 font-semibold">{tier.attestationLimit} / month</span>
                    </div>
                    <PowerStrips count={tier.attestationPower} colorKey={tier.colorKey} />
                </div>

                {/* CTA button */}
                <button
                    type="button"
                    className="w-full py-3 rounded-xl text-[12px] font-bold tracking-wide transition-all duration-200 bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-emerald-500/25 mt-1"
                >
                    {tier.button}
                </button>

            </div>
        </div>
    );
}

// ─── Main export ───────────────────────────────────────────────────────────
export function VerificationRequestModal({
    walletAddress,
    onClose,
    onSuccess,
    currentStatus,
    profileName,
    website,
    socials,
}: VerificationRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Pending ──
    if (currentStatus === "pending") {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                <div className="border border-white/20 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl">
                    {/* Video background */}
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
                        <source src="/box%20navigation.mp4" type="video/mp4" />
                    </video>
                    <div className="relative z-10 p-8 text-center text-white bg-black/50 backdrop-blur-sm">
                    <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-lg font-bold mb-2">Review In Progress</h2>
                    <p className="text-white/35 mb-6 text-sm leading-relaxed">
                        Your verification request is under review. We'll update your status once it's processed by our team.
                    </p>
                    <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors border border-white/10 text-sm">
                        Got it
                    </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Already verified ──
    if (currentStatus === "verified") {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                <div className="border border-white/20 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl">
                    {/* Video background */}
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
                        <source src="/box%20navigation.mp4" type="video/mp4" />
                    </video>
                    <div className="relative z-10 p-8 text-center text-white bg-black/50 backdrop-blur-sm">
                    <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold mb-2">Already Verified</h2>
                    <p className="text-white/35 text-sm">Your profile is already fully verified on ChainVolio.</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main 4-card modal ──
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            {/* Wide enough to hold 4 cards in one row */}
            <div className="relative border border-white/15 rounded-2xl w-full max-w-[1200px] shadow-2xl overflow-hidden">
                {/* Video background — same as landing page modal */}
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none">
                    <source src="/box%20navigation.mp4" type="video/mp4" />
                </video>
                {/* Dark overlay so cards remain legible */}
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] pointer-events-none" />

                {/* All content sits above the video */}
                <div className="relative z-10 flex flex-col">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black text-white tracking-tight leading-tight">Verify Identity</h2>
                            <p className="text-[10px] text-white/30 leading-none mt-0.5">Choose a verification tier to claim your badge and attestation authority.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* 4 cards — single horizontal row, no scroll */}
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-4">
                        {TIERS.map((tier) => (
                            <TierCard key={tier.id} tier={tier} />
                        ))}
                    </div>

                    {/* Footer note */}
                    <p className="mt-4 text-center text-[10px] text-white/20">
                        Each request is reviewed by the ChainVolio team before approval. Prices reflect platform access fees.
                    </p>
                </div>

                </div> {/* end relative z-10 */}
            </div>
        </div>
    );
}
