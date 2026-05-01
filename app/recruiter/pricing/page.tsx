"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Zap, ArrowLeft, Loader2, Building2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { STRIPE_PLANS } from "@/lib/stripePlans";
import type { StripePlanName } from "@/lib/stripePlans";

const PLANS: { key: StripePlanName; highlight?: boolean }[] = [
    { key: "free" },
    { key: "community" },
    { key: "company", highlight: true },
];

export default function RecruiterPricingPage() {
    const router = useRouter();
    const { session, orgAccount, loading, signInWithGoogle } = useGoogleAuth();
    const [subscribing, setSubscribing] = useState<StripePlanName | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentPlan = (orgAccount?.plan_name ?? "free") as StripePlanName;

    const handleSubscribe = async (planKey: StripePlanName) => {
        if (planKey === "free") return;
        if (planKey === "enterprise") {
            window.open("mailto:hello@chainvolio.com?subject=Enterprise Plan Inquiry", "_blank");
            return;
        }

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

    return (
        <main className="min-h-screen flex flex-col bg-[#050507] text-white">
            <Navbar />

            <section className="flex-1 max-w-4xl mx-auto px-4 pt-28 pb-20">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
                        <Building2 className="w-3.5 h-3.5" /> For Organizations &amp; Recruiters
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
                        Get Your Organization Verified
                    </h1>
                    <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
                        Get a verified badge, unlock unlimited hiring collections, and signal trust to every Web3 builder on ChainVolio.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map(({ key, highlight }) => {
                        const plan = STRIPE_PLANS[key];
                        const isCurrent = currentPlan === key;
                        const isLoading = subscribing === key;
                        const { collections, candidates } = plan.limits;

                        return (
                            <div
                                key={key}
                                className={`relative flex flex-col p-6 rounded-3xl border transition-all ${
                                    highlight
                                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.08)]"
                                        : "bg-slate-900/60 border-slate-700/50"
                                }`}
                            >
                                {highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute -top-3 right-4">
                                        <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest">
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h2 className="text-lg font-black text-white mb-1">{plan.displayName}</h2>
                                    <div className="flex items-end gap-1 mb-4">
                                        {plan.price === null ? (
                                            <span className="text-3xl font-black text-white">Custom</span>
                                        ) : plan.price === 0 ? (
                                            <span className="text-3xl font-black text-white">Free</span>
                                        ) : (
                                            <>
                                                <span className="text-3xl font-black text-white">${plan.price}</span>
                                                <span className="text-slate-400 text-sm mb-1">/month</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="space-y-1 mb-4 text-xs text-slate-400 font-mono bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                        <div className="flex justify-between">
                                            <span>Hiring Collections</span>
                                            <span className="font-bold text-white">{collections === null ? "Unlimited" : collections}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Saved Candidates</span>
                                            <span className="font-bold text-white">{candidates === null ? "Unlimited" : candidates}</span>
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-2.5 flex-1 mb-6">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-center gap-2.5 text-xs text-slate-300">
                                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(key)}
                                    disabled={isCurrent || isLoading || loading}
                                    className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                                        isCurrent
                                            ? "bg-slate-700/50 text-slate-500 cursor-default border border-slate-700"
                                            : key === "free"
                                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                            : key === "enterprise"
                                            ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20"
                                            : highlight
                                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                            : "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                                    }`}
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                    ) : isCurrent ? (
                                        "Current Plan"
                                    ) : key === "free" ? (
                                        "Get Started Free"
                                    ) : key === "enterprise" ? (
                                        "Contact Sales"
                                    ) : !session ? (
                                        <><Zap className="w-4 h-4" /> Sign In to Subscribe</>
                                    ) : (
                                        <><Zap className="w-4 h-4" /> Subscribe — ${plan.price}/mo</>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-center">
                    <h3 className="text-sm font-black text-white mb-2">Need Enterprise features?</h3>
                    <p className="text-xs text-slate-400 mb-4">Custom pricing, white-label options, dedicated SLA, and API access for large organizations.</p>
                    <a
                        href="mailto:hello@chainvolio.com?subject=Enterprise Plan Inquiry"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/20 transition-colors"
                    >
                        Contact Sales →
                    </a>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
