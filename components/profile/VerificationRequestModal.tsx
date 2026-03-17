"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Clock, ShieldCheck, Users, Building, Code2, Star, Lock, Shield } from "lucide-react";
import { PaymentModal } from "@/components/profile/PaymentModal";
import { SubscriptionModal, BillingCycle } from "@/components/profile/SubscriptionModal";
import { IS_SOL_TEST, SOL_TEST_PRICES } from "@/lib/paymentConfig";

type VerificationRequestModalProps = {
    walletAddress: string;
    onClose: () => void;
    onSuccess: () => void;
    currentStatus: string | null;
    currentTier?: string | null;
    isRenewal?: boolean;
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
        price: IS_SOL_TEST ? "0.0001 SOL" : "$10",
        billing: IS_SOL_TEST ? "(testing)" : "One-time unlock",
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
        price: IS_SOL_TEST ? "0.0001 SOL" : "$30",
        billing: IS_SOL_TEST ? "/ month (testing)" : "/ month",
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
        price: IS_SOL_TEST ? "0.0001 SOL" : "$100",
        billing: IS_SOL_TEST ? "/ month (testing)" : "/ month",
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

// ─── Tier pricing ───────────────────────────────────────────────────
// number  = one-time payment
// object  = subscription with monthly/yearly pricing
// null    = free (manual review)
type TierPricing = number | { monthly: number; yearly: number } | null;

// In SOL_TEST mode use ultra-low SOL amounts; in USDC_PROD use real USDC amounts.
const TIER_PRICES: Record<string, TierPricing> = IS_SOL_TEST
    ? {
        Builder:   SOL_TEST_PRICES.Builder.oneTime!,
        Figure:    null,
        Community: { monthly: SOL_TEST_PRICES.Community.monthly!, yearly: SOL_TEST_PRICES.Community.yearly! },
        Company:   { monthly: SOL_TEST_PRICES.Company.monthly!,   yearly: SOL_TEST_PRICES.Company.yearly!   },
    }
    : {
        Builder:   10,
        Figure:    null,
        Community: { monthly: 30,  yearly: 300  },
        Company:   { monthly: 100, yearly: 1000 },
    };

const isSubscriptionTier = (id: string) =>
    TIER_PRICES[id] !== null && typeof TIER_PRICES[id] === "object";

// ─── Reverse mapping for renewals ──────────────────────────────────────────
const REVERSE_TIER_MAP: Record<string, string> = {
    "Builder":               "Builder",
    "Public Figure":         "Figure",
    "Community / DAO":       "Community",
    "Company / Organization": "Company",
};

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
function TierCard({
    tier,
    onSelect,
    isLoading,
}: {
    tier: (typeof TIERS)[number];
    onSelect: (tierId: string) => void;
    isLoading: boolean;
}) {
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

                {/* Attestation authority */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.18em]">Attestation Authority</p>
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
                    disabled={isLoading}
                    onClick={() => onSelect(tier.id)}
                    className="w-full py-3 rounded-xl text-[12px] font-bold tracking-wide transition-all duration-200 bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-emerald-500/25 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Submitting…" : tier.button}
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
    currentTier,
    isRenewal,
    profileName,
    website,
    socials,
}: VerificationRequestModalProps) {
    const [loading,       setLoading]       = useState(false);
    const [error,         setError]         = useState<string | null>(null);
    const [selectedTier,  setSelectedTier]  = useState<string | null>(null);
    const [selectedBilling, setSelectedBilling] = useState<{ cycle: BillingCycle; price: number } | null>(null);

    // ── Renewal Logic: Auto-select current tier ──
    useEffect(() => {
        if (isRenewal && currentTier) {
            const internalId = REVERSE_TIER_MAP[currentTier];
            if (internalId) {
                setSelectedTier(internalId);
            }
        }
    }, [isRenewal, currentTier]);

    // Derived tier objects
    const activeTier    = selectedTier ? TIERS.find(t => t.id === selectedTier) ?? null : null;
    const activePricing = selectedTier ? TIER_PRICES[selectedTier] : undefined;

    const handleSelectTier = async (tierId: string) => {
        setError(null);
        const pricing = TIER_PRICES[tierId];

        // ── Free tier (Public Figure) → submit directly ─────────────────────
        if (pricing === null) {
            setLoading(true);
            try {
                const res = await fetch("/api/verify/request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        walletAddress, tier: tierId, profileName,
                        website: website || null, socials: socials || null,
                    }),
                });
                const data = await res.json();
                if (!res.ok) { setError(data.error || "Something went wrong."); }
                else         { onSuccess(); }
            } catch (err: any) {
                setError(err.message || "Network error.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // ── Subscription tiers (Community / Company) → show billing picker ────
        if (isSubscriptionTier(tierId)) {
            setSelectedTier(tierId);
            return;
        }

        // ── One-time tiers (Builder) → show payment modal directly ──────────
        setSelectedTier(tierId);
    };

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

    // ── Rejected — allow resubmission ──
    const isRejected = currentStatus === "rejected";

    // Derived render flags
    const showSubscription = !!(activeTier && isSubscriptionTier(selectedTier || "") && !selectedBilling);
    const showPayment      = !!(activeTier && (!isSubscriptionTier(selectedTier || "") || selectedBilling));

    // Compute price for PaymentModal based on billing selection
    let paymentPrice   = 0;
    let paymentBilling: BillingCycle | undefined;
    if (selectedTier) {
        const p = TIER_PRICES[selectedTier];
        if (typeof p === "number") {
            paymentPrice = p;
        } else if (selectedBilling) {
            paymentPrice   = selectedBilling.price;
            paymentBilling = selectedBilling.cycle;
        }
    }

    // Modal width adapts to content step
    const modalWidth = !selectedTier
        ? "max-w-[1200px]"
        : showSubscription
            ? "max-w-2xl"
            : "max-w-3xl";

    // ── Main modal ──
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className={`relative border border-white/15 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-full ${modalWidth}`}>
                {/* Video background */}
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none">
                    <source src="/box%20navigation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] pointer-events-none" />

                <div className="relative z-10 flex flex-col">

                {/* Header — always visible */}
                <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black text-white tracking-tight leading-tight">Verify Identity</h2>
                            <p className="text-[10px] text-white/30 leading-none mt-0.5">
                                {showSubscription
                                    ? `Select billing cycle for ${activeTier?.label}`
                                    : showPayment
                                        ? `Complete payment for ${activeTier?.label} verification`
                                        : "Choose a verification tier to claim your badge and attestation authority."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Subscription billing picker ── */}
                {showSubscription && activeTier && (() => {
                    const p = TIER_PRICES[activeTier.id] as { monthly: number; yearly: number };
                    return (
                        <SubscriptionModal
                            tierId={activeTier.id}
                            tierLabel={activeTier.label}
                            colorKey={activeTier.colorKey}
                            monthlyPrice={p.monthly}
                            yearlyPrice={p.yearly}
                            onBack={() => {
                                if (isRenewal) onClose();
                                else setSelectedTier(null);
                            }}
                            onSelectBilling={(cycle, price) => setSelectedBilling({ cycle, price })}
                        />
                    );
                })()}

                {/* ── Payment modal ── */}
                {showPayment && activeTier && (
                    <PaymentModal
                        tierId={activeTier.id}
                        tierLabel={activeTier.label}
                        price={paymentPrice}
                        billingCycle={paymentBilling}
                        colorKey={activeTier.colorKey}
                        walletAddress={walletAddress}
                        profileName={profileName}
                        website={website}
                        socials={socials}
                        onBack={() => {
                            // Subscription tiers: back to billing picker; one-time: back to grid
                            if (isRenewal) {
                                setSelectedBilling(null);
                            } else if (isSubscriptionTier(activeTier.id)) {
                                setSelectedBilling(null);
                            } else {
                                setSelectedTier(null);
                            }
                        }}
                        onSuccess={onSuccess}
                    />
                )}

                {/* ── 4-card tier grid ── */}
                {!selectedTier && (
                    <div className="p-6">
                        {/* Rejected banner */}
                        {isRejected && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold flex items-center gap-2">
                                <span className="text-base">⚠️</span>
                                Your previous request was rejected. You may select a tier and resubmit.
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-4">
                            {TIERS.map((tier) => (
                                <TierCard
                                    key={tier.id}
                                    tier={tier}
                                    onSelect={handleSelectTier}
                                    isLoading={loading && !selectedTier}
                                />
                            ))}
                        </div>

                        <p className="mt-4 text-center text-[10px] text-white/20">
                            Each request is reviewed by the ChainVolio team before approval. Prices reflect platform access fees.
                        </p>
                    </div>
                )}

                </div> {/* end relative z-10 */}
            </div>
        </div>
    );
}
