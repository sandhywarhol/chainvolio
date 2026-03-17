"use client";

import { useState } from "react";
import { ArrowLeft, ShieldCheck, CheckCircle, Calendar, Repeat, Star } from "lucide-react";
import { IS_SOL_TEST } from "@/lib/paymentConfig";

// ─── Color palette ──────────────────────────────────────────────────────────
const C = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", solid: "bg-emerald-500", hex: "#10b981" },
    pink:    { text: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20",    solid: "bg-pink-500",    hex: "#ec4899" },
    blue:    { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    solid: "bg-blue-500",    hex: "#3b82f6" },
    amber:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   solid: "bg-amber-500",   hex: "#f59e0b" },
} as const;
type CK = keyof typeof C;

export type BillingCycle = "monthly" | "yearly";

type SubscriptionModalProps = {
    tierId:        string;
    tierLabel:     string;
    colorKey:      CK;
    monthlyPrice:  number;
    yearlyPrice:   number;
    onBack:        () => void;
    /** Called when user clicks Subscribe — parent will open PaymentModal */
    onSelectBilling: (cycle: BillingCycle, price: number) => void;
};

export function SubscriptionModal({
    tierId,
    tierLabel,
    colorKey,
    monthlyPrice,
    yearlyPrice,
    onBack,
    onSelectBilling,
}: SubscriptionModalProps) {
    const [selected, setSelected] = useState<BillingCycle>("monthly");
    const col = C[colorKey];

    // Formatted display values based on mode
    const yearlyMonthlyEquiv = IS_SOL_TEST
        ? (yearlyPrice / 12).toFixed(4)
        : (yearlyPrice / 12).toFixed(0);

    const monthlyCostX12     = monthlyPrice * 12;

    // Use a precise rounding to avoid float issues in test mode
    const savingsAmount      = IS_SOL_TEST
        ? Number((monthlyCostX12 - yearlyPrice).toFixed(4))
        : monthlyCostX12 - yearlyPrice;

    const savingsPct         = Math.round((savingsAmount / monthlyCostX12) * 100);

    const activePrice = selected === "monthly" ? monthlyPrice : yearlyPrice;

    const displayCurrency = IS_SOL_TEST ? "SOL" : "USDC";
    const displayPrefix   = IS_SOL_TEST ? ""    : "$";

    return (
        <div className="flex flex-col">

            {/* Sub-header */}
            <div className="px-6 py-3 flex items-center gap-3 border-b border-white/5">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-white/30 hover:text-white/70 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to tiers
                </button>
                <div className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${col.bg} ${col.border} ${col.text}`}>
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {tierLabel}
                </div>
            </div>

            <div className="p-6 space-y-5">

                {/* Title */}
                <div className="text-center">
                    <h3 className="text-xl font-black text-white tracking-tight mb-1">Choose Your Billing Cycle</h3>
                    <p className="text-[12px] text-white/30">{tierLabel} Verification · Subscription</p>
                </div>

                {/* Two billing cards */}
                <div className="grid grid-cols-2 gap-4">

                    {/* ── Monthly ── */}
                    <button
                        type="button"
                        onClick={() => setSelected("monthly")}
                        className={`relative flex flex-col text-left rounded-2xl p-5 border transition-all duration-200 ${
                            selected === "monthly"
                                ? `${col.bg} ${col.border}`
                                : "bg-black/20 border-white/8 hover:border-white/15"
                        }`}
                        style={selected === "monthly" ? { boxShadow: `0 0 32px ${col.hex}15` } : {}}
                    >
                        {/* Selected indicator */}
                        <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 transition-all ${
                            selected === "monthly"
                                ? `${col.solid} border-transparent`
                                : "bg-transparent border-white/20"
                        }`}>
                            {selected === "monthly" && (
                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                            )}
                        </div>

                        {/* Icon + label */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${col.bg} border ${col.border}`}>
                                <Repeat className={`w-4 h-4 ${col.text}`} />
                            </div>
                            <span className="text-[12px] font-black text-white">Monthly</span>
                        </div>

                        {/* Price */}
                        <div className="mb-1">
                            <div className="flex items-baseline gap-1">
                                <span className={IS_SOL_TEST ? "text-[22px] font-black text-white leading-none" : "text-[28px] font-black text-white leading-none"}>
                                    {displayPrefix}{monthlyPrice}
                                </span>
                                <span className="text-[13px] font-bold text-white/35">{displayCurrency}</span>
                            </div>
                            <p className="text-[10px] text-white/30 mt-0.5">per month</p>
                        </div>

                        <div className="h-px bg-white/5 my-3" />

                        {/* Features */}
                        <div className="space-y-1.5">
                            {["Full verification badge", "Cancel anytime", "Billed monthly"].map((f, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <CheckCircle className={`w-2.5 h-2.5 flex-shrink-0 ${selected === "monthly" ? col.text : "text-white/20"}`} />
                                    <span className="text-[10px] text-white/40">{f}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                <Calendar className="w-2.5 h-2.5" />
                                Flexible
                            </span>
                        </div>
                    </button>

                    {/* ── Yearly ── */}
                    <button
                        type="button"
                        onClick={() => setSelected("yearly")}
                        className={`relative flex flex-col text-left rounded-2xl p-5 border transition-all duration-200 ${
                            selected === "yearly"
                                ? `${col.bg} ${col.border}`
                                : "bg-black/20 border-white/8 hover:border-white/15"
                        }`}
                        style={selected === "yearly" ? { boxShadow: `0 0 32px ${col.hex}15` } : {}}
                    >
                        {/* Best Value ribbon */}
                        <div
                            className="absolute top-0 right-4 text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded-b-lg"
                            style={{ background: col.hex }}
                        >
                            Best Value
                        </div>

                        {/* Selected indicator */}
                        <div className={`absolute top-3 left-3 w-4 h-4 rounded-full border-2 transition-all ${
                            selected === "yearly"
                                ? `${col.solid} border-transparent`
                                : "bg-transparent border-white/20"
                        }`}>
                            {selected === "yearly" && (
                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                            )}
                        </div>

                        {/* Icon + label */}
                        <div className="flex items-center gap-2 mb-3 mt-1">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${col.bg} border ${col.border}`}>
                                <Star className={`w-4 h-4 ${col.text}`} />
                            </div>
                            <span className="text-[12px] font-black text-white">Yearly</span>
                        </div>

                        {/* Price */}
                        <div className="mb-1">
                            <div className="flex items-baseline gap-1">
                                <span className={IS_SOL_TEST ? "text-[22px] font-black text-white leading-none" : "text-[28px] font-black text-white leading-none"}>
                                    {displayPrefix}{yearlyPrice}
                                </span>
                                <span className="text-[13px] font-bold text-white/35">{displayCurrency}</span>
                            </div>
                            <p className="text-[10px] text-white/30 mt-0.5">
                                per year · ≈ {displayPrefix}{yearlyMonthlyEquiv} {displayCurrency}/mo
                            </p>
                        </div>

                        <div className="h-px bg-white/5 my-3" />

                        {/* Features */}
                        <div className="space-y-1.5">
                            {["Full verification badge", "Billed once yearly", "Priority support"].map((f, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <CheckCircle className={`w-2.5 h-2.5 flex-shrink-0 ${selected === "yearly" ? col.text : "text-white/20"}`} />
                                    <span className="text-[10px] text-white/40">{f}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3">
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                                style={{ background: `${col.hex}30`, border: `1px solid ${col.hex}40` }}
                            >
                                🎉 Save {savingsPct}% · {displayPrefix}{savingsAmount} {displayCurrency} off
                            </span>
                        </div>
                    </button>
                </div>

                {/* Subscribe button */}
                <button
                    onClick={() => onSelectBilling(selected, activePrice)}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[14px] tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
                >
                    <ShieldCheck className="w-4 h-4" />
                    Subscribe {selected === "monthly" 
                        ? `· ${displayPrefix}${monthlyPrice} ${displayCurrency}/mo` 
                        : `· ${displayPrefix}${yearlyPrice} ${displayCurrency}/yr`}
                </button>

                {/* Comparison note */}
                <p className="text-center text-[10px] text-white/15">
                    Yearly plan saves <span className="text-white/30 font-bold">{displayPrefix}{savingsAmount} {displayCurrency}</span> compared to 12 months of monthly billing.
                    Admin approval required before badge activation.
                </p>
            </div>
        </div>
    );
}
